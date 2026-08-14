<template>
  <div>
    <div class="constraint-line">
      <label for="resource-constraint" class="form-label">资源约束:</label>
      <a-input id="resource-constraint" v-model:value="resourceConstraint" class="form-input"
        disabled />
      <a-button type="primary" @click="calculateFeasibleTimeWindow">计算可行时间窗</a-button>
    </div>
    <a-row :gutter="16" class="form-item">
      <a-col :span="24">
        <div class="form-item operator-row">
          <a-button type="default" @click="insertText('and')">and</a-button>
          <a-button type="default" @click="insertText('or')">or</a-button>
          <a-button type="default" @click="insertText('（')">（</a-button>
          <a-button type="default" @click="insertText('）')">）</a-button>
        </div>
      </a-col>
    </a-row>
    <a-row class="resource-grid" :gutter="16">
      <a-col :span="5" class="resource-panel">
        <div class="form-item">
          <label class="form-label" style="font-weight: bold;">资源列表:</label>
        </div>
        <div class="resource-list">
          <a-button v-for="(item, index) in resourceNameList" :key="index" @click="insertText(item.name)">{{ item.name
            }}</a-button>
        </div>
      </a-col>
      <a-col :span="4" class="resource-panel">
        <div class="form-item">
          <label class="form-label" style="font-weight: bold;">资源池列表:</label>
        </div>
        <div class="resource-list">
          <a-button v-for="(item, index) in resourceTemplateList" :key="index" @click="insertText(item.name)">{{
            item.name }}</a-button>
        </div>
      </a-col>
      <a-col :span="15" class="resource-panel resource-pool-panel">
        <div class="form-item">
          <label class="form-label" style="font-weight: bold;">资源池:</label>
          <a-button>创建</a-button>
        </div>
        <div class="form-item">
          <a-radio-group v-model:value="resourcePoolType" class="form-input">
            <a-radio :value="1" class="form-input">需要所有资源</a-radio>
            <a-radio :value="2" class="form-input">需要资源数量</a-radio>
          </a-radio-group>
          <a-input-number v-if="resourcePoolType === 2" v-model:value="resourceQuantity" :min="0" :precision="0"
            class="input-number" />
        </div>
        <div class="table-container">
          <ResourcePoolTable :includeColumns="poolResourceColumns" :excludeColumns="poolResourceGroupColumns"
            :includeList="poolResourceData" :excludeList="poolResourceGroupData" />
        </div>
      </a-col>
    </a-row>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import ResourcePoolTable from '@/components/table/resource_pool_table.vue';

const resourceConstraint = ref('');
const resourcePoolType = ref(1);
const resourceQuantity = ref(0);

const calculateFeasibleTimeWindow = () => {
  console.log('计算可行时间窗:', resourceConstraint.value);
};

const insertText = (text) => {
  resourceConstraint.value += text + ' ';
};

const poolResourceColumns = [
  {
    title: '资源',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: '操作',
    dataIndex: 'action',
    key: 'action',
  },
];

const poolResourceGroupColumns = [
  {
    title: '资源组名称',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: '操作',
    dataIndex: 'action',
    key: 'action',
  },
];

const resourceNameList = reactive([
  {
    key: '1',
    name: 'r1'
  },
  {
    key: '2',
    name: 'r2'
  }
]);
let resourceTemplateList = reactive([
  {
    key: '1',
    name: 'template1'
  },
  {
    key: '2',
    name: 'template2'
  }
]);

const poolResourceData = [
  {
    key: '1',
    name: 'r1',
  },
  {
    key: '2',
    name: 'r2',
  },
];

const poolResourceGroupData = [
  {
    key: '1',
    name: '资源组1',
  },
  {
    key: '2',
    name: '资源组2',
  },
];
</script>

<style scoped>
.form-item {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
}

.constraint-line {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.constraint-line .form-input {
  width: min(100%, 350px);
  margin: 0;
}

.operator-row {
  gap: 6px;
  margin: 8px 0 12px;
}

.resource-grid {
  row-gap: 16px;
}

.resource-panel {
  padding: 14px !important;
  border: 1px solid var(--sts-border);
  border-radius: var(--sts-radius-md);
  background: var(--sts-surface-raised);
}

.resource-pool-panel .form-item {
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
}

.input-number {
  margin-left: 10px;
  /* 调整右边的间距 */
}

.form-label {
  width: auto;
  text-align: left;
  margin-right: 1rem;
  white-space: nowrap;
  font-size: 18px;
}

.form-input {
  font-size: 18px;
  margin-right: 2rem;
}

.table-container {
  width: 100%;
  min-width: 0;
}

.table-container :deep(.ant-table) {
  flex: 1;
  /* 使两个表格平分容器宽度 */
}

:deep(.ant-btn) {
  font-size: 16px;
  margin-bottom: 10px;
  /* 增加按钮之间的垂直间距 */
  margin-right: 5px;
  /* 增加按钮之间的水平间距 */
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
  .resource-grid > .ant-col {
    max-width: 100%;
    flex: 1 1 100%;
  }

  .resource-panel {
    padding: 12px !important;
  }

  .form-label,
  .form-input,
  :deep(.ant-btn),
  :deep(.ant-table-thead),
  :deep(.ant-table-tbody .ant-table-cell) {
    font-size: 14px;
  }
}
</style>
