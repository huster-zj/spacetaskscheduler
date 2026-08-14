<template>
  <section class="page-shell editor-page">
    <header class="page-header">
      <h1 class="page-heading">新建任务组</h1>
    </header>
    <div class="box surface-panel">
      <div class="name-note">
      <span class="text">任务组名称：</span>
      <a-input v-model:value="newLogicalConstraint.task_group_name" placeholder="请输入任务组名称"/>
      <span class="text">备注：</span>
      <a-input v-model:value="newLogicalConstraint.task_group_note" placeholder="请输入任务组备注"/>
      </div>
      <div class="relate">
        <RadioBtn ref="taskRelationData" :radio_beforeText="radio_beforeText" :radio_selection="radio_selection" />
      </div>
      <NameActionTable :columns="columns" :includeList="includeTaskList" :excludeList="excludeTaskList" />
      <div class="saveBtn">
        <RouterBtn toPath="/logical_constraint" btnWidth="80px" btnText="保存" @click="saveLogicalConstraint" />
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, reactive } from 'vue';
import RadioBtn from '@/components/button/radio-button.vue'
import NameActionTable from '@/components/table/name_action_table.vue'; 
import RouterBtn from '@/components/button/router-button.vue'
import { useLogicalConstraintsListStore } from '@/stores/useLogicalConstraintsListStore.js'
import { useFormHeadStore } from '@/stores/taskDetailNumStore.js'

// 基于pinia使用
const LogicalConstraintsListStore = useLogicalConstraintsListStore()
// const { logicalConstraintsList } = storeToRefs(LogicalConstraintsListStore)
const addLogicalConstraints = LogicalConstraintsListStore.addLogicalConstraints
// console.log('ClogicalConstraintsList', logicalConstraintsList.value);

let newLogicalConstraint = reactive({
  task_group_name: '',
  task_group_note: '',
  task_relationship: '',
  task_group_includeTaskList: [],
  task_group_excludeTaskList: []
})

// 保存逻辑约束数据
const taskRelationData = ref(null);
function saveLogicalConstraint() {
  // console.log('保存逻辑约束数据');
  newLogicalConstraint.task_relationship = taskRelationData.value.radioValue;
  newLogicalConstraint.task_group_includeTaskList = includeTaskList;
  newLogicalConstraint.task_group_excludeTaskList = excludeTaskList;
  addLogicalConstraints(newLogicalConstraint);
}

function outputData() {
  console.log('当前任务组包含的所有任务：', includeTaskList);
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

const formHeadStore = useFormHeadStore()
console.log('formHeadStore', formHeadStore.formHeadList);
let includeTaskList = reactive([]);

let excludeTaskList = reactive(formHeadStore.formHeadList.map(item=>({
  key: item.key,
  name: item.taskName
})));

</script>

<style scoped>
.box {
  padding: 24px;
}
.box .name-note {
  display: grid;
  grid-template-columns: max-content minmax(180px, 1fr) max-content minmax(180px, 1fr);
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}
.box .name-note .text {
  color: var(--sts-ink-secondary);
  font-size: 14px;
  font-weight: 600;
}
.box .name-note .ant-input {
  width: 100%;
}
.box .relate {
  margin: 20px 0;
  padding: 16px;
  border: 1px solid var(--sts-border);
  border-radius: var(--sts-radius-md);
  background: var(--sts-surface-subtle);
}
.box .saveBtn {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.page-header {
  margin-bottom: 16px;
}

@media (max-width: 767px) {
  .box {
    padding: 16px;
  }

  .box .name-note {
    grid-template-columns: 1fr;
    gap: 6px;
  }
}
</style>
