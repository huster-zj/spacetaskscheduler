<template>
  <div class="box">
    <div class="form-container">
      <a-col :span="24">
        <div class="form-head">
          <a-row :gutter="32" class="form-row">
            <a-col>
              <div class="form-item">
                <label for="package-name" class="form-label">规划包名称:</label>
                <a-input id="package-name" v-model:value="localConfig.packageName" class="form-input"
                  placeholder="请输入规划包名称" />
              </div>
            </a-col>
            <a-col>
              <div class="form-item">
                <label for="package-description" class="form-label">规划包描述:</label>
                <a-input id="package-description" v-model:value="localConfig.packageDescription" class="form-input"
                  placeholder="请输入规划包描述" />
              </div>
            </a-col>
          </a-row>
        </div>

        <div class="form-body">
          <a-typography-title :level="3">基本信息</a-typography-title>
          <div class="basicinfo form-section">
            <div class="form-item">
              <label for="time-range" class="form-label">规划开始-结束时间:</label>
              <a-range-picker id="time-range" v-model:value="localTimeRange" show-time class="form-input" />
            </div>
          </div>

          <a-typography-title :level="3">资源优先级</a-typography-title>
          <div class="resource_priority form-section">
            <a-row :gutter="16" class="form-row">
              <a-col :span="12">
                <div class="form-item">
                  <label for="resource-min-value" class="form-label">最小值:</label>
                  <a-input-number id="resource-min-value" v-model:value="localConfig.resourceMinValue" :defaultValue="1"
                    :min="1" :precision="0" class="form-input" />
                </div>
              </a-col>
              <a-col :span="12">
                <div class="form-item">
                  <label for="resource-max-value" class="form-label">最大值:</label>
                  <a-input-number id="resource-max-value" v-model:value="localConfig.resourceMaxValue"
                    :defaultValue="10" :min="2" :precision="0" class="form-input" />
                </div>
              </a-col>
            </a-row>
            <div class="form-item">
              <a-radio-group v-model:value="localConfig.resourceRule" class="form-input">
                <a-radio :value="1">数字越小优先级越高</a-radio>
                <a-radio :value="2">数字越大优先级越高</a-radio>
              </a-radio-group>
            </div>
          </div>

          <a-typography-title :level="3">任务优先级</a-typography-title>
          <div class="task_priority form-section">
            <a-row :gutter="16" class="form-row">
              <a-col :span="12">
                <div class="form-item">
                  <label for="task-min-value" class="form-label">最小值:</label>
                  <a-input-number id="task-min-value" v-model:value="localConfig.taskMinValue" :precision="0"
                    class="form-input" />
                </div>
              </a-col>
              <a-col :span="12">
                <div class="form-item">
                  <label for="task-max-value" class="form-label">最大值:</label>
                  <a-input-number id="task-max-value" v-model:value="localConfig.taskMaxValue" :precision="0"
                    class="form-input" />
                </div>
              </a-col>
            </a-row>
            <div class="form-item">
              <a-radio-group v-model:value="localConfig.taskRule" class="form-input">
                <a-radio :value="1">数字越小优先级越高</a-radio>
                <a-radio :value="2">数字越大优先级越高</a-radio>
              </a-radio-group>
            </div>
          </div>
        </div>

        <div class="form-item form-item-center">
          <RouterLink to="/resource">
            <a-button type="primary" @click="handleSubmit" class="custom_btn">保存</a-button>
          </RouterLink>
        </div>
      </a-col>
    </div>
  </div>
</template>

<script setup>
import { useConfigStore } from '@/stores/useConfigStore';
import { storeToRefs } from 'pinia';
import dayjs from 'dayjs';
import { reactive, computed } from 'vue';
import { message } from 'ant-design-vue';  // 导入 message 组件

const configStore = useConfigStore();
const { basicConfig } = storeToRefs(configStore);

// 本地状态，用于表单数据
const localConfig = reactive({ ...basicConfig.value });

// 确保 timeRange 是 dayjs 实例
const localTimeRange = computed({
  get: () => localConfig.timeRange.map(date => dayjs(date)),
  set: (value) => {
    localConfig.timeRange = value.map(date => date.toISOString());
  }
});

const handleSubmit = () => {
  // 更新 Pinia store
  configStore.$patch({
    basicConfig: { ...localConfig }
  });
  console.log('提交的数据:', localConfig);
  message.success('提交成功！');  // 显示成功提示
};
</script>

<style scoped>
.box {
  display: flex;
  justify-content: center;
}

.form-container {
  display: flex;
  width: 1500px;
  padding: 2rem;
  justify-content: space-around;
}

.form-row {
  display: flex;
  align-items: center;
}

.form-section {
  display: flex;
  flex-direction: column;
  margin-bottom: 1rem;
  border-radius: 4px;
}

.form-item {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
}

.form-item-center {
  justify-content: center;
  /* 水平居中对齐 */
}

.form-label {
  margin-right: 1rem;
  /* 设置标签和输入框之间的间距 */
  white-space: nowrap;
  /* 防止标签文本换行 */
}

/* 统一其他部分的字体大小 */
.form-item label,
.form-input,
a-input-number,
a-radio {
  font-size: 18px;
  /* 统一字体大小 */
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
</style>