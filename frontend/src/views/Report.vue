<template>
  <Steps :current_page="9" />
  <section class="page-shell report-page">
    <header class="page-header">
      <div>
        <h1 class="page-heading">规划报告</h1>
        <p class="page-description">报告内容根据当前规划包和最近一次调度结果生成。</p>
      </div>
      <a-tag :color="scheduleResult.hasOutput ? 'green' : 'default'">
        {{ scheduleResult.hasOutput ? '已生成调度结果' : '尚未运行算法' }}
      </a-tag>
    </header>

    <a-alert
      v-if="!scheduleResult.hasOutput"
      message="当前没有算法输出"
      description="配置和数据仍可查看；运行算法后，报告会自动包含分配统计与资源信息。"
      type="info"
      show-icon
    />

    <div class="content_body">
      <div class="content_body_item">
        <span class="item-label">未分配任务</span>
        <a-select v-model:value="selectConflictTask" :options="conflictTaskOptions" mode="multiple" placeholder="未分配任务列表" class="select-position" />
        <span class="conflict-hint">{{ conflictTaskOptions.length }} 个条目</span>
        <RouterLink :to="{ name: 'report_content', params: { type: 'taskConflict' } }">
          <a-button type="primary" class="custom-btn">查看</a-button>
        </RouterLink>
      </div>
      <div class="content_body_item">
        <span class="item-label">资源</span>
        <a-select v-model:value="selectResource" :options="resourceOptions" mode="multiple" placeholder="资源列表" class="select-position" />
        <span class="conflict-hint">{{ resourceOptions.length }} 个资源</span>
        <RouterLink :to="{ name: 'report_content', params: { type: 'resource' } }">
          <a-button type="primary" class="custom-btn">查看</a-button>
        </RouterLink>
      </div>
      <div class="content_body_item">
        <span class="item-label">任务</span>
        <a-select v-model:value="selectTask" :options="taskOptions" mode="multiple" placeholder="任务列表" class="select-position" />
        <span class="conflict-hint">{{ taskOptions.length }} 个任务</span>
        <RouterLink :to="{ name: 'report_content', params: { type: 'task' } }">
          <a-button type="primary" class="custom-btn">查看</a-button>
        </RouterLink>
      </div>
      <div class="content_body_item">
        <span class="item-label">任务组</span>
        <a-select v-model:value="selectTaskGroup" :options="taskGroupOptions" mode="multiple" placeholder="任务组列表" class="select-position" />
        <span class="conflict-hint">{{ taskGroupOptions.length }} 个任务组</span>
        <RouterLink :to="{ name: 'report_content', params: { type: 'taskGroup' } }">
          <a-button type="primary" class="custom-btn">查看</a-button>
        </RouterLink>
      </div>
      <div class="content_body_item content_body_item--direct">
        <span class="item-label">调度</span>
        <span class="item-description">查看整体分配率、弧段数和运行状态</span>
        <RouterLink :to="{ name: 'report_content', params: { type: 'schedule' } }">
          <a-button type="primary" class="custom-btn">查看</a-button>
        </RouterLink>
      </div>
      <div class="content_body_item content_body_item--direct">
        <span class="item-label">总结</span>
        <span class="item-description">查看规划包和调度统计摘要</span>
        <RouterLink :to="{ name: 'report_content', params: { type: 'summary' } }">
          <a-button type="primary" class="custom-btn">查看</a-button>
        </RouterLink>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, ref } from 'vue'

import Steps from '@/components/Steps.vue'
import { useDynamicReports } from '@/composables/useDynamicReports'

defineOptions({ name: 'PlanningReportView' })

const {
  scheduleResult,
  taskDefinitions,
  resourceDefinitions,
  logicalConstraintsList
} = useDynamicReports()

const selectConflictTask = ref([])
const selectResource = ref([])
const selectTask = ref([])
const selectTaskGroup = ref([])

const conflictTaskOptions = computed(() => scheduleResult.value.rows
  .filter((item) => !item.assigned)
  .map((item) => ({ value: item.id, label: item.id })))
const resourceOptions = computed(() => Array.from(new Set([
  ...resourceDefinitions.value.map((item) => item.resourceName || item.key),
  ...scheduleResult.value.rows.flatMap((item) => item.resources || [])
].filter(Boolean))).map((value) => ({ value, label: value })))
const taskOptions = computed(() => Array.from(new Set([
  ...taskDefinitions.value.map((item) => item.taskName || item.key),
  ...scheduleResult.value.rows.map((item) => item.id)
].filter(Boolean))).map((value) => ({ value, label: value })))
const taskGroupOptions = computed(() => logicalConstraintsList.value.map((item) => ({
  value: item.task_group_name || item.key,
  label: item.task_group_name || item.key
})))

</script>

<style scoped>
.report-page {
  display: grid;
  gap: 16px;
}

.page-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
}

.page-description {
  margin: 6px 0 0;
  color: var(--sts-ink-secondary);
}

.content_body {
  display: grid;
  gap: 12px;
}

.content_body_item {
  display: grid;
  grid-template-columns: 100px minmax(220px, 1fr) minmax(110px, auto) auto;
  align-items: center;
  gap: 16px;
  width: 100%;
  padding: 14px 20px;
  border: 1px solid var(--sts-border);
  border-radius: var(--sts-radius-lg);
  background: var(--sts-surface-raised);
  box-shadow: var(--sts-shadow-sm);
}

.content_body_item--direct {
  grid-template-columns: 100px minmax(220px, 1fr) auto;
}

.item-label {
  color: var(--sts-ink-primary);
  font-weight: 600;
}

.item-description,
.conflict-hint {
  color: var(--sts-ink-secondary);
  font-size: 13px;
}

.conflict-hint {
  color: var(--sts-ink-muted);
}

.select-position {
  width: 100%;
}

.custom-btn {
  min-width: 72px;
}

@media (max-width: 767px) {
  .page-header {
    align-items: stretch;
    flex-direction: column;
  }

  .content_body_item,
  .content_body_item--direct {
    grid-template-columns: 1fr auto;
    gap: 10px 12px;
    padding: 14px;
  }

  .select-position,
  .item-description {
    grid-column: 1 / -1;
    grid-row: 2;
  }

  .conflict-hint {
    grid-column: 1;
    grid-row: 3;
  }

  .content_body_item > a {
    grid-column: 2;
    grid-row: 1;
  }
}
</style>
