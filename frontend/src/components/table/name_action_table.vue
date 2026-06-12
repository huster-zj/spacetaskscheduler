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
            <MinusOutlined @click="deleteAction(action.column1.key)" />
          </span>
        </template>
      </ShowTable>
    </div>
    <div class="hint_box">
      <!-- <div class="arrow"> -->
        <ArrowRightOutlined :style="{width: '200px', height: '40px'}" />
        <!-- <br /> -->
        <ArrowLeftOutlined />
      <!-- </div> -->
    </div>
    <div class="exclude">
      <ShowTable :columns="columns" :data="filteredExcludeList">
        <template #special_content>
          <div class="text">未包含</div>
        </template>
        <template #column_action="action">
          <span class="icons">
            <PlusOutlined @click="addAction(action.column1.key)" />
          </span>
        </template>
      </ShowTable>
    </div>
  </div>
  
  
</template>

<script setup>
import { ref, reactive, computed,defineProps } from 'vue';
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

let {columns,includeList,excludeList} = props
columns = reactive(columns)
includeList = reactive(includeList ? includeList : [])
excludeList = reactive(excludeList ? excludeList : [])

// 定义添加、删除操作
function deleteAction(value){
  console.log('delete');
  console.log(value);
  excludeList.unshift(includeList.find(item => item.key === value));
  includeList.splice(includeList.findIndex(item => item.key === value), 1);
}
function addAction(value){
  console.log('add');
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
  display: flex;
  justify-content: space-between;
  margin: 20px 30px 0 30px;
}
/* 表格宽度设置 */
.incloud,.exclude {
  width: 40%;
}
.hint_box {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  /* background-color: pink; */
  width: 200px;
}
.hint_box .anticon {
  /* background-color: green; */
  font-size: 40px;
  width: 200px;
  height: 40px;
  text-align: center;
}
.hint_box .anticon :deep(svg) {
  /* background-color: pink; */
  width: 50px;
  height: 30px;
}


/* 搜索框文本标题样式 */
.text {
  /* color: blue; */
  float: left;
  height: 40px;
  font-size: 22px;
  font-weight: bold;
  text-align: center;
  margin-bottom: 25px;
  margin-left: 20px;
}
/* 修改搜索框样式靠右 */
:deep(.container .header) {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-bottom: 20px
}
</style>