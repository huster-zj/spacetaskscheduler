<template>
  <ModalTask ref="modal_task1" @update-task="changeTask1" :selectedTask="selectedTask1" />
  <ModalTask ref="modal_task2" @update-task="changeTask2" :selectedTask="selectedTask2" />
  <section class="page-shell constraint-editor-page">
    <div class="box surface-panel">
    <div class="tasks">
      <div class="task">
        <span class="text">任务1:</span>
        <span class="task_name">{{ task1Show }}</span>
        <a-button type="primary" class="chooseTask" @click="showTaskModal1">选择任务</a-button>
      </div>
      <div class="task">
        <span class="text">任务2:</span>
        <span class="task_name">{{ task2Show }}</span>
        <a-button type="primary" class="chooseTask" @click="showTaskModal2">选择任务</a-button>
      </div>
      <div>
        <span class="text">备注：</span>
        <a-input placeholder="请输入时态约束备注" v-model:value="tem_con_detail.tem_constraint_note" />
      </div>
    </div>
    <div class="constraintType">
      <RadioBtn ref="temConstraintTypeData" :radio_beforeText="radio_beforeText" :radio_selection="radio_selection" :special_result="temConstraintTypeShow" />
    </div>
    <div class="interval">
      <span class="text">最小间隔时间</span>
      <Dropdown ref="minTimePointData" before_select_text="计时开始时间点:" :selectList="timePointList" :special_result="minTimePointShow" />
      <SelectInterval ref="minIntervalTimeData" :special_result="minIntervalTimeShow" />
    </div>
    <div class="interval">
      <span class="text">最大间隔时间</span>
      <Dropdown ref="maxTimePointData" before_select_text="计时开始时间点:" :selectList="timePointList" :special_result="maxTimePointShow" />
      <SelectInterval ref="maxIntervalTimeData" :special_result="maxIntervalTimeShow" />
    </div>
    <div class="saveBtn">
      <RouterBtn toPath="/temporal_constraint" btnWidth="80px" btnText="保存" @click="saveData" />
      <!-- <button @click="console.log(newTemCon)">点击输出当前编辑的时态约束数据</button> -->
    </div>
    </div>
  </section>
</template>

<script setup>
import { ref, reactive } from 'vue';
import RouterBtn from '@/components/button/router-button.vue'
import Dropdown from '@/components/dropdown/drop_down.vue'
import RadioBtn from '@/components/button/radio-button.vue'
import SelectInterval from '@/components/timeSelector/select_interval.vue';
import { useTemConstraintsListStore } from '@/stores/useTemConstraintsListStore.js'
import ModalTask from '@/components/modal/modal-task.vue'
import { useFormHeadStore } from '@/stores/taskDetailNumStore.js'
import { storeToRefs } from 'pinia';

// 页面显示基础数据
// 时态约束类型数据
let radio_beforeText = ref('时态约束类型：')
let radio_selection = reactive([
  {
    id: 1,
    value: 'predecessor',
    label: '之前'
  },
  {
    id: 2,
    value: 'during',
    label: '之中'
  }
])
// 最小、最大间隔时间数据
const timePointList = [{
  id: 1,
  value: 'start',
  label: '开始'
}, {
  id: 2,
  value: 'end',
  label: '结束'
}]

// 获取该页面应该显示的某一个时态约束具体数据
const temConstraintsListStore = useTemConstraintsListStore()
const { temConstraintsList } = temConstraintsListStore
const updateTemConstraints = temConstraintsListStore.updateTemConstraints
// console.log('temConstraintsList', temConstraintsList.value);

// 获取时态约束列表中那一行的任务1和任务2名称，便于匹配到对应的时态约束数据
let props = defineProps({
  task1: {
    type: String,
    required: true
  },
  task2: {
    type: String,
    required: true
  }
})
let task1 = ref(props.task1)
let task2 = ref(props.task2)
// console.log('task1', task1.value);
// console.log('task2', task2.value);
let selectedTask1 = task1.value
let selectedTask2 = task2.value

