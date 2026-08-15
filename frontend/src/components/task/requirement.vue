<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="form-container">
    <a-row>
      <a-col :span="24">
        <div class="form-head">
          <a-typography-title :level="3">资源需求</a-typography-title>
        </div>

        <a-col :span="24">
          <div class="form-body">
            <resource-requirement :taskKey="taskKey" />
          </div>
          <a-col :span="24">
            <time-segment class="resource-margin" style="margin-top: 16px;" />
            <resource-occupation style="margin-bottom: 16px;" />
          </a-col>
        </a-col>
      </a-col>
    </a-row>
  </div>
</template>

<script setup>
import ResourceRequirement from './requirement/resource_requirement.vue';
import TimeSegment from './requirement/time_segment.vue';
import ResourceOccupation from './requirement/resource_occupation.vue';

defineProps({
  taskKey: {
    type: String,
    default: null
  }
})

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
</style>
