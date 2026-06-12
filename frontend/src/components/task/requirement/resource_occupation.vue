<template>
  <a-collapse accordion>
    <a-collapse-panel key="1" header="资源占用">
      <a-collapse accordion>
        <a-collapse-panel :key="1 - 1" :header="`资源占用_任务 (${resourceOccupationTaskData.length})`">
          <!-- 资源占用_任务的内容 -->
          <a-table :columns="resourceOccupationTaskColumns" :dataSource="resourceOccupationTaskData" />
        </a-collapse-panel>
        <a-collapse-panel :key="1 - 2"
          :header="`资源占用_可能性 (${possibilityData.length}, ${possibilityResourceData.length})`">
          <!-- 资源占用_可能性的内容 -->
          <a-row :gutter="16">
            <a-col :span="6">
              <label class="form-label" style="font-weight: bold;">可能性列表</label>
              <a-table :columns="possibilityColumns" :dataSource="possibilityData" />
            </a-col>
            <a-col :span="18">
              <label class="form-label" style="font-weight: bold;">可能性对应的资源</label>
              <a-table :columns="possibilityResourceColumns" :dataSource="possibilityResourceData" />
            </a-col>
          </a-row>
        </a-collapse-panel>
      </a-collapse>
    </a-collapse-panel>
  </a-collapse>
</template>

<script setup>
import { ref } from 'vue';

const resourceOccupationTaskColumns = [
  {
    title: '资源名称',
    dataIndex: 'resourceName',
    key: 'resourceName',
  },
  {
    title: '资源类型',
    dataIndex: 'resourceType',
    key: 'resourceType',
  },
  {
    title: '消耗/补充',
    dataIndex: 'consumptionOrSupply',
    key: 'consumptionOrSupply',
  },
  {
    title: '数量/模式',
    dataIndex: 'quantityOrMode',
    key: 'quantityOrMode',
  },
  {
    title: '准备时间',
    dataIndex: 'preparationTime',
    key: 'preparationTime',
  },
  {
    title: '冷却时间',
    dataIndex: 'coolingTime',
    key: 'coolingTime',
  },
  {
    title: '是否可容纳',
    dataIndex: 'accommodatable',
    key: 'accommodatable',
  },
];

const resourceOccupationTaskData = [
  {
    key: '1',
    resourceName: 'r1',
    resourceType: '类型1',
    consumptionOrSupply: '消耗',
    quantityOrMode: '数量1',
    preparationTime: '10分钟',
    coolingTime: '5分钟',
    accommodatable: '是',
  },
  {
    key: '2',
    resourceName: 'r2',
    resourceType: '类型2',
    consumptionOrSupply: '补充',
    quantityOrMode: '模式2',
    preparationTime: '15分钟',
    coolingTime: '10分钟',
    accommodatable: '否',
  },
];

const possibilityColumns = [
  {
    title: '可能性',
    dataIndex: 'possibility',
    key: 'possibility',
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
    possibility: '可能性1',
    resource: 'r1',
  },
  {
    key: '2',
    possibility: '可能性2',
    resource: 'r2',
  },
];

const possibilityResourceColumns = [
  {
    title: '资源名称',
    dataIndex: 'resourceName',
    key: 'resourceName',
  },
  {
    title: '资源类型',
    dataIndex: 'resourceType',
    key: 'resourceType',
  },
  {
    title: '消耗/补充',
    dataIndex: 'consumptionOrSupply',
    key: 'consumptionOrSupply',
  },
  {
    title: '数量/模式',
    dataIndex: 'quantityOrMode',
    key: 'quantityOrMode',
  },
  {
    title: '准备时间',
    dataIndex: 'preparationTime',
    key: 'preparationTime',
  },
  {
    title: '冷却时间',
    dataIndex: 'coolingTime',
    key: 'coolingTime',
  },
];

const possibilityResourceData = [
  {
    key: '1',
    resourceName: 'r1',
    resourceType: '类型1',
    consumptionOrSupply: '消耗',
    quantityOrMode: '数量1',
    preparationTime: '10分钟',
    coolingTime: '5分钟',
  },
  {
    key: '2',
    resourceName: 'r2',
    resourceType: '类型2',
    consumptionOrSupply: '补充',
    quantityOrMode: '模式2',
    preparationTime: '15分钟',
    coolingTime: '10分钟',
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