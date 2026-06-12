<template>
  <Steps :current_page="page" />
  <ModalTask ref="modal_task" @update-task="changeTask" />
  <div class="anchor">
    <h1 class="title">锚定需求列表</h1>
    <ShowTable :columns="columns_anchor" :data="anchorContraintList" :searchIsShow="false">
      <template #column_action="action">
        <span class="before_selectedTaskBtn">{{ action.column1.anchor_type }}</span>
      <!-- 选择具体锚定需求对应的任务 -->
      <!-- TODO: 需要确保锚定在最前和锚定在最后的任务并非同一个 -->
       <!-- <span class="before_selectedTaskBtn">{{ action.column1.anchor_task }}</span> -->
      <a-button type="primary" @click="showModal(action.column1)" class="chooseTask" >选择任务</a-button>
      <!-- <CloseOutlined @click="deleteAnchorConstraint(action.column1.key)" /> -->
      </template>
      <template #column_name="name">
       <span>{{ name.column1.anchor_task }}</span>
      <CloseOutlined @click="deleteAnchorConstraint(name.column1.key)" />
      </template>
    </ShowTable>
  </div>
  <div class="temConstraints">
    <h1 class="title">时态约束列表</h1>
    <ShowTable :columns="columns_tem" :data="data_tem">
      <!-- 特定按钮功能 -->
    <template #special_btn>
      <RouterLink to="/custom_tem_constraint">
        <div class="custom_btn">添加</div>
      </RouterLink>
    </template>
    <template #column_name="record">
      <RouterLink :to="`/tem_constraint_detail/${record.column1.tem_constraint_task1}-${record.column1.tem_constraint_task2}`">
        {{ record.column1.tem_constraint_task1 }}
      </RouterLink>
    </template>
    <template #column_name2="record">
      <RouterLink :to="`/tem_constraint_detail/${record.column1.tem_constraint_task1}-${record.column1.tem_constraint_task2}`">
        {{ record.column1.tem_constraint_task2 }}
      </RouterLink>
    </template>
    <template #column_action="action">
      <span>
        <!-- <span @click="goToTemConDetailPage(action.column1.name,action.column1.name2)"> -->
        <RouterLink :to="`/tem_constraint_detail/${action.column1.tem_constraint_task1}-${action.column1.tem_constraint_task2}`">
          <FormOutlined />
        </RouterLink>
        <a-divider type="vertical" />
        <a-popconfirm
           title="是否删除该数据？"
           ok-text="是"
           cancel-text="否"
           @confirm="deleteTemConstraint(action.column1.key)"
           >
              <CloseOutlined />
          </a-popconfirm>
      </span>
    </template>
    </ShowTable>
  </div>
</template>

<script setup>
import { ref, reactive, watch, onMounted } from 'vue';
import ShowTable from '@/components/table/show_table.vue'
import { useTemConstraintsListStore } from '@/stores/useTemConstraintsListStore.js'
import { storeToRefs } from 'pinia';
import ModalTask from '@/components/modal/modal-task.vue'
import { useFormHeadStore } from '@/stores/taskDetailNumStore.js'
import { useAnchorContraintListStore } from '@/stores/useAnchorContraintListStore.js'
import Steps from '@/components/Steps.vue'
const page = ref(6)    // 当前所在页面对应的value,计数从0开始,传递给Steps组件

// 锚定需求列表
// 锚定需求基础数据
let columns_anchor = reactive([
  {
    title: '锚定类型',
    dataIndex: 'anchor_type',
    key: 'action'
  },
  {
    title: '任务',
    dataIndex: 'anchor_task',
    key: 'name'
  },
  {
    title: '任务优先级',
    dataIndex: 'anchor_task_priority',
    key: 'anchor_task_priority'
  },
  {
    title: '任务备注',
    dataIndex: 'anchor_task_note',
    key: 'anchor_task_note'
  }
])

const formHeadStore = useFormHeadStore()
const { formHeadList } = formHeadStore

// 两个锚定需求对应的数据，用于在表格中正常显示
const anchorContraintListStore = useAnchorContraintListStore()
const { anchorContraintList } = storeToRefs(anchorContraintListStore)

// 更新锚定需求列表中应该显示的任务相关信息数据
onMounted(() => {
  anchorContraintListStore.updateAnchorConstraint('1',anchorContraintList.value[0].anchor_task_key)
  anchorContraintListStore.updateAnchorConstraint('2',anchorContraintList.value[1].anchor_task_key)
})

// 清除锚定需求
const noAnchorContraint = ref('无')
function deleteAnchorConstraint(key) {
  // 清除该行锚定需求对应的数据
  let newAnchorC = anchorContraintList.value.find(item => item.key === key)
  newAnchorC.anchor_task = noAnchorContraint.value
  newAnchorC.anchor_task_priority = null
  newAnchorC.anchor_task_note = ''
  newAnchorC.anchor_task_key = ''
}

