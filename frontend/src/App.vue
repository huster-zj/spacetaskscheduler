<!--
 * @Author: Jerry
 * @Date: 2024-10-09 15:11:40
 * @LastEditors: Do not edit
 * @LastEditTime: 2025-09-18 07:53:14
 * @FilePath: \spacetaskscheduler\frontend\src\App.vue
-->
<script setup>
import { RouterView } from 'vue-router'
/* components文件夹 */
import AppHeader from './components/AppHeader.vue'
import NavigationBar from './components/NavigationBar.vue'
import Test from './test/test.vue'
/* 导入资源后对应资源列表界面 */
import SelectTable from '@/components/table/select_table.vue'   //可勾选行的表格组件
import CekongResource from './views/resource/resourceList/CekongResource.vue'

</script>

<template>
  <div class="app-container">
    <AppHeader />
    <NavigationBar />
    <main class="main-content">
      <RouterView />
    </main>
    <!-- <Test /> -->
    
    <!-- ICP备案信息底部 -->
    <footer class="app-footer">
      <div class="footer-content">
        <p class="beian-info">
          <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer">
            豫ICP备2025136177号-2
          </a>
        </p>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
}

.app-footer {
  background-color: #f8f9fa;
  border-top: 1px solid #e9ecef;
  padding: 20px 0;
  margin-top: auto;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  text-align: center;
  padding: 0 20px;
}

.beian-info {
  margin: 0;
  font-size: 14px;
}

.beian-info a {
  color: #666;
  text-decoration: none;
  transition: color 0.3s ease;
}

.beian-info a:hover {
  color: #007bff;
  text-decoration: underline;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .footer-content {
    padding: 0 15px;
  }
  
  .beian-info {
    font-size: 12px;
  }
}
</style>