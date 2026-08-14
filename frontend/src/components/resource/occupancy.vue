<template>
  <div class="form-container">
    <a-row>
      <a-col :span="24">
        <a-typography-title :level="4" style="font-size: 23px;">占用情况</a-typography-title>
        <a-row :gutter="32" class="occupancy-summary">
          <a-col :span="5">
            <div class="form-item">
              <label for="total-available-time" class="form-label">总可用时长:</label>
              <a-input id="total-available-time" placeholder="60min" class="form-input" disabled />
            </div>
          </a-col>
          <a-col :span="9">
            <div class="form-item">
              <label for="usage-ratio-exclude" class="form-label">资源使用时长占比(不包括准备和冷却时间):</label>
              <a-input id="usage-ratio-exclude" placeholder="0.68" class="form-input" disabled />
            </div>
          </a-col>
          <a-col :span="9">
            <div class="form-item">
              <label for="usage-ratio-include" class="form-label">资源使用时长占比(包括准备和冷却时间):</label>
              <a-input id="usage-ratio-include" placeholder="0.77" class="form-input" disabled />
            </div>
          </a-col>
        </a-row>

        <div class="form-body">
          <label class="form-label" style="font-weight: bold;">任务列表</label>
          <a-table :dataSource="dataSource" :columns="columns" :scroll="{ x: 980 }" rowKey="id" class="table" />
        </div>
      </a-col>
    </a-row>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useOccupancyStore } from '@/stores/resourceDetailNumStore'; // 确保路径正确
import { getKey } from '@/stores/keyManager'

const props = defineProps({
  resourceKey: {
    type: String,
    default: null
  }
});

console.log('Occupancy.vue, resourceKey:', props.resourceKey);

// 使用 Pinia store
const occupancyStore = useOccupancyStore();

// 从 store 中解构出响应式数据
const { occupancyMap, addResourceOccupancy } = occupancyStore;

let resourceOccupancy;

if (props.resourceKey) {
  resourceOccupancy = computed(() => occupancyMap.get(props.resourceKey) || [])
} else {
  // 初始化一个新的可用性对象
  const newResourceOccupancy = {
    taskName: '',
    minPrepStartTime: '',
    actualPrepStartTime: '',
    startTime: '',
    endTime: '',
    cooldownEndTime: '',
    taskQuantity: 0,
  }
  addResourceOccupancy(getKey(), newResourceOccupancy)
  resourceOccupancy = computed(() => occupancyMap.get(getKey()) || [])
}

const dataSource = ref(resourceOccupancy.value);

// 表格列配置
const columns = [
  {
    title: '任务名称',
    dataIndex: 'taskName',
    key: 'taskName',
  },
  {
    title: '最小准备开始时间',
    dataIndex: 'minPrepStartTime',
    key: 'minPrepStartTime',
  },
  {
    title: '实际准备开始时间',
    dataIndex: 'actualPrepStartTime',
    key: 'actualPrepStartTime',
  },
  {
    title: '开始时间',
    dataIndex: 'startTime',
    key: 'startTime',
  },
  {
    title: '结束时间',
    dataIndex: 'endTime',
    key: 'endTime',
  },
  {
    title: '冷却结束时间',
    dataIndex: 'cooldownEndTime',
    key: 'cooldownEndTime',
  },
  {
    title: '任务数量',
    dataIndex: 'taskQuantity',
    key: 'taskQuantity',
  },
];
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

.form-label {
  margin-right: 1rem;
  white-space: nowrap;
  font-size: 18px;
}

.table {
  margin-top: 0px;
}

.table-label {
  font-size: 20px;
  display: block;
  margin-bottom: 10px;
  /* 调整标签和表格之间的间距 */
}

.form-input {
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

@media (max-width: 767px) {
  .occupancy-summary > .ant-col {
    max-width: 100%;
    flex: 1 1 100%;
  }

  .form-label,
  .form-input,
  :deep(.ant-table-thead),
  :deep(.ant-table-tbody .ant-table-cell) {
    font-size: 14px;
  }
}
</style>
