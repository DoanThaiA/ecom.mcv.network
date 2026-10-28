# Internal–Main Reconciliation Design

Date: 2026-07-22
Target repository: `mmenuio/cchat-e-commerce`
Target branch: `internal`

## Context

`main` and `internal` have diverged since commit
`f079d71652530b363cca2ff4d4cf6520982bb817` on 2026-03-02. At the
start of this reconciliation:

- `main`: `a41da3f9b98dcc892f4cdbe3083947a4b01ce2dd`
- `internal`: `588e92fd073fbe9d20fff64546251dab0546e41f`
- divergence: 217 commits reachable only from `main`, 347 only from
  `internal`
- net tree difference: 273 files

A regular merge would risk retaining obsolete `internal` changes. A force reset
would make review and rollback unnecessarily dangerous, especially because
`internal` is the repository's default branch.

## Goals

1. Preserve an exact, remotely accessible backup of the current `internal` tip.
2. Make the resulting `internal` application tree use `main` as its source of
   truth.
3. Preserve only an explicit allowlist of internal-specific safeguards and
   deployment configuration.
4. Keep the existing CMS internal access gate.
5. Prevent plaintext credentials from being copied into the reconciled
   `internal` ConfigMap.
6. Connect the reconciled frontend, CMS, API, worker, Redis queues, and realtime
   channel to the intended internal environment.
7. Complete the change through a reviewable draft PR without force-pushing
   `internal`.

## Non-goals

- Rewriting Git history to erase previously committed credentials.
- Rotating external credentials; owners must do that outside Git.
- Replacing the client-side CMS access gate with a true network security
  boundary.
- Applying Kubernetes manifests directly to the cluster.
- Querying or mutating application databases.

## Backup

The pinned input snapshot is preserved before reconciliation:

- branch: `backup/internal-pre-main-sync-20260722`
- commit: `588e92fd073fbe9d20fff64546251dab0546e41f`
- draft PR: `#1817`

The backup PR is archival and must never be merged into `main`. Because the
backup commit remains an ancestor of the reconciled history, the backup branch
cannot later be opened directly as a restoration PR. A rollback must start a
new recovery branch from the then-current `internal`, materialize the backup
commit's tree into a new commit, verify that tree against the pinned backup,
and open a reviewed recovery PR to `internal`. Never force-reset the branch.

## Desired Tree

The reconciliation branch starts from the current `internal` tip, records
`main` as merged ancestry, and materializes the `main` tree. This makes future
`main` to `internal` synchronization use a recent merge base while keeping the
PR diff relative to the current `internal` tree.

The final tree must match `main` except for this allowlist:

1. `infra/k8s/prod/configmap/cchat-api-internal.yaml`
   - Keep the sanitized `internal` form.
   - Do not include literal storage, CDP, Nhanh, mail, or other credentials.
   - Runtime secrets are expected to come from the referenced
     `cchat-api-secret`; this is a rollout prerequisite because the workflow
     does not apply or inspect the cluster Secret.
2. `.github/workflows/frontend-pr-check.yml`
   - Preserve the internal-only Node 22 frontend lint/test gate for future PRs
     targeting `internal`.
3. This reconciliation design document.
4. `docs/superpowers/plans/2026-07-22-internal-main-reconciliation.md`
   - Preserve the implementation plan and its validation record for review and
     audit.
