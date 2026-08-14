<!--
 * @Author: Jerry
 * @Date: 2024-10-09 15:11:40
 * @LastEditors: Do not edit
 * @LastEditTime: 2025-09-18 07:53:14
 * @FilePath: \spacetaskscheduler\frontend\src\App.vue
-->
<script setup>
import { RouterView } from 'vue-router'
import AppHeader from './components/AppHeader.vue'
import NavigationBar from './components/NavigationBar.vue'
</script>

<template>
  <div class="app-container">
    <header class="app-chrome">
      <AppHeader>
        <NavigationBar />
      </AppHeader>
    </header>
    <main class="main-content">
      <RouterView />
    </main>
    <footer class="app-footer">
      <div class="footer-content">
        <span>航天任务调度工具</span>
        <span class="footer-separator" aria-hidden="true"></span>
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
  background: var(--sts-surface-base);
}

.app-chrome {
  position: sticky;
  z-index: 100;
  top: 0;
  border-bottom: 1px solid var(--sts-border);
  background: rgba(255, 255, 255, 0.98);
  box-shadow: var(--sts-shadow-sm);
}

.main-content {
  flex: 1;
  width: 100%;
  min-width: 0;
}

.app-footer {
  border-top: 1px solid var(--sts-border);
  background: var(--sts-surface-raised);
  color: var(--sts-ink-muted);
  padding: 14px 0;
  margin-top: auto;
}

.footer-content {
  display: flex;
  width: min(100%, var(--sts-content-max));
  margin: 0 auto;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 0 24px;
  font-size: 12px;
}

.footer-separator {
  width: 1px;
  height: 12px;
  background: var(--sts-border-strong);
}

.beian-info {
  margin: 0;
}

.beian-info a {
  color: var(--sts-ink-muted);
  text-decoration: none;
}

.beian-info a:hover {
  color: var(--sts-primary);
  text-decoration: underline;
}

@media (max-width: 768px) {
  .app-chrome {
    position: static;
  }

  .footer-content {
    padding: 0 12px;
    flex-wrap: wrap;
  }
}
</style>
