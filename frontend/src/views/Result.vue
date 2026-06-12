<template>
  <div>{{ message }}</div>
</template>

<script setup>
import { ref, reactive } from 'vue'

const message = ref('result!')
</script>

<style scoped>
div {
  color: red;
}
</style>
