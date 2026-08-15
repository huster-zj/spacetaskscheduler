<!-- import ModalTask from '@/components/modal/modal-task.vue' -->
<!-- 暴露绑定 模态框是否显示的 变量 visible ，其他父组件可以通过ref标签访问该变量，通过改变该变量的值实现模态框的显示与隐藏
  ：dataList=，接收模态框主要部分应该显示的内容列表
  ：selectedTask=，接收父组件传入的已经选择的任务数据
  @update-task='',在父组件中可以挂载一个函数,函数自动有一个参数,即子组件返回的任务对应的key值,即返回新选择的任务数据 -->

<template>
  <a-modal v-model:visible="visible" :footer="null">
    <!-- 使用title插槽实现自定义标题样式 -->
    <template #title>
      <div class="custom_title">任务列表</div>
    </template>
    <a-empty v-if="formHeadList.length === 0" description="暂无任务" />
    <a-radio-group v-else v-model:value="value">
      <a-radio v-for="item in formHeadList" :key="item.key" :style="radioStyle" :value="String(item.key)"
        :disabled="isOptionDisabled(item.key)">{{ item.taskName }}
      </a-radio>
    </a-radio-group>
    <footer class="footer">
      <a-button type="primary" :disabled="!value" @click="sendTask" class="sureBtn">确定</a-button>
    </footer>
  </a-modal>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { useFormHeadStore } from '@/stores/taskDetailNumStore.js'

let visible = ref(false)

// 将pinia中存储的任务列表数据导入，作为选择任务界面的默认数据
const formHeadStore = useFormHeadStore()
const { formHeadList } = formHeadStore
// console.log("formHeadList:", formHeadList);

let props = defineProps({
  // 接收已经定义的时态约束中的任务数据
  selectedTask: {
    type: String,
    required: false,
    default: ''
  },
  selectedTaskKey: {
    type: [String, Number],
    required: false,
    default: ''
  }
})

// 若父组件传入了已经选择的任务数据，则界面显示选中传入的任务
// const value = ref(formHeadList[0].key)
const value = ref(null)
watch(
  () => [props.selectedTaskKey, props.selectedTask, formHeadList],
  () => {
    const selected = props.selectedTaskKey
      ? formHeadList.find((item) => String(item.key) === String(props.selectedTaskKey))
      : formHeadList.find((item) => item.taskName === props.selectedTask)
    value.value = selected ? String(selected.key) : null
  },
  { immediate: true, deep: true }
)

// 子组件修改父组件的值
const emit = defineEmits(['update-task'])
function sendTask() {
  if (!value.value || !formHeadList.some((item) => String(item.key) === String(value.value))) return
  visible.value = false
  emit('update-task', value.value)
  // 关闭模态框
}

const disabledSelectionKey = ref('')
function isOptionDisabled(key) {
  return key === disabledSelectionKey.value;
}

defineExpose({
  visible,
  value,
  disabledSelectionKey
})

const radioStyle = reactive({
  display: 'flex',
  height: '30px',
  lineHeight: '30px',
});
</script>

<style scoped>
/* 模态框中间内容样式 */
.ant-radio-group,
.ant-radio-group-outline {
  display: flex;
  flex-wrap: wrap;
  /* 使得内容自动换行 */
  flex-direction: row;
}

.ant-radio-group .ant-radio-wrapper {
  margin-bottom: 5px;
}

.ant-radio-group :deep(span) {
  /* background-color: pink; */
  font-size: 20px;
}

/* 模态框底部样式 */
.footer {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.footer .sureBtn {
  /* background-color: pink; */
  width: 100px;
  height: 40px;
  font-size: 18px;
  color: #2e2e2e;
  border: 1.5px solid hsl(0, 1%, 57%);
  border-radius: 10px;
  padding: 5px 10px;
  background-color: #f7f8fa;
}
</style>
