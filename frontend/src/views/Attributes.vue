<template>
  <Steps :current_page="0" />
  <section class="page-shell attributes-page">
    <header class="attributes-header">
      <div>
        <p class="attributes-kicker">规划包设置</p>
        <h1 class="page-heading">属性配置</h1>
        <p class="page-description">编辑后自动保存，继续配置资源和任务即可。</p>
      </div>
      <div class="autosave-status" :class="`autosave-status--${saveStatus}`" role="status" aria-live="polite">
        <span class="autosave-status__dot" aria-hidden="true"></span>
        <span>{{ saveStatusLabel }}</span>
      </div>
    </header>

    <div class="box surface-panel attributes-panel">
      <div class="form-container">
        <a-col :span="24">
        <div class="form-head">
          <a-row :gutter="32" class="form-row">
            <a-col>
              <div class="form-item">
                <label for="package-name" class="form-label">规划包名称:</label>
                <a-input id="package-name" v-model:value="localConfig.packageName" class="form-input"
                  placeholder="请输入规划包名称" />
              </div>
            </a-col>
            <a-col>
              <div class="form-item">
                <label for="package-description" class="form-label">规划包描述:</label>
                <a-input id="package-description" v-model:value="localConfig.packageDescription" class="form-input"
                  placeholder="请输入规划包描述" />
              </div>
            </a-col>
          </a-row>
        </div>

        <div class="form-body">
          <a-typography-title :level="3">基本信息</a-typography-title>
          <div class="basicinfo form-section">
            <div class="form-item">
              <label for="time-range" class="form-label">规划开始-结束时间:</label>
              <a-range-picker id="time-range" v-model:value="localTimeRange" show-time class="form-input" />
            </div>
          </div>

          <a-typography-title :level="3">资源优先级</a-typography-title>
          <div class="resource_priority form-section">
            <a-row :gutter="16" class="form-row">
              <a-col :span="12">
                <div class="form-item">
                  <label for="resource-min-value" class="form-label">最小值:</label>
                  <a-input-number id="resource-min-value" v-model:value="localConfig.resourceMinValue" :defaultValue="1"
                    :min="1" :precision="0" class="form-input" />
                </div>
              </a-col>
              <a-col :span="12">
                <div class="form-item">
                  <label for="resource-max-value" class="form-label">最大值:</label>
                  <a-input-number id="resource-max-value" v-model:value="localConfig.resourceMaxValue"
                    :defaultValue="10" :min="2" :precision="0" class="form-input" />
                </div>
              </a-col>
            </a-row>
            <div class="form-item">
              <a-radio-group v-model:value="localConfig.resourceRule" class="form-input">
                <a-radio :value="1">数字越小优先级越高</a-radio>
                <a-radio :value="2">数字越大优先级越高</a-radio>
              </a-radio-group>
            </div>
          </div>

          <a-typography-title :level="3">任务优先级</a-typography-title>
          <div class="task_priority form-section">
            <a-row :gutter="16" class="form-row">
              <a-col :span="12">
                <div class="form-item">
                  <label for="task-min-value" class="form-label">最小值:</label>
                  <a-input-number id="task-min-value" v-model:value="localConfig.taskMinValue" :precision="0"
                    class="form-input" />
                </div>
              </a-col>
              <a-col :span="12">
                <div class="form-item">
                  <label for="task-max-value" class="form-label">最大值:</label>
                  <a-input-number id="task-max-value" v-model:value="localConfig.taskMaxValue" :precision="0"
                    class="form-input" />
                </div>
              </a-col>
            </a-row>
            <div class="form-item">
              <a-radio-group v-model:value="localConfig.taskRule" class="form-input">
                <a-radio :value="1">数字越小优先级越高</a-radio>
                <a-radio :value="2">数字越大优先级越高</a-radio>
              </a-radio-group>
            </div>
          </div>
        </div>

        </a-col>
      </div>
    </div>
  </section>
</template>

<script setup>
import { useConfigStore } from '@/stores/useConfigStore';
import { storeToRefs } from 'pinia';
import dayjs from 'dayjs';
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue';
import Steps from '@/components/Steps.vue';

defineOptions({ name: 'PlanningAttributesView' })

const configStore = useConfigStore();
const { basicConfig } = storeToRefs(configStore);
const AUTOSAVE_DELAY = 400

const cloneConfig = (value) => JSON.parse(JSON.stringify({
  packageName: value?.packageName || '',
  packageDescription: value?.packageDescription || '',
  timeRange: Array.isArray(value?.timeRange) ? value.timeRange : [],
  resourceMinValue: value?.resourceMinValue ?? 1,
  resourceMaxValue: value?.resourceMaxValue ?? 10,
  resourceRule: value?.resourceRule ?? 1,
  taskMinValue: value?.taskMinValue ?? 1,
  taskMaxValue: value?.taskMaxValue ?? 10,
  taskRule: value?.taskRule ?? 1
}))

const serializeConfig = (value) => JSON.stringify(cloneConfig(value))

