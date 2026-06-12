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
        <template v-if="column.key === 'name2'">
          <slot name="column_name2" :column1="record" />
        </template>
        <!-- 最后一列的详情编辑和删除操作如何呈现 -->
        <template v-else-if="column.key === 'action'">
          <slot name="column_action" :column1="record" />
        </template>
        <!-- 其他列的内容 -->
        <template v-else>
          <slot name="other_column" :column1="record" />
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
  // 根据data1中的item的name和name2属性进行搜索
  return data1.filter(item => (item.name && item.name.includes(searchQuery.value)) || (item.name2 && item.name2.includes(searchQuery.value)));
});

</script>


<style scoped>
.container {
  /* background-color: black; */
  margin: 30px;
}

.container .header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px
}

/* 设置搜索框样式 */

:deep(.custom-search-input) {
  /* background-color: green; */
  max-width: 400px;
  border: 1px solid #7b7676;
  /* border-radius: 10%; */
  border-radius: 5px;
}

:deep(.custom-search-input .ant-input) {
  /* background-color: pink; */
  height: 40px;
  font-size: 20px;
  border: none;
  border-radius: 5px;
}

/* 设置输入框获得焦点时的样式 */
:deep(.custom-search-input .ant-input:focus) {
  border-radius: 5px;
  box-shadow: 0 0 0px;
  /* 覆盖默认阴影 */
}


:deep(.custom-search-input .ant-input-group-addon .ant-btn) {
  height: 40px;
  border: none;
  border-radius: 5px;
}

:deep(.custom-search-input .ant-input-group-addon .ant-input-search-button .anticon.anticon-search) {
  font-size: 20px;
}

/* 设置表格样式 */
:deep(.ant-table-thead) {
  font-size: 20px;
}

:deep(.ant-table-thead .ant-table-cell) {
  text-align: center;
  font-weight: bold;
}

:deep(.ant-table-tbody .ant-table-cell) {
  text-align: center;
  font-size: 20px;
  color: #121111;
}

:deep(.ant-table-cell a) {
  color: #121111;
}
</style>