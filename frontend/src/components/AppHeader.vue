<!--
 * @Author: Jerry
 * @Date: 2024-10-09 15:13:15
 * @LastEditors: Do not edit
 * @LastEditTime: 2025-08-30 15:36:25
 * @FilePath: \spacetaskscheduler\src\components\AppHeader.vue
-->
<template>
  <div class="app-header">
    <div class="app-header__inner">
      <RouterLink to="/" class="brand" aria-label="航天任务调度工具工作台">
        <img src="../assets/logo.jpg" alt="" class="brand__logo" />
      </RouterLink>
      <div class="app-header__navigation">
        <slot />
      </div>
      <a-popover
        v-model:visible="sampleSelectorVisible"
        placement="bottomRight"
        trigger="click"
        overlay-class-name="sample-selector-popover"
      >
        <template #content>
          <section
            id="sample-selector"
            class="sample-selector"
            role="dialog"
            aria-labelledby="sample-selector-title"
          >
            <header class="sample-selector__header">
              <strong id="sample-selector-title">示例规划包</strong>
              <span>选择一个或多个 2026 场景</span>
            </header>
            <div class="sample-selector__list">
              <a-checkbox
                v-for="sample in SAMPLE_PLANNING_PACKAGES"
                :key="sample.id"
                :checked="selectedSampleIds.includes(sample.id)"
                @change="toggleSample(sample.id, $event.target.checked)"
              >
                <span class="sample-option">
                  <span class="sample-option__name">{{ sample.name }}</span>
                  <span class="sample-option__summary">{{ sample.summary }}</span>
                </span>
              </a-checkbox>
            </div>
            <footer class="sample-selector__actions">
              <span>{{ selectedSampleIds.length }} 个已选择</span>
              <a-button
                type="primary"
                size="small"
                :disabled="selectedSampleIds.length === 0"
                :loading="downloading"
                @click="handleDownload"
              >
                下载
              </a-button>
            </footer>
          </section>
        </template>
        <button
          class="download-button"
          type="button"
          aria-label="下载示例规划包"
          aria-haspopup="dialog"
          aria-controls="sample-selector"
          :aria-expanded="sampleSelectorVisible"
          title="下载示例规划包"
        >
          <DownloadOutlined aria-hidden="true" />
        </button>
      </a-popover>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import { message } from 'ant-design-vue'
import {
  SAMPLE_PLANNING_PACKAGES,
  downloadSamplePlanningPackages
} from '@/services/samplePlanningPackages'

const sampleSelectorVisible = ref(false)
const defaultSample = SAMPLE_PLANNING_PACKAGES.find(({ id }) => id === 'integrated-demo')
  || SAMPLE_PLANNING_PACKAGES[0]
const selectedSampleIds = ref(defaultSample ? [defaultSample.id] : [])
const downloading = ref(false)

const toggleSample = (id, checked) => {
  const nextSelection = new Set(selectedSampleIds.value)
  if (checked) nextSelection.add(id)
  else nextSelection.delete(id)
  selectedSampleIds.value = [...nextSelection]
}

const handleDownload = async () => {
  downloading.value = true
  try {
    const result = await downloadSamplePlanningPackages(selectedSampleIds.value)
    sampleSelectorVisible.value = false
    message.success(`已下载 ${result.filename}`)
  } catch (error) {
    message.error(error instanceof Error ? error.message : '示例规划包生成失败')
  } finally {
    downloading.value = false
  }
}
</script>

<style scoped>
.app-header {
  background: var(--sts-surface-raised);
}

.app-header__inner {
  display: flex;
  width: 100%;
  min-height: 76px;
  padding: 0 12px;
  align-items: center;
  gap: 8px;
}

.brand {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  color: var(--sts-ink-primary);
}

.brand:hover {
  color: var(--sts-ink-primary);
}

.brand__logo {
  width: 48px;
  height: 48px;
  flex: 0 0 48px;
  border: 1px solid var(--sts-border);
  border-radius: var(--sts-radius-md);
  object-fit: cover;
}

.app-header__navigation {
  min-width: 0;
  flex: 1;
}

.download-button {
  display: inline-flex;
  width: 36px;
  height: 36px;
  flex: 0 0 36px;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 1px solid var(--sts-border-strong);
  border-radius: var(--sts-radius-md);
  background: var(--sts-surface-raised);
  color: var(--sts-ink-primary);
  cursor: pointer;
}

.download-button:hover {
  border-color: var(--sts-primary);
  background: var(--sts-primary-soft);
  color: var(--sts-primary-hover);
}

.download-button .anticon {
  display: inline-flex;
  color: currentColor;
  font-size: 16px;
}

.download-button .anticon :deep(svg) {
  width: 16px;
  height: 16px;
}

.sample-selector {
  width: min(320px, calc(100vw - 32px));
}

.sample-selector__header {
  display: grid;
  gap: 2px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--sts-border);
}

.sample-selector__header strong {
  color: var(--sts-ink-primary);
  font-size: 14px;
}

.sample-selector__header span,
.sample-selector__actions > span,
.sample-option__summary {
  color: var(--sts-ink-muted);
  font-size: 12px;
}

.sample-selector__list {
  display: grid;
  gap: 2px;
  padding: 8px 0;
}

.sample-selector__list :deep(.ant-checkbox-wrapper) {
  display: flex;
  margin: 0;
  padding: 8px 6px;
  align-items: flex-start;
  border-radius: var(--sts-radius-md);
}

.sample-selector__list :deep(.ant-checkbox-wrapper:hover) {
  background: var(--sts-surface-subtle);
}

.sample-selector__list :deep(.ant-checkbox) {
  margin-top: 3px;
}

.sample-option {
  display: grid;
  gap: 1px;
}

.sample-option__name {
  color: var(--sts-ink-primary);
  font-size: 13px;
  font-weight: 600;
}

.sample-selector__actions {
  display: flex;
  padding-top: 10px;
  align-items: center;
  justify-content: space-between;
  border-top: 1px solid var(--sts-border);
}

@media (max-width: 767px) {
  .app-header__inner {
    min-height: 68px;
    padding: 0 8px;
    gap: 6px;
  }

  .brand__logo {
    width: 40px;
    height: 40px;
    flex-basis: 40px;
  }

  .download-button {
    width: 36px;
    height: 36px;
    flex-basis: 36px;
  }
}
</style>
