<template>
  <div class="resource-requirement">
    <div class="constraint-line">
      <label for="resource-constraint" class="form-label">资源需求表达式</label>
      <a-textarea
        id="resource-constraint"
        ref="expressionInput"
        v-model:value="resourceConstraint"
        class="form-input"
        :disabled="!taskRecord || isCalculating"
        :auto-size="{ minRows: 2, maxRows: 4 }"
        placeholder="例如：资源A and (资源B or 资源池C)"
        @update:value="markExpressionStale"
        @keydown.enter.exact.prevent="validateRequirement"
      />
    </div>

    <div class="editor-actions">
      <a-button :disabled="!taskRecord || isCalculating" @click="validateRequirement">
        <CheckOutlined />
        校验表达式
      </a-button>
      <a-button
        v-for="operator in operators"
        :key="operator"
        size="small"
        :disabled="!taskRecord || isCalculating"
        @mousedown.prevent
        @click="insertText(operator)"
      >
        {{ operator }}
      </a-button>
      <a-button :disabled="!taskRecord || isCalculating" @click="clearRequirement">
        <ClearOutlined />
        清空
      </a-button>
      <a-button
        type="primary"
        :loading="isCalculating"
        :disabled="!canCalculate"
        @click="calculateFeasibleTimeWindow"
      >
        计算可行时间窗
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
            :disabled="isCalculating"
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
            :disabled="isCalculating"
            @mousedown.prevent
            @click="insertText(item.value)"
          >
            {{ item.value }}
          </a-button>
        </div>
        <a-empty v-else :image="Empty.PRESENTED_IMAGE_SIMPLE" description="当前规划包暂无资源组" />
      </section>

      <section class="token-group">
        <div class="token-group__title">资源池</div>
        <div v-if="resourcePoolOptions.length" class="token-list">
          <a-button
            v-for="item in resourcePoolOptions"
            :key="item.value"
            size="small"
            :disabled="isCalculating"
            @mousedown.prevent
            @click="insertText(item.value)"
          >
            {{ item.value }}
          </a-button>
        </div>
        <a-empty v-else :image="Empty.PRESENTED_IMAGE_SIMPLE" description="当前任务暂无资源池" />
      </section>
    </div>

    <section class="pool-section">
      <div class="pool-section__header">
        <div>
          <div class="pool-section__title">资源池配置</div>
          <div class="pool-section__hint">将资源和资源组组织成任务可复用的资源集合，保存后可加入上方表达式。</div>
        </div>
        <a-tag v-if="taskPools.length">{{ taskPools.length }} 个资源池</a-tag>
      </div>

      <a-alert
        v-if="!taskRecord"
        type="info"
        show-icon
        message="请先选择一个任务"
      />
      <div v-else class="pool-builder">
        <div class="pool-builder__row">
          <label class="pool-field">
            <span>资源池名称</span>
            <a-input v-model:value="poolDraft.poolName" :disabled="isCalculating" placeholder="例如：主备测控池" />
          </label>
          <label class="pool-field">
            <span>资源池选择方式</span>
            <a-radio-group v-model:value="poolDraft.selectionMode" :disabled="isCalculating" button-style="solid">
              <a-radio-button value="all">池内全部资源</a-radio-button>
              <a-radio-button value="count">指定数量资源</a-radio-button>
            </a-radio-group>
          </label>
          <label v-if="poolDraft.selectionMode === 'count'" class="pool-field pool-field--count">
            <span>需要数量</span>
            <a-input-number v-model:value="poolDraft.requiredCount" :disabled="isCalculating" :min="1" :precision="0" />
          </label>
        </div>

        <div class="pool-builder__row pool-builder__row--members">
          <label class="pool-field">
            <span>加入资源</span>
            <a-select
              v-model:value="poolDraft.resourceList"
              mode="multiple"
              allow-clear
              :disabled="isCalculating"
              :options="resourceSelectOptions"
              placeholder="选择资源"
            />
          </label>
          <label class="pool-field">
            <span>加入资源组</span>
            <a-select
              v-model:value="poolDraft.resourceGroupList"
              mode="multiple"
              allow-clear
              :disabled="isCalculating"
              :options="resourceGroupSelectOptions"
              placeholder="选择资源组"
            />
          </label>
        </div>

        <div class="pool-builder__members">
          <span class="pool-builder__members-label">当前池成员</span>
          <a-tag v-for="name in draftMemberNames" :key="name" color="blue">{{ name }}</a-tag>
          <span v-if="!draftMemberNames.length" class="pool-builder__empty">尚未加入资源或资源组</span>
        </div>

        <div class="pool-builder__actions">
          <a-button type="primary" :disabled="isCalculating" @click="saveResourcePool">
            <SaveOutlined />
            {{ editingPoolKey ? '保存修改' : '保存资源池' }}
          </a-button>
          <a-button v-if="editingPoolKey" @click="resetPoolDraft">取消编辑</a-button>
        </div>
      </div>

      <a-empty
        v-if="!taskPools.length"
        :image="Empty.PRESENTED_IMAGE_SIMPLE"
        description="当前任务还没有保存的资源池"
      />
      <div v-else class="saved-pools">
        <div v-for="pool in taskPools" :key="pool.key" class="saved-pool">
          <div class="saved-pool__main">
            <div class="saved-pool__title">
              <span>{{ pool.poolName }}</span>
              <a-tag color="blue">{{ pool.selectionMode === 'all' ? '全部资源' : '指定 ' + pool.requiredCount + ' 个' }}</a-tag>
            </div>
            <div class="saved-pool__members">
              {{ formatPoolMembers(pool) }}
            </div>
          </div>
          <div class="saved-pool__actions">
            <a-button size="small" :disabled="isCalculating" title="插入表达式" @click="insertText(pool.poolName)">
              <PlusOutlined />
              插入
            </a-button>
            <a-button size="small" :disabled="isCalculating" title="编辑资源池" @click="editResourcePool(pool)">
              <EditOutlined />
              编辑
            </a-button>
            <a-popconfirm title="确定删除这个资源池吗？" ok-text="删除" cancel-text="取消" @confirm="deleteResourcePool(pool.key)">
              <a-button size="small" danger title="删除资源池">
                <DeleteOutlined />
                删除
              </a-button>
            </a-popconfirm>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { Empty, message } from 'ant-design-vue'
