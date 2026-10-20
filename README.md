# ConnectFlow

A no-code workflow automation platform in the spirit of n8n and Zapier. Build visual pipelines on a drag-and-drop canvas, connect a trigger to action nodes, and watch each node's status update live while the workflow runs as a durable background job.

**Live demo:** _add link_ · **Architecture deep dive:** [ARCHITECTURE.md](ARCHITECTURE.md)

<!-- Add a screenshot or GIF of the editor here: ![Editor](docs/editor.png) -->

## Features

- Visual workflow editor (React Flow) with real-time per-node status
- Triggers: manual, Stripe webhook, Google Form webhook, authenticated REST API
- Actions: HTTP request, OpenAI, Anthropic, Gemini, DeepSeek, Perplexity, Luma, Discord, Gmail, custom SMTP, Instagram
- Durable, retryable execution with Inngest; nodes run in topological order with cycle detection
- Handlebars templating to pass data between nodes
- Per-user credential vault, execution history, subscriptions via Polar
- Email/password plus GitHub and Google login (better-auth)

## Tech stack

Next.js 16 (App Router) · React 19 · TypeScript · tRPC · TanStack Query · Jotai · Prisma + PostgreSQL · Inngest (+ Realtime) · better-auth · Polar · Sentry · Tailwind v4 + shadcn/ui · Biome

## Getting started

Prerequisites: Node 20+, a PostgreSQL database.

```bash
npm install
cp .env.example .env     # then fill in the values
npx prisma migrate dev
npm run dev:all          # Next.js + Inngest dev server (+ ngrok if configured)
```

Open http://localhost:3000. Without `mprocs`, run `npm run dev` and `npm run inngest:dev` in two terminals.

| Script | Purpose |
|---|---|
| `npm run dev` | Next.js dev server |
| `npm run inngest:dev` | Local Inngest dev server |
| `npm run lint` / `format` | Biome check / format |
| `npm run build` | Production build |

## How it works

1. A trigger (button, webhook, or API call) sends a `workflow/execute.workflow` event to Inngest.
2. The `execute-workflow` function loads the workflow, topologically sorts its nodes, and runs each through an executor looked up in a registry.
3. Each executor reads the shared context, does its work inside `step.run`, publishes status to the browser over Inngest Realtime, and returns the updated context.

See [ARCHITECTURE.md](ARCHITECTURE.md) for the full design.

## Security notes

- All tRPC data access is scoped to the signed-in user; workflow and credential ownership is checked on every call.
- API-trigger keys are AES-256-GCM tokens, and the server verifies the key's workflow belongs to the key's user.
- Stripe and Google Form webhook URLs carry a per-workflow HMAC token (copy the URL from the trigger dialog).
- The HTTP Request and SMTP nodes refuse loopback, private and cloud-metadata addresses (SSRF guard).
- Known gaps: credentials are stored unencrypted in the database, and there is no rate limiting or API-key revocation yet.

## Roadmap

- Encrypt credentials at rest
- Rate limiting and API-key revocation
- Automated tests and CI

## License

[MIT](LICENSE)
