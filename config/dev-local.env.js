"use strict";
const merge = require("webpack-merge");
const prodEnv = require("./prod.env");

// Local development only. `DEV_USER` is the student ID that src/dev.js
// pretends DingTalk already authenticated; build/proxySim.js forwards the
// signed requests to CLINIC_BACKEND (default http://127.0.0.1:8080) using
// CLINIC_API_KEY (default local-dev-key). For the old Django backend, set
// CLINIC_BACKEND=http://127.0.0.1:8000 and CLINIC_API_KEY=oh-my-tlb.
module.exports = merge(prodEnv, {
  NODE_ENV: '"development"',
  BASE_URL: '"/api/"',
  PROXY_URL: '"/proxy"',
  USER_URL: '"/user"',
  DEV_USER: JSON.stringify(process.env.DEV_USER || "student01"),
  USE_PROXY: "false",
  PORT: "8888"
});
