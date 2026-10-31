# clinic_dingtalk_frontend — Code Review Issues

- **Reviewed:** 2026-10-31
- **Scope:** `clinic_dingtalk_frontend` (Vue 2.6 + VUX 2 + webpack 3)
- **Backend scope:** current `clinic-backend` only; the legacy Django backend is deprecated and out of scope.
- **Status:** review complete; source code was not modified by this review.

## Verification performed

- `npm ci` — succeeded
- `npm run lint` — exits 0
- `npm run build` — succeeds on Node 26
- `npm run dev` — dev server starts and the local proxy reaches the running new backend
- Live API checks through the dev proxy:
  - a proxy request with `url: "?page=2"` returns HTTP 404
  - `/api/announcement/` returns tags `normal` and `tos`, not `AN`/`TA`/`TOS`
- The current dev database only had 2 finished records, so the first page returned `next: null`; the `?page=2` shape comes from `drfPage` in `clinic-backend/internal/legacy/legacy.go:127-145`.

## Severity summary

| Severity | Count |
| --- | ---: |
| High | 7 |
| Medium | 8 |
| Low / cleanup | 9 |

## Issue index

| ID | Severity | Area | Issue |
| --- | --- | --- | --- |
| DT-001 | High | Finished records | Pagination is broken against the new backend |
| DT-002 | High | Announcements | Tag names do not match the new backend |
| DT-003 | High | Main list | “New ticket” availability logic uses a nonexistent field |
| DT-004 | High | Working record | Edit popup mutates Vuex state directly |
| DT-005 | High | Security / privacy | Computer password is plaintext in the form and preview |
| DT-006 | High | Authentication | Login failure can silently stop all app initialization |
| DT-007 | High | Proxy | Proxy appends `?username` even when the URL already has a query |
| DT-008 | Medium | New ticket | TOS popup cannot be reopened after closing by mask |
| DT-009 | Medium | Navigation | Delete-success title is discarded by the router |
| DT-010 | Medium | Calendar | `getAddress` can throw before campus data loads |
| DT-011 | Medium | Announcements | Banner timer leaks and can compute `NaN` |
| DT-012 | Medium | Record preview | `worker_description` is never displayed due to a typo |
| DT-013 | Medium | Browser support | Modern APIs are used without polyfills |
| DT-014 | Medium | New ticket | No guard against duplicate submissions |
| DT-015 | Medium | Main list | Tab state is not synchronized on history navigation |
| DT-016 | Low | Record preview | `getId`/`fixUrl` assume a specific URL shape |
| DT-017 | Low | State management | Vuex mutations perform HTTP requests and miss error handling |
| DT-018 | Low | Build | Production source maps are shipped |
| DT-019 | Low | Dependencies | Vue 2/VUX stack is EOL; production audit reports vulnerabilities |
| DT-020 | Low | Build / dev | Node engine range contradicts Node 18+ requirements |
| DT-021 | Low | Cleanup | Dead code, empty UI block, invalid CSS |
| DT-022 | Low | Documentation | README describes an outdated project/deployment |
| DT-023 | Low | New ticket | Phone number is not validated on the client before submit |
| DT-024 | Low | Performance | Large route chunks and no automated tests |

---

## High-priority issues

### DT-001 — Finished-record pagination is broken

**Location:** `src/views/FinishedRecords.vue:42-63`, `src/main.js:22-38`

**Problem:** The new backend returns `"next": "?page=2"`. The component stores that value in `this.next` and passes it to `axios.get()`. The request interceptor replaces the URL with `PROXY_URL` and stores `?page=2` in the `url` header. The proxy then requests the backend root instead of `/api/wechat/finish/?page=2`.

**Evidence:**

`drfPage` in the backend produces a relative next link when page 1 is full:

```text
GET /api/wechat/finish/?page=1  → next: "?page=2"
proxy url header "?page=2"      → HTTP 404
```

The request also has no `.catch()`, so a failed page leaves `infinite-loading` spinning forever.

**Recommended fix:** Use an explicit page counter and construct `/api/wechat/finish/?page=N`; use `data.next` only as a “has more” flag. Add error handling via `$state.error()` and deduplicate records by `url`.

The proxy must also be fixed for production — see DT-007.

### DT-002 — Announcement tags do not match the new backend

**Location:** `src/views/Announcements.vue:65-69,77,80`, `src/components/TopAnnouncements.vue:21`

**Problem:** The frontend maps `TOS`, `AN`, and `TA`. The new backend emits `tos`, `normal`, and `pinned`.

**Impact:**

- Every announcement type is rendered as `[undefined]`.
- `TopAnnouncements` filters on `v.tag === 'TA'`, so pinned announcements never appear.

**Recommended fix:** Support the new tags, for example:

