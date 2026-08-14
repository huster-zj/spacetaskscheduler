<!--
 * @Author: Jerry
 * @Date: 2025-01-11 10:33:55
 * @LastEditors: Do not edit
 * @LastEditTime: 2025-06-05 15:29:14
 * @FilePath: \spacetaskscheduler\src\views\MainView.vue
-->
<template>
  <section class="page-shell main-view-page">
    <div class="main-container surface-panel">
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
      <div class="view-stage">
        <TaskView v-if="currentView === 'task'" :showSkinOptions="showSkinOptions" />
        <ResourceView v-if="currentView === 'resource'" :showSkinOptions="showSkinOptions" />
        <CalendarView v-if="currentView === 'calendar'" />
      </div>
    </div>
  </section>
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
  min-height: 560px;
  overflow: hidden;
}

.view-control {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 16px;
  overflow-x: auto;
  border-bottom: 1px solid var(--sts-border);
  background: var(--sts-surface-raised);
}

.custom-skin {
  flex: 0 0 auto;
  margin: 0;
  font-size: 14px;
}

.view-stage {
  flex: 1;
  min-height: clamp(480px, 65vh, 760px);
  overflow: hidden;
}

.view-stage > * {
  min-height: inherit;
}

@media (max-width: 767px) {
  .main-view-page {
    padding-right: 0;
    padding-left: 0;
  }

  .main-container {
    border-right: 0;
    border-left: 0;
    border-radius: 0;
  }

  .view-control {
    align-items: flex-start;
    flex-direction: column;
  }

  .view-stage {
    min-height: 560px;
  }
}
</style>
