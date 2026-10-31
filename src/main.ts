import { createPinia } from 'pinia'
import { createApp } from 'vue'

import './style/main.css'
import './dev'

import App from './App.vue'
import router from './router'

createApp(App).use(createPinia()).use(router).mount('#app')