import {
  CheckOutlined,
  ClearOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  SaveOutlined
} from '@ant-design/icons-vue'
import { storeToRefs } from 'pinia'
import { computed, nextTick, reactive, ref, watch } from 'vue'

import PreprocessService from '@/services/Preprocess'
import {
  createResourceRequirementCandidates,
  validateResourceExpression
} from '@/services/resourceRequirement'
import {
  createResourcePool,
  expandResourcePoolMembers,
  validateResourcePool
} from '@/services/resourcePool'
import { useBasicInfoStore as useTaskBasicInfoStore } from '@/stores/taskDetailNumStore'
import { useFormHeadStore as useResourceFormHeadStore } from '@/stores/resourceDetailNumStore'
import { useResourceGroupListStore } from '@/stores/useResourceGroupListStore'
import { useTaskResourcePoolStore } from '@/stores/useTaskResourcePoolStore'
import { usePreprocessOutputStore } from '@/stores/usePreprocessOutput'

const props = defineProps({
  taskKey: {
    type: String,
    default: null
  }
})

const taskBasicInfoStore = useTaskBasicInfoStore()
const resourceFormHeadStore = useResourceFormHeadStore()
const resourceGroupStore = useResourceGroupListStore()
const resourcePoolStore = useTaskResourcePoolStore()
const preprocessStore = usePreprocessOutputStore()
const { basicInfoList } = storeToRefs(taskBasicInfoStore)
const { formHeadList: resourceList } = storeToRefs(resourceFormHeadStore)
const { customResourceGroupList } = storeToRefs(resourceGroupStore)
const { taskResourcePoolList } = storeToRefs(resourcePoolStore)

const taskRecord = computed(() => {
  if (props.taskKey) {
    return basicInfoList.value.find((item) => String(item.key) === String(props.taskKey)) || null
  }
  return basicInfoList.value[basicInfoList.value.length - 1] || null
})
const taskNotFound = computed(() => Boolean(props.taskKey) && !taskRecord.value)
const activeTaskKey = computed(() => String(taskRecord.value?.key || ''))
const taskPools = computed(() => taskResourcePoolList.value.filter((pool) => String(pool.taskKey) === activeTaskKey.value))
const resourceConstraint = ref('')
const validationMessage = ref('')
const isCalculating = ref(false)
const expressionInput = ref(null)
const editingPoolKey = ref('')
const operators = ['and', 'or', '(', ')']
const poolDraft = reactive(createResourcePool())

