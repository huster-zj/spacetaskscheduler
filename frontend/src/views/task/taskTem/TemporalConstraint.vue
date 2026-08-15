<template>
  <Steps :current_page="page" />
  <section class="page-shell constraints-page">
    <section class="constraint-section">
      <header class="section-header">
        <h1 class="section-heading">锚定需求</h1>
      </header>
      <ShowTable :columns="anchorColumns" :data="anchorContraintList" :search-is-show="false">
        <template #column_action="{ column1 }">
          <span class="anchor-type-cell">{{ column1.anchor_type }}</span>
        </template>
        <template #column_name="{ column1 }">
          <div class="anchor-task-cell">
            <a-select
              :value="column1.anchor_task_key || undefined"
              :options="anchorOptions(column1.key)"
              allow-clear
              placeholder="选择任务"
              class="anchor-task-select"
              @change="updateAnchorTask(column1.key, $event)"
            />
            <a-button
              v-if="column1.anchor_task_key"
              type="text"
              danger
              aria-label="清除锚定任务"
              title="清除锚定任务"
              @click="anchorStore.clearAnchorConstraint(column1.key)"
            >
              <CloseOutlined />
            </a-button>
          </div>
        </template>
      </ShowTable>
    </section>

    <section class="constraint-section">
      <header class="section-header">
        <h1 class="section-heading">时态约束</h1>
      </header>
      <ShowTable
        :columns="temporalColumns"
        :data="temConstraintsList"
        :search-fields="['tem_constraint_task1', 'tem_constraint_task2', 'tem_constraint_note']"
      >
        <template #special_btn>
          <RouterLink to="/custom_tem_constraint" class="custom_btn">添加</RouterLink>
        </template>
        <template #column_name="{ column1 }">
          <RouterLink :to="constraintRoute(column1.key)">
            {{ column1.tem_constraint_task1 }}
          </RouterLink>
        </template>
        <template #column_name2="{ column1 }">
          <RouterLink :to="constraintRoute(column1.key)">
            {{ column1.tem_constraint_task2 }}
          </RouterLink>
        </template>
        <template #column_action="{ column1 }">
          <span class="row-actions">
            <RouterLink :to="constraintRoute(column1.key)" aria-label="编辑时态约束" title="编辑">
              <FormOutlined />
            </RouterLink>
            <a-divider type="vertical" />
            <a-popconfirm
              title="是否删除该数据？"
              ok-text="是"
              cancel-text="否"
              @confirm="temporalStore.removeTemConstraints(column1.key)"
            >
              <a class="danger-action" aria-label="删除时态约束" title="删除"><CloseOutlined /></a>
            </a-popconfirm>
          </span>
        </template>
      </ShowTable>
    </section>
  </section>
</template>

<script setup>
import { onMounted, reactive } from 'vue'
import { storeToRefs } from 'pinia'
import { message } from 'ant-design-vue'

import ShowTable from '@/components/table/show_table.vue'
import Steps from '@/components/Steps.vue'
import { useFormHeadStore } from '@/stores/taskDetailNumStore.js'
import { useAnchorContraintListStore } from '@/stores/useAnchorContraintListStore.js'
import { useTemConstraintsListStore } from '@/stores/useTemConstraintsListStore.js'

defineOptions({ name: 'TemporalConstraintView' })

const page = 6

const anchorColumns = reactive([
  { title: '锚定类型', dataIndex: 'anchor_type', key: 'action' },
  { title: '任务', dataIndex: 'anchor_task', key: 'name' },
  { title: '任务优先级', dataIndex: 'anchor_task_priority', key: 'anchor_task_priority' },
  { title: '任务备注', dataIndex: 'anchor_task_note', key: 'anchor_task_note' }
])

const temporalColumns = reactive([
  { title: '任务 1', dataIndex: 'tem_constraint_task1', key: 'name' },
  { title: '任务 2', dataIndex: 'tem_constraint_task2', key: 'name2' },
  { title: '约束类型', dataIndex: 'tem_constraint_type', key: 'tem_constraint_type' },
  { title: '最小间隔', dataIndex: 'minimum_interval_time', key: 'minimum_interval_time' },
  { title: '最小计时点', dataIndex: 'min_timing_start_point', key: 'min_timing_start_point' },
  { title: '最大间隔', dataIndex: 'maximum_interval_time', key: 'maximum_interval_time' },
  { title: '最大计时点', dataIndex: 'max_timing_start_point', key: 'max_timing_start_point' },
  { title: '备注', dataIndex: 'tem_constraint_note', key: 'tem_constraint_note' },
  { title: '操作', key: 'action' }
])

const anchorStore = useAnchorContraintListStore()
const { anchorContraintList } = storeToRefs(anchorStore)
const { formHeadList } = storeToRefs(useFormHeadStore())
const temporalStore = useTemConstraintsListStore()
const { temConstraintsList } = storeToRefs(temporalStore)

const synchronizeAnchors = () => anchorStore.ensureAnchorConstraints()
synchronizeAnchors()
onMounted(synchronizeAnchors)

const anchorOptions = (anchorKey) => {
  const otherAnchor = anchorContraintList.value.find((item) => String(item.key) !== String(anchorKey))
  return formHeadList.value.map((task) => ({
    value: String(task.key),
    label: task.taskName,
    disabled: String(task.key) === String(otherAnchor?.anchor_task_key || '')
  }))
}

const updateAnchorTask = (anchorKey, taskKey) => {
  if (!anchorStore.updateAnchorConstraint(anchorKey, taskKey || '')) {
    message.warning('所选任务已不存在，请重新选择')
  }
}

const constraintRoute = (constraintKey) => ({
  name: 'TemConstraintDetail',
  params: { constraintKey: String(constraintKey) }
})
</script>

<style scoped>
.constraints-page {
  display: grid;
  gap: 28px;
}

.constraint-section {
  min-width: 0;
}

.section-header {
  margin-bottom: 12px;
}

.anchor-type-cell,
.anchor-task-cell,
.row-actions {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.anchor-type-cell {
  display: inline-block;
  min-width: 76px;
  color: var(--sts-ink-secondary);
}

.anchor-task-select {
  width: 170px;
}

.anchor-task-cell .ant-btn {
  min-width: 32px;
  padding: 4px;
}

.danger-action {
  color: var(--sts-danger);
}

.custom_btn {
  min-width: 80px;
}
</style>
