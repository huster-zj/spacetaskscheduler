<template>
  <div class="form-container">
    <a-row>
      <a-col :span="24">
        <div class="form-head">
          <a-typography-title :level="3">调度情况</a-typography-title>
        </div>
        <div class="form-body">
          <a-row :gutter="32">
            <a-col :span="24">
              <div class="form-item">
                <label style="font-weight: bold;">任务安排信息表</label>
              </div>
              <a-table :columns="taskScheduleColumns" :dataSource="taskScheduleData" :pagination="false" />
            </a-col>
          </a-row>
          <a-row :gutter="32" style="margin-top: 2rem;">
            <a-col :span="24">
              <div class="form-item">
                <label style="font-weight: bold;">潜在冲突表</label>
              </div>
              <a-table :columns="potentialConflictColumns" :dataSource="potentialConflictData" :pagination="false" />
            </a-col>
          </a-row>
        </div>
      </a-col>
    </a-row>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useSchedulerStateStore } from '@/stores/taskDetailNumStore'; // 确保路径正确
import { getKey } from '@/stores/keyManager'

const props = defineProps({
  taskKey: {
    type: String,
    default: null
  }
})

console.log('SchedulerState.vue, taskKey:', props.taskKey);

// 使用 Pinia store
const schedulerStateStore = useSchedulerStateStore();

// 从 store 中解构出响应式数据
const { schedulerStateMap, addSchedulerState, addPotentialConflict } = schedulerStateStore;

let taskScheduleData, potentialConflictData;

if (props.taskKey) {
  taskScheduleData = computed(() => schedulerStateMap.get(props.taskKey)?.taskScheduleData || []);
  potentialConflictData = computed(() => schedulerStateMap.get(props.taskKey)?.potentialConflictData || []);
} else {
  // 初始化示例数据到 store
  const newTaskSchedule = [
    { poss: 'Poss1' },
  ];
  const newPotentialConflict = [
    { poss: 'Poss1' },
  ];

  newTaskSchedule.forEach(task => addSchedulerState(getKey(), task));
  newPotentialConflict.forEach(conflict => addPotentialConflict(getKey(), conflict));

  // 任务安排信息表数据
  taskScheduleData = ref(newTaskSchedule);
  // 潜在冲突表数据
  potentialConflictData = ref(newPotentialConflict);
}

const taskScheduleColumns = [
  { title: 'Poss', dataIndex: 'poss', key: 'poss' },
  { title: '开始时间', dataIndex: 'startTime', key: 'startTime' },
  { title: '结束时间', dataIndex: 'endTime', key: 'endTime' },
  { title: '持续时长', dataIndex: 'duration', key: 'duration' },
  { title: '资源', dataIndex: 'resource', key: 'resource' },
  { title: '备注', dataIndex: 'note', key: 'note' },
];

const potentialConflictColumns = [
  { title: 'Poss', dataIndex: 'poss', key: 'poss' },
  { title: '冲突任务', dataIndex: 'conflictTask', key: 'conflictTask' },
  { title: '冲突资源', dataIndex: 'conflictResource', key: 'conflictResource' },
  { title: 'AssignedStart', dataIndex: 'assignedStart', key: 'assignedStart' },
  { title: 'AssignedStop', dataIndex: 'assignedStop', key: 'assignedStop' },
];
</script>

<style scoped>
.form-container {
  padding: 0rem 2rem;
  background-color: #f9f9f9;
  /* 去掉边框圆角和阴影 */
  border-radius: 0;
  box-shadow: none;
}

.form-head {
  margin-bottom: 1.5rem;
}

.form-item {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
  font-size: 18px;
}

/* 设置表格列名的字体大小 */
:deep(.ant-table-thead) {
  font-size: 18px;
  font-weight: bold;
}

:deep(.ant-table-tbody .ant-table-cell) {
  font-size: 16px;
}
</style>