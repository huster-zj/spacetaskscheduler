<template>
  <Steps :current_page="page" />
  <section class="page-shell operating-page">
    <header class="page-header">
      <h1 class="page-heading">运行配置</h1>
    </header>
    <div class="target surface-panel">
      <div class="target-title section-heading">目标</div>
      <div class="target-content">
        <a-radio-group v-model:value="valueTarget" name="targetRadioGroup" class="option-stack">
          <a-radio v-for="item in targetList" :key="item.key" :value="item.key" :disabled="disabled">{{ item.target_name
            }}</a-radio>
        </a-radio-group>
      </div>
    </div>
    <div class="algorithms surface-panel">
      <div class="algorithms-title section-heading">算法</div>
      <div class="algorithms-content">
        <a-alert
          class="algorithm-capability"
          type="info"
          show-icon
          message="目前仅接入启发式算法"
          description="其他算法选项暂不可运行。"
        />
        <a-radio-group @change="handelChangeAlgorithm" v-model:value="valueAlgorithm" name="algorithmsRadioGroup" class="option-stack">
          <a-radio v-for="item in algorithmsList" :key="item.key" :value="item.key" :disabled="item.disabled" class="algorithm-option">
            <span class="algorithm-name">{{ item.algorithm_name }}</span>
            <span class="algorithm_note">{{ item.algorithm_note }}</span>
          </a-radio>
        </a-radio-group>
      </div>
    </div>
    <div class="box">
      <a-button type="primary" :loading="running" :disabled="running" @click="handleRun" class="btn">运行</a-button>
      <span v-if="runStatus" class="run-status" role="status">{{ runStatus }}</span>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue';
import Steps from '@/components/Steps.vue'
import { message } from 'ant-design-vue';
import AlgorithmService from '@/services/Algorithm.js'
import PreprocessService from '@/services/Preprocess.js'
import { useAlgorithmOutputStore } from '@/stores/useAlgorithmOutput.js'
import eventBus from '@/utils/eventBus.js';
import router from '@/router'
import { parseOutputContent } from '@/services/ParseFile.js'

defineOptions({ name: 'PlanningOperatingView' })

const page = ref(8)    // 当前所在页面对应的value,计数从0开始,传递给Steps组件
const algorithmOutputStore = useAlgorithmOutputStore()


// 目标配置
const disabled = ref(false);      // 控制目标配置是否可选
const targetList = [
  { key: '1', target_name: '最小弧段申请' },
  { key: '2', target_name: '最大完成度' },
];
const valueTarget = ref(targetList[0].key);

// 算法配置
const algorithmsList = [
  { key: '1', algorithm_name: '基于优先级的调度启发式算法', algorithm_note: '可求解资源供小于需的问题，可能存在部分任务未安排，无需配置目标，计算时间短' },
  { key: '2', algorithm_name: '求解器-COPT', algorithm_note: '只能求解资源供大于需的问题，可能无解，解较优', disabled: true },
  { key: '3', algorithm_name: '分支定价切割算法', algorithm_note: '可求解资源供小于需的问题，解最优，计算时间长', disabled: true },
];
const valueAlgorithm = ref(algorithmsList[0].key);
disabled.value = true
function handelChangeAlgorithm() {
  console.log('value', valueAlgorithm.value);
  if (valueAlgorithm.value === algorithmsList[0].key) {
    // 当算法为基于优先级的启发式算法时，控制目标配置不可选
    disabled.value = true;
  } else {
    disabled.value = false;
  }
}

const running = ref(false)
const runStatus = ref('')

// 运行按钮
async function handleRun() {
  if (running.value) return

  try {
    // 检查是否选择了启发式算法
    if (valueAlgorithm.value !== '1') {
      message.warning('目前只支持基于优先级的调度启发式算法')
      return
    }

    algorithmOutputStore.clearOutput()
    running.value = true
    runStatus.value = '正在预处理当前规划包...'
    message.loading({ content: '正在预处理当前规划包...', duration: 0, key: 'planning-run' })

    const preprocessResult = await PreprocessService.preprocessTaskTimewindow()
    if (!preprocessResult.success) {
      message.error({
        content: `预处理失败：${preprocessResult.message || '请检查任务与资源数据'}`,
        key: 'planning-run'
      })
      runStatus.value = '预处理失败'
      return
    }

    runStatus.value = '预处理完成，正在运行启发式算法...'
    message.loading({ content: '正在运行启发式算法...', duration: 0, key: 'planning-run' })
    const result = await AlgorithmService.executeAlgorithm()

    if (result.success) {
      console.log('算法执行成功:', result.data)

      const outputText = result.data?.output_text || ''
      const parsedOutput = parseOutputContent(outputText)
      if (!outputText.trim()) {
        throw new Error('未获取到算法输出结果')
      }
      if (parsedOutput.parsingStatus === 'error') {
        message.error({ content: parsedOutput.parsingError, key: 'planning-run' })
        runStatus.value = '算法输出解析失败'
        return
      }

      message.success({ content: '预处理与算法执行成功，正在打开调度结果', key: 'planning-run' })
      runStatus.value = '运行完成'
      eventBus.emit('algorithmSuccess')
      await router.push({ name: 'result' })
    } else {
      console.error('算法执行失败:', result.message)
      message.error({ content: `算法执行失败：${result.message || '未知错误'}`, key: 'planning-run' })
      runStatus.value = '算法执行失败'
    }
  } catch (error) {
    console.error('运行过程出错:', error)
    message.error({ content: `运行出错：${error.message}`, key: 'planning-run' })
    runStatus.value = '运行失败'
  } finally {
    running.value = false
  }
}
</script>

<style scoped>
/* 运行-目标、算法配置样式 */
.target,
.algorithms {
  display: grid;
  grid-template-columns: 120px minmax(0, 1fr);
  gap: 20px;
  margin: 16px 0 0;
  padding: 20px;
}

.target .target-title,
.algorithms .algorithms-title {
  padding-top: 2px;
}

.target .target-content .ant-radio-wrapper,
.algorithms .algorithms-content .ant-radio-wrapper {
  margin: 0;
  font-size: 14px;
}

.option-stack {
  display: grid;
  gap: 14px;
}

.algorithm-option {
  display: flex;
  align-items: flex-start;
}

.algorithm-name {
  display: block;
  color: var(--sts-ink-primary);
  font-weight: 600;
}

.algorithm_note {
  display: block;
  margin-top: 2px;
  color: var(--sts-ink-secondary);
  line-height: 1.6;
}

/* 运行按钮样式 */
/* 保存按钮样式 */
.box {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  gap: 8px;
  margin-top: 24px;
}

.algorithm-capability {
  margin-bottom: 16px;
}

.btn {
  min-width: 96px;
}

.run-status {
  min-height: 20px;
  color: var(--sts-ink-secondary);
  font-size: 13px;
}

@media (max-width: 767px) {
  .target,
  .algorithms {
    grid-template-columns: 1fr;
    gap: 12px;
    padding: 16px;
  }
}
</style>
