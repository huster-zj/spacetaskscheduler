<!-- 使用说明：
 :columns=""，传递首行数据，第一列名称为：name，便于实现搜索框的搜索功能
 :data=''，传递除首行之外的数据，第一列的key值为：name
 :addBtnisShow，可选择是否传递一个布尔值，控制最后的“添加至资源列表按钮是否显示”，默认显示（为资源的导入服务） -->

<template>
  <div class="select-table">
    <!-- 头部搜索栏 -->
    <div class="header">
      <!-- 搜索+添加按钮 -->
      <div class="search_add">
        <a-input-search v-model:value="searchQuery" class="custom-search-input" :bordered="false" placeholder="请输入搜索内容" />
        <div class="add" v-if="addBtnisShow1">
          <a-button @click="handleSendSelectedResourceList">添加至资源列表</a-button>
        </div>
      </div>
      <!-- 页面其他按钮实现特定的功能 -->
      <slot name="special_btn"></slot>
    </div>
    <a-table :row-selection="{ selectedRowKeys: state.selectedRowKeys, onChange: onSelectChange }" :columns="columns1"
      :data-source="filteredData" :pagination="false">
      <template #bodyCell="{ column, record }">
        <!-- 点击第一列跳转至测控资源详情页面 -->
        <template v-if="column.key === 'name'">
          <slot name="column_name" :column1="record" />
        </template>
      </template>
    </a-table>

  </div>
</template>

<script setup>
import { ref, reactive, defineProps, computed } from 'vue';

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
  addBtnisShow: {
    type: Boolean,
    default: true
  }
})

// 解构出props接收的数据
let { columns: columns1, data: data1, addBtnisShow: addBtnisShow1 } = props
// 将解构出来的数据转换为 ref
// columns1 = reactive(columns1);
// data1 = reactive(data1);
// addBtnisShow1 = ref(addBtnisShow1);

// 计算属性：根据搜索查询过滤数据
const searchQuery = ref('');
const filteredData = computed(() => {
  if (!searchQuery.value) {
    // 若不存在搜索的值，则返回全部data
    return data1;
  }
  // 根据data中的item的name和name2属性进行搜索
  return data1.filter(item => (item.name && item.name.includes(searchQuery.value)) || (item.name2 && item.name2.includes(searchQuery.value)));
});

// 勾选功能
const state = reactive({
  selectedRowKeys: [],
  // Check here to configure the default column
  loading: false,
});
const onSelectChange = selectedRowKeys => {
  // console.log('selectedRowKeys changed: ', selectedRowKeys);
  state.selectedRowKeys = selectedRowKeys;
};

// 添加至资源列表
const emit = defineEmits(['addResourceList']);
const handleSendSelectedResourceList = () => {
  // console.log('添加至资源列表');
  const selectedRows = data1.filter(item => state.selectedRowKeys.includes(item.key));
  emit('addToResourceList', selectedRows);
  // emit('addResourceList', state.selectedRowKeys);
};

</script>

<style scoped>
.select-table {
  display: grid;
  width: 100%;
  min-width: 0;
  gap: 16px;
}

/* 设计搜索栏样式 */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.search_add {
  display: flex;
  justify-content: start;
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
  /* background-color: pink; */
  height: 36px;
  font-size: 14px;
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
  text-align: left;
  font-weight: bold;
}

:deep(.ant-table-tbody .ant-table-cell) {
  text-align: left;
  font-size: 14px;
  color: var(--sts-ink-primary);
}

:deep(.ant-table-cell a) {
  color: var(--sts-primary);
}

/* 设置添加资源按钮样式 */
.add {
  display: flex;
  justify-content: flex-start;
  margin: 0;
}

.add .ant-btn {
  margin: 0;
  border-color: var(--sts-primary);
  color: var(--sts-primary);
}

@media (max-width: 767px) {
  .header,
  .search_add {
    align-items: stretch;
    flex-direction: column;
  }

  :deep(.custom-search-input) {
    width: 100%;
    max-width: none;
  }
}
</style>
