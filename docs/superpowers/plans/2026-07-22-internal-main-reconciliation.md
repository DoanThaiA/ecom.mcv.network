# Internal–Main Reconciliation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the `internal` application tree with the pinned `main` tree through a reviewable PR while preserving the approved internal-only allowlist, the exact pre-change backup, and the `main` branch unchanged.

**Architecture:** Work on one isolated branch descended from the pinned `internal` tip. Create a two-parent reconciliation commit whose second parent is the pinned `main` tip, materialize `main` as the content tree, then restore only the approved internal ConfigMap, frontend PR check, and reconciliation documentation. Validate tree identity, secrets, environment routing, builds, tests, backup integrity, and `main` ref integrity before an explicit non-force push and a draft PR whose base is `internal`.

**Tech Stack:** Git worktrees and merge objects, GitHub CLI, GitHub Actions, Kubernetes/Helm YAML, Node.js/npm, NestJS/TypeScript/Jest, Next.js/Vitest, Vite/Vitest.

## Global Constraints

- Pinned `main` source: `a41da3f9b98dcc892f4cdbe3083947a4b01ce2dd`.
- Pinned old `internal`: `588e92fd073fbe9d20fff64546251dab0546e41f`.
- Backup branch must remain `backup/internal-pre-main-sync-20260722` at the pinned old `internal` SHA.
- Backup draft PR is `#1817` and must not be merged.
- Work only in `/private/tmp/cchat-reconcile-internal-from-main-20260722` on `agent/reconcile-internal-from-main-20260722`.
- Never switch, commit, merge, reset, push, or open a reconciliation PR against `main`.
- Never force-push or delete `internal`.
- Push only `agent/reconcile-internal-from-main-20260722`; open the reconciliation PR with base `internal`.
- Publication is draft-only. Do not merge while repository validation gates or
  the recorded security/rollout blockers remain unresolved.
- The eventual integration must use a regular merge commit, not squash or
  rebase merge, so the pinned `main` second-parent ancestry is preserved.
- Never print secret values in terminal output, commits, plans, PR text, or reports.
- Never query or write an application database. Do not start API/worker processes or run unreviewed integration tests.
- The reconciliation merge commit initially preserved only these final-tree
  differences from pinned `main`:
  - `infra/k8s/prod/configmap/cchat-api-internal.yaml` from pinned old `internal`.
  - `.github/workflows/frontend-pr-check.yml` from pinned old `internal`.
  - `docs/superpowers/specs/2026-07-22-internal-main-reconciliation-design.md`.
  - `docs/superpowers/plans/2026-07-22-internal-main-reconciliation.md`.
- After the required frontend check failed, the user explicitly authorized a
  follow-up repair on this PR. The final additional allowlist is the exact
  frontend CI repair set in the design document's **Desired Tree** section.
  Do not add other runtime or test paths and do not weaken the required check.

---

### Task 1: Commit the reviewed implementation plan and re-run safety preflight

**Files:**
- Create: `docs/superpowers/plans/2026-07-22-internal-main-reconciliation.md`
- Existing: `docs/superpowers/specs/2026-07-22-internal-main-reconciliation-design.md`

**Interfaces:**
- Consumes: reviewed design commit `91565ff1` and the two pinned source SHAs.
- Produces: a clean reconciliation branch whose first-parent history still descends from old `internal`.

- [ ] **Step 1: Confirm the isolated branch and both protected source refs**

Run:

```bash
git branch --show-current
git rev-parse refs/heads/main
git rev-parse origin/main
git rev-parse origin/internal
git status --short
```

Expected:

```text
agent/reconcile-internal-from-main-20260722
a41da3f9b98dcc892f4cdbe3083947a4b01ce2dd
a41da3f9b98dcc892f4cdbe3083947a4b01ce2dd
588e92fd073fbe9d20fff64546251dab0546e41f
?? docs/superpowers/plans/2026-07-22-internal-main-reconciliation.md
```

- [ ] **Step 2: Verify the remote backup ref without updating any local branch**

Run:

```bash
git ls-remote origin refs/heads/backup/internal-pre-main-sync-20260722
```

Expected first field:

```text
588e92fd073fbe9d20fff64546251dab0546e41f
```

- [ ] **Step 3: Validate and commit only the plan**

Run:

```bash
git diff --check
git add docs/superpowers/plans/2026-07-22-internal-main-reconciliation.md
git diff --cached --check
git diff --cached --name-only
git commit -m "docs: plan internal main reconciliation"
```

Expected staged file before commit:

```text
docs/superpowers/plans/2026-07-22-internal-main-reconciliation.md
```

Expected result: one documentation commit and a clean worktree.

### Task 2: Create the two-parent reconciliation commit

**Files:**
- Materialize from pinned `main`: repository tree at `a41da3f9b98dcc892f4cdbe3083947a4b01ce2dd`.
- Restore from old `internal`: `infra/k8s/prod/configmap/cchat-api-internal.yaml`.
- Restore from old `internal`: `.github/workflows/frontend-pr-check.yml`.
- Restore from current first parent: both reconciliation documents.
- Remove through `main` materialization: `.github/workflows/test.yml` and every obsolete internal-only tree entry.

**Interfaces:**
- Consumes: clean plan commit, pinned source trees, approved allowlist.
- Produces: one merge commit with old `internal` ancestry on the first-parent side and pinned `main` as the second parent.

- [ ] **Step 1: Re-run destructive-operation guards immediately before materialization**

Run:

```bash
git status --porcelain
git branch --show-current | rg -x 'agent/reconcile-internal-from-main-20260722'
git rev-parse refs/heads/main | rg -x 'a41da3f9b98dcc892f4cdbe3083947a4b01ce2dd'
git rev-parse origin/main | rg -x 'a41da3f9b98dcc892f4cdbe3083947a4b01ce2dd'
git rev-parse origin/internal | rg -x '588e92fd073fbe9d20fff64546251dab0546e41f'
```

Expected: the first command prints nothing and every guard exits `0`.

- [ ] **Step 2: Record pinned `main` as pending merge ancestry without resolving its tree**

Run:

```bash
git merge --no-commit -s ours a41da3f9b98dcc892f4cdbe3083947a4b01ce2dd
git rev-parse MERGE_HEAD
```

Expected `MERGE_HEAD`:

```text
a41da3f9b98dcc892f4cdbe3083947a4b01ce2dd
```

- [ ] **Step 3: Materialize exactly the pinned `main` tree in the isolated worktree**

Run only from `/private/tmp/cchat-reconcile-internal-from-main-20260722` after all Step 1 guards pass:

```bash
git read-tree --reset -u a41da3f9b98dcc892f4cdbe3083947a4b01ce2dd
```

Expected: the index and isolated worktree now contain the pinned `main` tree; `MERGE_HEAD` remains present. No other worktree or ref changes.

- [ ] **Step 4: Restore the approved allowlist from explicit sources**

Run:

```bash
git restore --source=HEAD --staged --worktree -- \
  docs/superpowers/specs/2026-07-22-internal-main-reconciliation-design.md \
  docs/superpowers/plans/2026-07-22-internal-main-reconciliation.md

git restore --source=588e92fd073fbe9d20fff64546251dab0546e41f \
  --staged --worktree -- \
  infra/k8s/prod/configmap/cchat-api-internal.yaml \
  .github/workflows/frontend-pr-check.yml
```

Expected: the desired tree equals pinned `main` except for exactly four allowlisted paths.

- [ ] **Step 5: Inspect staged scope without displaying file contents that may contain secrets**

Run:

```bash
git status --short
git diff --cached --stat
git diff --cached --name-status
git diff --cached a41da3f9b98dcc892f4cdbe3083947a4b01ce2dd --check
```

Expected: a large reconciliation diff relative to old `internal`, no unmerged
paths, and no whitespace errors introduced by the four allowlisted differences.
The pinned `main` tree itself contains pre-existing whitespace findings, so a
check against the old `internal` parent would not distinguish inherited content
from reconciliation-specific changes.

- [ ] **Step 6: Commit the reconciliation while `MERGE_HEAD` is present**

Run:

```bash
git commit -m "chore: reconcile internal with main"
```

Expected: one merge commit with two parents.

### Task 3: Prove tree identity, backup integrity, secret hygiene, and `main` safety

**Files:**
- Verify: complete tree at `HEAD`.
- Verify: `infra/k8s/prod/configmap/cchat-api-internal.yaml`.
- Verify: CMS access gate and internal workflows/values.

**Interfaces:**
- Consumes: reconciliation merge commit.
- Produces: machine-checkable evidence that the final tree and Git topology match the approved design.

- [ ] **Step 1: Verify two-parent topology and ancestry**

Run:

```bash
git rev-parse HEAD^2
git merge-base --is-ancestor 588e92fd073fbe9d20fff64546251dab0546e41f HEAD^1
git merge-base --is-ancestor a41da3f9b98dcc892f4cdbe3083947a4b01ce2dd HEAD
```

