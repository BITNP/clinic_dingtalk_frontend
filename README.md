# 诊所在线预约系统 — 钉钉前端

电脑诊所预约系统的钉钉 H5 前端。用户通过钉钉工作台进入，完成公告查看、服务日历查询、新建工单、查看/编辑当前工单和已处理工单。

## 技术栈

| 层 | 选择 |
| --- | --- |
| 框架 | Vue 3 |
| 构建 | Vite 5 |
| 语言 | TypeScript（严格模式） |
| 状态 | Pinia |
| 路由 | Vue Router 4（hash 模式） |
| UI | Vant 4 |
| HTTP | axios 1.x |
| Markdown | markdown-it + DOMPurify |
| 测试 | Vitest + Vue Test Utils |

## 后端

本前端只使用 **`clinic-backend` 的新版客户端 API**：

- `GET /api/announcements`
- `GET /api/service-dates`
- `GET /api/rooms`
- `GET /api/tickets/working`
- `GET /api/tickets/finished`
- `POST /api/tickets`
- `PUT /api/tickets/{id}`
- `DELETE /api/tickets/{id}`

旧版 Django 接口（`/api/wechat/*`、`/api/announcement/*`、`/api/campus/*`、`/api/date/*`）已不再调用。`tests/legacy-guard.spec.ts` 会阻止它们重新进入 `src/`。

请求仍然经过 `clinic_proxy_dingtalk`：

1. 前端通过 `/user` 完成钉钉免登；
2. 代理把 `user-token` 换成学号，并在每个后端请求上追加 `?username=...`；
3. 代理用 `Date` + `X-API-KEY` 签名请求。

## 环境要求

- Node.js **>= 20**（见 `.nvmrc`）
- npm
- 本地运行时需要 `clinic-backend` 监听 `127.0.0.1:8080`（或通过 `CLINIC_BACKEND` 指定）

## 本地开发

```bash
npm install
cp .env.example .env.local   # 可选；默认值已经能跑本地开发
npm run dev
```

开发服务器监听 <http://localhost:8888>。

本地开发默认绕过钉钉登录：

- `src/dev.ts` 把 `VITE_DEV_USER`（默认 `student01`）写入 `user-token`；
- `server/proxySim.ts` 模拟 `/user` 和 `/proxy`，并把签名后的请求转发到
  `CLINIC_BACKEND`（默认 `http://127.0.0.1:8080`）；
- `CLINIC_API_KEY` 默认 `local-dev-key`，需要与后端本地配置一致。

打开带 `corpId` 参数的地址（即真实钉钉环境）时，`dev.ts` 不会写入测试账号，应用会走真实的
`dd.ready()` / `requestAuthCode()` 流程。

连接真实代理而不是本地模拟器：

```bash
VITE_PROXY_URL=https://clinicp.bitnp.net/proxy \
VITE_USER_URL=https://clinicp.bitnp.net/user \
npm run dev
```

## 构建与部署

```bash
npm run build
```

构建产物在 `dist/`，静态资源基路径为 `/lightapp/`。部署时把 `dist/` 内容放到
`clinic_proxy_dingtalk` 的静态根目录（该服务把 `/lightapp` 映射到自己的文件服务器根目录），
例如 Docker 部署中的 `/app/wwwroot`。

构建会：

- 不生成 source map；
- 生成 iOS 12+ / Android 6+ 的 legacy 产物与 polyfill；
- 运行 `scripts/check-bundle.mjs` 检查单 chunk 与总 gzip 预算。

## 常用命令

```bash
npm run dev          # 开发服务器
npm run build        # 类型检查 + 生产构建 + 产物检查
npm run build-only   # 只构建
npm run build:analyze# 构建并生成 dist/stats.html
npm run type-check   # vue-tsc
npm run lint         # ESLint
npm test             # Vitest
npm run verify       # lint + type-check + test + build
```

## 目录结构

```text
src/
  api/          axios 客户端、新 API 类型与端点
  auth/         user-token 存取
  components/   通用组件（表单、预览、状态流、TOS 等）
  domain/       状态映射、工单草稿、日历聚合、格式化
  platform/     钉钉 JSAPI 适配器
  router/       路由
  stores/       Pinia stores
  views/        页面
server/
  proxySim.ts   本地开发代理模拟器
tests/          Vitest 单元/组件测试与 API fixtures
```

## 浏览器支持

- iOS >= 12
- Android >= 6

构建使用 `@vitejs/plugin-legacy` 与 `modernPolyfills`，覆盖
`String.prototype.startsWith`、`Array.prototype.includes`、
`String.prototype.padStart` 等旧 WebView 缺失的内置方法。发布前仍需在目标钉钉客户端上做一次真机冒烟。

## 相关项目

- `clinic-backend` — 新后端，API 契约见其 `API.md`
- `clinic_proxy_dingtalk` — 钉钉免登与 API 签名代理
- `clinic_admin_frontend` — 管理端
- `clinic_dingtalk_ng` — 已弃用的旧版钉钉前端，仅作参考，不再新增功能

## 迁移记录

- 问题清单：`docs/ISSUES.md`
- 修复对照：`docs/RESOLUTION.md`
- 迁移计划：`docs/MIGRATION_PLAN.md`

## License

内部项目，未单独声明开源许可证。
