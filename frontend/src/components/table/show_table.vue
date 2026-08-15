<!-- 使用说明：
 第一列和最后一列可作为链接，点击跳转到详情页或者执行某个操作（例如：删除行） 
 :columns=""，传递首行数据，第一列名称为：name，便于实现搜索框的搜索功能；最后一列名称为：action，最后一列的内容可自定义
 :data=''，传递除首行之外的数据，第一列的key值为：name，可不写最后一列的key-value，在具名插槽中编写 
 :searchIsShow=''，是否显示搜索框，默认显示
import ShowTable from '@/components/table/show_table.vue'
 -->

<template>
  <div class="container">
    <!-- 头部搜索栏+插槽（显示页面特定内容）-->
    <slot name="special_content"></slot>
    <div class="header">
      <!-- 搜索按钮 -->
      <a-input-search v-model:value="searchQuery" class="custom-search-input" :bordered="false" placeholder="请输入搜索内容"
        v-if="searchIsShow1" />
      <!-- class="custom-search-input" -->
      <!-- 页面其他按钮实现特定的功能 -->
      <slot name="special_btn"></slot>
    </div>

    <!-- 表格 -->
    <a-table :columns="columns1" :dataSource="filteredData" :pagination="false" :rowKey='record => record.key'>
      <template #bodyCell="{ column, record }">
        <!-- 点击第一列跳转至编辑详情页面 -->
        <template v-if="column.key === 'name'">
          <slot name="column_name" :column1="record" />
        </template>
        <!-- 点击第二列跳转至编辑详情页面，为时态约束界面的时态约束专门设置-->
        <template v-else-if="column.key === 'name2'">
          <slot name="column_name2" :column1="record" />
        </template>
        <!-- 最后一列的详情编辑和删除操作如何呈现 -->
        <template v-else-if="column.key === 'action'">
          <slot name="column_action" :column1="record" />
        </template>
        <!-- 其他列的内容 -->
        <template v-else>
          <slot name="other_column" :column1="record">
            {{ record[column.dataIndex] }}
          </slot>
        </template>
      </template>
    </a-table>
  </div>
</template>

<script setup>
import { ref, defineProps, computed } from 'vue';

// 接收父组件传递的 props
const props = defineProps({
  columns: {
    type: Array,
    required: true,
  },
  data: {
    type: Array,
    required: true,
  },
  searchIsShow: {
    type: Boolean,
    default: true
  },
  searchFields: {
    type: Array,
    default: () => ['name', 'name2', 'taskName']
  }
})

// 解构出props接收的数据
let { columns: columns1, data: data1, searchIsShow: searchIsShow1 } = props
// console.log('dbsuavbd',columns1,data1);

// 计算属性：根据搜索查询过滤数据
const searchQuery = ref('');    // 搜索框的输入值
const filteredData = computed(() => {
  if (!searchQuery.value) {
    // 若不存在搜索的值，则返回全部data1
    return data1;
  }
  const normalizedQuery = searchQuery.value.trim().toLowerCase()
  return data1.filter((item) => props.searchFields.some((field) =>
    String(item[field] ?? '').toLowerCase().includes(normalizedQuery)
  ))
});

</script>


<style scoped>
.container {
  display: grid;
  width: 100%;
  min-width: 0;
  gap: 16px;
  margin: 0;
}

.container .header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

/* 设置搜索框样式 */

:deep(.custom-search-input) {
  width: min(100%, 360px);
  border: 1px solid var(--sts-border-strong);
  border-radius: var(--sts-radius-md);
  background: var(--sts-surface-raised);
}

:deep(.custom-search-input .ant-input) {
  height: 36px;
  font-size: 14px;
  border: none;
  border-radius: var(--sts-radius-md);
}

/* 设置输入框获得焦点时的样式 */
:deep(.custom-search-input .ant-input:focus) {
  border-radius: 5px;
  box-shadow: 0 0 0px;
  /* 覆盖默认阴影 */
}


:deep(.custom-search-input .ant-input-group-addon .ant-btn) {
  height: 36px;
  border: none;
  border-radius: 5px;
}

:deep(.custom-search-input .ant-input-group-addon .ant-input-search-button .anticon.anticon-search) {
  font-size: 16px;
}

/* 设置表格样式 */
:deep(.ant-table-thead) {
  font-size: 13px;
}

:deep(.ant-table-thead .ant-table-cell) {
  text-align: center;
  font-weight: bold;
}

:deep(.ant-table-tbody .ant-table-cell) {
  text-align: center;
  font-size: 14px;
  color: var(--sts-ink-primary);
}

:deep(.ant-table-cell a) {
  color: var(--sts-primary);
}

@media (max-width: 767px) {
  .container .header {
    align-items: stretch;
    flex-direction: column;
  }

  :deep(.custom-search-input) {
    width: 100%;
    max-width: none;
  }
}
</style>
