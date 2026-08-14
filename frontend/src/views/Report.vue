<template>
  <Steps :current_page="page" />
  <section class="page-shell report-page">
    <header class="page-header">
      <h1 class="page-heading">规划报告</h1>
    </header>
    <div class="content">
    <div class="content_header">
      <RadioBtn :radio_beforeText="radio_beforeText" :radio_selection="radio_selection" />
    </div>
    <div class="content_body">
      <div class="content_body_item">
        <span class="item-label">冲突</span>
        <a-select v-model:value="select_conflict_task" :options="conflict_task_options" mode="multiple"
          placeholder="任务冲突列表" class="select_position"></a-select>
        <span class="conflict_hint">存在三个冲突</span>
        <RouterLink :to="{ name: 'report_content', params: { type: 'taskConflict' } }">
          <a-button type="primary" class="custom_btn">查看</a-button>
        </RouterLink>
      </div>
      <div class="content_body_item">
        <span class="item-label">资源</span>
        <a-select v-model:value="select_resource" :options="resource_options" mode="multiple"
          placeholder="资源列表" class="select_position"></a-select>
        <RouterLink :to="{ name: 'report_content', params: { type: 'resource' } }">
          <a-button type="primary" class="custom_btn">查看</a-button>
        </RouterLink>
      </div>
      <div class="content_body_item">
        <span class="item-label">任务</span>
        <a-select v-model:value="select_task" :options="task_options" mode="multiple"
          placeholder="任务列表" class="select_position"></a-select>
        <RouterLink :to="{ name: 'report_content', params: { type: 'task' } }">
          <a-button type="primary" class="custom_btn">查看</a-button>
        </RouterLink>
      </div>
      <div class="content_body_item">
        <span class="item-label">任务组</span>
        <a-select v-model:value="select_task_group" :options="task_group_options" mode="multiple"
          placeholder="任务组列表" class="select_position"></a-select>
        <RouterLink :to="{ name: 'report_content', params: { type: 'taskGroup' } }">
          <a-button type="primary" class="custom_btn">查看</a-button>
        </RouterLink>
      </div>
      <div class="content_body_item">
        <span class="item-label">调度</span>
        <span class="item-placeholder" aria-hidden="true"></span>
        <RouterLink :to="{ name: 'report_content', params: { type: 'schedule' } }">
          <a-button type="primary" class="custom_btn">查看</a-button>
        </RouterLink>
      </div>
      <div class="content_body_item">
        <span class="item-label">总结</span>
        <span class="item-placeholder" aria-hidden="true"></span>
        <RouterLink :to="{ name: 'report_content', params: { type: 'summary' } }">
          <a-button type="primary" class="custom_btn">查看</a-button>
        </RouterLink>
      </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, reactive } from 'vue'
import RadioBtn from '@/components/button/radio-button.vue'
import Steps from '@/components/Steps.vue'
const page = ref(9)    // 当前所在页面对应的value,计数从0开始,传递给Steps组件

// 单选框数据
const radio_beforeText = ref('历史记录:')
const radio_selection = ref([
  {
    id: 1,
    value: '启发式515',
    label: '启发式515'
  },
  {
    id: 2,
    value: '启发式441',
    label: '启发式441'
  },
  {
    id: 3,
    value: '启发式485',
    label: '启发式485'
  }
])

// 冲突下拉框数据
const select_conflict_task = ref(['a1', 'b2'])
const conflict_task_options = [...Array(25)].map((_, i) => ({
  value: (i + 10).toString(36) + (i + 1),
}))

// 资源下拉框数据
const select_resource = ref(['a1', 'b2'])
const resource_options = [...Array(25)].map((_, i) => ({
  value: (i + 10).toString(36) + (i + 1),
}))

// 任务下拉框数据
const select_task = ref(['a1', 'b2'])
const task_options = [...Array(25)].map((_, i) => ({
  value: (i + 10).toString(36) + (i + 1),
}))

// 任务组下拉框数据
const select_task_group = ref(['a1', 'b2'])
const task_group_options = [...Array(25)].map((_, i) => ({
  value: (i + 10).toString(36) + (i + 1),
}))

</script>

<style scoped>
.content {
  display: grid;
  gap: 16px;
  margin-top: 16px;
}

.content .content_header {
  width: 100%;
  padding: 16px 20px;
  border: 1px solid var(--sts-border);
  border-radius: var(--sts-radius-lg);
  background: var(--sts-surface-raised);
}

.content .content_body {
  display: grid;
  gap: 12px;
}

.content_body .content_body_item {
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

.content_body .content_body_item .select_position {
  width: 100%;
}

/* 冲突提示信息样式 */
.content_body .content_body_item .conflict_hint {
  color: var(--sts-danger);
  font-size: 13px;
}

.item-label {
  color: var(--sts-ink-primary);
  font-weight: 600;
}

/* 按钮样式 */
.content_body .content_body_item .custom_btn {
  min-width: 72px;
}

@media (max-width: 767px) {
  .content_body .content_body_item {
    grid-template-columns: 1fr auto;
    gap: 10px 12px;
    padding: 14px;
  }

  .select_position,
  .item-placeholder {
    grid-column: 1 / -1;
    grid-row: 2;
  }

  .conflict_hint {
    grid-column: 1;
    grid-row: 3;
  }

  .content_body_item > a {
    grid-column: 2;
    grid-row: 1;
  }
}
</style>
