<!--
 * @Author: Jerry
 * @Date: 2025-01-11 10:33:55
 * @LastEditors: Do not edit
 * @LastEditTime: 2025-06-05 15:29:14
 * @FilePath: \spacetaskscheduler\src\views\MainView.vue
-->
<template>
  <div class="main-container">
    <div class="view-control">
      <a-radio-group v-model:value="currentView" option-type="button" @change="switchView">
        <a-radio-button value="resource">资源视图</a-radio-button>
        <a-radio-button value="task">任务视图</a-radio-button>
        <a-radio-button value="calendar">日程表视图</a-radio-button>
      </a-radio-group>
      <a-checkbox 
          v-show="currentView !== 'calendar'" 
          v-model:checked="showSkinOptions" 
          class="custom-skin"
        >皮肤样式</a-checkbox>
    </div>
    <TaskView v-if="currentView === 'task'" :showSkinOptions="showSkinOptions" />
    <ResourceView v-if="currentView === 'resource'" :showSkinOptions="showSkinOptions" />
    <CalendarView v-if="currentView === 'calendar'" />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import TaskView from '@/components/mainview/task_view.vue';
import ResourceView from '@/components/mainview/resource_view.vue';
import CalendarView from '@/components/mainview/calendar.vue';

const currentView = ref('resource');
const showSkinOptions = ref(false);

function switchView(e) {
  currentView.value = e.target.value;
}
</script>

<style scoped>
.main-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.view-control {
  display: flex;
  gap: 10px;
  padding: 10px;
}

.custom-skin {
  font-size: 16px;
  margin-left: 100px;
  /* 设置统一的字体大小 */
}

.task-container,
.resource-container,
.calendar-container {
  flex: 1;
}
</style>