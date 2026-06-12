<template>
  <Steps :current_page="page" />
  <!-- <h1 style="color: red;">点击模态框的确定按钮，需跳转至主视图界面</h1> -->
  <div class="target">
    <div class="target-title">目标：</div>
    <div class="target-content">
      <a-radio-group v-model:value="valueTarget" name="targetRadioGroup">
        <a-radio v-for="item in targetList" :key="item.key" :value="item.key" :disabled="disabled">{{ item.target_name
          }}</a-radio>
      </a-radio-group>
    </div>
  </div>
  <div class="algorithms">
    <div class="algorithms-title">算法：</div>
    <div class="algorithms-content">
      <a-radio-group @change="handelChangeAlgorithm" v-model:value="valueAlgorithm" name="algorithmsRadioGroup">
        <a-radio v-for="item in algorithmsList" :key="item.key" :value="item.key" style="display:flex ;">
          {{ item.algorithm_name }}：
          <span class="algorithm_note">
            {{ item.algorithm_note }}
          </span>
        </a-radio>
      </a-radio-group>
    </div>
  </div>
  <div class="box">
    <RouterLink>
      <a-button type="primary" @click="handleRun" class="btn">运行</a-button>
    </RouterLink>
  </div>
  <a-modal v-model:visible="visible" ok-text="确定" :footer="footer" wrapClassName="result_modal">
    <!-- 使用title插槽实现自定义标题样式 -->
    <template #title>
      <div class="custom_title">{{ result }}</div>
    </template>
    <!-- 使用 pre 标签展示输出内容，保留格式 -->
    <pre class="output-content">{{ outputContent }}</pre>

    <footer class="footer">
      <RouterLink to="/main_view">
        <a-button type="primary" @click="handleSure" class="btn">确定</a-button>
      </RouterLink>
    </footer>
  </a-modal>
</template>

<script setup>
import { ref } from 'vue';
import Steps from '@/components/Steps.vue'
import { message } from 'ant-design-vue';
import AlgorithmService from '@/services/Algorithm.js'
import eventBus from '@/utils/eventBus.js';
const page = ref(8)    // 当前所在页面对应的value,计数从0开始,传递给Steps组件


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
  { key: '2', algorithm_name: '求解器-COPT', algorithm_note: '只能求解资源供大于需的问题，可能无解，解较优' },
  { key: '3', algorithm_name: '分支定价切割算法', algorithm_note: '可求解资源供小于需的问题，解最优，计算时间长' },
];
const valueAlgorithm = ref(algorithmsList[2].key);
function handelChangeAlgorithm() {
  console.log('value', valueAlgorithm.value);
  if (valueAlgorithm.value === algorithmsList[0].key) {
    // 当算法为基于优先级的启发式算法时，控制目标配置不可选
    disabled.value = true;
  } else {
    disabled.value = false;
  }
}

// 算法运行结果数据、控制模态框显示样式
const visible = ref(false);    // 控制模态框显示
const footer = ref(false);    // 控制模态框底部默认按钮不显示
const result = ref('算法运行结果')
const outputContent = ref('')

function handleSure() {
  visible.value = false
}

// 运行按钮
async function handleRun() {
  try {
    // 检查是否选择了启发式算法
    if (valueAlgorithm.value !== '1') {
      message.warning('目前只支持基于优先级的调度启发式算法')
      return
    }

    console.log('开始运行算法...')

    // 调用算法服务
    const result = await AlgorithmService.executeAlgorithm()

    if (result.success) {
      console.log('算法执行成功:', result.data)

      // 从返回结果中获取输出文本并显示
      if (result.data && result.data.output_text) {
        outputContent.value = result.data.output_text
        visible.value = true
        message.success('算法执行成功')
        // 触发更新事件
        eventBus.emit('algorithmSuccess')
      } else {
        throw new Error('未获取到算法输出结果')
      }
    } else {
      console.error('算法执行失败:', result.message)
      message.error(result.message || '算法执行失败')
    }
  } catch (error) {
    console.error('运行过程出错:', error)
    message.error('运行出错: ' + error.message)
  }
}
</script>

<style scoped>
/* 运行-目标、算法配置样式 */
.target,
.algorithms {
  display: flex;
  margin: 30px 0 20px 100px;
}

.target .target-title,
.algorithms .algorithms-title {
  font-size: 20px;
  font-weight: bold;
}

.target .target-content .ant-radio-wrapper,
.algorithms .algorithms-content .ant-radio-wrapper {
  font-size: 20px;
  margin: 0 20px 20px 20px;
}

/* 运行-算法备注样式 */
/* .algorithms .algorithms-content .algorithm_note {
  display: flex;
  margin: 10px 0 0 20px;
  background-color: palegoldenrod;
} */

/* 运行按钮样式 */
/* 保存按钮样式 */
.box {
  display: flex;
  justify-content: center;
  margin-top: 40px;
}

.btn {
  height: 40px;
  font-size: 18px;
  color: #2e2e2e;
  border: 1.5px solid hsl(0, 1%, 57%);
  border-radius: 10px;
  padding: 5px 15px;
  background-color: #f7f8fa;
}

/* 模态框样式 */
li {
  list-style: none;
}

/* 模态框标题样式 */
.result_modal {
  display: flex;
  align-items: center;
}

.result_modal .custom_title {
  /* background-color: pink; */
  font-size: 25px;
  height: 40px;
  line-height: 40px;
  text-align: center;
}

/* 模态框内容样式 */
.result_modal ul {
  /* background-color: pink; */
  margin: 0px;
  padding: 0;
}

.result_modal .result_taskList {
  /* background-color: pink; */
  border-bottom: 1px solid #f0f0f0;
  padding: 10px 0 10px 15px;
  font-size: 20px;
}

/* 模态框底部样式 */
.footer {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}
</style>