<template>
  <div class="form-head">
    <a-row>
      <a-col :span="24">
        <a-row :gutter="16">
          <a-col :span="6">
            <div class="form-item">
              <label for="resource-name" class="form-label" style="font-weight: bold;">资源名称:</label>
              <a-input id="resource-name" v-model:value="resourceFormHead.resourceName" class="form-input"
                placeholder="请输入资源名称" />
            </div>
          </a-col>
          <a-col :span="7">
            <div class="form-item">
              <label for="resource-notes" class="form-label" style="font-weight: bold;">资源备注:</label>
              <a-input id="resource-notes" v-model:value="resourceFormHead.resourceNotes" class="form-input"
                placeholder="请输入资源备注" />
            </div>
          </a-col>
        </a-row>
        <a-row :gutter="16">
          <a-col :span="6">
            <div class="form-item">
              <label for="resource-type" class="form-label">资源类型:</label>
              <a-input id="resource-type" v-model:value="resourceFormHead.resourceType" class="form-input"
                placeholder="请输入资源类型" />
            </div>
          </a-col>
          <a-col :span="3">
            <div class="form-item">
              <label for="priority" class="form-label">优先级:</label>
              <a-input-number id="priority" v-model:value="resourceFormHead.priority" :min="1" :precision="0" class="form-input" />
            </div>
          </a-col>
        </a-row>
      </a-col>
    </a-row>
  </div>
</template>

<script setup>
import { generateKey } from '@/stores/keyManager.js';
import { useFormHeadStore } from '@/stores/resourceDetailNumStore'; // 确保路径正确

const props = defineProps({
  resourceKey: {
    type: String,
    default: null
  }
})

console.log('FormHead.vue, resourceKey:', props.resourceKey);

// 使用 Pinia store
const formHeadStore = useFormHeadStore();

// 从 store 中解构出响应式数据
const { formHeadList, addResourceFormHead } = formHeadStore;

let resourceFormHead

if (props.resourceKey) {
  // 根据传入的 key 查找对应的资源对象
  resourceFormHead = formHeadList.find(item => item.key === props.resourceKey)
} else {
  // 生成新的 key
  generateKey()
  // 新建一个资源对象
  const newResource = {
    resourceName: '',
    resourceNotes: '',
    resourceType: '',
    priority: 1
  }
  addResourceFormHead(newResource);
  resourceFormHead = formHeadList[formHeadList.length - 1]; // 获取最后添加的资源
}

// 输出 resourceFormHead 的值
console.log('当前资源的FormHead:', resourceFormHead);

</script>

<style scoped>
.form-head {
  padding: 2rem;
  background-color: #ffffff;
  border-radius: 8px;
}

.form-item {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
}

.form-label {
  margin-right: 1rem;
  white-space: nowrap;
  font-size: 18px;
}

.form-input {
  flex: 1;
}
</style>
