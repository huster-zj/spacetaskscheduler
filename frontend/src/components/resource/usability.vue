<template>
  <div class="form-container">
    <a-row>
      <a-col :span="24">
        <div class="form-head">
          <a-typography-title :level="3">时间窗设置</a-typography-title>
          <a-row :gutter="32">
            <a-col :span="24">
              <div class="form-item">
                <a-radio-group v-model:value="resourceUsability.availability" class="form-input">
                  <a-radio :value="1" class="radio-label">可用时间窗</a-radio>
                  <a-radio :value="2" class="radio-label">不可用时间窗</a-radio>
                </a-radio-group>
                <a-radio-group v-model:value="resourceUsability.timeWindowType" class="form-input">
                  <a-radio :value="1" class="radio-label">周期时间窗</a-radio>
                  <a-radio :value="2" class="radio-label">离散时间窗</a-radio>
                </a-radio-group>
              </div>
            </a-col>
          </a-row>
        </div>

        <div class="form-body">
          <a-row :gutter="32">
            <a-col :span="24">
              <div v-if="combinedValue === 1">
                <radio-table :data="resourceUsability.availabilityPeriodData" :columns="availabilityColumns"
                  v-model:value="resourceUsability.availabilityPeriodData"
                  @updateValue="updateAvailabilityPeriodData" />
              </div>
              <div v-else-if="combinedValue === 3">
                <radio-table :data="resourceUsability.unavailablePeriodData" :columns="unavailableColumns"
                  v-model:value="resourceUsability.unavailablePeriodData" @updateValue="updateUnavailablePeriodData" />
              </div>
              <div v-else-if="combinedValue === 2">
                <radio-table :data="resourceUsability.availabilityDiscreteData" :columns="availabilityDiscreteColumns"
                  v-model:value="resourceUsability.availabilityDiscreteData"
                  @updateValue="updateAvailabilityDiscreteData" />
              </div>
              <div v-else-if="combinedValue === 4">
                <radio-table :data="resourceUsability.unavailabilityDiscreteData"
                  :columns="unavailabilityDiscreteColumns" v-model:value="resourceUsability.unavailabilityDiscreteData"
                  @updateValue="updateUnavailabilityDiscreteData" />
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
import { useUsabilityStore } from '@/stores/resourceDetailNumStore'; // 确保路径正确
import RadioTable from '@/components/table/radio_table.vue';

const props = defineProps({
  resourceKey: {
    type: String,
    default: null
  }
});

console.log('Usability.vue, resourceKey:', props.resourceKey);

// 使用 Pinia store
const usabilityStore = useUsabilityStore();

// 从 store 中解构出响应式数据
const { usabilityList, addResourceUsability } = usabilityStore;

let resourceUsability;

if (props.resourceKey) {
  resourceUsability = usabilityList.find((item) => item.key === props.resourceKey);
} else {
  // 初始化一个新的可用性对象
  const newUsability = {
    availability: 1,
    timeWindowType: 1,
    availabilityPeriodData: [
      {
        id: 1,
      },
    ],
    unavailablePeriodData: [
      {
        id: 1,
      },
    ],
    availabilityDiscreteData: [
      {
        id: 1,
      },
    ],
    unavailabilityDiscreteData: [
      {
        id: 1,
      },
    ]
  };

  // 添加新的可用性到 store
  addResourceUsability(newUsability);

  // 获取刚添加的可用性
  resourceUsability = usabilityList[usabilityList.length - 1]; // 获取最后添加的可用性
}

// 输出resourceUsability 的值
console.log('当前资源的Usability:', resourceUsability);

// 列配置
const availabilityColumns = [
  { title: '周期开始时间', dataIndex: 'startTime', key: 'startTime' },
  { title: '周期结束时间', dataIndex: 'endTime', key: 'endTime' },
  { title: '周期类型', dataIndex: 'cycleClass', key: 'cycleClass' },
  { title: '时间窗备注', dataIndex: 'notes', key: 'notes' },
  { title: '时间窗数量', dataIndex: 'windowCount', key: 'windowCount' },
  {
    title: '操作', key: 'operation'
  },
];

const unavailableColumns = [
  { title: '周期开始时间', dataIndex: 'startTime', key: 'startTime' },
  { title: '周期结束时间', dataIndex: 'endTime', key: 'endTime' },
  { title: '周期类型', dataIndex: 'cycleClass', key: 'cycleClass' },
  { title: '时间窗备注', dataIndex: 'notes', key: 'notes' },
  { title: '时间窗数量', dataIndex: 'windowCount', key: 'windowCount' },
  { title: '操作', key: 'operation' },
];

const availabilityDiscreteColumns = [
  { title: '开始时间', dataIndex: 'startTime', key: 'startTime' },
  { title: '结束时间', dataIndex: 'endTime', key: 'endTime' },
  { title: '时间窗备注', dataIndex: 'notes', key: 'notes' },
  { title: '操作', key: 'operation' },
];

const unavailabilityDiscreteColumns = [
  { title: '开始时间', dataIndex: 'startTime', key: 'startTime' },
  { title: '结束时间', dataIndex: 'endTime', key: 'endTime' },
  { title: '时间窗备注', dataIndex: 'notes', key: 'notes' },
  { title: '操作', key: 'operation' },
];

// 计算属性
const combinedValue = computed(() => {
  if (resourceUsability.availability === 1 && resourceUsability.timeWindowType === 1) return 1;
  if (resourceUsability.availability === 1 && resourceUsability.timeWindowType === 2) return 2;
  if (resourceUsability.availability === 2 && resourceUsability.timeWindowType === 1) return 3;
  if (resourceUsability.availability === 2 && resourceUsability.timeWindowType === 2) return 4;
  return 1; // 添加默认返回值以满足lint的要求
});

const updateAvailabilityPeriodData = (newData) => {
  resourceUsability.availabilityPeriodData = newData;
};

const updateUnavailablePeriodData = (newData) => {
  resourceUsability.unavailablePeriodData = newData;
};

const updateAvailabilityDiscreteData = (newData) => {
  resourceUsability.availabilityDiscreteData = newData;
};

const updateUnavailabilityDiscreteData = (newData) => {
  resourceUsability.unavailabilityDiscreteData = newData;
};

</script>

<style scoped>
.form-container {
  display: flex;
  flex-direction: column;
  padding: 2rem;
  background-color: #ffffff;
  border-radius: 8px;
}

.form-item {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
}

.form-input {
  margin-right: 10rem;
}

.radio-label {
  font-size: 18px;
  /* 设置单选框标签字体大小 */
}
</style>