```js
ANNOUNCEMENTS_MAP: {
  normal: '普通公告',
  pinned: '置顶公告',
  tos: '免责声明'
}
```

and filter on `v.tag === 'pinned'`. If old announcement data may still exist, accept both spellings.

### DT-003 — “New ticket” availability logic is dead and inverted

**Location:** `src/views/MainList.vue:72-75`

**Problem:** `hasOne` reads `this.working_record`, which does not exist. It is always `false`, so the new-ticket button is always visible even when the user already has a working record. Fixing only the field name is not enough: `working_record === null` means “no record”, while the template uses `v-if="!hasOne"` to show the button.

**Recommended fix:**

```js
hasOne () {
  return Boolean(this.$store.state.workingRecord)
}
```

Then keep `v-if="!hasOne"` on the new-ticket footer.

### DT-004 — Edit popup mutates Vuex state directly

**Location:** `src/views/WorkingRecord.vue:3-6`, `src/components/PopupContent.vue:105-109`, `src/components/RecordForm.vue:57-62`

**Problem:** The edit popup receives the store’s `workingRecord` object and `RecordForm` writes directly into it. Closing the popup without pressing “更新” leaves the preview and Vuex state showing unsaved values.

The `v-model`/`model` declarations are also not implemented: neither component emits the declared `update` event.

**Recommended fix:** Pass a deep clone into the popup (`JSON.parse(JSON.stringify(record))`), edit the clone, and only commit it back to Vuex after a successful update. Replace the fake `v-model` contracts with explicit props/events.

### DT-005 — Computer password is plaintext

**Location:** `src/components/RecordForm.vue:34-40`, `src/components/RecordPreview.vue:63,72`

**Problem:** The password input does not set `type="password"`, so the value is visible while typing. The record preview also includes `password` in the displayed body.

**Recommended fix:**

- Add `type="password"` to the password `x-input`.
- Do not include the password in `dict2list()` for the customer-facing preview, or mask it.
- Consider whether the backend needs to return the password at all in list responses.

### DT-006 — Login failure can silently stop app initialization

**Location:** `src/App.vue:35-69`

**Problem:** `created()` awaits the login flow before calling `initAnnouncements`, `getCampus`, `getDates`, and `getWorkingRecord`.

Failure cases that leave the promise unresolved or reject it:

- `GET /user` fails at the network level or returns an unexpected status.
- `dd.runtime.permission.requestAuthCode` never calls `onSuccess`.
- `dd.ready` never fires outside DingTalk.
- `POST /user` fails and calls `reject`.
- There is no `onFail` handler or timeout for the DingTalk API.

In these cases the user gets no data and no clear error state; the rejection is unhandled.

**Recommended fix:**

- Wrap the login flow in `try/catch`.
- Add `onFail` and a timeout for `requestAuthCode`.
- On failure, show an explicit login error and retry action.
- Do not block non-authenticated data initialization unnecessarily; at minimum ensure loading state is cleared and the user can retry.

### DT-007 — Proxy query-string handling is broken

**Location:** `clinic_proxy_dingtalk/Program.cs:135-136` (GET; same pattern at `175-176`, `216-217`, `257-258`)

**Problem:** The proxy always appends `?username=...`:

```csharp
request.RequestUri = new Uri($"{_host}{url}?username={cachedUserName}");
```

For a target with an existing query such as `/api/wechat/finish/?page=2` this produces:

```text
/api/wechat/finish/?page=2?username=student01
```

The backend cannot parse `page`, so it keeps returning page 1. This affects any proxied request with a query string.

**Recommended fix:**

```csharp
var separator = url.Contains('?') ? '&' : '?';
request.RequestUri = new Uri(
    $"{_host}{url}{separator}username={Uri.EscapeDataString(cachedUserName)}"
);
```

Apply consistently to GET, POST, PUT, and DELETE. The local `build/proxySim.js` already handles `?` correctly, so dev tests will not expose this proxy bug.

---

## Medium-priority issues

### DT-008 — TOS popup cannot be reopened after mask close

**Location:** `src/components/TOS.vue:27-31,44-49`

**Problem:** The component declares the model event as `click`, but never emits it. The inner `popup` uses `v-model="show"`, which assigns directly to the `show` prop. Closing via the mask sets the child prop to `false` while the parent’s `toc` remains `true`, so clicking “免责声明” again does not reopen it.

**Recommended fix:** Use a proper `value` prop with an `input` event, or emit `toggle-toc` from the popup’s `@on-hide` and keep the parent state as the single source of truth.

### DT-009 — Delete-success title is discarded

**Location:** `src/views/Success.vue:28-30`, `src/main.js:121-126`, `src/components/PopupContent.vue:71-76`

**Problem:** The route is `/success/` with no `:title` parameter. `PopupContent` passes `params: { title: '已成功删除工单' }`, but Vue Router discards params not present in the path, so the page always shows “已成功提交工单”.

