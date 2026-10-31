# Migration plan — new API + TypeScript

- **Started:** 2026-10-31
- **Branch:** `feat/vue3-ts-new-api`
- **Source issue list:** [`docs/ISSUES.md`](./ISSUES.md)
- **Backend contract:** `clinic-backend/API.md` (new `/api/tickets`, `/api/announcements`,
  `/api/service-dates`, `/api/rooms` endpoints). Legacy `/api/wechat/*`,
  `/api/announcement/*`, `/api/campus/*`, and `/api/date/*` are out of scope.

## Target stack

| Layer | Choice |
| --- | --- |
| Framework | Vue 3 |
| Build | Vite 5+ |
| Language | TypeScript (strict) |
| State | Pinia |
| Router | Vue Router 4, hash history |
| UI | Vant 4 |
| HTTP | axios 1.x |
| Markdown | markdown-it + DOMPurify |
| Tests | Vitest + Vue Test Utils |

## Stages

### Stage 0 — Baseline, branch, fixtures

- [x] Create `feat/vue3-ts-new-api`.
- [x] Commit `docs/ISSUES.md` as the review baseline.
- [x] Add this plan.
- [x] Add API fixtures under `tests/fixtures/api/`.

### Stage 1 — Proxy query handling (DT-007)

- [x] Fix `clinic_proxy_dingtalk/Program.cs` so `username` is appended with
  `&` when the target URL already has a query string.
- [x] Apply the same helper to GET/POST/PUT/DELETE.
- [x] Extract `ProxyUrlBuilder.Build()` so it can be tested independently.
- [ ] Add a .NET test project when the SDK is available in the deployment/CI
  environment. The .NET SDK is not installed in the current workspace, so the
  proxy change could not be compiled here.

### Stage 2 — Toolchain and app shell

- [x] Vite + Vue 3 + TypeScript + Pinia + Vue Router + Vant.
- [x] ESLint/Prettier/Vitest scripts.
- [x] Dev proxy middleware reusing `proxySim`.
- [x] Remove webpack, Babel 6, VUX, and the old build config.
- [x] Production source maps off; Node engine set to >= 20.

### Stage 3 — API, domain, state, auth

- [x] Typed API client for the new endpoints.
- [x] Domain helpers for statuses, ticket IDs, catalog joins, formatting.
- [x] Pinia stores; no HTTP inside mutations.
- [x] DingTalk auth adapter with `onFail` and timeout (DT-006).
- [x] Legacy API guard test.

### Stage 4 — Read-only UI port

- [x] Main list, tabs, working-ticket button (DT-003, DT-015).
- [x] Announcements and pinned banner (DT-002, DT-011).
- [x] Calendar with room join and safe address lookup (DT-010).
- [x] Finished records pagination against the new envelope (DT-001).
- [x] Ticket preview / status flow (DT-012, DT-016).

### Stage 5 — Write-flow UI port

- [x] New ticket form: validation, duplicate-submit guard, password input
  (DT-014, DT-023, DT-005).
- [x] Edit popup with local draft and commit-on-success (DT-004).
- [x] Delete flow and success title (DT-009).
- [x] TOS popup reopen after mask close (DT-008).

### Stage 6 — Hardening

- [x] Browser target / legacy build (DT-013).
- [x] Source maps off (DT-018).
- [x] Dependency cleanup and audit (DT-019).
- [x] Node engine (DT-020).
- [x] Bundle splitting and dead code cleanup (DT-021, DT-024).

### Stage 7 — Tests, docs, cutover

- [x] Unit/component tests for the fixed issues.
- [x] README and issue resolution notes.
- [x] Final lint, type-check, test, and build.

## API migration contract

| Legacy | New |
| --- | --- |
| `GET /api/wechat/working/` | `GET /api/tickets/working` |
| `GET /api/wechat/finish/?page=N` | `GET /api/tickets/finished?page=N&pageSize=20` |
| `POST /api/wechat/` | `POST /api/tickets` |
| `PUT /api/wechat/{id}/` | `PUT /api/tickets/{id}` |
| `DELETE /api/wechat/{id}/` | `DELETE /api/tickets/{id}` |
| `GET /api/announcement/` | `GET /api/announcements?active=true` |
| `GET /api/announcement/toc/` | `GET /api/announcements?tag=tos&active=true` |
| `GET /api/campus/` | `GET /api/rooms?enabled=true` |
| `GET /api/date/` | `GET /api/service-dates?active=true` + `/api/rooms` |

Statuses:

| Legacy int | New string |
| ---: | --- |
| 1 | `pending` |
| 2 | `confirmed` |
| 3 | `rejected` |
| 4 | `arrived` |
| 5 | `in_progress` |
| 6 | `completed` |
| 7 | `referred` |
| 9 | `no_show` |

## Known trade-offs

- The new service-date payload has `room_id` but no room name and no
  “正在服务” count. The UI joins rooms locally and shows capacity / booked /
  remaining instead of the old working count.
- The new announcement and room lists are paginated; the catalog store fetches
  all pages.
- The frontend keeps the existing proxy authentication protocol (`/user` plus
  the `user-token` header). Only the backend paths change.
