# 诊所在线预约系统i北理前端

本项目为诊所在线预约系统学校i北理平台上的前端。

## 特性

- 使用 Vue.js + VUX 提供最佳体验
- 提供公告、日历、当前工单、历史工单等等功能
- 接入i北理


## 访问方式

i北理 -> 我的北理 -> IT服务 -> 电脑义诊

## 项目架构图

![架构](./docs/images/archi.svg)

## 项目结构

- `records/` i北理前端
- `misc/` 其他内容

## 使用方式

与 https://github.com/BITNP/clinic_proxy_dingtalk 一同部署。

> Records management for clinic wechat SPA

## Build Setup

``` bash
# install dependencies
npm install

npm run dev

# build for production with minification
npm run build

# build for production and view the bundle analyzer report
npm run build --report
```

## FAQ

### 如何创建本地开发环境

通常我会在本地同时启动 django, grails, 前端部分。

``` bash
npm install
npm run dev
```

本地开发默认绕过钉钉登录：`src/dev.js` 会把 `DEV_USER`（默认 `student01`）写入
`user-token`，`build/proxySim.js` 模拟 `/user` 和 `/proxy`，并把签名后的请求转发到
`CLINIC_BACKEND`（默认 `http://127.0.0.1:8080`，对应 `CLINIC_API_KEY=local-dev-key`）。

连接旧 Django 后端时：

``` bash
CLINIC_BACKEND=http://127.0.0.1:8000 CLINIC_API_KEY=oh-my-tlb npm run dev
```

`npm run dev-proxy` 仍然使用线上代理和真实钉钉登录。

## Contributes

欢迎提交 Issues 和 PR
