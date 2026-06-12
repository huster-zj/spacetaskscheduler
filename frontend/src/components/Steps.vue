<!-- 
 :current_page='',传递当前所在页面对应的value,计数从0开始
 import Steps from './components/Steps.vue' 
 -->

<template>
  <!-- <h1 style="color:red;text-align: center;">
    TODO：在计算可行时间窗步骤条中：需完成嵌入计算可行时间窗的逻辑/算法
    <br />
    TODO2: 计算可行时间窗没有对应界面就无法点击跳转,实现在某个特定的界面是处于当前"计算可行时间窗"步骤,故暂时删除"计算可行时间窗"步骤
  </h1> -->
  <div class="steps_box">
    <a-steps v-model:current="current" @change="toPath">
      <!-- 点状导航条样式 -->
      <template #progressDot="{ index, status, prefixCls }">
        <a-popover>
          <template #content>
            <span>step {{ index }} status: {{ status }}</span>
          </template>
          <span :class="`${prefixCls}-icon-dot`" />
        </a-popover>
      </template>
      <!-- 导航内容 -->
      <a-step title="新建规划包" description="导航栏-新建" class="bigDot" />
      <a-step title="资源" description="导航栏-资源" class="bigDot short_distance" />
      <a-step title="定义资源" description="导入/自定义" class="smallDot short_distance left_move" />
      <a-step title="定义资源组" description="选择策略自动生成/自定义" class="smallDot left_move" />
      <a-step title="任务" description="导航栏-任务" class="bigDot short_distance" />
      <a-step title="定义任务" description="导入/自定义,导入或定义完成后需计算可行时间窗" class="smallDot short_distance left_move" />
      <!-- <a-step title="计算可行时间窗" description="点击计算可行时间窗按钮" class="smallDot short_distance left_move" /> -->
      <a-step title="定义时态约束" description="导航栏-时态约束" class="smallDot short_distance left_move" />
      <a-step title="定义逻辑约束" description="自定义" class="smallDot left_move" />
      <a-step title="算法" description="导航栏-运行" class="bigDot" />
      <a-step title="查看报告" description="导航栏-报告" class="bigDot" />
    </a-steps>
  </div>
</template>

<script setup>
import { ref, toRef } from 'vue'
import { useRouter } from 'vue-router';

// 接收父组件传递当前在哪个步骤
// let props = defineProps({
//   current_page: {
//     type: Number,
//     Required: false,
//     default: 0
//   }
// })
let props = defineProps({
  current_page: {
    type: Number,
    Required: true,
  }
})

let { current_page: current_page1 } = props   // 当前步骤，步骤计数从0开始
console.log('current:', current_page1);
const current = ref(current_page1)    // 转化为ref类型,便于实时更新

// if (current_page1) {
//   current.value = current_page1
// } else {
//   current.value = 0
// }
// const current = current_page1    
// 步骤条导航点击事件
const router = useRouter()
function toPath() {
  console.log('current:', current.value)
  switch (current.value) {
    case 0:
      console.log('新建规划包')
      router.push('/attributes')
      break
    case 1:
      console.log('资源')
      router.push('/resource')
      break
    case 2:
      console.log('定义资源')
      router.push('/resource')
      break
    case 3:
      console.log('定义资源组')
      router.push('/resource_group')
      break
    case 4:
      console.log('任务')
      router.push('/task')
      break
    case 5:
      console.log('计算可行时间窗')
      // 嵌入计算可行时间窗的逻辑/算法
      break
    case 6:
      console.log('定义时态约束')
      router.push('/temporal_constraint')
      break
    case 7:
      console.log('定义逻辑约束')
      router.push('/logical_constraint')
      break
    case 8:
      console.log('算法')
      router.push('/operating')
      break
    case 9:
      console.log('查看报告')
      router.push('/report')
      break
  }
}

</script>

<style scoped>
/* 步骤条整体位置布局 */
.steps_box {
  margin-top: 50px;
  margin-bottom: 20px;
}

/* 圆点上下居中，左右居中 */
.bigDot :deep(.ant-steps-item-icon) {
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 大圆点样式 */
.bigDot :deep(.ant-steps-item-icon .ant-steps-icon-dot) {
  width: 15px;
  height: 15px;
  line-height: 32px;
  border-radius: 50%;
}

/* 小圆点样式 */
.smallDot :deep(.ant-steps-item-icon .ant-steps-icon-dot) {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

/* 距离缩小，设置中间的横线宽度减小 */
:deep(.ant-steps-dot .short_distance .ant-steps-item-tail::after) {
  width: calc(100% - 80px);
  /* 正常的宽度为100% - 20px */
  height: 3px;
  /* border-radius: 50%; */
}

/* 横线宽度减小，对应的右边的盒子需往左移 */
:deep(.ant-steps-item.ant-steps-item-finish.left_move) {
  margin-left: -59px;
  /* 短距离右边的盒子需要往左移才能保证无间距，应为上面设计减少的宽度60px */
}

:deep(.ant-steps-item.ant-steps-item-active.left_move) {
  margin-left: -59px;
}

:deep(.ant-steps-item.ant-steps-item-wait.left_move) {
  margin-left: -59px;
}

:deep(.ant-steps-item.ant-steps-item-prpcess.left_move) {
  margin-left: -59px;
}
</style>