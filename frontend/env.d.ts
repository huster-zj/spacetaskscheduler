/// <reference types="vite/client" />

// 为了让 TypeScript 正确识别 .vue 文件的类型
declare module '*.vue' {
  import { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}
