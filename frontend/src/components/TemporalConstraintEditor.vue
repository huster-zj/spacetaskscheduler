<template>
  <div class="temporal-editor surface-panel">
    <a-form layout="vertical" @submit.prevent="submitForm">
      <div class="task-grid">
        <a-form-item label="任务 1" required>
          <a-select
            v-model:value="form.task1Key"
            :options="task1Options"
            placeholder="请选择任务"
            show-search
            :filter-option="filterTaskOption"
          />
        </a-form-item>
        <a-form-item label="任务 2" required>
          <a-select
            v-model:value="form.task2Key"
            :options="task2Options"
            placeholder="请选择任务"
            show-search
            :filter-option="filterTaskOption"
          />
        </a-form-item>
      </div>

      <a-form-item label="时态约束类型" required>
        <a-radio-group v-model:value="form.type">
          <a-radio value="predecessor">之前</a-radio>
          <a-radio value="during">之中</a-radio>
        </a-radio-group>
      </a-form-item>

      <div class="interval-section">
        <h2 class="section-heading">间隔时间</h2>
        <div class="interval-grid interval-grid--heading" aria-hidden="true">
          <span>边界</span>
          <span>计时开始时间点</span>
          <span>间隔时长</span>
        </div>
        <div class="interval-grid">
          <span class="interval-label">最小间隔</span>
          <a-select v-model:value="form.minTimingPoint" :options="timingPointOptions" />
          <a-time-picker v-model:value="form.minInterval" format="HH:mm:ss" />
        </div>
        <div class="interval-grid">
          <span class="interval-label">最大间隔</span>
          <a-select v-model:value="form.maxTimingPoint" :options="timingPointOptions" />
          <a-time-picker v-model:value="form.maxInterval" format="HH:mm:ss" />
        </div>
      </div>

      <a-form-item label="备注">
        <a-textarea
          v-model:value="form.note"
          :maxlength="300"
          :auto-size="{ minRows: 3, maxRows: 6 }"
          placeholder="请输入时态约束备注"
        />
      </a-form-item>

      <div class="form-actions">
        <a-button @click="$emit('cancel')">取消</a-button>
        <a-button type="primary" html-type="submit">{{ submitText }}</a-button>
      </div>
    </a-form>
  </div>
</template>

<script setup>
import { computed, reactive, watch } from 'vue'
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'

const props = defineProps({
  initialValue: { type: Object, default: null },
  tasks: { type: Array, default: () => [] },
  submitText: { type: String, default: '保存' }
})

const emit = defineEmits(['cancel', 'save'])

const timingPointOptions = [
  { value: 'start', label: '开始' },
  { value: 'end', label: '结束' }
]

const parseTime = (value) => {
  const normalized = /^\d{2}:\d{2}:\d{2}$/.test(value || '') ? value : '00:00:00'
  return dayjs(`2000-01-01T${normalized}`)
}

const form = reactive({
  task1Key: null,
  task2Key: null,
  type: 'predecessor',
  minTimingPoint: 'start',
  maxTimingPoint: 'end',
  minInterval: parseTime('00:00:00'),
  maxInterval: parseTime('00:00:00'),
  note: ''
})

const taskOptions = computed(() => props.tasks.map((task) => ({
  value: String(task.key),
  label: task.taskName
})))

const task1Options = computed(() => taskOptions.value.map((option) => ({
  ...option,
  disabled: option.value === form.task2Key
})))

const task2Options = computed(() => taskOptions.value.map((option) => ({
  ...option,
  disabled: option.value === form.task1Key
})))

const findTaskKey = (taskName) => {
  const task = props.tasks.find((item) => item.taskName === taskName)
  return task ? String(task.key) : null
}

const hydrate = () => {
  const initial = props.initialValue || {}
  form.task1Key = findTaskKey(initial.tem_constraint_task1)
  form.task2Key = findTaskKey(initial.tem_constraint_task2)
  form.type = initial.tem_constraint_type || 'predecessor'
  form.minTimingPoint = initial.min_timing_start_point || 'start'
  form.maxTimingPoint = initial.max_timing_start_point || 'end'
  form.minInterval = parseTime(initial.minimum_interval_time)
  form.maxInterval = parseTime(initial.maximum_interval_time)
  form.note = initial.tem_constraint_note || ''
}

watch(() => [props.initialValue, props.tasks], hydrate, { immediate: true, deep: true })

const filterTaskOption = (input, option) => option.label.toLowerCase().includes(input.toLowerCase())

const submitForm = () => {
  if (!form.task1Key || !form.task2Key) {
    message.warning(props.tasks.length ? '请选择两个任务' : '请先创建任务')
    return
  }
  if (form.task1Key === form.task2Key) {
    message.warning('两个任务不能相同')
    return
  }

  const task1 = props.tasks.find((item) => String(item.key) === form.task1Key)
  const task2 = props.tasks.find((item) => String(item.key) === form.task2Key)
  if (!task1 || !task2) {
    message.warning('所选任务已不存在，请重新选择')
    return
  }

  emit('save', {
    tem_constraint_task1: task1.taskName,
    tem_constraint_task2: task2.taskName,
    tem_constraint_type: form.type,
    minimum_interval_time: form.minInterval.format('HH:mm:ss'),
    min_timing_start_point: form.minTimingPoint,
    maximum_interval_time: form.maxInterval.format('HH:mm:ss'),
    max_timing_start_point: form.maxTimingPoint,
    tem_constraint_note: form.note.trim()
  })
}
</script>

<style scoped>
.temporal-editor {
  padding: 24px;
}

.task-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
}

.interval-section {
  margin: 4px 0 24px;
  padding: 20px;
  border: 1px solid var(--sts-border);
  border-radius: var(--sts-radius-md);
  background: var(--sts-surface-subtle);
}

.interval-section .section-heading {
  margin-bottom: 14px;
}

.interval-grid {
  display: grid;
  grid-template-columns: minmax(100px, 0.6fr) minmax(180px, 1fr) minmax(150px, 0.8fr);
  gap: 16px;
  align-items: center;
  padding: 8px 0;
}

.interval-grid--heading {
  padding: 0 0 6px;
  color: var(--sts-ink-muted);
  font-size: 12px;
}

.interval-label {
  color: var(--sts-ink-primary);
  font-weight: 600;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

@media (max-width: 767px) {
  .temporal-editor {
    padding: 16px;
  }

  .task-grid,
  .interval-grid {
    grid-template-columns: 1fr;
    gap: 8px;
  }

  .interval-grid--heading {
    display: none;
  }

  .interval-grid + .interval-grid {
    margin-top: 14px;
    padding-top: 18px;
    border-top: 1px solid var(--sts-border);
  }

  .form-actions .ant-btn {
    flex: 1;
  }
}
</style>
