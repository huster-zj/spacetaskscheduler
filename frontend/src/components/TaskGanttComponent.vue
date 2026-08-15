<template>
  <BaseGanttComponent :tasks="tasks" :scale="scale" />
</template>

<script setup>
import BaseGanttComponent from '@/components/BaseGanttComponent.vue'

defineProps({
  tasks: {
    type: Object,
    default: () => ({ data: [], links: [] })
  },
  scale: {
    type: String,
    default: 'day'
  }
})
</script>
