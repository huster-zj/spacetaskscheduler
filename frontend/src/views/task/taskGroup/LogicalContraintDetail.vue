<template>
  <div class="box">
    <div class="name-note">
      <span class="text">任务组名称：</span>
      <a-input v-model:value="logical_con_detail.task_group_name" placeholder="请输入任务组名称"/>
      <span class="text">备注：</span>
      <a-input v-model:value="logical_con_detail.task_group_note" placeholder="请输入任务组备注"/>
    </div>
    <div class="relate">
      <RadioBtn ref="taskRelationData" :radio_beforeText="radio_beforeText" :radio_selection="radio_selection" :special_result="logical_con_detail.task_relationship" />
    </div>
    <NameActionTable :columns="columns" :includeList="includeTaskList" :excludeList="excludeTaskList" />
    <!-- <button @click="outputData">点击输出当前任务组包含的所有任务</button> -->
    <div class="saveBtn">
      <RouterBtn toPath="/logical_constraint" btnWidth="80px" btnText="保存" @click="saveLogicalConstraint" />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import RadioBtn from '@/components/button/radio-button.vue'
import NameActionTable from '@/components/table/name_action_table.vue'; 
import RouterBtn from '@/components/button/router-button.vue'
import { useLogicalConstraintsListStore } from '@/stores/useLogicalConstraintsListStore.js'
import { useFormHeadStore } from '@/stores/taskDetailNumStore.js'
import { storeToRefs } from 'pinia'

// 基于pinia使用
const LogicalConstraintsListStore = useLogicalConstraintsListStore()
const { logicalConstraintsList } = storeToRefs(LogicalConstraintsListStore)
const updateLogicalConstraints = LogicalConstraintsListStore.updateLogicalConstraints
// console.log('ClogicalConstraintsList', logicalConstraintsList.value);

// 接收传递过来的数据，确定是哪个任务组的逻辑约束详情页
const props = defineProps({
  name: {
    type: String,
    required: true
  }
})

let logical_con_detail = logicalConstraintsList.value.find(item => item.task_group_name === props.name)
// console.log('logical_con_detail', logical_con_detail);

// 保存逻辑约束数据
const taskRelationData = ref(null);
let includeTaskList = logical_con_detail.task_group_includeTaskList;
const formHeadStore = useFormHeadStore(); // 任务详情页头部数据
let excludeTaskList = reactive(formHeadStore.formHeadList.filter(
  item => !includeTaskList.some(includeItem => includeItem.key === item.key)
).map(item =>({
  key: item.key,
  name: item.taskName
})));
function saveLogicalConstraint() {
  // console.log('保存逻辑约束数据');
  logical_con_detail.task_relationship = taskRelationData.value.radioValue;
  logical_con_detail.task_group_includeTaskList = includeTaskList;
  logical_con_detail.task_group_excludeTaskList = excludeTaskList;
  updateLogicalConstraints(logical_con_detail);
}

function outputData() {
  console.log('当前任务组包含的所有任务：', includeTaskList);
  console.log('当前任务组未包含的所有任务：', excludeTaskList);
}


// 逻辑约束详情页基础数据
const radio_beforeText = ref('组内任务关系：')
const radio_selection = reactive([
  {
    id: 1,
    value: '互斥',
    label: '互斥'
  },
  {
    id: 2,
    value: '共存',
    label: '共存'
  },
  {
    id: 2,
    value: '自定义',
    label: '自定义'
  }
])
// 已包含、未包含任务数据
let columns = reactive([
  {
    title: '任务名称',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: '操作',
    dataIndex: 'action',
    key: 'action',
  }
])
</script>

<style scoped>
.box {
  margin: 30px 100px 0 100px;
}
.box .name-note {
  /* background-color: pink; */
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}
.box .name-note .text {
  /* background-color: green; */
  font-size: 22px;
  font-weight: bold;
  width: 150px;
  text-align: center;
}
.box .name-note .ant-input {
  /* background-color: pink; */
  height: 40px;
  font-size: 20px;
  border-radius: 5px;
  width: 500px;
  margin-left: -300px;
}
.box .name-note .ant-input:focus {
  border-radius: 5px;
  box-shadow: 0 0 0px; /* 覆盖默认阴影 */
}
.box .saveBtn {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}
</style>