const resourceOptions = computed(() => createResourceRequirementCandidates({
  resources: resourceList.value
}).map((item) => ({ ...item, label: item.value })))
const resourceGroupOptions = computed(() => createResourceRequirementCandidates({
  resourceGroups: customResourceGroupList.value
}).map((item) => ({ ...item, label: item.value })))
const resourcePoolOptions = computed(() => createResourceRequirementCandidates({
  resourcePools: taskPools.value
}).map((item) => ({ ...item, label: item.value })))
const candidates = computed(() => createResourceRequirementCandidates({
  resources: resourceList.value,
  resourceGroups: customResourceGroupList.value,
  resourcePools: taskPools.value
}))
const canCalculate = computed(() => Boolean(taskRecord.value) && (
  resourceList.value.length > 0 ||
  customResourceGroupList.value.length > 0 ||
  taskPools.value.length > 0
) && !isCalculating.value)
const resourceSelectOptions = computed(() => resourceList.value
  .map((item) => String(item?.resourceName || item?.name || '').trim())
  .filter(Boolean)
  .map((value) => ({ value, label: value })))
const resourceGroupSelectOptions = computed(() => customResourceGroupList.value
  .map((item) => String(item?.resourceGroupName || item?.name || '').trim())
  .filter(Boolean)
  .map((value) => ({ value, label: value })))
const draftMemberNames = computed(() => [
  ...(poolDraft.resourceList || []),
  ...(poolDraft.resourceGroupList || []).map((name) => name + '（资源组）')
])

const resetPoolDraft = () => {
  const fresh = createResourcePool({ taskKey: activeTaskKey.value })
  Object.assign(poolDraft, fresh)
  editingPoolKey.value = ''
}

const markExpressionStale = () => {
  if (!taskRecord.value || isCalculating.value) return
  preprocessStore.markTaskStale(activeTaskKey.value, taskRecord.value.taskName)
}

watch(taskRecord, (record) => {
  resourceConstraint.value = record?.resourceRequirement || ''
  validationMessage.value = ''
  resetPoolDraft()
}, { immediate: true })

const editResourcePool = (pool) => {
  Object.assign(poolDraft, createResourcePool(pool))
  editingPoolKey.value = pool.key
}

const saveResourcePool = () => {
  if (!taskRecord.value) return
  const result = validateResourcePool({ ...poolDraft, taskKey: activeTaskKey.value }, {
    resources: resourceList.value,
    resourceGroups: customResourceGroupList.value,
    existingPools: taskPools.value
  })
  if (!result.valid) {
    message.error(result.errors.join('；'))
    return
  }
  if (editingPoolKey.value) {
    resourcePoolStore.updateResourcePool(editingPoolKey.value, result.pool)
  } else {
    resourcePoolStore.addResourcePool(result.pool)
  }
  preprocessStore.markTaskStale(activeTaskKey.value, taskRecord.value.taskName)
  resetPoolDraft()
  message.success('资源池已保存')
}

const deleteResourcePool = (key) => {
  resourcePoolStore.removeResourcePool(key)
  preprocessStore.markTaskStale(activeTaskKey.value, taskRecord.value.taskName)
  if (editingPoolKey.value === key) resetPoolDraft()
  message.success('资源池已删除')
}

const formatPoolMembers = (pool) => {
  const members = expandResourcePoolMembers(pool, resourceList.value, customResourceGroupList.value)
  const sources = [...(pool.resourceList || []), ...(pool.resourceGroupList || []).map((name) => name + '（资源组）')]
  return sources.join('、') + '；展开后 ' + members.length + ' 项'
}

const getInputElement = () => expressionInput.value?.resizableTextArea?.textArea || expressionInput.value?.$el?.querySelector('textarea')

const insertText = (value) => {
  if (!taskRecord.value) return
  const input = getInputElement()
  const currentValue = resourceConstraint.value || ''
  const start = input?.selectionStart ?? currentValue.length
  const end = input?.selectionEnd ?? currentValue.length
  const before = currentValue.slice(0, start)
  const after = currentValue.slice(end)
  const prefix = before && !/[\s(]$/.test(before) ? ' ' : ''
  const suffix = after && !/^[\s)]/.test(after) ? ' ' : ' '
  const inserted = prefix + value + suffix
  resourceConstraint.value = before + inserted + after
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
  if (result.valid) message.success('资源需求表达式校验通过')
  else message.error(validationMessage.value)
  return result.valid
}

