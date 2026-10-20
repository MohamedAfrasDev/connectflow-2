# Portfolio Readiness Checklist — ConnectFlow

What reviewers look for (from the sources at the bottom), checked against this repo.
`[x]` = already done, `[ ]` = to do. Items marked **(high impact)** are what a recruiter notices in the first minute.

## 1. First impression (README + repo front page)
- [ ] **(high impact)** Real `README.md` — today it is a byte-for-byte copy of `ARCHITECTURE.md` (990 lines). Make README short; keep the deep dive in ARCHITECTURE.md and link to it.
- [ ] **(high impact)** One-line pitch at the top: "Visual workflow automation platform (n8n/Zapier-style) built with Next.js, tRPC, Prisma, Inngest."
- [ ] **(high impact)** Screenshots or a 30–60s GIF/video of the editor running a workflow
- [ ] **(high impact)** Live demo link (and demo login or a read-only demo account)
- [ ] Tech-stack badges/list near the top
- [ ] "Features" list (15 node types, real-time status, API trigger, webhooks)
- [ ] "Getting started": prerequisites, `npm install`, env setup, DB migrate, `npm run dev:all`
- [ ] `.env.example` with placeholders for every variable (list is in ARCHITECTURE.md §14)
- [ ] "Challenges & decisions" section: why Inngest for durable execution, topological sort, executor registry, security model
- [ ] "What I'd improve next" (shows self-awareness; see §6 below)
- [ ] Your role stated clearly if any part was not yours
- [x] Architecture documentation exists (strong differentiator)

## 2. Live demo
- [ ] Deployed and reachable (Vercel config exists; Polar is hardcoded to `sandbox`, fine for a demo)
- [ ] Every link in README/portfolio site tested, no dead links
- [ ] Cold start is acceptable (free-tier hosting sleeps; warn or keep warm)
- [ ] Demo works without needing reviewer to pay: seed a demo user/subscription or bypass `premiumProcedure` in demo mode
- [ ] Sensitive nodes (SMTP, Gmail, Instagram) are disabled or sandboxed in the public demo

## 3. Code quality and repo hygiene
- [ ] **(high impact)** Remove committed junk: `mprocs.log`, `tsconfig.tsbuildinfo` (add to `.gitignore`), and the prebuilt Prisma `.node` engine binaries under `src/generated/client` (generated output shouldn't be in git)
- [ ] Turn off `typescript.ignoreBuildErrors` in `next.config.ts` and fix the errors — reviewers who read the config will notice
- [ ] Run `npm run lint` clean (Biome is configured)
- [ ] Delete dead code and stale comments ("can be removed if you wish", "--- ADDED ---" markers in credentials router)
- [ ] Remove leftover `any` types and `console.log` of sensitive responses (e.g. mail send info)
- [ ] Consistent formatting (`npm run format`)
- [x] Clear feature-based folder structure
- [x] Executor registry pattern and typed node executors

## 4. Commit history and collaboration
- [ ] Meaningful commit messages going forward; ~10 of 50 commits are just "Updated"
- [ ] Don't rewrite shared history to hide them — just write better ones from now on
- [ ] Use small PRs/branches for new features, even solo (shows team workflow)
- [ ] Consistent git identity (commits use three author names: MohamedAfrasDev, Mohamed Afras, Afras)
- [x] Conventional-commit style started (`feat:`, `fix:`, `docs:`)

## 5. Testing and CI (biggest gap)
- [ ] **(high impact)** Some automated tests — start with pure logic: `topologicalSort` (incl. cycle case), `api-key` encrypt/decrypt/tamper, `ssrf.assertPublicHost`, `webhook-token`
- [ ] One end-to-end or integration test of a workflow run
- [ ] GitHub Actions workflow: install, lint, typecheck, test, build
- [ ] CI status badge in README
- [ ] Run `npm audit` and note/triage results

## 6. Security (done in the last commit; keep it visible)
- [x] Ownership checks on API trigger and key generation
- [x] Authenticated (AES-GCM) API keys; per-workflow webhook tokens
- [x] SSRF guard on HTTP Request and SMTP nodes
- [x] Credential secrets no longer returned by list endpoints
- [x] Security headers
- [ ] Encrypt credentials at rest (known gap — document it or fix it)
- [ ] Rate limiting on `/api/trigger` and webhooks
- [ ] API key revocation
- [ ] Add a short "Security" section in README summarising the above
- [ ] Confirm no secrets in git history (a quick scan found none) and `.env*` stays ignored

## 7. Portfolio-site presentation
- [ ] Pin this repo on GitHub (reviewers mostly look at 4–6 pinned repos)
- [ ] Project card: name, one-line description, stack, **Live Demo** and **GitHub** buttons visible together
- [ ] GitHub repo description, topics/tags and website URL filled in
- [ ] Short case study: problem → approach → key decisions → result → what you'd change
- [ ] Feature this as one of 2–4 flagship projects; hide half-finished ones
- [ ] Profile README / bio is a pitch, not a keyword dump
- [ ] LinkedIn and GitHub tell the same story
- [ ] Add a `LICENSE` file (none today)

## 8. Originality (this project already scores well)
- [x] Not a tutorial clone: real-time execution engine, 15 integrations, billing, background jobs
- [ ] Call out in the write-up what is *yours* versus what came from a course or template

## Suggested order (about a day each)
1. Real README + screenshots + `.env.example` + remove junk files
2. Deploy and verify the demo end to end
3. Tests for the four pure-logic modules + GitHub Actions
4. Re-enable TypeScript build checks and fix errors
5. Write the case study and update the portfolio card

## Sources
- [What Hiring Managers Look for on GitHub (Underdog.io)](https://underdog.io/blog/what-hiring-managers-look-for-on-github)
- [How to Build a Web Developer Portfolio That Gets You Hired (Scrimba)](https://scrimba.com/articles/how-to-build-a-web-developer-portfolio-that-gets-you-hired)
- [Developer Portfolio Checklist: 20 Things Hiring Managers Look For (DevPlaybook)](https://devplaybook.cc/blog/developer-portfolio-checklist-20-things-hiring-managers)
- [What do hiring managers actually look for in a GitHub portfolio (SOLTECH)](https://soltech.net/what-do-hiring-managers-actually-look-for-in-a-github-portfolio/)
- [Portfolio content for tech jobs: what recruiters want (Scale.jobs)](https://scale.jobs/blog/portfolio-content-for-tech-jobs-what-recruiters-want)
- [Junior developer portfolio mistakes to avoid (SlateGit)](https://slategit.com/blog/junior-developer-portfolio-mistakes-to-avoid)
- [Avoiding portfolio mistakes (CodeSignal)](https://codesignal.com/learn/courses/technical-portfolio-and-personal-branding-for-cs-students-1/lessons/avoiding-portfolio-mistakes)

Note: these are mostly career blogs and vendor content, so treat their numbers (e.g. "60-second review") as rules of thumb, not hard data.