// 根据 task1 和 task2 匹配具体是哪个时态约束数据
const tem_con_detail = temConstraintsList.find(item => 
  item.tem_constraint_task1 === task1.value && item.tem_constraint_task2 === task2.value
)

// 将对应的约束数据显示到页面上
let task1Show = ref(tem_con_detail.tem_constraint_task1)
let task2Show = ref(tem_con_detail.tem_constraint_task2)
let temConstraintTypeShow = tem_con_detail.tem_constraint_type
let minTimePointShow = tem_con_detail.min_timing_start_point
let maxTimePointShow = tem_con_detail.max_timing_start_point
let minIntervalTimeShow = tem_con_detail.minimum_interval_time
let maxIntervalTimeShow = tem_con_detail.maximum_interval_time


// 修改该时态约束中的数据
const formHeadStore = useFormHeadStore()
const { formHeadList } = storeToRefs(formHeadStore)


const modal_task1 = ref(null)   // 选择任务1的模态框对应的ref标签，便于获取该组件的数据，以及控制该组件的显示与隐藏
const modal_task2 = ref(null)

function showTaskModal1() {
  modal_task1.value.visible = true
  // console.log('modal_task1:', modal_task1.value);
}
function showTaskModal2() {
  modal_task2.value.visible = true
  // console.log('modal_task2:', modal_task2.value);
}
// 选择任务1
function changeTask1(newTask1Key) {
  // console.log('newTask1Key:', newTask1Key);
  const newTask1 = formHeadList.value.find(item => item.key === newTask1Key)    // 找到选择的任务对应的名称
  task1Show.value = newTask1.taskName    // 将新的任务名称显示在对应的时态约束定义界面
}
// 选择任务2
function changeTask2(newTask2Key) {
  // console.log('newTask2Key:', newTask2Key);
  const newTask2 = formHeadList.value.find(item => item.key === newTask2Key)    // 找到选择的任务对应的名称
  task2Show.value = newTask2.taskName    // 将新的任务名称显示在对应的时态约束定义界面
}

// 保存按钮点击事件
// 编辑时态约束组件对应的ref标签
const minTimePointData = ref(null)
const maxTimePointData = ref(null)
const temConstraintTypeData = ref(null)
const minIntervalTimeData = ref(null)
const maxIntervalTimeData = ref(null)
function saveData() {
  tem_con_detail.tem_constraint_task1 = task1Show.value
  tem_con_detail.tem_constraint_task2 = task2Show.value
  tem_con_detail.min_timing_start_point = minTimePointData.value.selectValue
  tem_con_detail.max_timing_start_point = maxTimePointData.value.selectValue
  tem_con_detail.tem_constraint_type = temConstraintTypeData.value.radioValue
  tem_con_detail.minimum_interval_time = minIntervalTimeData.value.selectTime.format('HH:mm:ss')
  tem_con_detail.maximum_interval_time = maxIntervalTimeData.value.selectTime.format('HH:mm:ss')
  updateTemConstraints(tem_con_detail)  // 将新增的时态约束数据添加到时态约束列表中
}

</script>

<style scoped>
/* 整体布局居中 */
.flexCenter {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  margin-top: 30px;
  /* background-color: pink; */
}
/* 设置居中内容宽度 */
.box {
  width: 1200px;
}

/* 选择任务部分-样式 */
.box .tasks {
  /* background-color: yellow; */
  display: flex;
  justify-content: start;
  margin-bottom: 40px;
}
.box .tasks .task {
  /* background-color: pink; */
  display: flex;
  margin-right: 100px;
}
.box .tasks .task .task_name {
  font-size: 24px;
  color: #2e2e2e;
  margin-right: 30px;
  margin-left: 30px;
}
.box .tasks .task .chooseTask {
  /* background-color: pink; */
  height: 40px;
  font-size: 18px;
  color: #2e2e2e;
  border: 1.5px solid hsl(0, 1%, 57%);
  border-radius: 10px;
  padding: 5px 10px;
  background-color: #f7f8fa;
}

