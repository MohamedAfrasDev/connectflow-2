# Portfolio Readiness Checklist — ConnectFlow

What reviewers look for (from the sources at the bottom), checked against this repo.
`[x]` = already done, `[ ]` = to do. Items marked **(high impact)** are what a recruiter notices in the first minute.

## Progress
**Done:** README, ARCHITECTURE, `.env.example`, LICENSE, repo cleanup, security fixes.
**Next (highest impact first):** screenshots/GIF, deploy + live demo link, tests + GitHub Actions, re-enable TypeScript build checks, case study, pin the repo.

## 1. First impression (README + repo front page)
- [x] **(high impact)** Real `README.md` (short project page) with the deep dive moved to a simplified `ARCHITECTURE.md` (~170 lines)
- [x] **(high impact)** One-line pitch at the top
- [ ] **(high impact)** Screenshots or a 30–60s GIF/video of the editor running a workflow
- [ ] **(high impact)** Live demo link (and demo login or a read-only demo account)
- [x] Tech-stack list near the top (badges optional)
- [x] "Features" list
- [x] "Getting started": prerequisites, install, env setup, DB migrate, dev scripts
- [x] `.env.example` with placeholders for every variable
- [x] "What I learned / key decisions" section (Inngest, executor registry, context + Handlebars, security)
- [x] "Roadmap" section (what to improve next)
- [ ] Your role stated clearly if any part was not yours
- [x] Architecture documentation exists, now simplified and up to date (strong differentiator)

## 2. Live demo
- [ ] Deployed and reachable (Vercel config exists; Polar is hardcoded to `sandbox`, fine for a demo)
- [ ] Every link in README/portfolio site tested, no dead links
- [ ] Cold start is acceptable (free-tier hosting sleeps; warn or keep warm)
- [ ] Demo works without needing reviewer to pay: seed a demo user/subscription or bypass `premiumProcedure` in demo mode
- [ ] Sensitive nodes (SMTP, Gmail, Instagram) are disabled or sandboxed in the public demo

## 3. Code quality and repo hygiene
- [x] **(high impact)** Removed committed junk: `mprocs.log` and the stale `src/generated/client` (incl. Prisma `.node` binaries); `.gitignore` updated (`tsbuildinfo` was never tracked)
- [x] Fixed `mprocs.yaml` script name so `npm run dev:all` works
- [x] Turned off `typescript.ignoreBuildErrors`; `tsc --noEmit` is clean
- [x] `npm run lint`: 0 errors (30 minor warnings left, mostly unused-var and a11y hints)
- [x] Deleted dead code and stale comments ("can be removed if you wish", "--- ADDED ---" markers in credentials router)
- [x] Removed leftover `any` types and debug/sensitive `console.log` calls
- [x] Consistent formatting (Biome applied repo-wide)
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
- [x] Short "Security notes" section in README summarising the above (including known gaps)
- [ ] Confirm no secrets in git history (a quick scan found none) and `.env*` stays ignored

## 7. Portfolio-site presentation
- [ ] Pin this repo on GitHub (reviewers mostly look at 4–6 pinned repos)
- [ ] Project card: name, one-line description, stack, **Live Demo** and **GitHub** buttons visible together
- [ ] GitHub repo description, topics/tags and website URL filled in
- [ ] Short case study: problem → approach → key decisions → result → what you'd change
- [ ] Feature this as one of 2–4 flagship projects; hide half-finished ones
- [ ] Profile README / bio is a pitch, not a keyword dump
- [ ] LinkedIn and GitHub tell the same story
- [x] `LICENSE` file added (MIT)

## 8. Originality (this project already scores well)
- [x] Not a tutorial clone: real-time execution engine, 15 integrations, billing, background jobs
- [ ] Call out in the write-up what is *yours* versus what came from a course or template

## Suggested order (about a day each)
1. ~~Real README + `.env.example` + remove junk files~~ done; still add screenshots
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