**Recommended fix:** Add an optional route parameter (`/success/:title?`) or pass the message as a query parameter, and read it in `Success.vue`.

### DT-010 — Calendar address lookup can crash

**Location:** `src/views/Calendar.vue:64-66`

**Problem:** `this.campus.filter(...)[0]['address']` assumes campus data is loaded and that every date has a matching campus. `getCampus` and `getDates` run concurrently; if dates resolve first, `events` can evaluate while `campus` is empty. A date referencing a disabled or removed room also produces an undefined lookup.

**Recommended fix:**

```js
getAddress (campusName) {
  const campus = this.campus.find(v => v.name === campusName)
  return campus ? campus.address : ''
}
```

Also handle an empty campus list in the template.

### DT-011 — Announcement banner timer leaks and can compute `NaN`

**Location:** `src/components/TopAnnouncements.vue:24-28`

**Problem:** The interval is never cleared, so every return to the home page adds another timer. If there are no pinned announcements, `(index + 1) % 0` becomes `NaN`; if pinned announcements appear later or the count shrinks, `topAnnouncements[index]` is `undefined` and rendering throws.

**Recommended fix:** Store the timer ID and clear it in `beforeDestroy`. Guard the modulo operation when the list is empty and reset `index` when the list changes.

### DT-012 — Worker description is never displayed

**Location:** `src/components/RecordPreview.vue:68-78`

**Problem:** The key list contains `'workder_description'` (typo), while the API and `KEY_TRANSLATION` use `worker_description`.

**Impact:** Staff repair notes silently disappear from the ticket preview.

**Recommended fix:** Change the key to `'worker_description'`.

### DT-013 — Browser support does not match the code

**Location:** `package.json:82-85`, `src/main.js:35`, `src/components/RecordForm.vue:66`, `src/components/RecordPreview.vue:5-26,102`, `src/views/Calendar.vue:62`

**Problem:** The project declares support for `iOS >= 7` and `Android >= 4.1`, but uses:

- `String.prototype.startsWith`
- `Array.prototype.includes`
- `String.prototype.padStart`

Babel transpiles syntax but does not polyfill built-ins (`transform-runtime` does not add these methods). On older DingTalk WebViews the first request can throw before any data loads.

**Recommended fix:** Either add a global polyfill (`core-js`/`babel-polyfill`) or raise the browserslist targets to versions that support these APIs, then re-test in the target DingTalk client.

### DT-014 — No duplicate-submission guard

**Location:** `src/views/NewRecord.vue:48-82`

**Problem:** The submit button remains enabled while the request is in flight. Repeated taps can send multiple create requests before the first response returns.

**Recommended fix:** Add a `submitting` flag, disable the button while true, and reset it in `finally`.

### DT-015 — Tab state is not synced on history navigation

**Location:** `src/views/MainList.vue:86-89`

**Problem:** `tabNum` is set only in `created()`. `MainList` is reused when navigating between child routes, so browser back/forward can change the displayed child while the tab bar highlights the previous tab.

**Recommended fix:** Watch `$route.name` and update `tabNum`, or derive `tabNum` from the route instead of storing it.

### DT-016 — URL parsing assumes a specific record URL shape

**Location:** `src/components/RecordPreview.vue:98-103`, `src/components/PopupContent.vue:97-103`

**Problem:** Both methods call `url.match(/\/\d+\//)` and then immediately dereference the result. A missing `url` or a URL without a trailing slash throws.

**Recommended fix:** Add null checks and a fallback. Since the new backend always returns `/api/wechat/<id>/`, the code can be simplified to parse the ID with a guarded expression or use a shared helper.

### DT-017 — Vuex mutations perform HTTP and lack error handling

**Location:** `src/store.js:30-77`, `src/main.js:54-72`

**Problem:** `getCampus`, `getDates`, and `getWorkingRecord` perform HTTP requests inside Vuex mutations. Only `initAnnouncements` has a local catch. The global axios interceptor shows “无法获取数据” for every failure, which can duplicate more specific error toasts. `getAnnouncements` assumes the response is always an array.

**Recommended fix:** Move async work into Vuex actions, add per-request error handling, and avoid duplicate global toasts for errors already handled by the caller.

### DT-018 — Production source maps are shipped

**Location:** `config/index.js:64`

**Problem:** `productionSourceMap: true` causes the production build to emit `.map` files for every chunk, exposing the source in deployment.

**Recommended fix:** Set `productionSourceMap: false` unless source maps are needed for a private error-tracking service. If they are needed, upload them to the tracker and do not serve them publicly.

---

## Low-priority / cleanup

### DT-019 — EOL dependencies and audit findings

**Location:** `package.json:14-26`

