<template>
 <div>{{ message }}</div>
</template>

<script setup>
import { ref, reactive } from 'vue';

const message = ref('custon task');
</script>

<style scoped>
div {
 color: red;
}
</style>