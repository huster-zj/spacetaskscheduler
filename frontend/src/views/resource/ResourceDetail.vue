<template>
  <div class="box">
    <div class="page-container">
      <FormHead class="page-section" :resourceKey="resourceKey" />
      <BasicInfo class="page-section" :resourceKey="resourceKey" />
      <Usability class="page-section" :resourceKey="resourceKey" />
      <ThreeParts class="page-section" :resourceKey="resourceKey" />
      <Occupancy class="page-section" :resourceKey="resourceKey" />
    </div>
  </div>

</template>

<script setup>
import FormHead from '@/components/resource/form_head.vue';
import BasicInfo from '@/components/resource/basic_info.vue';
import Usability from '@/components/resource/usability.vue';
import ThreeParts from '@/components/resource/three_parts.vue';
import Occupancy from '@/components/resource/occupancy.vue';

const props = defineProps({
  resourceKey: {
    type: String,
    // default: null
    required: true
  }
})
console.log('resourceKey', props);

</script>

<style scoped>
.box {
  display: flex;
  justify-content: center;
}

.page-container {
  width: 1500px;
  background-color: #ffffff;
  /* 设置统一的背景色 */
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
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
</style>