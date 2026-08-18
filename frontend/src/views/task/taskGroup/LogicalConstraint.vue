<template>
  <Steps :current_page="page" />
  <!-- <h1 style="color: red;text-align: center;font-size: 50px;">
    TODO：定义界面在定义任务组属性时，需要允许用户输入内容，<br />
    并获取显示到列表中，在ant-design中单选按钮有这样的功能
  </h1> -->
  <section class="page-shell list-page">
    <header class="page-header">
      <div>
        <h1 class="page-heading">逻辑约束</h1>
        <p class="page-description">定义任务组及其组合关系，控制任务之间的逻辑依赖。</p>
      </div>
    </header>
    <ShowTable :columns="columns" :data="data">
    <!-- 特定按钮功能 -->
    <template #special_btn>
      <RouterLink to="/custom_logical_constraint">
        <div class="custom_btn">自定义</div>
      </RouterLink>
    </template>
    <!-- 任务组列表 -->
    <template #column_name="record">
      <RouterLink to="/custom_logical_constraint">
        {{ record.column1.task_group_name }}
      </RouterLink>
    </template>
    <!-- 编辑删除操作 -->
    <template #column_action="action">
      <span>
        <RouterLink :to="`/logical_constraint_detail/${action.column1.task_group_name}`">
          <FormOutlined />
        </RouterLink>
        <a-divider type="vertical" />
        <a-popconfirm
         title="是否删除该数据？" 
         ok-text="是" 
         cancel-text="否"
         @confirm="deleteTaskGroup(action.column1.key)"
         >
            <CloseOutlined />
        </a-popconfirm>
      </span>
    </template>
    </ShowTable>
  </section>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import ShowTable from '@/components/table/show_table.vue'
import { useLogicalConstraintsListStore } from '@/stores/useLogicalConstraintsListStore.js'
import { storeToRefs } from 'pinia'
import Steps from '@/components/Steps.vue'
const page = ref(7)    // 当前所在页面对应的value,计数从0开始,传递给Steps组件

let columns = reactive([
  {
    title: '任务组名称',
    dataIndex: 'task_group_name',
    key: 'name'
  },
  {
    title: '组内任务关系',
    dataIndex: 'task_relationship',
    key: 'task_relationship'
  },
  {
    title: '任务',
    dataIndex: 'tasks',
    key: 'tasks'
  },
  {
    title: '备注',
    key: 'taskGroup_note',
    dataIndex: 'taskGroup_note'
  },
  {
    title: '操作',
    key: 'action'
  }
])

// 使用pinia中数据
const LogicalConstraintsListStore = useLogicalConstraintsListStore()
const { logicalConstraintsList } = storeToRefs(LogicalConstraintsListStore)
// console.log('logicalConstraintsList', logicalConstraintsList.value);

// 将logicalConstraintsList中数据映射到data
let data = reactive([])
const mapLogicalConstraintsListToData = () => {
  for (let i = 0; i < logicalConstraintsList.value.length; i++) {
    // 初始化data[i]为一个对象
    if (!data[i]) {
      data[i] = {
        key: '',
        task_group_name: '',
        task_relationship: '',
        tasks: '',
        taskGroup_note: ''
      }
    }
    data[i].key = logicalConstraintsList.value[i].key
    data[i].task_group_name = logicalConstraintsList.value[i].task_group_name
    data[i].task_relationship = logicalConstraintsList.value[i].task_relationship
    data[i].taskGroup_note = logicalConstraintsList.value[i].task_group_note

    // 把tasks中name拼接起来，组成任务组包含的任务名称
    for (let j = 0; j < logicalConstraintsList.value[i].task_group_includeTaskList.length; j++) {
      data[i].tasks += '-' + logicalConstraintsList.value[i].task_group_includeTaskList[j].name
    }
  }
}
onMounted(() => {
  mapLogicalConstraintsListToData()
})

function deleteTaskGroup(key) {
  // 删除表格中该行数据
  data.splice(
    data.findIndex((item) => item.key === key), 1
  )
  // 删除pinia中对应的逻辑约束数据
  logicalConstraintsList.value.splice(
    logicalConstraintsList.value.findIndex((item) => item.key === key), 1
  )
}
</script>

<style scoped>
.custom_btn {
  margin: 0;
}
</style>