5. The user-authorized frontend CI repair set added after draft publication:
   - `frontend/app/health/route.test.ts`
   - `frontend/lib/utils/reviewConverter.ts`
   - `frontend/test/components/ads/AdBanner.test.tsx`
   - `frontend/test/components/ads/AdSection.test.tsx`
   - `frontend/test/components/cart/CartContent.test.tsx`
   - `frontend/test/components/cart/CartContentDesktop.test.tsx`
   - `frontend/test/components/cart/ConfirmOrderPaymentStatus.test.tsx`
   - `frontend/test/components/category/CategoryCard.test.tsx`
   - `frontend/test/components/news/RelatedNews.test.tsx`
   - `frontend/test/components/product/FlashSaleInProductDetail.test.tsx`
   - remove the orphaned
     `frontend/test/components/product/FlashSaleTimer.test.tsx`
   - `frontend/test/components/product/ProductReviews.test.tsx`
   - `frontend/test/components/product/StockStatusBadge.test.tsx`
   - `frontend/test/components/product/TopProducts.test.tsx`
   - `frontend/test/hooks/useMemberPromoPopup.test.ts`
   - `frontend/test/lib/repositories/cart.repository.test.ts`
   - `frontend/test/lib/repositories/file.repository.test.ts`
   - `frontend/test/lib/repositories/menu.repository.test.ts`
   - `frontend/test/lib/repositories/news.repository.test.ts`
   - `frontend/test/lib/repositories/order.repository.test.ts`
   - `frontend/test/lib/repositories/promotion.repository.test.ts`
   - `frontend/test/lib/repositories/review.repository.test.ts`
   - `frontend/test/lib/repositories/shop.repository.test.ts`
   - `frontend/test/lib/utils/orderMapper.test.ts`
   - `frontend/test/lib/utils/reviewConverter.test.ts`
   - `frontend/test/utils/setup.ts`

   The production change is limited to normalizing review media values from
   both the raw REST response (`image`/`video`) and the generated numeric
   protobuf enum so image media remains an image in either representation.
   Every other frontend path in this set updates tests or test infrastructure
   to the current `main` behavior. The required frontend check must remain
   enabled; it is not bypassed or changed to ignore failures.

The old `.github/workflows/test.yml` is not preserved. It uses Node 24 while the
runtime build uses Node 22 and runs an unscoped backend suite. A replacement can
be designed separately after its database and integration-test behavior is
audited.

## CMS Access Gate

No port is required. The following files have identical blobs on the pinned
`main` and `internal` tips:

- `cms/src/components/access-gate/access-gate.ts`
- `cms/src/main.tsx`

The gate remains active only for the internal CMS hostname. It blocks the React
application from mounting until the browser-side bypass state is present. It is
a deterrent for accidental access, not a security boundary: its bypass logic is
shipped to the browser and API authorization must remain authoritative.

## Internal Connectivity

Use the `main` versions of the internal deployment workflows and Helm values:

- `.github/workflows/backend-build-gke.yml`
- `.github/workflows/cms-build-gke.yml`
- `.github/workflows/frontend-build-gke.yml`
- `.github/workflows/worker-build-gke.yml`
- `infra/charts/cchat-backend/values-internal.yaml`
- `infra/charts/cchat-worker/values-internal.yaml`

These workflows deploy only when the branch is `internal` and target the
`*-internal` deployments. The CMS and frontend builds inject the internal API
URL; the frontend build also injects the internal WebSocket URL. The backend and
worker load `NODE_ENV=internal`, so queue names and cache prefixes remain
environment-scoped.

The reconciliation uses the current Redis configuration from the pinned `main`
tip. This assumes the Redis endpoint recently repaired on `main` is also the
intended shared Redis service for `internal`; the environment-specific queue
names and cache prefixes prevent logical collisions. Moving the Redis URL and
credential into `cchat-api-secret` is a follow-up because the current code does
not yet read that URL from the environment. The hard-coded credential prevents
normal Secret-based rotation and is a security blocker before merge unless the
security owner explicitly accepts the temporary debt and records a rotation
plan.

Tracked `frontend/.env` is taken from `main`. It is not the deployment source of
truth: the internal workflow rewrites `.env` during image build with the
internal API and WebSocket endpoints.

The pinned `main` frontend workflow also places the Sentry build token in that
file, prints the file, and sends it into a Docker build context without a
`.dockerignore`. GitHub masking is not a sufficient boundary. This inherited
behavior must be fixed before merge (without exposing the token in review
output); publishing a draft PR does not run the push-only deployment workflow.

## Versions and Deployment Trigger

Use the version files from `main` without an additional bump. All four differ
from the old `internal` snapshot, so the reconciliation PR changes:

- `backend/version.json`
- `backend/worker/version.json`
- `cms/version.json`
- `frontend/version.json`

Those path changes trigger the four internal image build/deploy workflows while
keeping the source tree aligned with `main`.

