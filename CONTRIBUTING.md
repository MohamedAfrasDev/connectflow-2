# Contributing / Git workflow

Even as a solo project, ConnectFlow follows a small-PR workflow.

## Branches and pull requests

- `master` is always deployable. Don't commit features straight to it.
- One branch per change, named `<type>/<short-description>`, e.g. `feat/slack-node`, `fix/webhook-auth`.
- Keep PRs small and focused (one feature or fix). Fill in the PR template.
- Before opening a PR run:

```bash
npx tsc --noEmit
npm run lint
```

## Commit messages (Conventional Commits)

```
<type>(optional scope): <summary in imperative mood, under ~72 chars>

Optional body: what changed and why.
```

| Type | Use for |
|---|---|
| `feat` | a new user-facing capability |
| `fix` | a bug fix |
| `docs` | documentation only |
| `refactor` | code change that neither fixes a bug nor adds a feature |
| `chore` | tooling, dependencies, formatting |
| `test` | adding or fixing tests |
| `perf`, `ci`, `build` | as named |

Good: `feat(nodes): add Slack message node`, `fix(trigger): verify workflow ownership`.
Avoid: `Updated`, `fix stuff`, `wip`.

History is never rewritten on `master`; old vague commits stay as they are.

## Git identity

Commit as one identity. `.mailmap` maps the three historical author names to `MohamedAfrasDev`:

```bash
git config user.name "MohamedAfrasDev"
git config user.email "mohamedafrasai@gmail.com"
```