Expected: `HEAD^2` equals pinned `main`; both ancestry checks exit `0`.

- [ ] **Step 2: Verify the final-tree allowlist against pinned `main`**

Run:

```bash
git diff --name-only a41da3f9b98dcc892f4cdbe3083947a4b01ce2dd..HEAD | sort
```

Expected exactly:

```text
.github/workflows/frontend-pr-check.yml
docs/superpowers/plans/2026-07-22-internal-main-reconciliation.md
docs/superpowers/specs/2026-07-22-internal-main-reconciliation-design.md
infra/k8s/prod/configmap/cchat-api-internal.yaml
```

- [ ] **Step 3: Verify source blobs and deployment triggers**

Run:

```bash
git diff --quiet a41da3f9b98dcc892f4cdbe3083947a4b01ce2dd HEAD -- \
  cms/src/components/access-gate/access-gate.ts cms/src/main.tsx
git diff --quiet a41da3f9b98dcc892f4cdbe3083947a4b01ce2dd HEAD -- \
  backend/src/utils/env.ts
for version_file in backend/version.json backend/worker/version.json cms/version.json frontend/version.json; do
  if git diff --quiet 588e92fd073fbe9d20fff64546251dab0546e41f HEAD -- "$version_file"; then
    exit 1
  fi
done
true
```

Expected: both source comparisons exit `0`; all four version paths differ from old `internal`.

- [ ] **Step 4: Verify the internal ConfigMap has no forbidden literal credential entries without printing values**

Run:

```bash
git show HEAD:infra/k8s/prod/configmap/cchat-api-internal.yaml | \
  awk -F: '/^  (MAIL_USER|ACCESS_KEY_ID|SECRET_ACCESS_KEY|CDP_PASSWORD|CDP_PHONE|NHANH_APP_ID|NHANH_APP_SECRET):/ {found=1} END {exit found}'
git diff --quiet 588e92fd073fbe9d20fff64546251dab0546e41f HEAD -- \
  infra/k8s/prod/configmap/cchat-api-internal.yaml
```

Expected: both commands exit `0` and print no credential values.

- [ ] **Step 5: Verify internal routing and deployment names using boolean assertions**

Run:

```bash
git show HEAD:.github/workflows/frontend-build-gke.yml | rg -q 'NEXT_PUBLIC_API_URL=https://internalcchatapi\.mmenu\.io/api/v1'
git show HEAD:.github/workflows/frontend-build-gke.yml | rg -q 'NEXT_PUBLIC_WS_URL=wss://internalcchatapi\.mmenu\.io'
git show HEAD:.github/workflows/cms-build-gke.yml | rg -q 'VITE_API_URL=https://internalcchatapi\.mmenu\.io/api/v1'
git show HEAD:.github/workflows/backend-build-gke.yml | rg -q 'deployment/cchat-backend-internal'
git show HEAD:.github/workflows/worker-build-gke.yml | rg -q 'deployment/cchat-worker-internal'
git show HEAD:infra/charts/cchat-backend/values-internal.yaml | rg -q 'configEnv: cchat-api-internal'
git show HEAD:infra/charts/cchat-backend/values-internal.yaml | rg -q 'secretEnv: cchat-api-secret'
git show HEAD:infra/charts/cchat-worker/values-internal.yaml | rg -q 'configEnv: cchat-api-internal'
git show HEAD:infra/charts/cchat-worker/values-internal.yaml | rg -q 'secretEnv: cchat-api-secret'
```

Expected: every assertion exits `0` and prints no secret values.

- [ ] **Step 6: Reconfirm backup and local `main` integrity**

Run:

```bash
git ls-remote origin refs/heads/backup/internal-pre-main-sync-20260722
git rev-parse refs/heads/main
git rev-parse origin/main
git status --porcelain
git diff --check a41da3f9b98dcc892f4cdbe3083947a4b01ce2dd..HEAD
```

Expected:

- backup remote SHA is pinned old `internal`;
- local `main` and local `origin/main` remain pinned `main`;
- reconciliation worktree is clean;
- reconciliation-only diff check exits `0`.

### Task 4: Install and validate without database access

**Files:**
- Verify: `backend/package-lock.json`, `frontend/package-lock.json`, `cms/package-lock.json` from pinned `main`.
- Verify: application source at the reconciliation merge commit.

**Interfaces:**
- Consumes: structurally verified reconciliation tree.
- Produces: lint, type-check, unit-test, build, and chart-render evidence without starting runtime services.

