<template>
  <Steps :current_page="8" />
  <section class="page-shell result-page">
    <header class="page-header">
      <div>
        <h1 class="page-heading">调度结果</h1>
        <p class="page-description">查看算法输出中的任务分配、时间和资源匹配情况。</p>
      </div>
      <a-button v-if="scheduleResult.hasOutput" @click="downloadOutput">
        <template #icon><DownloadOutlined /></template>
        下载原始结果
      </a-button>
    </header>

    <a-alert
      v-if="scheduleResult.parsingStatus === 'error'"
      message="调度结果解析失败"
      :description="scheduleResult.parsingError"
      type="error"
      show-icon
    />

    <a-alert
      v-else-if="scheduleResult.parsingStatus === 'empty'"
      message="尚未生成调度结果"
      description="请先完成预处理并在运行页面执行支持的调度算法。"
      type="info"
      show-icon
    >
      <template #action>
        <RouterLink to="/operating"><a-button size="small">前往运行</a-button></RouterLink>
      </template>
    </a-alert>

    <div v-if="scheduleResult.parsingStatus === 'success'" class="metrics-grid">
      <div class="metric-item">
        <span>结果条目</span>
        <strong>{{ scheduleResult.rows.length }}</strong>
      </div>
      <div class="metric-item metric-item--success">
        <span>已分配</span>
        <strong>{{ scheduleResult.assignedCount }}</strong>
      </div>
      <div class="metric-item metric-item--warning">
        <span>未分配</span>
        <strong>{{ scheduleResult.unassignedCount }}</strong>
      </div>
      <div class="metric-item">
        <span>使用弧段</span>
        <strong>{{ scheduleResult.totalArcs }}</strong>
      </div>
    </div>

    <div v-if="scheduleResult.parsingStatus === 'success'" class="result-table surface-panel">
      <a-table
        v-if="scheduleResult.rows.length"
        :columns="columns"
        :data-source="scheduleResult.rows"
        :scroll="{ x: 980 }"
        row-key="key"
        :pagination="{ pageSize: 10, hideOnSinglePage: true }"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'status'">
            <a-tag :color="record.assigned ? 'green' : 'orange'">{{ record.status }}</a-tag>
          </template>
        </template>
      </a-table>
      <a-empty v-if="!scheduleResult.rows.length" description="暂无可展示的结果明细" />
    </div>

    <a-collapse v-if="scheduleResult.hasOutput" class="raw-output">
      <a-collapse-panel key="output" header="查看原始算法输出">
        <pre>{{ algorithmOutput.outputText }}</pre>
      </a-collapse-panel>
    </a-collapse>
  </section>
</template>

<script setup>
import { DownloadOutlined } from '@ant-design/icons-vue'
import { storeToRefs } from 'pinia'
import { computed } from 'vue'

import Steps from '@/components/Steps.vue'
import { createScheduleResult } from '@/services/scheduleData'
import { useFormHeadStore as useTaskFormHeadStore } from '@/stores/taskDetailNumStore'
import { useAlgorithmOutputStore } from '@/stores/useAlgorithmOutput'
import { usePreprocessOutputStore } from '@/stores/usePreprocessOutput'

defineOptions({ name: 'ScheduleResultView' })

const taskFormHeadStore = useTaskFormHeadStore()
const algorithmOutputStore = useAlgorithmOutputStore()
const preprocessOutputStore = usePreprocessOutputStore()
const { formHeadList } = storeToRefs(taskFormHeadStore)
const { algorithmOutput } = storeToRefs(algorithmOutputStore)
const { preprocessOutput } = storeToRefs(preprocessOutputStore)

const scheduleResult = computed(() => createScheduleResult({
  outputText: algorithmOutput.value.outputText,
  preprocessOutput: preprocessOutput.value,
  taskDefinitions: formHeadList.value
}))

const columns = [
  { title: '飞控事件 ID', dataIndex: 'id', key: 'id' },
  { title: '状态', dataIndex: 'status', key: 'status' },
  { title: '开始时间', dataIndex: 'startTimeLabel', key: 'startTimeLabel' },
  { title: '结束时间', dataIndex: 'endTimeLabel', key: 'endTimeLabel' },
  { title: '弧段 ID', dataIndex: 'arcId', key: 'arcId' },
  { title: '测控资源', dataIndex: 'resourceLabel', key: 'resourceLabel' }
]

const downloadOutput = () => {
  const blob = new Blob([algorithmOutput.value.outputText], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `调度结果-${new Date().toISOString().slice(0, 10)}.txt`
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
</script>

<style scoped>
.result-page {
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

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(140px, 1fr));
  gap: 12px;
}

.metric-item {
  display: grid;
  gap: 6px;
  padding: 16px;
  border-left: 3px solid var(--sts-primary);
  background: var(--sts-surface-subtle);
}

.metric-item span {
  color: var(--sts-ink-secondary);
  font-size: 13px;
}

.metric-item strong {
  color: var(--sts-ink-primary);
  font-size: 24px;
}

.metric-item--success {
  border-left-color: var(--sts-success);
}

.metric-item--warning {
  border-left-color: var(--sts-warning);
}

.result-table {
  padding: 16px;
}

.raw-output pre {
  max-height: 360px;
  margin: 0;
  overflow: auto;
  color: var(--sts-ink-primary);
  font-family: Consolas, 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.6;
  white-space: pre-wrap;
}

@media (max-width: 767px) {
  .page-header {
    align-items: stretch;
    flex-direction: column;
  }

  .metrics-grid {
    grid-template-columns: repeat(2, minmax(120px, 1fr));
  }

  .result-table {
    padding: 8px;
  }
}
</style>
