# ConnectFlow Architecture

A short guide to how ConnectFlow works and why it is built this way. For setup instructions see the [README](README.md).

**The idea in one sentence:** users draw a graph of nodes (a trigger, then actions) in the browser; when the trigger fires, a background job runs the nodes in order, passing data from one to the next and reporting live status back to the canvas.

## 1. The big picture

```
Browser (React Flow editor, dashboard)
   │  tRPC calls                ▲ live node status (Inngest Realtime)
   ▼                            │
Next.js server ── /api/trpc ── workflows, credentials, executions
   │             /api/auth ─── better-auth (sessions, OAuth, Polar billing)
   │             /api/webhooks/* and /api/trigger ── start a run from outside
   │             /api/inngest ─ lets Inngest call back into our code
   ▼
Inngest ──► execute-workflow function ──► node executors ──► OpenAI, Gmail, Discord, ...
   │
   ▼
PostgreSQL (Prisma): users, workflows, nodes, connections, credentials, executions
```

Three decisions shape everything else:

| Decision | Why |
|---|---|
| **Inngest runs the workflows**, not an HTTP handler | Runs can take minutes, must survive restarts, and should retry. Inngest checkpoints each step. |
| **One executor per node type**, found through a registry | Adding an integration means adding one folder and one registry line. |
| **tRPC for the app's own API** | Types flow from database to React component with no hand-written client. |

## 2. Code map

```
prisma/schema.prisma        database schema
src/app/                    Next.js routes
  (auth)/                   login, signup
  (dashboard)/              workflows, credentials, executions, editor
  api/                      trpc, auth, inngest, trigger, webhooks/{stripe,google-form}
src/features/               one folder per feature
  executions/components/<node>/   node.tsx  dialog.tsx  action.ts  executor.ts
  triggers/components/<node>/     same four files for each trigger
  workflows|credentials|editor/   hooks, params, server routers
src/inngest/                client, the execute-workflow function, topological sort, realtime channels
src/trpc/                   procedures (public, protected, premium) and root router
src/lib/                    auth, db, api-key, webhook-token, ssrf guard, polar
```

Every node is built from the same four files:

| File | Runs where | Job |
|---|---|---|
| `node.tsx` | browser | the box on the canvas, shows live status |
| `dialog.tsx` | browser | settings form (React Hook Form + Zod) |
| `action.ts` | server action | issues the realtime subscription token |
| `executor.ts` | Inngest | does the real work |

## 3. The editor

- The canvas is **React Flow**. Each workflow step is a node; each arrow is a connection.
- The React Flow instance lives in a **Jotai** atom so the Save and Run buttons (outside the canvas) can read it.
- **Save** sends all nodes and edges to `workflows.update`. The server checks that the workflow belongs to the user and that every edge points at a real node, then replaces the workflow's nodes and connections in one transaction.
- Node settings are stored as JSON in `Node.data`.
- Server data (workflows, credentials, executions) is fetched with **TanStack Query** through tRPC and prefetched in Server Components.

## 4. API layer and auth

tRPC procedures come in three levels:

```
baseProcedure        anyone
 └ protectedProcedure   needs a session (better-auth)
    └ premiumProcedure     also needs an active Polar subscription
```

Every query and mutation filters by the signed-in user's id, so users only ever see their own workflows, credentials and executions. Pages are guarded by `requireAuth()` in the dashboard layout.

Login supports email/password, GitHub and Google. Polar creates a billing customer at signup; creating workflows and credentials requires a subscription.

## 5. How a workflow runs

1. **Trigger.** The Run button, a webhook, or the REST API sends the event `workflow/execute.workflow` to Inngest.
2. **Execution record.** The `execute-workflow` function creates an `Execution` row (status RUNNING).
3. **Order the nodes.** It loads nodes and connections and sorts them with `toposort`, so each node runs after the ones feeding it. Cycles raise a clear error.
4. **Run each node.** `getExecutor(node.type)` returns the executor, which receives the node's settings, the user id, the shared context and Inngest's `step` and `publish` helpers.
5. **Finish.** The final context is saved to `Execution.output` and the status becomes SUCCESS. If anything fails after retries (3 in production), an `onFailure` handler marks it FAILED with the error.

### The shared context

A plain object that grows as nodes run. Each node stores its result under the **variable name** chosen in its settings:

```
after trigger:      { stripe: { eventType: "payment_intent.succeeded", ... } }
after OpenAI node:  { stripe: {...}, summary: { text: "Payment received..." } }
after Gmail node:   { stripe: {...}, summary: {...}, email: { success: true, messageId: "..." } }
```

