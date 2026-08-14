/*
 * @Author: Jerry
 * @Date: 2024-10-09 15:13:15
 * @LastEditors: Do not edit
 * @LastEditTime: 2025-10-21 15:33:22
 * @FilePath: \spacetaskscheduler\frontend\src\main.ts
 */
// src/main.ts
import { createApp } from 'vue'
import App from './App.vue'
import './utils/timezone' // 导入时区配置
import router from './router'
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/antd.css'
import './assets/theme.css'
import * as Icons from '@ant-design/icons-vue'
import { createPinia } from 'pinia'
import piniaPersist from 'pinia-plugin-persistedstate'

const app = createApp(App)
const pinia = createPinia()
pinia.use(piniaPersist)
app.use(Antd)
app.use(router)
app.use(pinia)

export default pinia

// 全局注册图标组件
Object.keys(Icons).forEach((key: string) => {
  app.component(key, (Icons as { [key: string]: any })[key])
})


app.mount('#app')