/* 选择任务部分-备注样式 */
.box .tasks .text {
  /* background-color: green; */
  font-size: 20px;
  font-weight: bold;
  /* width: 150px; */
  text-align: center;
  align-self: center;
}
.box .tasks .ant-input {
  /* background-color: pink; */
  height: 40px;
  font-size: 20px;
  border-radius: 5px;
  width: 300px;
  margin-left: 10px;
  align-self: center;
}
.box .tasks .ant-input:focus {
  border-radius: 5px;
  box-shadow: 0 0 0px; /* 覆盖默认阴影 */
}

/* 时态约束类型样式 */
.box .constraintType {
  /* background-color: yellow; */
  margin-bottom: 40px;
}
/* 间隔时间样式 */
.box .interval {
  /* background-color: pink; */
  display: flex;
  align-items: center;
  justify-content: start;
  margin-bottom: 20px;
}
.box .interval .text {
  /* background-color: burlywood; */
  font-size: 20px;
  font-weight: bold;
  /* margin-right: 50px;
  margin-left: 30px; */
}

/* 间隔时间部分-下拉框样式 */
.box .interval :deep(.dropdown_box) {
  display: flex;
  margin-left: 20px;
  width: 400px;
}

.box .interval :deep(.ant-select-selector) {
  /* background-color: pink; */
  margin-left: 20px;
}
.box .interval :deep(.ant-select-arrow) {
  right: -30px;
}

/* 保存按钮样式 */
.box .saveBtn {
  display: flex;
  justify-content: center;
  margin-top: 40px;
}
/* 去除radio按钮的左边距，时态约束类型那一行的左间距 */
div.radio {
  margin-left: 0;
}

/* Responsive visual layer; all selection refs and save behavior stay unchanged. */
.flexCenter {
  display: block;
  height: auto;
  margin: 0;
}

.box {
  width: 100%;
  padding: 24px;
}

.box .tasks {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}

.box .tasks .task,
.box .tasks > div {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 10px;
  margin: 0;
}

.box .tasks .task .task_name {
  min-width: 52px;
  margin: 0;
  padding: 6px 10px;
  border: 1px solid var(--sts-border);
  border-radius: var(--sts-radius-md);
  background: var(--sts-surface-subtle);
  color: var(--sts-ink-primary);
  font-size: 14px;
  text-align: center;
}

.box .tasks .task .chooseTask {
  min-height: 36px;
  border: 1px solid var(--sts-primary);
  border-radius: var(--sts-radius-md);
  background: var(--sts-primary);
  color: #ffffff;
  font-size: 14px;
}

.box .tasks .text,
.box .interval .text {
  flex: 0 0 auto;
  margin: 0;
  color: var(--sts-ink-secondary);
  font-size: 14px;
  font-weight: 600;
}

.box .tasks .ant-input {
  min-width: 0;
  width: 100%;
  height: 36px;
  margin: 0;
  font-size: 14px;
}

.box .constraintType {
  margin-bottom: 12px;
  padding: 16px;
  border: 1px solid var(--sts-border);
  border-radius: var(--sts-radius-md);
  background: var(--sts-surface-subtle);
}

.box .interval {
  display: grid;
  grid-template-columns: 130px minmax(240px, 1fr) 180px;
  align-items: center;
  gap: 16px;
  margin-bottom: 12px;
  padding: 16px;
  border: 1px solid var(--sts-border);
  border-radius: var(--sts-radius-md);
  background: var(--sts-surface-raised);
}

.box .interval :deep(.dropdown_box) {
  width: 100%;
  margin: 0;
}

.box .interval :deep(.ant-select-selector) {
  margin: 0;
}

.box .interval :deep(.ant-select-arrow) {
  right: 11px;
}

.box .saveBtn {
  margin-top: 24px;
}

@media (max-width: 1023px) {
  .box .tasks,
  .box .interval {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 767px) {
  .box {
    padding: 16px;
  }

  .box .tasks .task,
  .box .tasks > div {
    align-items: stretch;
    flex-wrap: wrap;
  }
}
</style>