Any text field in a node can read this with Handlebars: `Hi {{stripe.raw.customer}}, {{summary.text}}`, or `{{json summary}}` to embed a whole object.

### Live status

Each executor calls `publish(channel.status({ nodeId, status }))` with `loading`, `success` or `error`. The browser subscribes through Inngest Realtime and the node on the canvas changes colour as the run progresses.

### Executor pattern (example)

All five AI nodes follow the same steps: validate settings, render the Handlebars prompts, load the user's credential (always filtered by `userId`), call the model with `step.ai.wrap` (so a retry never repeats a call that already succeeded), and return the context plus `{ [variableName]: { text } }`.

## 6. Nodes

| Type | Node | Notes |
|---|---|---|
| Trigger | Manual | Run button in the editor |
| Trigger | Stripe, Google Form | Webhook URL with a per-workflow token |
| Trigger | API | `POST /api/trigger` with a bearer key |
| Action | HTTP Request | Any REST endpoint; blocked from private networks |
| Action | OpenAI, Anthropic, Gemini, DeepSeek, Perplexity | Text generation via Vercel AI SDK |
| Action | Luma | Image generation |
| Action | Gmail, Custom SMTP | Email through Nodemailer |
| Action | Discord | Incoming webhook message |
| Action | Instagram | Post an image through the Graph API |

## 7. Starting a run from outside

**Webhooks** (`/api/webhooks/stripe`, `/api/webhooks/google-form`): the URL contains `workflowId` and a `token`, an HMAC of the workflow id keyed with `API_SECRET_KEY`. The trigger dialog shows the full URL to the workflow's owner. Requests with a wrong token or unknown workflow get 401. Stripe's own signature is not verified.

**REST API** (`POST /api/trigger`, `Authorization: Bearer cf_sk2_...`, body `{ "payload": {...} }`):
- The key is an AES-256-GCM encrypted blob holding `userId`, `workflowId` and the trigger node id. Tampering is detected.
- The route then confirms in the database that this user owns the workflow and the trigger node still exists.
- Old `cf_sk_` (CBC) keys are still accepted but go through the same database check.
- The payload appears in the context as `api`.

## 8. Data model

```
User ─┬─< Workflow ─┬─< Node ──> Credential (optional)
      │             ├─< Connection (fromNode → toNode)
      │             └─< Execution (status, output, error)
      ├─< Credential
      └─< Session, Account   (better-auth)
```

Deleting a user or workflow cascades to everything below it. `Execution.inngestEventId` is unique and links a database row to its Inngest run.

## 9. Security model

| Area | What is in place |
|---|---|
| Access control | Every tRPC call filters by user id; executors load credentials with `where: { id, userId }` |
| Run triggers | Ownership checked when API keys are created and when they are used; webhooks need a token |
| Outbound requests | HTTP Request and SMTP hosts are resolved and rejected if loopback, private or link-local (e.g. cloud metadata); redirects are not followed |
| API keys | AES-256-GCM, key derived from `API_SECRET_KEY` |
| Credentials in lists | List endpoints return only id, name and type; secrets are returned only when editing one credential |
| Headers | `X-Frame-Options`, `nosniff`, HSTS, referrer and permissions policies |

**Known gaps:** credentials are stored unencrypted in the database; no rate limiting; API keys cannot be revoked individually; the SSRF check does not pin the resolved IP (DNS-rebinding gap); Stripe signatures are not verified.

## 10. Errors and observability

- Executors throw `NonRetriableError` for bad configuration (no retry), plain errors for transient failures (retried).
- Zod validates every tRPC input.
- Sentry captures server and browser errors.
- The Executions page shows each run's status, output and error.

## 11. Environment variables

See [`.env.example`](.env.example). Required: `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, GitHub and Google OAuth ids/secrets, `INNGEST_EVENT_KEY`, `INNGEST_SIGNING_KEY`, `API_SECRET_KEY`, `POLAR_ACCESS_TOKEN`, `POLAR_SUCCESS_URL`, `NEXT_PUBLIC_APP_URL`. Optional: `SENTRY_DSN`, `NGROK_URL`.

## 12. Tech stack

Next.js 16 (App Router, Turbopack) · React 19 · TypeScript · Tailwind 4 + shadcn/ui · React Flow · tRPC 11 · TanStack Query · Jotai · Prisma 6 + PostgreSQL · Inngest + Realtime · better-auth · Polar · Vercel AI SDK · Nodemailer · Handlebars · Sentry · Biome