`npm audit --omit=dev` reports 11 production vulnerabilities (8 high), including `axios@0.19.2`, `vux`, `vue-markdown`/`markdown-it`, and `validator`. Vue 2 itself is end-of-life.

**Impact:** No security patches for the framework and UI library; `vue-markdown` is a potential XSS risk if announcement content is ever untrusted.

**Recommended fix:** Plan a migration off Vue 2/VUX and update `axios`, `vue-markdown`, and transitive dependencies. This is an architectural task, not a small patch.

### DT-020 — Node engine range contradicts the tooling

**Location:** `package.json:78-81`, `build/proxySim.js:65,112`

**Problem:** `engines` says Node `>= 4`, but `proxySim.js` uses global `fetch` (Node 18+) and `for await` (Node 10+). On older Node versions the dev server starts but proxy requests fail with `fetch is not defined`.

**Recommended fix:** Set `engines.node` to `>= 18` and document it in the README.

### DT-021 — Dead code, empty UI block, invalid CSS

**Location:** `src/views/MainList.vue:22-25,103-105`

**Problems:**

- `MainList` renders an empty `<x-button>` block above the footer.
- `overflow: wrap` is not valid CSS; likely intended `overflow-wrap: break-word`.
- `NewRecord.vue:25-28` declares `props`/`model` that are unused.
- `PopupContent.vue:105-109` has a `v-model` contract that is never emitted.
- `FinishedRecords.vue:31-32` has unused status arrays.
- `Success.vue:32-34` has an unused `data` field.
- `App.vue:75` leaves a production `console.log(location.search)`.
- `RecordPreview.vue:50` defines an unreachable `STATUS_MAP._` entry.

**Recommended fix:** Remove dead code and fix the CSS.

### DT-022 — README describes an outdated project

**Location:** `README.md`

The README still describes an iBIT/`records/` layout and does not mention:

- the current DingTalk deployment
- the Node 18+ requirement
- the local `npm run dev` auth bypass details in the current code
- the relationship to `clinic_proxy_dingtalk`

**Recommended fix:** Update the project description, architecture, supported backend, development requirements, and deployment instructions.

### DT-023 — Phone number is not validated on the client

**Location:** `src/views/NewRecord.vue:49-56`, `src/components/RecordForm.vue:29`

**Problem:** The form only checks that `phone_num` is non-empty. `is-type="china-mobile"` displays validation styling but does not prevent submission of an invalid number.

**Recommended fix:** Check the input’s validity before submitting or validate the value with a regex/backend error handling.

### DT-024 — Large chunks and no automated tests

**Location:** `build/webpack.prod.conf.js`, `package.json`

**Observations:**

- Route chunks are large: `record` ~809 KB, `announcements` ~585 KB, `working` ~282 KB.
- There is no test script or test framework in `package.json`.

**Impact:** Slower loading on mobile DingTalk clients and regressions in pagination/tag mapping are not caught automatically.

**Recommended fix:**

- Investigate VUX/component tree-shaking and lazy loading.
- Add at least component tests for `FinishedRecords` pagination and `Announcements` tag mapping.
- Add an integration smoke test against the new backend.

---

## Suggested fix order

1. **DT-001 + DT-007** — pagination and proxy query handling (must ship together)
2. **DT-003** — working-record check on the home page
3. **DT-002** — announcement tags
4. **DT-004** — edit-popup state isolation
5. **DT-006** — login failure handling
6. **DT-005** — password handling
7. Medium items, starting with DT-008/DT-010/DT-011
8. Dependency and migration work separately

## Pagination fix outline (DT-001)

Use a page counter in `FinishedRecords.vue`:

```js
data: () => ({
  page: 0,
  hasMore: true,
  loading: false,
  records: []
}),

async loadMore ($state) {
  if (!this.hasMore) {
    if ($state) $state.complete()
    return
  }

  if (this.loading) return
  this.loading = true

  try {
    const { data } = await this.$http.get(
      `${this.Const}wechat/finish/?page=${this.page + 1}`
    )

    if (!data || !Array.isArray(data.results)) {
      throw new Error('invalid response')
    }

    const existing = new Set(this.records.map(r => r.url))
    const incoming = data.results.filter(r => !existing.has(r.url))

    this.records = this.records.concat(incoming)
    this.page += 1
    this.hasMore = Boolean(data.next)

    if (!$state) return
    this.hasMore ? $state.loaded() : $state.complete()
  } catch (e) {
    // main.js already shows a toast for HTTP failures.
    if ($state) $state.error()
  } finally {
    this.loading = false
  }
}
```

Remove `initRecords()` and the `mounted()` hook; let `infinite-loading` trigger the first request.

**Important:** the frontend fix alone is not enough in production while DT-007 exists. `build/proxySim.js` handles existing query strings correctly, so local tests can pass while the deployed proxy still fails.
