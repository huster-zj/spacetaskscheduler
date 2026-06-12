<template>
  <a-collapse accordion>
    <a-collapse-panel key="1" header="时段">
      <a-collapse accordion>
        <a-collapse-panel :key="1 - 1" :header="`时段_任务 (${taskTimeData.length})`">
          <!-- 时段_任务的内容 -->
          <a-table :columns="taskTimeColumns" :dataSource="taskTimeData" />
        </a-collapse-panel>
        <a-collapse-panel :key="1 - 2"
          :header="`时段_可能性 (${possibilityData.length}, ${possibilityTimeWindowData.length})`">
          <!-- 时段_可能性的内容 -->
          <a-row :gutter="16">
            <a-col :span="12">
              <label class="form-label" style="font-weight: bold;">可能性列表</label>
              <a-table :columns="possibilityColumns" :dataSource="possibilityData" />
            </a-col>
            <a-col :span="12">
              <label class="form-label" style="font-weight: bold;">可能性对应的时间窗列表</label>
              <a-table :columns="possibilityTimeWindowColumns" :dataSource="possibilityTimeWindowData" />
            </a-col>
          </a-row>
        </a-collapse-panel>
      </a-collapse>
    </a-collapse-panel>
  </a-collapse>
</template>

<script setup>
import { ref } from 'vue';

const timeSegmentType = ref(1);

const taskTimeColumns = [
  {
    title: '资源',
    dataIndex: 'resource',
    key: 'resource',
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
    title: '偏好开始时间',
    dataIndex: 'preferredStartTime',
    key: 'preferredStartTime',
  },
];

const taskTimeData = [
  {
    key: '1',
    resource: 'r1',
    startTime: '08:00',
    endTime: '12:00',
    preferredStartTime: '08:00',
  },
  {
    key: '2',
    resource: 'r2',
    startTime: '13:00',
    endTime: '17:00',
    preferredStartTime: '13:00',
  },
];

const possibilityColumns = [
  {
    title: '索引',
    dataIndex: 'index',
    key: 'index',
  },
  {
    title: '优先级',
    dataIndex: 'priority',
    key: 'priority',
  },
  {
    title: '资源',
    dataIndex: 'resource',
    key: 'resource',
  },
];

const possibilityData = [
  {
    key: '1',
    index: '1',
    priority: '高',
    resource: 'r1',
  },
  {
    key: '2',
    index: '2',
    priority: '中',
    resource: 'r2',
  },
];

const possibilityTimeWindowColumns = [
  {
    title: '索引',
    dataIndex: 'index',
    key: 'index',
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
    title: '偏好开始时间',
    dataIndex: 'preferredStartTime',
    key: 'preferredStartTime',
  },
];

const possibilityTimeWindowData = [
  {
    key: '1',
    index: '1',
    startTime: '08:00',
    endTime: '12:00',
    preferredStartTime: '08:00',
  },
  {
    key: '2',
    index: '2',
    startTime: '13:00',
    endTime: '17:00',
    preferredStartTime: '13:00',
  },
];
</script>

<style scoped>
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

/* 设置表格列名的字体大小 */
:deep(.ant-table-thead) {
  font-size: 18px;
  font-weight: bold;
}

:deep(.ant-table-tbody .ant-table-cell) {
  font-size: 16px;
}
</style>