const calculateFeasibleTimeWindow = async () => {
  if (!canCalculate.value || !validateRequirement()) return
  const result = validateResourceExpression(resourceConstraint.value, candidates.value)
  const taskIdentifier = String(taskRecord.value.key)
  taskRecord.value.resourceRequirement = result.normalizedExpression
  resourceConstraint.value = result.normalizedExpression
  preprocessStore.markTaskStale(taskIdentifier, taskRecord.value.taskName)
  isCalculating.value = true
  try {
    const preprocessResult = await PreprocessService.preprocessTaskTimewindow({ taskKey: taskIdentifier })
    if (!preprocessResult.success) throw new Error(preprocessResult.message || '计算可行时间窗失败')
    const data = preprocessResult.data || {}
    const count = (data.continuous_events?.length || 0) + (data.discrete_events?.length || 0)
    if (count) message.success('可行时间窗计算完成，共 ' + count + ' 个备选弧段')
    else message.warning('未找到可行时间窗，请检查任务时段和资源需求')
  } catch (error) {
    preprocessStore.markTaskError(taskIdentifier, taskRecord.value.taskName, error.message)
    message.error(error.message || '计算可行时间窗失败')
  } finally {
    isCalculating.value = false
  }
}

const clearRequirement = () => {
  if (!taskRecord.value) return
  resourceConstraint.value = ''
  taskRecord.value.resourceRequirement = ''
  preprocessStore.markTaskStale(String(taskRecord.value.key), taskRecord.value.taskName)
  validationMessage.value = ''
  message.success('资源需求已清空')
}
</script>

<style scoped>
.resource-requirement { display: grid; gap: 16px; }
.constraint-line { display: grid; grid-template-columns: 150px minmax(0, 1fr); align-items: start; gap: 12px; }
.form-label { padding-top: 8px; color: var(--sts-ink-primary); font-size: 15px; font-weight: 600; }
.form-input { min-width: 0; }
.editor-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }
.token-groups { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
.token-group, .pool-section { min-width: 0; padding: 14px; border: 1px solid var(--sts-border); border-radius: var(--sts-radius-md); background: var(--sts-surface-subtle); }
.token-group__title, .pool-section__title { margin-bottom: 10px; color: var(--sts-ink-primary); font-size: 14px; font-weight: 600; }
.token-list { display: flex; flex-wrap: wrap; gap: 8px; }
.token-list :deep(.ant-btn) { max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.token-group :deep(.ant-empty) { margin: 8px 0 0; }
.pool-section__header { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; margin-bottom: 12px; }
.pool-section__hint { color: var(--sts-ink-secondary); font-size: 13px; }
.pool-builder { display: grid; gap: 14px; padding-bottom: 14px; border-bottom: 1px solid var(--sts-border); }
.pool-builder__row { display: grid; grid-template-columns: minmax(0, 1.3fr) minmax(0, 1.7fr) auto; gap: 12px; }
.pool-builder__row--members { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.pool-field { display: grid; gap: 6px; min-width: 0; color: var(--sts-ink-secondary); font-size: 13px; }
.pool-field :deep(.ant-select), .pool-field :deep(.ant-input-number) { width: 100%; }
.pool-field--count { max-width: 150px; }
.pool-builder__members { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }
.pool-builder__members-label { color: var(--sts-ink-secondary); font-size: 13px; }
.pool-builder__empty { color: var(--sts-ink-tertiary); font-size: 13px; }
.pool-builder__actions { display: flex; gap: 8px; }
.saved-pools { display: grid; gap: 10px; margin-top: 14px; }
.saved-pool { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 12px; border: 1px solid var(--sts-border); border-radius: var(--sts-radius-md); background: var(--sts-surface-raised); }
.saved-pool__main { min-width: 0; }
.saved-pool__title { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; color: var(--sts-ink-primary); font-weight: 600; }
.saved-pool__members { margin-top: 5px; overflow: hidden; color: var(--sts-ink-secondary); font-size: 13px; text-overflow: ellipsis; white-space: nowrap; }
.saved-pool__actions { display: flex; flex: 0 0 auto; gap: 6px; }
@media (max-width: 900px) { .pool-builder__row, .pool-builder__row--members { grid-template-columns: 1fr; } .pool-field--count { max-width: none; } }
@media (max-width: 767px) { .constraint-line, .token-groups { grid-template-columns: 1fr; } .form-label { padding-top: 0; } .saved-pool { align-items: flex-start; flex-direction: column; } .saved-pool__actions { flex-wrap: wrap; } }
</style>
