<template>
  <section class="page-shell documentation-page">
    <header class="documentation-header">
      <div>
        <RouterLink to="/" class="documentation-back">
          <ArrowLeftOutlined aria-hidden="true" />
          <span>返回工作台</span>
        </RouterLink>
        <h1 class="page-heading">{{ title }}</h1>
        <p v-if="description" class="page-description">{{ description }}</p>
      </div>
      <nav class="documentation-tabs" aria-label="产品说明">
        <RouterLink to="/help">帮助中心</RouterLink>
        <RouterLink to="/license">许可证</RouterLink>
        <RouterLink to="/about">关于</RouterLink>
      </nav>
    </header>

    <main class="documentation-content surface-panel">
      <slot />
    </main>
  </section>
</template>

<script setup>
defineProps({
  title: { type: String, required: true },
  description: { type: String, default: '' }
})
</script>

<style scoped>
.documentation-page {
  max-width: 1180px;
  padding-top: 28px;
  padding-bottom: 40px;
}

.documentation-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 18px;
}

.documentation-back {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 12px;
  color: var(--sts-ink-secondary);
  font-size: 13px;
}

.documentation-tabs {
  display: flex;
  flex: 0 0 auto;
  gap: 4px;
  padding: 3px;
  border: 1px solid var(--sts-border);
  border-radius: var(--sts-radius-md);
  background: var(--sts-surface-subtle);
}

.documentation-tabs a {
  min-width: 76px;
  min-height: 40px;
  padding: 8px 12px;
  border-radius: var(--sts-radius-sm);
  color: var(--sts-ink-secondary);
  text-align: center;
}

.documentation-tabs a.router-link-exact-active {
  background: var(--sts-surface-raised);
  color: var(--sts-primary);
  font-weight: 600;
  box-shadow: var(--sts-shadow-sm);
}

.documentation-content {
  padding: 28px 32px;
}

.documentation-content :deep(section + section) {
  margin-top: 32px;
  padding-top: 28px;
  border-top: 1px solid var(--sts-border);
}

.documentation-content :deep(h2) {
  margin: 32px 0 12px;
  color: var(--sts-ink-primary);
  font-size: 18px;
  font-weight: 600;
  letter-spacing: 0;
}

.documentation-content :deep(h2:first-child) {
  margin-top: 0;
}

.documentation-content :deep(h3) {
  margin: 22px 0 8px;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 0;
}

.documentation-content :deep(p),
.documentation-content :deep(li) {
  color: var(--sts-ink-secondary);
  line-height: 1.8;
}

.documentation-content :deep(ul),
.documentation-content :deep(ol) {
  margin: 8px 0;
  padding-left: 22px;
}

.documentation-content :deep(code) {
  padding: 1px 5px;
  border-radius: var(--sts-radius-sm);
  background: var(--sts-surface-subtle);
  color: var(--sts-primary-hover);
}

@media (max-width: 767px) {
  .documentation-page {
    padding-top: 20px;
  }

  .documentation-header {
    align-items: stretch;
    flex-direction: column;
    gap: 16px;
  }

  .documentation-tabs {
    width: 100%;
  }

  .documentation-tabs a {
    min-width: 0;
    flex: 1;
    min-height: 44px;
    padding-right: 4px;
    padding-left: 4px;
  }

  .documentation-content {
    padding: 20px 16px;
  }
}
</style>
