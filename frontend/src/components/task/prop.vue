<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="prop-container">
    <a-row>
      <a-col :span="24">
        <div class="form-head">
          <a-typography-title :level="3">任务属性</a-typography-title>
          <a-row :gutter="32">
            <a-col :span="24">
              <div class="form-item">
                <a-radio-group v-model:value="taskProp.availability" class="radio-group-right-margin">
                  <a-radio :value="1" class="form-input">单次任务</a-radio>
                  <a-radio :value="2" class="form-input">重复任务</a-radio>
                </a-radio-group>
                <a-radio-group v-model:value="taskProp.timeWindowType">
                  <a-radio :value="1" class="form-input">周期时间窗</a-radio>
                  <a-radio :value="2" class="form-input">离散时间窗</a-radio>
                </a-radio-group>
              </div>
            </a-col>
          </a-row>
        </div>

        <div class="form-body">
          <a-row :gutter="32">
            <a-col :span="24">
              <div v-if="combinedValue === 1">
                <radio-table :data="taskProp.singlePeriodData" :columns="singlePeriodColumns"
                  v-model:value="taskProp.singlePeriodData" @updateValue="updateSinglePeriodData" />
              </div>
              <div v-if="combinedValue === 2">
                <radio-table :data="taskProp.singleDiscreteData" :columns="singleDiscreteColumns"
                  @updateValue="updateSingleDiscreteData" />
              </div>
              <div v-if="combinedValue === 3">
                <a-row :gutter="32">
                  <a-col :span="12">
                    <div class="form-item">
                      <label class="form-label">最小间隔时间：</label>
                      <a-select v-model:value="taskProp.selectedTimeOption" class="form-input" style="width: 200px;">
                        <a-select-option :value="1">开始</a-select-option>
                        <a-select-option :value="2">结束</a-select-option>
                      </a-select>
                      <DurationPicker :modelValue="taskProp.minIntervalTime1" id="prepare-time"
                        v-model:value="taskProp.minIntervalTime1" class="form-input"
                        @updateValue="onUpdateMinIntervalTime1" />
                    </div>
                  </a-col>
                </a-row>
                <a-row :gutter="32">
                  <a-col :span="12">
                    <div class="form-item">
                      <label class="form-label">最大间隔时间：</label>
                      <a-select v-model:value="taskProp.selectedTimeOption2" class="form-input" style="width: 200px;">
                        <a-select-option :value="1">开始</a-select-option>
                        <a-select-option :value="2">结束</a-select-option>
                      </a-select>
                      <DurationPicker :modelValue="taskProp.maxIntervalTime1" id="prepare-time"
                        v-model:value="taskProp.maxIntervalTime1" class="form-input"
                        @updateValue="onUpdateMaxIntervalTime1" />
                    </div>
                  </a-col>
                </a-row>
                <radio-table :data="taskProp.repeatPeriodData" :columns="repeatPeriodColumns"
                  @updateValue="updateRepeatPeriodData" />
              </div>
              <div v-if="combinedValue === 4">
                <a-row :gutter="32">
                  <a-col :span="12">
                    <div class="form-item">
                      <label class="form-label">最小间隔时间：</label>
                      <a-select v-model:value="taskProp.selectedTimeOption3" class="form-input" style="width: 200px;">
                        <a-select-option :value="1">开始</a-select-option>
                        <a-select-option :value="2">结束</a-select-option>
                      </a-select>
                      <DurationPicker :modelValue="taskProp.minIntervalTime2" id="prepare-time"
                        v-model:value="taskProp.minIntervalTime2" class="form-input"
                        @updateValue="onUpdateMinIntervalTime2" />
                    </div>
                  </a-col>
                </a-row>
                <a-row :gutter="32">
                  <a-col :span="12">
                    <div class="form-item">
                      <label class="form-label">最大间隔时间：</label>
                      <a-select v-model:value="taskProp.selectedTimeOption4" class="form-input" style="width: 200px;">
                        <a-select-option :value="1">开始</a-select-option>
                        <a-select-option :value="2">结束</a-select-option>
                      </a-select>
                      <DurationPicker :modelValue="taskProp.maxIntervalTime2" id="prepare-time"
                        v-model:value="taskProp.maxIntervalTime2" class="form-input"
                        @updateValue="onUpdateMaxIntervalTime2" />
                    </div>
                  </a-col>
                </a-row>
                <radio-table :data="taskProp.repeatDiscreteData" :columns="repeatDiscreteColumns"
                  @updateValue="updateRepeatDiscreteData" />
              </div>
            </a-col>
          </a-row>
        </div>
      </a-col>
    </a-row>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { usePropStore } from '@/stores/taskDetailNumStore'; // 确保路径正确
import RadioTable from '@/components/table/radio_table.vue'; // 引入 radio_table 组件
import DurationPicker from '@/components/DurationPicker.vue';

const props = defineProps({
  taskKey: {
    type: String,
    default: null
  }
})

console.log('prop.vue, taskKey:', props.taskKey);

// 使用 Pinia store
const propStore = usePropStore();

