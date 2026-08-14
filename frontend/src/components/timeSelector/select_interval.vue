<!-- 使用说明
import SelectInterval from '@/components/timeSelector/select_interval.vue';
  -->

<template>
  <a-space direction="vertical">
    <a-time-picker v-model:value="selectTime" format="HH:mm:ss" @change="handleChange" />
    <!-- <a-time-picker v-model:value="strValue" format="HH:mm:ss" /> -->
  </a-space>
  <!-- <button @click="outputData">点击输出要暴露的数据</button> -->
</template>

<script setup>
import dayjs from 'dayjs';
import { ref,toRefs } from 'vue';

const props = defineProps({
  special_result: {
    type: String,
    Required: false,
    default: '08:00:00'
  }
});
let { special_result:special_result1 } = toRefs(props);

const selectTime = ref(dayjs(special_result1.value, 'HH:mm:ss'));

function handleChange(newValue) {
  if (!newValue) {
    selectTime.value = dayjs('00:00:00', 'HH:mm:ss');
  }
  console.log('当前时间:', selectTime.value.format('HH:mm:ss'));
};

function outputData() {
  console.log('暴露的数据:', selectTime.value.format('HH:mm:ss'));
}

defineExpose({
  selectTime
});

</script>

<style scoped>
.ant-picker {
  width: 180px;
  min-height: 36px;
  border-radius: var(--sts-radius-md);
}
:deep(.ant-picker .ant-picker-input input) {
  font-size: 14px;
  line-height: 1.5;
}
</style>
