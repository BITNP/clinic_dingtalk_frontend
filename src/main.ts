import { createPinia } from 'pinia'
import { createApp } from 'vue'
import 'vant/lib/index.css'

import './style/main.css'
import './dev'

import App from './App.vue'
import router from './router'

createApp(App).use(createPinia()).use(router).mount('#app')
