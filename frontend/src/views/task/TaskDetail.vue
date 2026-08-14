<template>
  <div class="page-shell detail-page">
    <div class="box">
      <div class="page-container surface-panel">
      <FormHead class="page-section" :taskKey="taskKey" />
      <BasicInfo class="page-section" :taskKey="taskKey" />
      <Prop class="page-section" :taskKey="taskKey" />
      <Duration class="page-section" :taskKey="taskKey" />
      <Requirement class="page-section" />
      <SchedulerState class="page-section" :taskKey="taskKey" />
      </div>
    </div>
  </div>

</template>

<script setup>
import BasicInfo from '@/components/task/basic_info.vue';
import Duration from '@/components/task/duration.vue';
import FormHead from '@/components/task/form_head.vue';
import Prop from '@/components/task/prop.vue';
import Requirement from '@/components/task/requirement.vue';
import SchedulerState from '@/components/task/scheduler_state.vue';

const props = defineProps({
  taskKey: {
    type: String,
    // default: null
    required: true
  }
})
console.log('taskKey', props);

</script>

<style scoped>
.box {
  width: 100%;
}

.page-container {
  width: 100%;
  padding: 24px;
}

.page-section {
  background-color: #ffffff;
  /* 确保每个组件都有相同的背景色 */
  border: none;
  /* 去掉分割线 */
  border-bottom: none;
  /* 确保没有底部边框 */
  margin-bottom: 0;
  /* 确保没有底部间距 */
  padding-bottom: 0;
  /* 确保没有底部内边距 */
}

@media (max-width: 767px) {
  .page-container {
    padding: 16px;
  }
}
</style>
