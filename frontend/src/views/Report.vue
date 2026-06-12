<template>
  <Steps :current_page="page" />
  <div class="content">
    <div class="content_header">
      <RadioBtn :radio_beforeText="radio_beforeText" :radio_selection="radio_selection" />
    </div>
    <div class="content_body">
      <div class="content_body_item">
        <span>冲突</span>
        <a-select v-model:value="select_conflict_task" :options="conflict_task_options" mode="multiple"
          style="width: 400px" placeholder="任务冲突列表" class="select_position"></a-select>
        <span class="conflict_hint">存在三个冲突</span>
        <RouterLink :to="{ name: 'report_content', params: { type: 'taskConflict' } }">
          <a-button type="primary" class="custom_btn">查看</a-button>
        </RouterLink>
      </div>
      <div class="content_body_item">
        <span>资源</span>
        <a-select v-model:value="select_resource" :options="resource_options" mode="multiple" style="width: 400px"
          placeholder="资源列表" class="select_position"></a-select>
        <RouterLink :to="{ name: 'report_content', params: { type: 'resource' } }">
          <a-button type="primary" class="custom_btn">查看</a-button>
        </RouterLink>
      </div>
      <div class="content_body_item">
        <span>任务</span>
        <a-select v-model:value="select_task" :options="task_options" mode="multiple" style="width: 400px"
          placeholder="任务列表" class="select_position"></a-select>
        <RouterLink :to="{ name: 'report_content', params: { type: 'task' } }">
          <a-button type="primary" class="custom_btn">查看</a-button>
        </RouterLink>
      </div>
      <div class="content_body_item">
        <span>任务组</span>
        <a-select v-model:value="select_task_group" :options="task_group_options" mode="multiple" style="width: 400px;"
          placeholder="任务组列表" class="select_position"></a-select>
        <RouterLink :to="{ name: 'report_content', params: { type: 'taskGroup' } }">
          <a-button type="primary" class="custom_btn">查看</a-button>
        </RouterLink>
      </div>
      <div class="content_body_item">
        <span>调度</span>
        <RouterLink :to="{ name: 'report_content', params: { type: 'schedule' } }">
          <a-button type="primary" class="custom_btn">查看</a-button>
        </RouterLink>
      </div>
      <div class="content_body_item">
        <span>总结</span>
        <RouterLink :to="{ name: 'report_content', params: { type: 'summary' } }">
          <a-button type="primary" class="custom_btn">查看</a-button>
        </RouterLink>
      </div>
    </div>
  </div>
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
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 20px;
}

.content .content_header {
  width: 1000px;
}

.content .content_body {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 20px;
}

.content_body .content_body_item {
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 1000px;
  margin-top: 20px;
  font-size: 22px;
  /* background-color: #c8ccd2; */
  border: solid 1px #9ea0a3;
  border-radius: 10px;
  padding: 10px 50px;
}

.content_body .content_body_item .select_position {
  position: absolute;
  left: 180px;
}

/* 冲突提示信息样式 */
.content_body .content_body_item .conflict_hint {
  position: absolute;
  right: 180px;
  color: red;
}

/* 按钮样式 */
.content_body .content_body_item .custom_btn {
  height: 40px;
  font-size: 18px;
  color: #2e2e2e;
  border: 1.5px solid hsl(0, 1%, 57%);
  border-radius: 10px;
  padding: 5px 10px;
  background-color: #f7f8fa;
}
</style>