- [ ] **Step 1: Record the local toolchain and install exact dependencies**

Run:

```bash
node --version
npm --version
(cd backend && npm ci)
(cd frontend && npm ci)
(cd cms && npm ci)
```

Expected: all installs exit `0`. Record if the local Node version differs from the Node 22 GitHub workflows; do not modify lockfiles to compensate.

- [ ] **Step 2: Validate backend and worker without starting them**

Run:

```bash
cd backend
npm run lint
npx tsc --project tsconfig.build.json --noEmit
npx tsc --project worker/tsconfig.json --noEmit
npm test -- \
  test/home/home.service.spec.ts \
  test/cache/redis-checker.spec.ts \
  test/cache/cache-config.service.spec.ts
```

Expected: lint/type-check commands exit `0`; the three explicitly reviewed unit suites pass. Do not run `start`, worker runtime, seed, migration, repository integration, or full unreviewed test commands.

- [ ] **Step 3: Validate frontend with non-secret internal public configuration**

Run:

```bash
cd frontend
npm run lint
npm test -- --run
NEXT_PUBLIC_API_URL=https://internalcchatapi.mmenu.io/api/v1 \
NEXT_PUBLIC_WS_URL=wss://internalcchatapi.mmenu.io npm run build
```

Expected: lint and Vitest exit `0`; build exits `0` without requiring secret values or database connectivity.

- [ ] **Step 4: Validate CMS bootstrap and build with a non-secret public API URL**

Run:

```bash
cd cms
npm run fm:check
npm test -- --run
VITE_API_URL=https://internalcchatapi.mmenu.io/api/v1 npm run build:check
```

Expected: formatting and Vitest exit `0`; TypeScript/Vite build exits `0`. No API process is started.

- [ ] **Step 5: Render Helm charts when Helm is available**

Run:

```bash
if command -v helm >/dev/null 2>&1; then
  helm template cchat-backend-internal infra/charts/cchat-backend \
    -f infra/charts/cchat-backend/values-internal.yaml >/dev/null
  helm template cchat-worker-internal infra/charts/cchat-worker \
    -f infra/charts/cchat-worker/values-internal.yaml >/dev/null
fi
```

Expected: both renders exit `0`, or the step records that Helm is not installed. No cluster command is run.

- [ ] **Step 6: Confirm validation created no tracked changes**

Run:

```bash
git status --short
git diff --check
```

Expected: clean output and exit `0`.

#### Execution record (2026-07-22)

- Dependency installation completed for backend, frontend, and CMS. The local
  toolchain was Node `v24.14.1` / npm `11.11.0`; deployment workflows use Node
  22. Only the frontend PR check runs before merge, so CI cannot be treated as
  comprehensive Node 22 evidence for backend or CMS; that remains a pre-merge
  gate.
- Backend server and worker TypeScript checks passed. The three isolated
  Redis/health/cache unit suites passed: 3 suites and 24 tests. Backend lint
  reported 60 pre-existing errors in the pinned `main` source.
- Initial frontend validation had no lint errors, but the inherited full
  Vitest baseline reported 103 test files passing and 24 failing (3189 tests
  passing, 131 failing, with 3 unhandled errors). The required GitHub `Test`
  check therefore blocked PR merge. The user authorized a follow-up that fixed
  stale imports, mocks, repository contracts, and component expectations while
  preserving current behavior coverage; it also normalized the production
  review-media mapping for both the raw REST string value and generated numeric
  protobuf enum, with regression coverage for each representation.
- Post-repair frontend verification passed all 127 test files and all 3266
  collected tests with zero unhandled errors. Lint exited `0` with zero errors
  and 145 inherited warnings. A production build exited `0` with API and
  WebSocket values forced to a closed loopback port and Sentry credentials
  unset. The first sandboxed build attempt failed only because Turbopack could
  not bind an internal local port; the same build completed outside that
  restriction without contacting an application database.
- CMS formatting reported one pre-existing file. The full existing Vitest suite
  could not start its tests because the pinned lockfile does not install the
  required `@testing-library/dom` peer. `build:check` reported pre-existing
  TypeScript errors, while the Vite production build completed successfully.
- Helm was unavailable locally, so chart rendering is deferred to CI/review.
- Backend, CMS, proto, and all dependency-lock content remain byte-identical to
  pinned `main`. Frontend differs from pinned `main` only by the exact
  user-authorized CI repair set recorded in the design document. No validation
  or repair step queried or wrote an application database.
