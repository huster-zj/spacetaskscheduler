<template>
  <div class="resource-requirement">
    <div class="constraint-line">
      <label for="resource-constraint" class="form-label">资源需求表达式</label>
      <a-textarea
        id="resource-constraint"
        ref="expressionInput"
        v-model:value="resourceConstraint"
        class="form-input"
        :disabled="!taskRecord"
        :auto-size="{ minRows: 2, maxRows: 4 }"
        placeholder="例如：资源A and (资源B or 资源组C)"
        @keydown.enter.exact.prevent="saveRequirement"
      />
    </div>

    <div class="editor-actions">
      <a-button type="primary" :disabled="!taskRecord" @click="saveRequirement">
        <SaveOutlined />
        保存
      </a-button>
      <a-button :disabled="!taskRecord" @click="clearRequirement">
        <ClearOutlined />
        清空
      </a-button>
      <a-button :disabled="!taskRecord" @click="validateRequirement">
        <CheckOutlined />
        校验表达式
      </a-button>
    </div>

    <a-alert
      v-if="taskNotFound"
      type="warning"
      show-icon
      message="当前任务数据不存在"
      description="请返回任务列表重新打开任务详情。"
    />
    <a-alert
      v-else-if="validationMessage"
      type="error"
      show-icon
      :message="validationMessage"
    />

    <div class="token-groups">
      <section class="token-group">
        <div class="token-group__title">资源</div>
        <div v-if="resourceOptions.length" class="token-list">
          <a-button
            v-for="item in resourceOptions"
            :key="item.value"
            size="small"
            @mousedown.prevent
            @click="insertText(item.value)"
          >
            {{ item.value }}
          </a-button>
        </div>
        <a-empty v-else :image="Empty.PRESENTED_IMAGE_SIMPLE" description="当前规划包暂无资源" />
      </section>

      <section class="token-group">
        <div class="token-group__title">资源组</div>
        <div v-if="resourceGroupOptions.length" class="token-list">
          <a-button
            v-for="item in resourceGroupOptions"
            :key="item.value"
            size="small"
            @mousedown.prevent
            @click="insertText(item.value)"
          >
            {{ item.value }}
          </a-button>
        </div>
        <a-empty v-else :image="Empty.PRESENTED_IMAGE_SIMPLE" description="当前规划包暂无资源组" />
      </section>

      <section class="token-group token-group--operators">
        <div class="token-group__title">运算符</div>
        <div class="token-list">
          <a-button v-for="operator in operators" :key="operator" size="small" @mousedown.prevent @click="insertText(operator)">
            {{ operator }}
          </a-button>
        </div>
      </section>
    </div>

    <section class="pool-section">
      <div class="pool-section__header">
        <div>
          <div class="pool-section__title">资源池候选</div>
          <div class="pool-section__hint">候选内容来自当前规划包的资源和资源组。</div>
        </div>
        <a-tag>{{ poolResourceData.length + poolResourceGroupData.length }} 项</a-tag>
      </div>
      <ResourcePoolTable
        v-if="poolResourceData.length || poolResourceGroupData.length"
        :include-columns="poolResourceColumns"
        :exclude-columns="poolResourceGroupColumns"
        :include-list="poolResourceData"
        :exclude-list="poolResourceGroupData"
        @update:include-list="updatePoolResourceData"
        @update:exclude-list="updatePoolResourceGroupData"
      />
      <a-empty v-else :image="Empty.PRESENTED_IMAGE_SIMPLE" description="当前规划包暂无资源池候选" />
    </section>
  </div>
</template>

<script setup>
import { Empty, message } from 'ant-design-vue'
import { CheckOutlined, ClearOutlined, SaveOutlined } from '@ant-design/icons-vue'
import { storeToRefs } from 'pinia'
import { computed, nextTick, ref, watch } from 'vue'

import ResourcePoolTable from '@/components/table/resource_pool_table.vue'
import {
  createResourceRequirementCandidates,
  validateResourceExpression
} from '@/services/resourceRequirement'
import { useBasicInfoStore as useTaskBasicInfoStore } from '@/stores/taskDetailNumStore'
import { useFormHeadStore as useResourceFormHeadStore } from '@/stores/resourceDetailNumStore'
import { useResourceGroupListStore } from '@/stores/useResourceGroupListStore'

const props = defineProps({
  taskKey: {
    type: String,
    default: null
  }
})

const taskBasicInfoStore = useTaskBasicInfoStore()
const resourceFormHeadStore = useResourceFormHeadStore()
const resourceGroupStore = useResourceGroupListStore()
const { basicInfoList } = storeToRefs(taskBasicInfoStore)
const { formHeadList: resourceList } = storeToRefs(resourceFormHeadStore)
const { customResourceGroupList } = storeToRefs(resourceGroupStore)

const taskRecord = computed(() => {
  if (props.taskKey) {
    return basicInfoList.value.find((item) => String(item.key) === String(props.taskKey)) || null
  }
  return basicInfoList.value[basicInfoList.value.length - 1] || null
})
const taskNotFound = computed(() => Boolean(props.taskKey) && !taskRecord.value)
const resourceConstraint = ref('')
const validationMessage = ref('')
const expressionInput = ref(null)
const operators = ['and', 'or', '(', ')']

