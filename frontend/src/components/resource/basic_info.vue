<template>
  <div class="form-container">
    <a-row>
      <a-col :span="24">
        <div class="form-head">
          <a-typography-title :level="3" class="title">基本信息</a-typography-title>
          <a-row :gutter="32">
            <a-col :span="8">
              <div class="form-item">
                <label for="prepare-time" class="form-label">准备时间：</label>
                <DurationPicker :modelValue="resourceBasicInfo.prepareTime" id="prepare-time"
                  v-model:value="resourceBasicInfo.prepareTime" class="form-input" @updateValue="onUpdatePrepareTime" />
              </div>
            </a-col>
            <a-col :span="8">
              <div class="form-item">
                <label for="breakdown-time" class="form-label">冷却时间：</label>
                <DurationPicker :modelValue="resourceBasicInfo.breakDownTime" id="breakdown-time"
                  v-model:value="resourceBasicInfo.breakDownTime" class="form-input"
                  @updateValue="onUpdateBreakDownTime" />
              </div>
            </a-col>
            <a-col :span="8">
              <div class="form-item">
                <label for="buffer-time" class="form-label">缓冲时间：</label>
                <DurationPicker :modelValue="resourceBasicInfo.bufferTime" id="buffer-time"
                  v-model:value="resourceBasicInfo.bufferTime" class="form-input" @updateValue="onUpdateBufferTime" />
              </div>
            </a-col>
          </a-row>
        </div>

        <div class="form-body">
          <a-row :gutter="32">
            <a-col :span="24">
              <name-operate-table :columns="columns" :includeList="data" :excludeList="data2" />
            </a-col>
          </a-row>
        </div>
      </a-col>
    </a-row>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useBasicInfoStore } from '@/stores/resourceDetailNumStore';
import NameOperateTable from '@/components/table/name_operate_table.vue'
import DurationPicker from '@/components/DurationPicker.vue';

const props = defineProps({
  resourceKey: {
    type: String,
    default: null
  }
})

console.log('BasicInfo.vue, resourceKey:', props.resourceKey);

// 使用 Pinia store
const basicInfoStore = useBasicInfoStore();

// 从 store 中解构出响应式数据
const { basicInfoList, addResourceBasicInfo } = basicInfoStore;

let resourceBasicInfo;

if (props.resourceKey) {
  resourceBasicInfo = basicInfoList.find((item) => item.key === props.resourceKey);
} else {
  // 初始化一个新的基本信息对象
  const newBasicInfo = {
    prepareTime: 0,
    breakDownTime: 0,
    bufferTime: 0,
  }
  console.log('初始化一个新的基本信息对象')
  addResourceBasicInfo(newBasicInfo);
  resourceBasicInfo = basicInfoList[basicInfoList.length - 1];
}

const onUpdatePrepareTime = (newValue) => {
  resourceBasicInfo.prepareTime = newValue;
};

const onUpdateBreakDownTime = (newValue) => {
  resourceBasicInfo.breakDownTime = newValue;
};

const onUpdateBufferTime = (newValue) => {
  resourceBasicInfo.bufferTime = newValue;
};

// 输出resourceBasicInfo 的值
console.log('当前资源的BasicInfo:', resourceBasicInfo);

// 表格数据和列配置
const data = ref([
  { name: '资源组1', action: '-' },
  { name: '资源组2', action: '-' },
])

const data2 = ref([
  { name: '资源组1', action: '+' },
  { name: '资源组2', action: '+' },
])

const columns = [
  {
    title: '资源组名称',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: '操作',
    dataIndex: 'action',
    key: 'action',
  },
]
</script>

<style scoped>
.form-container {
  display: flex;
  flex-direction: column;
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
}

.form-item label,
.form-input,
a-input-number,
a-radio {
  font-size: 18px;
}
</style>
