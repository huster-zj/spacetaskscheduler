<template>
  <section class="page-shell constraint-editor-page">
    <header class="page-header">
      <h1 class="page-heading">新增时态约束</h1>
    </header>
    <TemporalConstraintEditor
      :tasks="formHeadList"
      submit-text="添加约束"
      @cancel="router.push('/temporal_constraint')"
      @save="saveConstraint"
    />
  </section>
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'

import TemporalConstraintEditor from '@/components/TemporalConstraintEditor.vue'
import { useFormHeadStore } from '@/stores/taskDetailNumStore.js'
import { useTemConstraintsListStore } from '@/stores/useTemConstraintsListStore.js'

defineOptions({ name: 'CustomTemporalConstraintView' })

const router = useRouter()
const { formHeadList } = storeToRefs(useFormHeadStore())
const temConstraintsStore = useTemConstraintsListStore()

const saveConstraint = (constraint) => {
  temConstraintsStore.addTemConstraints(constraint)
  message.success('时态约束已添加')
  router.push('/temporal_constraint')
}
</script>

<style scoped>
.constraint-editor-page {
  max-width: 1080px;
}

.page-header {
  margin-bottom: 16px;
}
</style>
