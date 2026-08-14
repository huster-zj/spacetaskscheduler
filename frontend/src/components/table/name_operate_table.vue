<!-- 使用说明： 
 :columns=""，传递表格标题行数据
 :includeList=''，传递已包含表格的数据
 :excludeList=''，传递未包含表格的数据
import NameActionTable from '@/components/table/name_action_table.vue'; 
  -->

<template>
  <div class="two_table">
    <div class="incloud">
      <ShowTable :columns="columns" :data="filteredIncludeList">
        <template #special_content>
          <div class="text">已包含</div>
        </template>
        <template #column_action="action">
          <span class="icons">
            <MinusOutlined @click="deleteGroup(action.action.key)" />
          </span>
        </template>
      </ShowTable>
    </div>
    <div class="exclude">
      <ShowTable :columns="columns" :data="filteredExcludeList">
        <template #special_content>
          <div class="text">未包含</div>
        </template>
        <template #column_action="action">
          <span class="icons">
            <PlusOutlined @click="addGroup(action.action.key)" />
          </span>
        </template>
      </ShowTable>
    </div>
  </div>


</template>

<script setup>
import { ref, reactive, computed, defineProps } from 'vue';
import ShowTable from '@/components/table/show_table.vue'

const props = defineProps({
  columns: {
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

let { columns, includeList, excludeList } = props
columns = reactive(columns)
includeList = reactive(includeList)
excludeList = reactive(excludeList)

// 定义添加、删除操作
function deleteGroup(value) {
  console.log('deleteGroup');
  console.log(value);
  excludeList.unshift(includeList.find(item => item.key === value));

  includeList.splice(includeList.findIndex(item => item.key === value), 1);
}
function addGroup(value) {
  console.log('addGroup');
  includeList.unshift(excludeList.find(item => item.key === value));
  excludeList.splice(excludeList.findIndex(item => item.key === value), 1);
}

// 计算属性：根据搜索查询过滤数据
// 已包含搜索框的输入值
const searchQueryIn = ref('');
const filteredIncludeList = computed(() => {
  if (!searchQueryIn.value) {
    return includeList;
  }
  return includeList.filter(item => (item.name && item.name.includes(searchQueryIn.value)) || (item.name2 && item.name2.includes(searchQueryIn.value)));
});
// 未包含搜索框的输入值
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

/* 表格宽度设置 */
.incloud,
.exclude {
  min-width: 0;
}

/* 文本标题样式 */
.text {
  float: left;
  font-size: 18px;
  font-weight: bold;
  text-align: center;
  margin-bottom: 25px;
  margin-right: 20px;
}

/* 设置表格样式 */
:deep(.ant-table-thead) {
  font-size: 16px;
}

:deep(.ant-table-tbody .ant-table-cell) {
  text-align: center;
  font-size: 15px;
  color: #121111;
}

@media (max-width: 767px) {
  .two_table {
    overflow-x: auto;
    grid-template-columns: repeat(2, minmax(300px, 1fr));
    padding-bottom: 4px;
  }
}
</style>
