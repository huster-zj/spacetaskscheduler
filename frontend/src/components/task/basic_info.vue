<template>
  <div class="form-container">
    <a-row>
      <a-col :span="24">
        <div class="form-head">
          <a-typography-title :level="3">偏好信息</a-typography-title>
          <a-row :gutter="32">
            <a-col :span="8">
              <div class="form-item">
                <label class="form-label">调度偏好：</label>
                <a-select v-model:value="taskBasicInfo.schedulePreference" style="width: 100px;">
                  <a-select-option value=1>无</a-select-option>
                  <a-select-option value=2>早</a-select-option>
                  <a-select-option value=3>中</a-select-option>
                  <a-select-option value=4>晚</a-select-option>
                </a-select>
              </div>
            </a-col>
            <a-col :span="8">
              <div class="form-item">
                <label class="form-label">时间点偏好：</label>
                <a-select v-model:value="taskBasicInfo.timePreference" style="width: 100px;">
                  <a-select-option value=1>无</a-select-option>
                  <a-select-option value=2>早</a-select-option>
                  <a-select-option value=3>中</a-select-option>
                  <a-select-option value=4>晚</a-select-option>
                </a-select>
              </div>
            </a-col>
            <a-col :span="8">
              <div class="form-item">
                <label class="form-label">偏好的开始时间：</label>
                <a-date-picker v-model:value="taskBasicInfo.startTimePreference" show-time />
              </div>
            </a-col>
          </a-row>
        </div>
      </a-col>
      <a-col :span="24">
        <div class="form-head">
          <a-typography-title :level="3">关键点约束</a-typography-title>
          <a-row :gutter="32">
            <a-col :span="16">
              <div>
                <radio-table :data="taskBasicInfo.keyPointConstraint" :columns="keypoint_constraint"
                  v-model:value="taskBasicInfo.keyPointConstraint" @updateValue="updateKeyPointConstraint" />
              </div>
            </a-col>
          </a-row>
        </div>
      </a-col>
    </a-row>
  </div>
</template>

<script setup>
import { useBasicInfoStore } from '@/stores/taskDetailNumStore'; // 确保路径正确
import RadioTable from '@/components/table/radio_table.vue'; // 引入 radio_table 组件

const props = defineProps({
  taskKey: {
    type: String,
    default: null
  }
})

const keypoint_constraint = [
  { title: '时间点', dataIndex: 'taskTimePoint', key: 'taskTimePoint' },
  { title: '关键点', dataIndex: 'taskKeyPoint', key: 'taskKeyPoint' },
  { title: '偏移', dataIndex: 'offset', key: 'offset' },
  { title: '操作', key: 'operation', width: '25%' },
];

console.log('basic_info.vue, taskKey:', props.taskKey);

// 使用 Pinia store
const basicInfoStore = useBasicInfoStore();

// 从 store 中解构出响应式数据
const { basicInfoList, addTaskBasicInfo } = basicInfoStore;

let taskBasicInfo

if (props.taskKey) {
  // 根据传入的 key 查找对应的任务对象
  taskBasicInfo = basicInfoList.find((item) => item.key === props.taskKey);
} else {
  // 新建一个任务对象
  const newTaskBasicInfo = {
    schedulePreference: '',
    timePreference: '',
    startTimePreference: '',
    keyPointConstraint: [
      {
        key: '1',
      },
    ],
  };
  addTaskBasicInfo(newTaskBasicInfo);
  taskBasicInfo = basicInfoList[basicInfoList.length - 1]; // 获取最后添加的任务
}

const updateKeyPointConstraint = (newData) => {
  taskProp.keyPointConstraint = newData;
  console.log('Updated keyPointConstraint:', taskProp.keyPointConstraint);
};

// 输出 taskBasicInfo 的值
console.log('当前任务的BasicInfo:', taskBasicInfo);

</script>

<style scoped>
.form-container {
  padding: 2rem;
  background-color: #ffffff;
  border-radius: 8px;
}

.form-head {
  margin-bottom: 1.5rem;
}

.form-item {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
}

.form-label {
  margin-right: 1rem;
  white-space: nowrap;
  font-size: 18px;
}
</style>