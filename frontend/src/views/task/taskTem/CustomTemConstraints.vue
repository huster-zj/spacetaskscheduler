<template>
  <ModalTask ref="modal_task1" @update-task="changeTask1" />
  <ModalTask ref="modal_task2" @update-task="changeTask2" />
  <div class="flexCenter">
    <div class="box">
      <div class="tasks">
        <div class="task">
          <span class="text">任务1:</span>
          <span class="task_name">{{ task1 }}</span>
          <a-button type="primary" class="chooseTask" @click="showTaskModal1">选择任务</a-button>
        </div>
        <div class="task">
          <span class="text">任务2:</span>
          <span class="task_name">{{ task2 }}</span>
          <a-button type="primary" class="chooseTask" @click="showTaskModal2">选择任务</a-button>
        </div>
        <div>
          <span class="text">备注：</span>
          <a-input placeholder="请输入时态约束备注" v-model:value="newTemCon.tem_constraint_note" />
        </div>
      </div>
      <div class="constraintType">
        <RadioBtn ref="temConstraintTypeData" :radio_beforeText="radio_beforeText" :radio_selection="radio_selection"
          v-model:value="newTemCon.tem_constraint_type" />
      </div>
      <div class="interval">
        <span class="text">最小间隔时间</span>
        <Dropdown ref="minTimePointData" before_select_text="计时开始时间点:" :selectList="timePointList" />
        <SelectInterval ref="minIntervalTimeData" />
      </div>
      <div class="interval">
        <span class="text">最大间隔时间</span>
        <Dropdown ref="maxTimePointData" before_select_text="计时开始时间点:" :selectList="timePointList" />
        <SelectInterval ref="maxIntervalTimeData" />
      </div>
      <div class="saveBtn">
        <RouterBtn toPath="/temporal_constraint" btnWidth="80px" btnText="保存" @click="saveData" />
        <!-- <button @click="console.log(newTemCon)">点击输出当前编辑的时态约束数据</button> -->
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import RouterBtn from '@/components/button/router-button.vue'
import Dropdown from '@/components/dropdown/drop_down.vue'
import RadioBtn from '@/components/button/radio-button.vue'
import SelectInterval from '@/components/timeSelector/select_interval.vue';
import { useTemConstraintsListStore } from '@/stores/useTemConstraintsListStore.js'
import { storeToRefs } from 'pinia';
import ModalTask from '@/components/modal/modal-task.vue'
import { useFormHeadStore } from '@/stores/taskDetailNumStore.js'

// 基础数据,用于显示

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

// 选择任务1和任务2

const taskFormHeadStore = useFormHeadStore()
const { formHeadList } = storeToRefs(taskFormHeadStore)

const modal_task1 = ref(null)   // 选择任务1的模态框对应的ref标签，便于获取该组件的数据，以及控制该组件的显示与隐藏
const modal_task2 = ref(null)
function showTaskModal1() {
  if (task2Key.value) {
    modal_task1.value.disabledSelectionKey = task2Key.value
  }
  modal_task1.value.visible = true
}
function showTaskModal2() {
  if (task1Key.value) {
    modal_task2.value.disabledSelectionKey = task1Key.value
  }
  modal_task2.value.visible = true
}
// 选择任务1
const task1Key = ref(null)
let task1 = ref('无')
// const selectedTaskKey = ref(null)   // 存储另一个模态框已选的任务对应的key，便于控制时态约束中两个任务非同一个
function changeTask1(newTask1Key) {
  // console.log('newTask1Key:', newTask1Key);
  task1Key.value = newTask1Key
  const newTask1 = formHeadList.value.find(item => item.key === newTask1Key)    // 找到选择的任务对应的名称
  task1.value = newTask1.taskName    // 将新的任务名称显示在对应的时态约束定义界面
}
// 选择任务2
const task2Key = ref(null)
let task2 = ref('无')
function changeTask2(newTask2Key) {
  task2Key.value = newTask2Key
  const newTask2 = formHeadList.value.find(item => item.key === newTask2Key)    // 找到选择的任务对应的名称
  task2.value = newTask2.taskName    // 将新的任务名称显示在对应的时态约束定义界面
}

// 与时态约束列表页面的数据交互
const temConstraintsListStore = useTemConstraintsListStore()
const addTemConstraints = temConstraintsListStore.addTemConstraints
// console.log('temConstraintsList', temConstraintsList.value);

// 新增时态约束页面的数据
const minTimePointData = ref(null)
const maxTimePointData = ref(null)
const temConstraintTypeData = ref(null)
const minIntervalTimeData = ref(null)
const maxIntervalTimeData = ref(null)

// 添加空值检查
let newTemCon = reactive({
  tem_constraint_task1: '',
  tem_constraint_task2: '',
  tem_constraint_type: '',
  minimum_interval_time: '',
  min_timing_start_point: '',
  maximum_interval_time: '',
  max_timing_start_point: '',
  tem_constraint_note: ''
})

// 保存按钮点击事件
function saveData() {
  newTemCon.tem_constraint_task1 = task1.value
  newTemCon.tem_constraint_task2 = task2.value
  newTemCon.min_timing_start_point = minTimePointData.value.selectValue
  newTemCon.max_timing_start_point = maxTimePointData.value.selectValue
  newTemCon.tem_constraint_type = temConstraintTypeData.value.radioValue
  newTemCon.minimum_interval_time = minIntervalTimeData.value.selectTime.format('HH:mm:ss')
  newTemCon.maximum_interval_time = maxIntervalTimeData.value.selectTime.format('HH:mm:ss')
  addTemConstraints(newTemCon)  // 将新增的时态约束数据添加到时态约束列表中
  // console.log('newTemCon', newTemCon);
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


/* .box .tasks :deep(.dropdown_box) {
  display: flex;
  margin-left: 30px;
  width: 400px;
} */
/* .box .tasks :deep(.ant-select-selector) {
  margin-left: 20px;
}
.box .tasks :deep(.ant-select-arrow) {
  right: -30px;
} */

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
  box-shadow: 0 0 0px;
  /* 覆盖默认阴影 */
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
  margin-right: 50px;
  /* margin-left: 30px; */
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
</style>