// 实现选择任务的功能
const modal_task = ref(null)
let selectColumn = ref(null)    // 存储用户点击的行数据，便于确定新选择的任务是哪个锚定需求对应的任务
let notselectColumn = ref(null)    // 存储用户点击的行数据，便于确定新选择的任务是哪个锚定需求对应的任务
// 获取点击的行数据
function showModal(this_column) {
  selectColumn.value = anchorContraintList.value.find(item => item.key === this_column.key);    // 使用 find 方法查找匹配的锚定需求对象
  notselectColumn.value = anchorContraintList.value.find(item => item.key !== this_column.key);    // 使用 find 方法查找匹配的锚定需求对象
  modal_task.value.disabledSelectionKey = notselectColumn.value.anchor_task_key   // 将不是当前锚定需求的任务的key值赋值给模态框，不允许用户两个锚定需求选择相同的任务

  if(selectColumn.value.anchor_task === noAnchorContraint.value){
    modal_task.value.value = noAnchorContraint.value    // 将无锚定需求的值赋值给模态框，便于界面显示当前无选定的选项

  }else{
    modal_task.value.value = formHeadList.find(item => item.taskName === selectColumn.value.anchor_task).key    // 将锚定需求对应的任务名称对应的key值赋值给模态框，便于界面显示当前选定的选项
  }
  modal_task.value.visible = true     // 控制选择任务的模态框是否显示
}
// 获取选择的任务，更新对应锚定需求中任务数据
function changeTask(newTaskKey) {
  selectColumn.value.anchor_task_key = newTaskKey    // 将新的任务key赋值给对应的锚定需求
  anchorContraintListStore.updateAnchorConstraint(selectColumn.value.key, newTaskKey)    // 更新锚定需求对应的任务数据
}

// 时态约束列表
// 时态约束基础数据
let columns_tem = reactive([
  {
    title: '任务1',
    dataIndex: 'tem_constraint_task1',
    key: 'name'
  },
  {
    title: '任务2',
    dataIndex: 'tem_constraint_task2',
    key: 'name2'
  },
  {
    title: '约束类型',
    dataIndex: 'tem_constraint_type',
    key: 'tem_constraint_type'
  },
  {
    title: '最小间隔时间',
    dataIndex: 'minimum_interval_time',
    key: 'minimum_interval_time'
  },
  {
    title: '计时开始时间点',
    dataIndex: 'min_timing_start_point',
    key: 'min_timing_start_point'
  },
  {
    title: '最大间隔时间',
    dataIndex: 'maximum_interval_time',
    key: 'maximum_interval_time'
  },
  {
    title: '计时开始时间点',
    dataIndex: 'max_timing_start_point',
    key: 'max_timing_start_point'
  },
  {
    title: '备注',
    key: 'tem_constraint_note',
    dataIndex: 'tem_constraint_note'
  },
  {
    title: '操作',
    key: 'action'
  }
])

const temConstraintsListStore = useTemConstraintsListStore()
const { temConstraintsList } = storeToRefs(temConstraintsListStore)

function output() {
  console.log('temConstraintsList.value:', temConstraintsList.value);
  console.log('data_tem', data_tem);
}

// 创建reactive对象，用于在表格中正常显示
const data_tem = reactive(temConstraintsList.value || [])

// 当本地数据改变时，更新 store
let updateSource = null
// BUG:当store数据改变时，本地数据也会改变，导致运行此函数，但是实际上并不需要运行该函数（虽然并不影响任何数据的正确性）
// 使用计算属性无法实现页面的删除操作
watch(data_tem, (newValue) => {
  console.log('本地数据改变时，更新 store');
  if (updateSource !== 'store') {
    updateSource = 'local'
    temConstraintsList.value = [...newValue]
    updateSource = null
  }
}, { deep: true })

function deleteTemConstraint(key) {
  // 删除该行数据
  data_tem.splice(
    data_tem.findIndex((item) => item.key === key), 1
  )
}

</script>

<style scoped>
h1.title {
  font-size: 30px;
  font-weight: bold;
  color: #2e2e2e;
  margin-bottom: 20px;
  margin-top: 30px;
  text-align: center;
}

.before_selectedTaskBtn {
  font-size: 20px;
  color: #2e2e2e;
  margin-right: 30px;
}

.chooseTask {
  /* background-color: pink; */
  height: 40px;
  font-size: 18px;
  color: #2e2e2e;
  border: 1.5px solid hsl(0, 1%, 57%);
  border-radius: 10px;
  padding: 5px 10px;
  background-color: #f7f8fa;
}

.custom_btn {
  /* background-color: pink; */
  margin-right: 30px;
  height: 40px;
  font-size: 18px;
  color: #2e2e2e;
  border: 1.5px solid hsl(0, 1%, 57%);
  border-radius: 10px;
  padding: 5px 10px;
  background-color: #f7f8fa;
}

/* 设置锚定需求列表中删除图标的样式 */
.anchor td.ant-table-cell span.anticon-close {
  margin-left: 30px;
}
</style>