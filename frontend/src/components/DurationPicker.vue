<template>
  <a-dropdown :visible="dropdownVisible" @visibleChange="handleVisibleChange" trigger="click">
    <a-input v-model:value="displayValue" readonly class="form-input" @click="toggleDropdown" />
    <template #overlay>
      <div class="date-time-picker">
        <div class="scroll-container">
          <div class="scroll-item" v-for="day in days" :key="'day-' + day" @click="selectDay(day)"
            :class="{ selected: day === dayValue }">
            {{ day }} 天
          </div>
        </div>
        <div class="scroll-container">
          <div class="scroll-item" v-for="hour in hours" :key="'hour-' + hour" @click="selectHour(hour)"
            :class="{ selected: hour === hourValue }">
            {{ hour }} 时
          </div>
        </div>
        <div class="scroll-container">
          <div class="scroll-item" v-for="minute in minutes" :key="'minute-' + minute" @click="selectMinute(minute)"
            :class="{ selected: minute === minuteValue }">
            {{ minute }} 分
          </div>
        </div>
        <div class="scroll-container">
          <div class="scroll-item" v-for="second in seconds" :key="'second-' + second" @click="selectSecond(second)"
            :class="{ selected: second === secondValue }">
            {{ second }} 秒
          </div>
        </div>
        <div class="confirm-button">
          <a-button type="primary" @click="confirmSelection">确认</a-button>
        </div>
      </div>
    </template>
  </a-dropdown>
</template>

<script setup>
import { ref, watch, defineProps } from 'vue';

const props = defineProps({
  modelValue: {
    type: Number,
    default: 0
  }
});

const emit = defineEmits(['updateValue']);

const days = Array.from({ length: 31 }, (_, i) => i); // 从0开始
const hours = Array.from({ length: 24 }, (_, i) => i);
const minutes = Array.from({ length: 60 }, (_, i) => i);
const seconds = Array.from({ length: 60 }, (_, i) => i);

const dayValue = ref(0);
const hourValue = ref(0);
const minuteValue = ref(0);
const secondValue = ref(0);
const displayValue = ref('');
const dropdownVisible = ref(false);

const updateDisplayValue = () => {
  displayValue.value = `${dayValue.value} 天 ${hourValue.value} 时 ${minuteValue.value} 分 ${secondValue.value} 秒`;
};

watch(() => props.modelValue, (newValue) => {
  console.log('父组件传递的值:', newValue); // 输出父组件传递的值
  if (newValue !== null) {
    const totalSeconds = newValue;
    dayValue.value = Math.floor(totalSeconds / (24 * 3600));
    const remainingSeconds = totalSeconds % (24 * 3600);
    hourValue.value = Math.floor(remainingSeconds / 3600);
    minuteValue.value = Math.floor((remainingSeconds % 3600) / 60);
    secondValue.value = remainingSeconds % 60;
    updateDisplayValue();
  }
}, { immediate: true });

const selectDay = (day) => {
  dayValue.value = day;
};

const selectHour = (hour) => {
  hourValue.value = hour;
};

const selectMinute = (minute) => {
  minuteValue.value = minute;
};

const selectSecond = (second) => {
  secondValue.value = second;
};

const confirmSelection = () => {
  updateModelValue();
  dropdownVisible.value = false;
};

const updateModelValue = () => {
  const totalSeconds = (dayValue.value * 24 * 3600) + (hourValue.value * 3600) + (minuteValue.value * 60) + secondValue.value;
  emit('updateValue', totalSeconds);
  updateDisplayValue();
};

const toggleDropdown = () => {
  dropdownVisible.value = !dropdownVisible.value;
};

const handleVisibleChange = (visible) => {
  dropdownVisible.value = visible;
};
</script>

<style scoped>
.date-time-picker {
  display: flex;
  gap: 10px;
  padding: 10px;
  background: white;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
}

.scroll-container {
  height: 150px;
  overflow-y: scroll;
  width: 80px;
}

.scroll-item {
  padding: 5px;
  cursor: pointer;
}

.scroll-item:hover {
  background-color: #f0f0f0;
}

.scroll-item.selected {
  box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.3);
  background-color: #e6f7ff;
}

.confirm-button {
  display: flex;
  justify-content: center;
  margin-top: 10px;
}

.form-input {
  width: 200px;
}
</style>