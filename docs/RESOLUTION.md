# Resolution — review issues

- **Resolved on:** 2026-10-31
- **Branch:** `feat/vue3-ts-new-api`
- **Source list:** [`ISSUES.md`](./ISSUES.md)
- **Verification:** `npm run verify` (lint, type-check, 48 tests, production build + bundle check)

| ID | Status | Fix / evidence |
| --- | --- | --- |
| DT-001 | Fixed | `FinishedRecords.vue` + `stores/tickets.ts` use an explicit page counter against `{items,total,page,pageSize}`, dedupe by ticket URL, and show a retry state. Covered by `tests/stores/tickets.spec.ts`. |
| DT-002 | Fixed | `domain/announcement.ts` maps `normal` / `pinned` / `tos` (plus legacy aliases); `TopAnnouncements` filters `pinned`. Covered by `tests/domain/announcement.spec.ts`. |
| DT-003 | Fixed | `MainList.vue` hides the new-ticket footer when `tickets.hasWorking` is true. Covered by `tests/components/MainList.spec.ts`. |
| DT-004 | Fixed | `PopupContent.vue` edits a local `ticketToDraft()` clone and only updates the store after a successful `PUT`. The popup remounts for each open. |
| DT-005 | Fixed | Password input is `type="password"`; `ticketToDraft()` deliberately drops the stored password; `buildPreviewItems()` never includes it; an empty edit field leaves the password unchanged. |
| DT-006 | Fixed | `stores/session.ts` wraps login in `try/catch`, and `platform/dingtalk.ts` adds `onFail`, a timeout, and lazy JSAPI loading. The shell shows an error screen with retry. Covered by `tests/stores/session.spec.ts`. |
| DT-007 | Fixed | `clinic_proxy_dingtalk/Program.cs` now uses `ProxyUrlBuilder.Build()`, which appends `&username=` when a query already exists and escapes the value. Applied to GET/POST/PUT/DELETE. Commit `15ae5ec` in the proxy repo. |
| DT-008 | Fixed | `TOS.vue` uses a named `show` model and emits `update:show`; the parent owns the state, so reopening after a mask close works. Covered by `tests/components/TOS.spec.ts`. |
| DT-009 | Fixed | Delete navigates to `/success?title=已成功删除工单`; `Success.vue` reads `route.query.title`. Covered by `tests/components/Success.spec.ts`. |
| DT-010 | Fixed | `domain/catalog.ts` joins service dates to rooms and `DatePreview` uses `date.room?.address` with fallbacks; `getRoomAddress()` returns `''` for missing rooms. |
| DT-011 | Fixed | `TopAnnouncements.vue` clears its interval on unmount, guards empty lists, and resets the index when the list changes. Covered by `tests/components/TopAnnouncements.spec.ts`. |
| DT-012 | Fixed | Preview fields now include `worker_description`; `buildPreviewItems()` is covered by `tests/domain/ticket.spec.ts`. |
| DT-013 | Fixed | `.browserslistrc` and `@vitejs/plugin-legacy` target iOS 12+ / Android 6+ with `modernPolyfills`. |
| DT-014 | Fixed | `tickets.submitting` guards create/update/delete and the buttons disable while in flight. Covered by `tests/stores/tickets.spec.ts`. |
| DT-015 | Fixed | `MainList` derives the active tab from `route.name` instead of storing it once in `created()`. |
| DT-016 | Fixed | `parseTicketId()` handles `/api/tickets/{id}` with an optional trailing slash and returns `null` for malformed/legacy URLs. Covered by `tests/domain/ticket.spec.ts`. |
| DT-017 | Fixed | HTTP work moved into Pinia actions (`catalog`, `tickets`, `session`); errors are handled per call and the global interceptor no longer emits duplicate toasts. |
| DT-018 | Fixed | `vite.config.ts` sets `build.sourcemap: false`; `scripts/check-bundle.mjs` fails if any `.map` appears in `dist/`. |
| DT-019 | Fixed | Vue 2, VUX, webpack 3, Babel 6, and their transitive dependencies were removed; `npm audit --omit=dev` reports 0 vulnerabilities. |
| DT-020 | Fixed | `package.json` requires Node >= 20; `.nvmrc` pins 20. |
| DT-021 | Fixed | Old webpack/VUX files and dead view code were deleted; invalid CSS, unused props, empty button block, `console.log`, and dead status entries are gone. |
| DT-022 | Fixed | `README.md` now documents the new API, stack, Node 20, dev proxy, browser support, deployment, and related projects. |
| DT-023 | Fixed | `validateDraft()` requires `^1[3-9]\d{9}$` before submit; covered by `tests/domain/ticket.spec.ts`. |
| DT-024 | Fixed | Route-level lazy loading and Vant on-demand imports; bundle check enforces 300 KiB per chunk / 700 KiB total gzip. 48 Vitest tests cover the regression-prone paths. |

## Smoke test

Against the running local backend through `server/proxySim.ts`:

- `GET /user` with a dev token returns `{"status":200}`.
- `GET /api/tickets/working`, `/api/announcements?active=true`,
  `/api/rooms?enabled=true`, and `/api/service-dates?active=true` return the
  new API shapes.
- `/api/tickets/finished?page=1&pageSize=1` and `page=2` return distinct pages
  with the correct `total` / `page` / `pageSize`.
- Create → get → update → delete for a throwaway user (`student99`) succeeded,
  including `204 No Content` on delete and `count: 0` from
  `/api/tickets/working` afterwards. The test record was deleted.

## Notes

- `DT-007` lives in the separate `clinic_proxy_dingtalk` repository. The .NET SDK is not installed in this environment, so the C# change was reviewed but could not be compiled here. Run `dotnet build` / `dotnet test` there before deploying.
- The new `/api/service-dates` payload has no room name and no “正在服务” count. The UI joins rooms locally and shows capacity / booked / remaining instead of the old working count.
- The backend still returns the device password in ticket responses; the frontend masks it and never preloads it into the edit form. A backend redaction follow-up is still recommended.
