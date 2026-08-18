<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <section class="workflow-strip" :data-current-step="current" aria-label="规划流程">
    <div class="workflow-strip__heading">
      <span>规划流程</span>
      <strong class="workflow-strip__current">{{ currentStepTitle }}</strong>
    </div>
    <div class="workflow-strip__scroll">
      <ol class="workflow-steps">
        <li
          v-for="(step, index) in steps"
          :key="step.title"
          :class="[
            'workflow-step',
            `workflow-step--${step.group}`,
            `workflow-step--${step.kind}`,
            {
              'workflow-step--group-end': step.groupEnd,
              'workflow-step--complete': index < current,
              'workflow-step--current': index === current,
              'workflow-step--upcoming': index > current
            }
          ]"
          :style="{
            '--workflow-step-color': step.color,
            '--workflow-line-color': step.lineColor
          }"
        >
          <button
            class="workflow-step__button"
            type="button"
            :aria-current="index === current ? 'step' : undefined"
            :aria-disabled="!step.path ? 'true' : undefined"
            :aria-label="step.title"
            :disabled="!step.path"
            @click="toPath(index)"
          >
            <span class="workflow-step__marker-row" aria-hidden="true">
              <span class="workflow-step__marker"></span>
            </span>
            <span class="workflow-step__title">{{ step.title }}</span>
          </button>
          <span v-if="index < steps.length - 1" class="workflow-step__connector" aria-hidden="true"></span>
        </li>
      </ol>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  current_page: {
    type: Number,
    required: true
  }
})

const steps = [
  { title: '新建规划包', path: '/attributes', group: 'package', kind: 'major', groupEnd: true, color: '#176b87', lineColor: '#79aebe' },
  { title: '资源', path: '/resource', group: 'resource', kind: 'major', groupEnd: false, color: '#2e7d68', lineColor: '#83b7a7' },
  { title: '定义资源', path: '/resource', group: 'resource', kind: 'minor', groupEnd: false, color: '#2e7d68', lineColor: '#83b7a7' },
  { title: '定义资源组', path: '/resource_group', group: 'resource', kind: 'minor', groupEnd: true, color: '#2e7d68', lineColor: '#83b7a7' },
  { title: '任务', path: '/task', group: 'task', kind: 'major', groupEnd: false, color: '#a66d18', lineColor: '#d1aa70' },
  { title: '定义任务', path: null, group: 'task', kind: 'minor', groupEnd: false, color: '#a66d18', lineColor: '#d1aa70' },
  { title: '定义时态约束', path: '/temporal_constraint', group: 'task', kind: 'minor', groupEnd: false, color: '#a66d18', lineColor: '#d1aa70' },
  { title: '定义逻辑约束', path: '/logical_constraint', group: 'task', kind: 'minor', groupEnd: true, color: '#a66d18', lineColor: '#d1aa70' },
  { title: '算法', path: '/operating', group: 'algorithm', kind: 'major', groupEnd: true, color: '#665b91', lineColor: '#aaa1c8' },
  { title: '查看报告', path: '/report', group: 'algorithm', kind: 'major', groupEnd: false, color: '#665b91', lineColor: '#aaa1c8' }
]

const router = useRouter()
const current = computed(() => props.current_page)
const currentStepTitle = computed(() => steps[current.value]?.title || '工作台')

const toPath = (index) => {
  const target = steps[index]
  if (target?.path) {
    router.push(target.path)
  }
}
</script>

<style scoped>
.workflow-strip {
  display: flex;
  width: min(calc(100% - 48px), 1320px);
  margin: 16px auto 0;
  padding: 10px 14px 11px;
  align-items: center;
  gap: 18px;
  border: 1px solid var(--sts-border);
  border-radius: var(--sts-radius-lg);
  background: var(--sts-surface-raised);
  box-shadow: var(--sts-shadow-sm);
}

.workflow-strip__heading {
  display: grid;
  min-width: 84px;
  flex: 0 0 auto;
  gap: 2px;
  color: var(--sts-ink-muted);
  font-size: 12px;
  font-weight: 600;
  line-height: 1.3;
}

.workflow-strip__current {
  overflow: hidden;
  color: var(--sts-ink-primary);
  font-size: 13px;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.workflow-strip__scroll {
  min-width: 0;
  flex: 1;
  overflow-x: auto;
  overscroll-behavior-x: contain;
  scrollbar-width: thin;
}

.workflow-steps {
  display: flex;
  width: 1128px;
  min-width: 1128px;
  margin: 0 auto;
  padding: 3px 0 0;
  list-style: none;
}

.workflow-step {
  position: relative;
  flex: 0 0 88px;
  min-width: 0;
}

.workflow-step--group-end {
  flex-basis: 152px;
}

.workflow-step:last-child {
  flex-basis: 80px;
}

.workflow-step__button {
  display: flex;
  position: relative;
  z-index: 1;
  width: 80px;
  align-items: center;
  flex-direction: column;
  gap: 4px;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--sts-ink-secondary);
  cursor: pointer;
  transition: color var(--sts-transition-fast), opacity var(--sts-transition-fast);
}

.workflow-step__button:disabled {
  cursor: default;
}

.workflow-step__marker-row {
  display: flex;
  width: 80px;
  height: 14px;
  align-items: center;
  justify-content: center;
}

.workflow-step__marker {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--workflow-step-color);
  box-shadow: 0 0 0 3px var(--sts-surface-base);
  transition: width var(--sts-transition-fast), height var(--sts-transition-fast),
    background-color var(--sts-transition-fast), box-shadow var(--sts-transition-fast);
}

.workflow-step--major .workflow-step__marker {
  width: 14px;
  height: 14px;
}

.workflow-step__button[aria-current='step'] .workflow-step__marker {
  box-shadow: 0 0 0 3px var(--sts-surface-base), 0 0 0 5px var(--workflow-line-color);
}

.workflow-step--complete .workflow-step__marker {
  background: var(--workflow-line-color);
}

.workflow-step--upcoming .workflow-step__marker {
  opacity: 0.62;
}

.workflow-step--upcoming .workflow-step__title {
  color: var(--sts-ink-muted) !important;
}

.workflow-step--current .workflow-step__title {
  color: var(--sts-ink-primary) !important;
  font-weight: 700;
}

.workflow-step__connector {
  position: absolute;
  z-index: 0;
  top: 6px;
  left: 48px;
  width: calc(100% - 16px);
  height: 2px;
  background: var(--workflow-line-color);
}

.workflow-step__title {
  color: var(--sts-ink-secondary) !important;
  font-size: 12px;
  font-weight: 500;
  line-height: 18px;
  white-space: nowrap;
}

.workflow-step--major .workflow-step__title {
  color: var(--workflow-step-color) !important;
  font-weight: 600;
}

@media (max-width: 767px) {
  .workflow-strip {
    width: calc(100% - 24px);
    margin-top: 12px;
    padding: 9px 10px 10px;
    gap: 10px;
  }

  .workflow-strip__heading {
    min-width: 72px;
  }
}
</style>
