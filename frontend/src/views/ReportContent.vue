<template>
  <div class="page-shell report-content-page">
    <div class="content">
      <div class="header">
        <a-button type="primary" @click="downloadMarkdown">
          <template #icon>
            <DownloadOutlined />
          </template>
          下载报告
        </a-button>
      </div>
      <div class="markdown-container" v-html="renderedContent"></div>
    </div>
  </div>
</template>

<script setup>
import { DownloadOutlined } from '@ant-design/icons-vue'
import MarkdownIt from 'markdown-it'
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useDynamicReports } from '@/composables/useDynamicReports'

const route = useRoute()
const { reports } = useDynamicReports()

// 根据路由参数获取对应报告内容
const getReportContent = () => {
  const type = route.params.type
  switch (type) {
    case 'schedule': return reports.value.scheduleReport
    case 'resource': return reports.value.resourceReport
    case 'summary': return reports.value.summaryReport
    case 'taskGroup': return reports.value.taskGroupReport
    case 'taskConflict': return reports.value.taskConflictReport
    case 'task': return reports.value.taskReport
    default: return ''
  }
}

const md = new MarkdownIt({
  html: false,
  breaks: true,
  linkify: true
})

const renderedContent = computed(() => md.render(getReportContent()))

const downloadMarkdown = () => {
  const now = new Date()
  const fileName = now.getFullYear().toString() +
    (now.getMonth() + 1).toString().padStart(2, '0') +
    now.getDate().toString().padStart(2, '0') +
    now.getHours().toString().padStart(2, '0') +
    now.getMinutes().toString().padStart(2, '0') +
    '报告.md'

  const blob = new Blob([getReportContent()], { type: 'text/markdown' })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}
</script>

<style scoped>
.content {
  max-width: 1040px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 16px;
}

.markdown-container {
  overflow-x: auto;
  overflow-y: hidden;
  overflow-wrap: anywhere;
  padding: 24px;
  border: 1px solid var(--sts-border);
  border-radius: var(--sts-radius-lg);
  background: var(--sts-surface-raised);
  box-shadow: var(--sts-shadow-sm);
}

:deep(h1) {
  font-size: 24px;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
}

:deep(h2) {
  font-size: 20px;
  margin: 16px 0;
}

:deep(p) {
  line-height: 1.6;
  margin: 12px 0;
}

:deep(pre) {
  background: var(--sts-surface-subtle);
  padding: 16px;
  border-radius: 4px;
  overflow-x: auto;
}

:deep(table) {
  border-collapse: collapse;
  width: 100%;
  margin: 12px 0;
}

:deep(th),
:deep(td) {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}

:deep(.markdown-container > *) {
  max-width: 100%;
}

@media (max-width: 767px) {
  .markdown-container {
    padding: 16px;
  }
}
</style>