const resourceOptions = computed(() => createResourceRequirementCandidates({
  resources: resourceList.value
}).map((item) => ({ ...item, label: item.value })))

const resourceGroupOptions = computed(() => createResourceRequirementCandidates({
  resourceGroups: customResourceGroupList.value
}).map((item) => ({ ...item, label: item.value })))

const candidates = computed(() => createResourceRequirementCandidates({
  resources: resourceList.value,
  resourceGroups: customResourceGroupList.value
}))

const poolResourceColumns = [
  { title: '资源', dataIndex: 'name', key: 'name' },
  { title: '操作', dataIndex: 'action', key: 'action' }
]
const poolResourceGroupColumns = [
  { title: '资源组', dataIndex: 'name', key: 'name' },
  { title: '操作', dataIndex: 'action', key: 'action' }
]
const poolResourceData = ref([])
const poolResourceGroupData = ref([])

watch(
  [resourceOptions, resourceGroupOptions],
  ([resources, groups]) => {
    const currentResourceNames = new Set(poolResourceData.value.map((item) => item.name))
    const currentGroupNames = new Set(poolResourceGroupData.value.map((item) => item.name))
    poolResourceData.value = [
      ...poolResourceData.value,
      ...resources
        .filter((item) => !currentResourceNames.has(item.value))
        .map((item) => ({ key: item.value, name: item.value }))
    ]
    poolResourceGroupData.value = [
      ...poolResourceGroupData.value,
      ...groups
        .filter((item) => !currentGroupNames.has(item.value))
        .map((item) => ({ key: item.value, name: item.value }))
    ]
  },
  { immediate: true }
)

watch(
  taskRecord,
  (record) => {
    resourceConstraint.value = record?.resourceRequirement || ''
    validationMessage.value = ''
  },
  { immediate: true }
)

const updatePoolResourceData = (list) => {
  poolResourceData.value = list
}

const updatePoolResourceGroupData = (list) => {
  poolResourceGroupData.value = list
}

const getInputElement = () => expressionInput.value?.resizableTextArea?.textArea || expressionInput.value?.$el?.querySelector('textarea')

const insertText = (text) => {
  if (!taskRecord.value) return
  const input = getInputElement()
  const currentValue = resourceConstraint.value || ''
  const start = input?.selectionStart ?? currentValue.length
  const end = input?.selectionEnd ?? currentValue.length
  const before = currentValue.slice(0, start)
  const after = currentValue.slice(end)
  const prefix = before && !/[\s(]$/.test(before) ? ' ' : ''
  const suffix = after && !/^[\s)]/.test(after) ? ' ' : ' '
  const inserted = `${prefix}${text}${suffix}`
  const nextValue = `${before}${inserted}${after}`

  resourceConstraint.value = nextValue
  nextTick(() => {
    const nextInput = getInputElement()
    if (!nextInput) return
    const cursor = before.length + inserted.length
    nextInput.focus()
    nextInput.setSelectionRange(cursor, cursor)
  })
}

const validateRequirement = () => {
  if (!taskRecord.value) return false
  const result = validateResourceExpression(resourceConstraint.value, candidates.value)
  validationMessage.value = result.valid ? '' : result.errors.join('；')
  if (result.valid) {
    message.success('资源需求表达式校验通过')
  } else {
    message.error(validationMessage.value)
  }
  return result.valid
}

const saveRequirement = () => {
  if (!taskRecord.value || !validateRequirement()) return
  const result = validateResourceExpression(resourceConstraint.value, candidates.value)
  taskRecord.value.resourceRequirement = result.normalizedExpression
  resourceConstraint.value = result.normalizedExpression
  message.success('资源需求已保存')
}

const clearRequirement = () => {
  if (!taskRecord.value) return
  resourceConstraint.value = ''
  taskRecord.value.resourceRequirement = ''
  validationMessage.value = ''
  message.success('资源需求已清空')
}
</script>

<style scoped>
.resource-requirement {
  display: grid;
  gap: 16px;
}

.constraint-line {
  display: grid;
  grid-template-columns: 150px minmax(0, 1fr);
  align-items: start;
  gap: 12px;
}

.form-label {
  padding-top: 8px;
  color: var(--sts-ink-primary);
  font-size: 15px;
  font-weight: 600;
}

.form-input {
  min-width: 0;
}

.editor-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.token-groups {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.token-group,
.pool-section {
  min-width: 0;
  padding: 14px;
  border: 1px solid var(--sts-border);
  border-radius: var(--sts-radius-md);
  background: var(--sts-surface-subtle);
}

.token-group__title,
.pool-section__title {
  margin-bottom: 10px;
  color: var(--sts-ink-primary);
  font-size: 14px;
  font-weight: 600;
}

.token-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.token-list :deep(.ant-btn) {
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.token-group :deep(.ant-empty) {
  margin: 8px 0 0;
}

.pool-section__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.pool-section__hint {
  color: var(--sts-ink-secondary);
  font-size: 13px;
}

@media (max-width: 767px) {
  .constraint-line,
  .token-groups {
    grid-template-columns: 1fr;
  }

  .form-label {
    padding-top: 0;
  }

  .pool-section {
    overflow: hidden;
  }
}
</style>