The workflows update container images only; they do not apply ConfigMaps,
Secrets, HTTPRoutes, or Helm releases. Existing cluster resources must therefore
already provide `cchat-api-internal` and `cchat-api-secret` before rollout.

## Git and PR Strategy

1. Work only in an isolated worktree on
   `agent/reconcile-internal-from-main-20260722`, initially based on the pinned
   `internal` commit.
2. Record the design document.
3. Create a two-parent reconciliation commit that records the pinned `main` tip
   as merged while using the `main` tree as content.
4. Apply only the explicit allowlist above.
5. Open a draft PR from the reconciliation branch to `internal`.
6. Do not force-push or delete `internal`.

The draft is a review artifact, not approval to merge. It must disclose the
inherited red validation gates and security blockers. To preserve the pinned
`main` ancestry, the eventual PR must be merged with a regular merge commit;
squash or rebase merge would discard the reconciliation commit's second-parent
relationship.

The PR description must identify both pinned source SHAs, the backup PR, the
allowlisted differences, validation evidence, deployment behavior, and rollback
procedure.

## Validation

Validation must not query or write an application database.

### Structural checks

- Confirm both expected parents are present in the reconciliation history.
- Compare the final tree with pinned `main`; only the allowlisted files may
  differ.
- Confirm the backup remote branch still points to the original `internal` SHA.
- Confirm the CMS gate files remain byte-identical to pinned `main`.
- Confirm all four version paths differ from old `internal`.
- Run `git diff --check`.

### Secret and configuration checks

- Assert the internal ConfigMap contains no forbidden credential keys or literal
  secret values.
- Confirm backend and worker values reference `cchat-api-internal` and
  `cchat-api-secret`.
- Confirm internal CMS/frontend workflow API URLs and the frontend WebSocket URL
  use the internal hosts.
- Confirm workflows deploy only to the `*-internal` deployments.
- Do not print credential values in logs, test output, PR text, or reports.

### Build and test checks

- Install dependencies from each committed lockfile in the isolated worktree.
- Run backend lint and TypeScript checks plus unit tests that do not connect to a
  database.
- Run worker build/type checks without starting the worker.
- Run frontend lint, unit tests, and build using non-secret internal build-time
  configuration.
- Run CMS formatting/lint checks, unit tests relevant to bootstrap/access, and
  build using a non-secret internal API URL.
- Render the available Helm charts locally when `helm` is installed.

Any test requiring a live database is excluded unless it is proven read-only;
no database writes are permitted.

## Rollout and Rollback

The PR remains draft until structural, secret, build, and test checks are
recorded. It must not be merged while required repository checks are red or the
inherited Redis/frontend-token security findings remain unresolved or lack an
explicit maintainer/security exception. Before merge, obtain Node 22 evidence
for backend/CMS, render the internal Helm charts, and confirm the existing
ConfigMap, Secret, routes, and deployment permissions outside this read-only
task. The current workflows only set images and do not wait for rollout health,
so after an approved merge the operator must monitor all four internal
deployments and verify their health endpoints and CMS access-gate behavior.

If rollout fails, create `recovery/internal-pre-main-sync-20260722` from the
then-current `origin/internal` in a new isolated worktree. Materialize the exact
tree at `588e92fd073fbe9d20fff64546251dab0546e41f`, commit that restoration,
verify the resulting tree is byte-identical to the backup commit, and open a
reviewed PR back to `internal`. The backup branch and PR retain the exact
pre-reconciliation state for comparison; they are not themselves a directly
mergeable rollback. Do not reset or force-push `internal`.

## Known Follow-ups

1. Remove plaintext credentials from `main` and rotate any still-valid values.
2. Move Redis connection configuration to Kubernetes Secret/secret manager.
3. Stop printing the frontend build environment, pass the Sentry token as a
   build secret, and exclude local environment files from Docker context.
4. Add rollout-health checks to the four internal deployment workflows and
   reconcile stale Helm image tags before the next Helm-driven rollout.
5. Replace the CMS browser-side trick with Gateway/Ingress/IAP protection if it
   must be a real access-control boundary.
6. Decide whether to replace the removed backend PR workflow with a scoped Node
   22 CI workflow that cannot contact live databases.