- Independent review also confirmed inherited security/rollout blockers: Redis
  configuration is hard-coded and cannot be rotated through the referenced
  Secret; the frontend workflow prints its generated environment file and puts
  the Sentry token into an unfiltered Docker build context; deployment workflows
  do not wait for rollout health; and Helm image tags are stale. The draft PR
  must disclose these findings and must not claim that all validation passed.

### Task 5: Obtain three independent read-only reviews

**Files:**
- Review: merge topology and tree allowlist.
- Review: secrets, Redis/environment routing, workflows, and Helm values.
- Review: test/build evidence and PR/rollback safety.

**Interfaces:**
- Consumes: clean, validated reconciliation merge commit.
- Produces: severity-ranked findings; reviewers must not edit files, change refs, query databases, or access the cluster.

- [ ] **Step 1: Dispatch one read-only reviewer per independent risk domain**

Expected reviewer constraints:

```text
Read only. Do not edit, stage, commit, switch, reset, merge, push, query a database, or access a cluster. Do not print secret values.
```

- [ ] **Step 2: Independently verify every finding against Git/tree/test evidence**

Expected: no unverified sub-agent claim is accepted. Blocking findings are fixed and the relevant validation is rerun before publication.

### Task 6: Push only the reconciliation branch and open a draft PR to `internal`

**Files:**
- Create temporary local PR body outside the repository.
- No repository file changes after validation.

**Interfaces:**
- Consumes: clean reviewed branch and recorded evidence.
- Produces: a review-only draft PR with base `internal`, exact head branch,
  backup link, full red/pass validation results, merge blockers, and no mutation
  to `main`.

Opening this draft was an explicit review-only exception to the repository's
normal pre-PR green-gate workflow. It was not approval to merge. The body must
preserve the initial red frontend baseline and later record the verified green
frontend result. Backend lint, CMS formatting/tests/type-check, Node 22
backend/CMS validation, and Helm rendering remain disclosed separately.

- [ ] **Step 1: Re-fetch only the target branch and abort if `internal` moved**

Run:

```bash
git fetch origin internal
git rev-parse origin/internal
```

Expected target SHA:

```text
588e92fd073fbe9d20fff64546251dab0546e41f
```

If it differs, stop and rebuild/review the reconciliation against the new tip. Do not rebase or force automatically.

- [ ] **Step 2: Final pre-push guards**

Run:

```bash
git branch --show-current | rg -x 'agent/reconcile-internal-from-main-20260722'
git status --porcelain
git rev-parse refs/heads/main | rg -x 'a41da3f9b98dcc892f4cdbe3083947a4b01ce2dd'
git rev-parse HEAD^2 | rg -x 'a41da3f9b98dcc892f4cdbe3083947a4b01ce2dd'
```

Expected: all guards exit `0`; status prints nothing.

- [ ] **Step 3: Push one explicit head ref without force**

Run:

```bash
git push -u origin agent/reconcile-internal-from-main-20260722
```

Expected: only `refs/heads/agent/reconcile-internal-from-main-20260722` is created or updated. No `main` or `internal` refspec appears.

- [ ] **Step 4: Open a draft PR with base `internal`**

Run:

```bash
gh pr create \
  --repo mmenuio/cchat-e-commerce \
  --draft \
  --base internal \
  --head agent/reconcile-internal-from-main-20260722 \
  --title "chore: reconcile internal with main" \
  --body-file /private/tmp/cchat-internal-reconciliation-pr-body.md
```

Expected: a new draft PR URL.

- [ ] **Step 5: Verify PR metadata and prove `main` stayed untouched**

Run:

```bash
gh pr view agent/reconcile-internal-from-main-20260722 \
  --repo mmenuio/cchat-e-commerce \
  --json number,title,url,isDraft,state,baseRefName,headRefName,commits,files
git rev-parse refs/heads/main
git status --short
```

Expected:

- `isDraft: true`;
- `baseRefName: internal`;
- `headRefName: agent/reconcile-internal-from-main-20260722`;
- local `main` remains `a41da3f9b98dcc892f4cdbe3083947a4b01ce2dd`;
- clean reconciliation worktree.

- [ ] **Step 6: Report without merging**

Report the backup PR, reconciliation PR, pinned SHAs, allowlisted differences,
test/build evidence, red gates, security/rollout blockers, rollout triggers, and
rollback path. A usable rollback creates a new recovery branch from the
then-current `internal`, materializes the pinned backup tree into a new commit,
and opens a reviewed PR; the ancestor backup branch cannot itself restore the
tree through a direct PR. Leave both PRs open as drafts and do not merge either
one.
