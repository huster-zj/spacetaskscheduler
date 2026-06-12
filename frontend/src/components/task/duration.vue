<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="form-container">
    <a-row>
      <a-col :span="24">
        <div class="form-head">
          <a-typography-title :level="3">任务时长</a-typography-title>
        </div>

        <div class="form-body">
          <a-row :gutter="32">
            <a-col :span="24">
              <div class="form-item">
                <a-radio-group v-model:value="taskDurationData.durationType" class="form-input">
                  <a-radio :value="1" class="form-label">固定</a-radio>
                  <a-radio :value="2" class="form-label">可变</a-radio>
                </a-radio-group>
              </div>
            </a-col>
          </a-row>
          <a-row :gutter="32">
            <a-col :span="24">
              <div v-if="taskDurationData.durationType === 1" class="form-item">
                <label for="fixed-duration" class="form-label">固定时间:</label>
                <DurationPicker :modelValue="taskDurationData.fixedDuration" id="prepare-time"
                  v-model:value="taskDurationData.fixedDuration" class="form-input"
                  @updateValue="onUpdateFixedDuration" />
              </div>
              <div v-if="taskDurationData.durationType === 2">
                <div class="form-item">
                  <a-checkbox v-model:checked="taskDurationData.needsFullWindow" class="form-label">需要完整时间窗</a-checkbox>
                </div>
                <div v-if="!taskDurationData.needsFullWindow">
                  <div class="form-item">
                    <label for="min-total-duration" class="form-label">最小总时长:</label>
                    <DurationPicker :modelValue="taskDurationData.minTotalDuration" id="prepare-time"
                      v-model:value="taskDurationData.minTotalDuration" class="form-input"
                      @updateValue="onUpdateMinTotalDuration" />
                  </div>
                  <div class="form-item">
                    <div v-if="!taskDurationData.needsRestrict">
                      <label class="form-label">最大总时长:</label>
                      <DurationPicker :modelValue="taskDurationData.maxTotalDuration" id="prepare-time"
                        v-model:value="taskDurationData.maxTotalDuration" class="form-input" style="margin-right: 16px;"
                        @updateValue="onUpdateMaxTotalDuration" />
                    </div>
                    <a-checkbox v-model:checked="taskDurationData.needsRestrict" class="form-label">无限制</a-checkbox>
                  </div>
                </div>
                <div class="form-item">
                  <a-checkbox v-model:checked="taskDurationData.allowsSegmentedCompletion"
                    class="form-label">允许分段完成</a-checkbox>
                </div>
                <div v-if="taskDurationData.allowsSegmentedCompletion" class="form-item">
                  <label class="form-label">每段最小时长:</label>
                  <DurationPicker :modelValue="taskDurationData.segmentMinDuration" id="prepare-time"
                    v-model:value="taskDurationData.segmentMinDuration" class="form-input"
                    @updateValue="onUpdateSegmentMinDuration" />
                </div>
                <div v-if="taskDurationData.allowsSegmentedCompletion" class="form-item">
                  <a-checkbox v-model:checked="taskDurationData.allowsResourceChange"
                    class="form-label">允许不同段之间改变资源</a-checkbox>
                </div>
                <div v-if="taskDurationData.allowsSegmentedCompletion && taskDurationData.allowsResourceChange">
                  <a-radio-group v-model:value="taskDurationData.overlapType" class="form-input"
                    style="margin-bottom: 16px;">
                    <a-radio :value="1" class="form-label">允许有间隔</a-radio>
                    <a-radio :value="2" class="form-label">需要重叠</a-radio>
                  </a-radio-group>
                  <div v-if="taskDurationData.overlapType === 1" class="form-item">
                    <label for="max-overlap-duration" class="form-label">最大重叠时长:</label>
                    <DurationPicker :modelValue="taskDurationData.maxOverlapDuration" id="prepare-time"
                      v-model:value="taskDurationData.maxOverlapDuration" class="form-input"
                      @updateValue="onUpdateMaxOverlapDuration" />
                  </div>
                  <div v-if="taskDurationData.overlapType === 2" class="form-item">
                    <label class="form-label">准确重叠时长:</label>
                    <DurationPicker :modelValue="taskDurationData.exactOverlapDuration" id="prepare-time"
                      v-model:value="taskDurationData.exactOverlapDuration" class="form-input"
                      @updateValue="onUpdateExactOverlapDuration" />
                  </div>
                </div>
              </div>
            </a-col>
          </a-row>
        </div>
      </a-col>
    </a-row>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useDurationStore } from '@/stores/taskDetailNumStore'; // 确保路径正确
import dayjs from 'dayjs';
import DurationPicker from '@/components/DurationPicker.vue';

const props = defineProps({
  taskKey: {
    type: String,
    default: null
  }
})

console.log('duration.vue, taskKey:', props.taskKey);

// 使用 Pinia store
const durationStore = useDurationStore();

// 从 store 中解构出响应式数据
const { durationList, addTaskDuration, updateTaskDuration } = durationStore;

let taskDurationData;

if (props.taskKey) {
  taskDurationData = durationList.find((item) => item.key === props.taskKey);
} else {
  // 初始化一个新的任务持续时间对象
  const newTaskDuration = {
    durationType: 1,
    fixedDuration: 0,
    minTotalDuration: 0,
    maxTotalDuration: 0,
    needsRestrict: false,
    needsFullWindow: false,
    allowsSegmentedCompletion: false,
    allowsResourceChange: false,
    segmentMinDuration: 0,
    maxOverlapDuration: 0,
    exactOverlapDuration: 0,
    overlapType: 1
  };
  addTaskDuration(newTaskDuration);
  taskDurationData = durationList[durationList.length - 1]; // 获取最后添加的任务持续时间
}

// 输出 taskDurationData 的值
console.log('当前任务持续时间:', taskDurationData);

const onUpdateFixedDuration = (newValue) => {
  taskDurationData.fixedDuration = newValue;
};
const onUpdateMinTotalDuration = (newValue) => {
  taskDurationData.minTotalDuration = newValue;
};
const onUpdateMaxTotalDuration = (newValue) => {
  taskDurationData.maxTotalDuration = newValue;
};
const onUpdateSegmentMinDuration = (newValue) => {
  taskDurationData.segmentMinDuration = newValue;
};
const onUpdateMaxOverlapDuration = (newValue) => {
  taskDurationData.maxOverlapDuration = newValue;
};
const onUpdateExactOverlapDuration = (newValue) => {
  taskDurationData.exactOverlapDuration = newValue;
};
</script>

<style scoped>
.form-container {
  padding: 0rem 2rem;
  background-color: #f9f9f9;
  border-radius: 0;
  box-shadow: none;
}

.form-head {
  margin-bottom: 1.5rem;
}

.form-item {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
}

.form-label {
  width: auto;
  text-align: left;
  margin-right: 1rem;
  white-space: nowrap;
  font-size: 18px;
}
</style>