// 从 store 中解构出响应式数据
const { propList, addTaskProp } = propStore;

let taskProp

if (props.taskKey) {
  taskProp = propList.find((item) => item.key === props.taskKey);
} else {
  // 初始化一个新的任务属性对象
  const newTaskProp = {
    availability: 1,
    timeWindowType: 1,
    selectedTimeOption: 1,
    selectedTimeOption2: 1,
    selectedTimeOption3: 1,
    selectedTimeOption4: 1,
    minIntervalTime1: null,
    maxIntervalTime1: null,
    minIntervalTime2: null,
    maxIntervalTime2: null,
    singlePeriodData: [
      { id: 1 },
    ],
    singleDiscreteData: [
      { id: 1 },
    ],
    repeatPeriodData: [
      { id: 1 },
    ],
    repeatDiscreteData: [
      { id: 1 },
    ]
  };

  // 添加新的任务属性到 store
  addTaskProp(newTaskProp);

  // 获取刚添加的任务属性
  taskProp = propList[propList.length - 1]; // 获取最后添加的任务属性
}


// 输出 taskProp 的值
console.log('当前任务的Prop:', taskProp);

const combinedValue = computed(() => {
  if (taskProp.availability === 1 && taskProp.timeWindowType === 1) return 1;
  if (taskProp.availability === 1 && taskProp.timeWindowType === 2) return 2;
  if (taskProp.availability === 2 && taskProp.timeWindowType === 1) return 3;
  if (taskProp.availability === 2 && taskProp.timeWindowType === 2) return 4;
  return 0; // Default return value to ensure a value is always returned
});

const onUpdateMinIntervalTime1 = (newValue) => {
  taskProp.minIntervalTime1 = newValue;
};

const onUpdateMinIntervalTime2 = (newValue) => {
  taskProp.minIntervalTime2 = newValue;
};

const onUpdateMaxIntervalTime1 = (newValue) => {
  taskProp.maxIntervalTime1 = newValue;
};

const onUpdateMaxIntervalTime2 = (newValue) => {
  taskProp.maxIntervalTime2 = newValue;
};

const updateSinglePeriodData = (newData) => {
  taskProp.singlePeriodData = newData;
  console.log('Updated singlePeriodData:', taskProp.singlePeriodData);
};

const updateSingleDiscreteData = (newData) => {
  taskProp.singleDiscreteData = newData;
  console.log('Updated singleDiscreteData:', taskProp.singleDiscreteData);
};

const updateRepeatPeriodData = (newData) => {
  taskProp.repeatPeriodData = newData;
  console.log('Updated repeatPeriodData:', taskProp.repeatPeriodData);
};

const updateRepeatDiscreteData = (newData) => {
  taskProp.repeatDiscreteData = newData;
  console.log('Updated repeatDiscreteData:', taskProp.repeatDiscreteData);
};

// 定义列配置
const singlePeriodColumns = [
  { title: '时间窗开始时间', dataIndex: 'startTime', key: 'startTime' },
  { title: '时间窗结束时间', dataIndex: 'endTime', key: 'endTime' },
  { title: '时间窗备注', dataIndex: 'notes', key: 'notes' },
  { title: '操作', key: 'operation' },
];

const singleDiscreteColumns = [
  { title: '开始时间', dataIndex: 'startTime', key: 'startTime' },
  { title: '结束时间', dataIndex: 'endTime', key: 'endTime' },
  { title: '时间窗备注', dataIndex: 'notes', key: 'notes' },
  { title: '操作', key: 'operation' },
];

const repeatPeriodColumns = [
  { title: '周期开始时间', dataIndex: 'startTime', key: 'startTime' },
  { title: '周期结束时间', dataIndex: 'endTime', key: 'endTime' },
  { title: '周期类型', dataIndex: 'cycleClass', key: 'cycleClass' },
  { title: '重复类型', dataIndex: 'repeatType', key: 'repeatType' },
  { title: '重复次数', dataIndex: 'repeatCount', key: 'repeatCount' },
  { title: '时间窗备注', dataIndex: 'notes', key: 'notes' },
  { title: '操作', key: 'operation' },
];

const repeatDiscreteColumns = [
  { title: '开始时间', dataIndex: 'startTime', key: 'startTime' },
  { title: '结束时间', dataIndex: 'endTime', key: 'endTime' },
  { title: '时间窗备注', dataIndex: 'notes', key: 'notes' },
  { title: '操作', key: 'operation' },
];
</script>

<style scoped>
.prop-container {
  padding: 0rem 2rem;
  background-color: #f9f9f9;
  border-radius: 0;
  box-shadow: none;
}

.form-item {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
}

.form-label {
  width: auto;
  text-align: left;
  margin-right: 1rem;
  white-space: nowrap;
  font-size: 18px;
}

.form-input {
  flex: 1;
  font-size: 18px;
  margin-right: 2rem;
}

.radio-group-right-margin {
  margin-right: 10rem;
}

.separator {
  margin: 0 0.5rem;
}
</style>