<template>
  <div class="form-head">
    <a-row>
      <a-col :span="20">
        <a-row :gutter="16">
          <a-col :span="8">
            <div class="form-item">
              <label for="task-name" class="form-label" style="font-weight: bold;">任务名称:</label>
              <a-input id="task-name" v-model:value="taskFormHead.taskName" class="form-input" placeholder="请输入任务名称" />
            </div>
          </a-col>
          <a-col :span="8">
            <div class="form-item">
              <label for="task-notes" class="form-label" style="font-weight: bold;">任务备注:</label>
              <a-input id="task-notes" v-model:value="taskFormHead.taskNotes" class="form-input"
                placeholder="请输入任务备注" />
            </div>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="24">
            <div class="form-item form-item-inline">
              <label for="state" class="form-label">状态:</label>
              <a-radio-group v-model:value="taskFormHead.state" class="form-input">
                <a-radio :value="1" class="form-input">隐藏</a-radio>
                <a-radio :value="2" class="form-input">推迟</a-radio>
                <a-radio :value="3" class="form-input">已分配</a-radio>
                <a-radio :value="4" class="form-input">锁定</a-radio>
              </a-radio-group>
            </div>
          </a-col>
        </a-row>
        <a-row>
          <a-col>
            <div class="form-item form-item-inline">
              <a-checkbox v-model="taskFormHead.isExclusiveTask" class="form-input">独占任务</a-checkbox>
              <div class="form-item-inline">
                <label for="priority" class="form-label">优先级:</label>
                <a-input-number id="priority" v-model:value="taskFormHead.priority" :min="1" :precision="0"
                  class="form-input" />
              </div>
            </div>
          </a-col>
        </a-row>
      </a-col>
    </a-row>
  </div>
</template>

<script setup>
import { generateKey } from '@/stores/keyManager.js';
import { useFormHeadStore } from '@/stores/taskDetailNumStore'; // 确保路径正确

const props = defineProps({
  taskKey: {
    type: String,
    default: null
  }
})

console.log('FormHead.vue, taskKey:', props.taskKey);

// 使用 Pinia store
const formHeadStore = useFormHeadStore();

// 从 store 中解构出响应式数据
const { formHeadList, addTaskFormHead } = formHeadStore;

let taskFormHead

if (props.taskKey) {
  // 根据传入的 key 查找对应的任务对象
  taskFormHead = formHeadList.find((item) => item.key === props.taskKey);
} else {
  // 生成新的 key
  generateKey();
  // 新建一个任务对象
  const newTask = {
    taskName: '',
    taskNotes: '',
    state: 1,
    priority: 1,
    isExclusiveTask: false,
  };
  addTaskFormHead(newTask);
  taskFormHead = formHeadList[formHeadList.length - 1]; // 获取最后添加的任务
}

// 输出 taskFormHead 的值
console.log('当前任务的FormHead:', taskFormHead);
</script>

<style scoped>
.form-head {
  padding: 0rem 2rem;
  background-color: #ffffff;
  border-radius: 8px;
}

.form-item {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
}

.form-item-inline {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.form-label {
  margin-right: 1rem;
  white-space: nowrap;
  font-size: 18px;
}

.form-input {
  flex: 1;
  font-size: 18px;
  margin-right: 2rem;
}
</style>