// 本地状态，用于表单数据
const localConfig = reactive(cloneConfig(basicConfig.value));
const isHydrating = ref(false)
const isReady = ref(false)
const saveStatus = ref('idle')
const lastSavedAt = ref(null)
const saveError = ref('')
let saveTimer = null
let hasPendingChanges = false

watch(basicConfig, (value) => {
  if (serializeConfig(value) === serializeConfig(localConfig)) return

  if (saveTimer) {
    clearTimeout(saveTimer)
    saveTimer = null
  }
  hasPendingChanges = false
  saveError.value = ''
  saveStatus.value = 'idle'
  isHydrating.value = true
  Object.assign(localConfig, value)
  nextTick(() => {
    isHydrating.value = false
  })
}, { deep: true })

// 确保 timeRange 是 dayjs 实例
const localTimeRange = computed({
  get: () => localConfig.timeRange.map(date => dayjs(date)),
  set: (value) => {
    localConfig.timeRange = Array.isArray(value)
      ? value.filter(Boolean).map(date => date.toISOString())
      : []
  }
});

const saveStatusLabel = computed(() => {
  if (saveStatus.value === 'pending') return '待保存'
  if (saveStatus.value === 'saving') return '正在保存'
  if (saveStatus.value === 'error') return `自动保存失败：${saveError.value}`
  if (saveStatus.value === 'saved') {
    return `已保存 ${dayjs(lastSavedAt.value).format('HH:mm:ss')}`
  }
  return '编辑后自动保存'
})

const saveNow = () => {
  if (!hasPendingChanges) return

  if (saveTimer) {
    clearTimeout(saveTimer)
    saveTimer = null
  }

  const snapshot = cloneConfig(localConfig)
  saveStatus.value = 'saving'
  try {
    configStore.updateConfig(snapshot)
    hasPendingChanges = false
    lastSavedAt.value = new Date()
    saveError.value = ''
    saveStatus.value = 'saved'
  } catch (error) {
    saveError.value = error instanceof Error ? error.message : '请稍后重试'
    saveStatus.value = 'error'
  }
}

const scheduleSave = () => {
  if (!isReady.value || isHydrating.value) return

  hasPendingChanges = true
  saveError.value = ''
  saveStatus.value = 'pending'
  if (saveTimer) clearTimeout(saveTimer)
  saveTimer = setTimeout(saveNow, AUTOSAVE_DELAY)
}

watch(localConfig, scheduleSave, { deep: true })

onMounted(() => {
  isReady.value = true
})

onBeforeUnmount(() => {
  saveNow()
})
</script>

<style scoped>
.attributes-page {
  display: grid;
  gap: 18px;
}

.attributes-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
}

.attributes-kicker {
  margin: 0 0 4px;
  color: var(--sts-primary);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0;
  text-transform: uppercase;
}

.attributes-header .page-heading {
  margin: 0;
}

.attributes-header .page-description {
  margin-bottom: 0;
}

.autosave-status {
  display: inline-flex;
  min-height: 36px;
  align-items: center;
  gap: 8px;
  padding: 7px 12px;
  border: 1px solid var(--sts-border);
  border-radius: var(--sts-radius-md);
  background: var(--sts-surface-raised);
  color: var(--sts-ink-secondary);
  font-size: 13px;
  white-space: nowrap;
}

.autosave-status__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--sts-ink-muted);
}

.autosave-status--pending .autosave-status__dot,
.autosave-status--saving .autosave-status__dot {
  background: var(--sts-warning);
}

.autosave-status--saved .autosave-status__dot {
  background: var(--sts-success);
}

.autosave-status--error {
  border-color: color-mix(in srgb, var(--sts-danger) 40%, var(--sts-border));
  color: var(--sts-danger);
}

.autosave-status--error .autosave-status__dot {
  background: var(--sts-danger);
}

.box {
  width: 100%;
}

.attributes-panel {
  overflow: hidden;
  box-shadow: var(--sts-shadow-md);
}

.form-container {
  width: 100%;
  padding: 24px;
}

.form-row {
  display: flex;
  align-items: center;
  row-gap: 16px;
}

.form-section {
  display: flex;
  flex-direction: column;
  margin-bottom: 20px;
  padding: 20px;
  border: 1px solid var(--sts-border);
  border-radius: var(--sts-radius-lg);
  background: var(--sts-surface-subtle);
}

.form-item {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
}

.form-label {
  min-width: 88px;
  margin-right: 12px;
  color: var(--sts-ink-secondary);
  font-weight: 500;
  white-space: nowrap;
  /* 防止标签文本换行 */
}

.form-item label,
.form-input,
a-input-number,
a-radio {
  font-size: 14px;
}

@media (max-width: 767px) {
  .attributes-header {
    align-items: stretch;
    flex-direction: column;
    gap: 10px;
  }

  .autosave-status {
    width: fit-content;
  }

  .form-container {
    padding: 16px;
  }

  .form-row {
    margin-right: 0 !important;
    margin-left: 0 !important;
  }

  .form-section {
    padding: 16px;
  }

  .form-item {
    align-items: stretch;
    flex-direction: column;
    gap: 6px;
  }

  .form-label {
    min-width: 0;
    margin-right: 0;
  }
}
</style>
