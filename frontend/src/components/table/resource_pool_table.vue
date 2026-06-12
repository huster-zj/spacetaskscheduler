<template>
  <div class="two_table">
    <div class="table-wrapper">
      <a-table :columns="includeColumns" :dataSource="filteredIncludeList" :pagination="false">
        <template #bodyCell="{ column, record }">
          <span v-if="column.key === 'action'" class="icons">
            <MinusOutlined @click="deleteAction(record.key)" />
          </span>
          <span v-else>{{ record[column.dataIndex] }}</span>
        </template>
      </a-table>
    </div>
    <div class="table-wrapper">
      <a-table :columns="excludeColumns" :dataSource="filteredExcludeList" :pagination="false">
        <template #bodyCell="{ column, record }">
          <span v-if="column.key === 'action'" class="icons">
            <PlusOutlined @click="addAction(record.key)" />
          </span>
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
  display: flex;
  justify-content: space-between;
  gap: 100px;
  /* 设置两个表格之间的间距 */
  margin: 0px 30px 0 10px;
}


.icons {
  cursor: pointer;
}
</style>