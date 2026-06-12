<template>
  <Steps :current_page="page" />
  <span class="h1_text">历史文档</span>
  <a-table :data-source="data" :columns="columns" :customHeaderRow="customHeaderRow" :rowClassName="rowClassName"
    class="custom_table">
    <template #headerCell="{ column }">
      <template v-if="column.key === 'filename'">
        <span style="color: #333333" class="headline_fileicon">
          <FolderOutlined />
          文件名
        </span>
      </template>
    </template>
    <template #customFilterDropdown="{ setSelectedKeys, selectedKeys, confirm, clearFilters, column }">
      <div style="padding: 8px" class="search_box">
        <a-input ref="searchInput" :placeholder="`Search ${column.dataIndex}`" :value="selectedKeys[0]"
          style="width: 250px; margin-bottom: 10px; display: block"
          @change="(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])"
          @pressEnter="handleSearch(selectedKeys, confirm, column.dataIndex)" />
        <a-button type="primary" size="normal" style="width: 90px; margin-right: 8px"
          @click="handleSearch(selectedKeys, confirm, column.dataIndex)">
          <!-- <template #icon><SearchOutlined /></template> -->
          搜索
        </a-button>
        <a-button size="normal" style="width: 90px" @click="handleReset(clearFilters)">
          重置
        </a-button>
      </div>
    </template>
    <template #customFilterIcon="{ filtered }">
      <search-outlined :style="{ color: filtered ? '#108ee9' : undefined }" />
    </template>
    <template #bodyCell="{ text, column }">
      <!-- 加图片在单元格中显示 -->
      <template v-if="column.key === 'filename'">
        <span>
          <img src="../assets/logo.jpg" alt="无法正常显示" class="logo_img">
          {{ text }}
        </span>
      </template>
      <!-- 高亮显示搜索文本 -->
      <span v-if="state.searchText && state.searchedColumn === column.dataIndex">
        <template v-for="(fragment, i) in text
          .toString()
          .split(new RegExp(`(?<=${state.searchText})|(?=${state.searchText})`, 'i'))">
          <mark v-if="fragment.toLowerCase() === state.searchText.toLowerCase()" :key="i" class="highlight">
            {{ fragment }}
          </mark>
          <template v-else>{{ fragment }}</template>
        </template>
      </span>
    </template>
  </a-table>
</template>
<script setup>
// import { update } from 'cypress/types/lodash';
import { reactive, ref, computed } from 'vue'
import Steps from '@/components/Steps.vue'  // 引入步骤条组件
import { useFileDetailStore } from '@/stores/useFileDetailStore'

const page = ref(-1)    // 当前所在页面对应的value,计数从0开始,传递给Steps组件

const fileDetailStore = useFileDetailStore()
const data = computed(() => fileDetailStore.fileDetailList)

const state = reactive({
  searchText: '',
  searchedColumn: ''
})
const searchInput = ref()
const columns = [
  {
    title: '文件名',
    dataIndex: 'filename',
    key: 'filename',
    customFilterDropdown: true,
    onFilter: (value, record) => record.filename.toString().toLowerCase().includes(value.toLowerCase()),
    onFilterDropdownOpenChange: (visible) => {
      if (visible) {
        setTimeout(() => {
          searchInput.value.focus()
        }, 100)
      }
    }
  },
  {
    title: '更新时间',
    dataIndex: 'updateTime',
    key: 'updateTime'
  },
  {
    title: '详细信息',
    dataIndex: 'info',
    key: 'info',
    // customFilterDropdown: true,
    // onFilter: (value, record) =>
    //   record.info.toString().toLowerCase().includes(value.toLowerCase()),
    // onFilterDropdownOpenChange: (visible) => {
    //   if (visible) {
    //     setTimeout(() => {
    //       searchInput.value.focus()
    //     }, 100)
    //   }
    // }
  }
]

// 为每一行设置类名，用于设置行的样式
// 头部行
const customHeaderRow = (columns, index) => {
  return {
    class: 'headline',
    // style: { backgroundColor: '#4CAF50', color: 'red' }
  };
};
// 其余行
const rowClassName = (record, index) => {
  // 根据条件返回不同的类名
  return 'row'
}

const handleSearch = (selectedKeys, confirm, dataIndex) => {
  confirm()
  state.searchText = selectedKeys[0]
  state.searchedColumn = dataIndex
}
const handleReset = (clearFilters) => {
  clearFilters({
    confirm: true
  })
  state.searchText = ''
}
</script>

<!-- 设置一般样式 -->
<style scoped>
.h1_text {
  margin: 10px 0;
  padding-left: 20px;
  font-size: 24px;
  line-height: 2;
  font-weight: normal;
  /* background-color: rgb(172, 205, 172); */
}
</style>

<!-- 设置table中行的样式 -->
<style>
.custom_table {
  /* border-collapse: collapse; 合并单元格边框 */
  margin-left: 15px;
}

.headline {
  font-size: 20px;
  /* border-collapse: collapse; */
  text-align: left;
}

.headline .ant-table-cell {
  border-collapse: collapse;
  border-bottom: 2px solid #969595;
  /* background-color: #8d3b3b; */
}

.row {
  font-size: 18px;
  line-height: 2;
  /* background-color: #8d3b3b; */
}

/* .row:hover {
  background-color: #a22929;
} */

.row .ant-table-cell {
  border-collapse: collapse;
  border-bottom: 2px solid #969595;
}

.highlight {
  background-color: rgb(255, 192, 105);
  padding: 0px;
}

.headline .ant-table-cell .anticon {
  /* background-color: pink; */
  font-size: 20px;
  /* color: aqua; */
  /* margin-right: 25px; */
}

.search_box .ant-input {
  /* width: 250px;
  margin-bottom: 10px;
  display: block; */
  /* background-color: pink; */
}

.headline_fileicon .anticon {
  /* background-color: #ffc0cb; */
  margin-right: 10px;
}

.logo_img {
  width: 36px;
  /* height: 20px; */
  margin-right: 10px;
}
</style>
