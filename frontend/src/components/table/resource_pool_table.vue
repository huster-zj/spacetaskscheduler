<template>
  <div class="two_table">
    <div class="table-wrapper">
      <a-table :columns="includeColumns" :dataSource="filteredIncludeList" :pagination="false">
        <template #bodyCell="{ column, record }">
          <button v-if="column.key === 'action'" class="icon-button" type="button" aria-label="移出资源" @click="deleteAction(record.key)">
            <MinusOutlined />
          </button>
          <span v-else>{{ record[column.dataIndex] }}</span>
        </template>
      </a-table>
    </div>
    <div class="table-wrapper">
      <a-table :columns="excludeColumns" :dataSource="filteredExcludeList" :pagination="false">
        <template #bodyCell="{ column, record }">
          <button v-if="column.key === 'action'" class="icon-button" type="button" aria-label="加入资源" @click="addAction(record.key)">
            <PlusOutlined />
          </button>
          <span v-else>{{ record[column.dataIndex] }}</span>
        </template>
      </a-table>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, defineProps } from 'vue';
import { MinusOutlined, PlusOutlined } from '@ant-design/icons-vue';

const props = defineProps({
  includeColumns: {
    type: Array,
    required: true,
  },
  excludeColumns: {
    type: Array,
    required: true,
  },
  includeList: {
    type: Array,
    required: true,
  },
  excludeList: {
    type: Array,
    required: true,
  }
})

let { includeColumns, excludeColumns, includeList, excludeList } = props
includeColumns = reactive(includeColumns)
excludeColumns = reactive(excludeColumns)
includeList = reactive(includeList)
excludeList = reactive(excludeList)

// 定义添加、删除操作
function deleteAction(value) {
  console.log('delete');
  console.log(value);
  includeList.splice(includeList.findIndex(item => item.key === value), 1);
}

function addAction(value) {
  console.log('add');
  includeList.unshift(excludeList.find(item => item.key === value));
  excludeList.splice(excludeList.findIndex(item => item.key === value), 1);
}

// 计算属性：根据搜索查询过滤数据
const searchQueryIn = ref('');
const filteredIncludeList = computed(() => {
  if (!searchQueryIn.value) {
    return includeList;
  }
  return includeList.filter(item => (item.name && item.name.includes(searchQueryIn.value)) || (item.name2 && item.name2.includes(searchQueryIn.value)));
});

const searchQueryEx = ref('');
const filteredExcludeList = computed(() => {
  if (!searchQueryEx.value) {
    return excludeList;
  }
  return excludeList.filter(item => (item.name && item.name.includes(searchQueryEx.value)) || (item.name2 && item.name2.includes(searchQueryEx.value)));
});
</script>

<style scoped>
/* 两个表格并排显示 */
.two_table {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 24px;
  width: 100%;
  margin: 0;
}

.table-wrapper {
  min-width: 0;
}

.icon-button {
  display: inline-grid;
  width: 32px;
  height: 32px;
  padding: 0;
  place-items: center;
  border: 1px solid var(--sts-border-strong);
  border-radius: var(--sts-radius-md);
  background: var(--sts-surface-raised);
  color: var(--sts-primary);
  cursor: pointer;
}

.icon-button:hover {
  border-color: var(--sts-primary);
  background: var(--sts-primary-soft);
}

@media (max-width: 900px) {
  .two_table {
    overflow-x: auto;
    grid-template-columns: repeat(2, minmax(320px, 1fr));
    padding-bottom: 4px;
  }
}
</style>
