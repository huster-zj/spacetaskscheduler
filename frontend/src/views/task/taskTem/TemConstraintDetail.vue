<template>
  <section class="page-shell constraint-editor-page">
    <template v-if="constraint">
      <header class="page-header">
        <h1 class="page-heading">编辑时态约束</h1>
      </header>
      <TemporalConstraintEditor
        :initial-value="constraint"
        :tasks="formHeadList"
        @cancel="router.push('/temporal_constraint')"
        @save="saveConstraint"
      />
    </template>

    <div v-else class="missing-state surface-panel" role="status">
      <h1 class="page-heading">时态约束不存在</h1>
      <p>该约束可能已被删除，或当前规划包中没有对应记录。</p>
      <a-button type="primary" @click="router.push('/temporal_constraint')">返回时态约束</a-button>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'

import TemporalConstraintEditor from '@/components/TemporalConstraintEditor.vue'
import { useFormHeadStore } from '@/stores/taskDetailNumStore.js'
import { useTemConstraintsListStore } from '@/stores/useTemConstraintsListStore.js'

defineOptions({ name: 'TemporalConstraintDetailView' })

const props = defineProps({
  constraintKey: { type: String, required: true }
})

const router = useRouter()
const { formHeadList } = storeToRefs(useFormHeadStore())
const temConstraintsStore = useTemConstraintsListStore()
const { temConstraintsList } = storeToRefs(temConstraintsStore)

const constraint = computed(() => temConstraintsList.value.find(
  (item) => String(item.key) === String(props.constraintKey)
))

const saveConstraint = (updates) => {
  if (!temConstraintsStore.updateTemConstraints(props.constraintKey, updates)) {
    message.error('时态约束已不存在，无法保存')
    return
  }

  message.success('时态约束已保存')
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

.missing-state {
  padding: 40px 24px;
  text-align: center;
}

.missing-state p {
  margin: 10px 0 22px;
  color: var(--sts-ink-secondary);
}
</style>
