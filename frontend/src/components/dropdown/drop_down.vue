<!-- 使用说明： 
 :before_select_text=""，传递下拉框前面的内容
 :selectList=''，传递下拉框中要显示的数据
 slot name=special_content，编写下拉框后面的界面特殊的内容
import Dropdown from '@/components/dropdown/drop_down.vue'
  -->

<template>
  <!-- 策略模块 -->
   <div class="dropdown_box">
    <div class="dif_text">
      <span class="text_name">{{ before_select_text1 }}</span>
        <a-select
          ref="select"
          v-model:value="selectValue"
          class="dropdown-select"
        >
          <a-select-option v-for="item in selectList" :key="item.id" :value="item.value">
            {{ item.label }}
          </a-select-option>
        </a-select>
        <slot name="special_content"></slot>
    </div>
   </div>
  
</template>

<script setup>
import { ref, reactive,onMounted,defineProps } from 'vue';

// 接收父组件传递的 props
let props = defineProps({
  // 下拉框前的文字
  before_select_text: {
    type: String,
    required: true,
  },
  // 下拉框中的内容
  selectList: {
    type: Array,
    required: true,
  },
  // 接收父组件传递的 props，即特定的内容显示
  special_result: {
    type: String,
    required: false,
    default: null
  }
})
// console.log('selectList',selectList);
let {before_select_text:before_select_text1,selectList:selectList1,special_result:special_result1} = props
before_select_text1 = ref(before_select_text1)
selectList1 = reactive(selectList1)

// 默认选中第一个选项或显示父组件指定的值
let selectValue = ref(null)
onMounted(() => {
  if(selectList1.length>0){
  // console.log('selectList1[0].value',selectList1[0].value);
  selectValue.value = selectList1[0].value}
  if(special_result1){
  selectValue.value = special_result1
  // console.log('special_result1',special_result1);
}
})

// 暴露所有想要给父组件访问的数据和方法
defineExpose({
  selectValue
})


</script>


<style scoped>
/* 策略部分-样式 */
.dropdown_box {
  display: flex;
  align-items: center;
  width: auto;
  max-width: 100%;
  margin: 0;
  font-size: 14px;
}

.dropdown_box .dif_text {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.dropdown_box .dif_text .text_name {
  color: var(--sts-ink-secondary);
  font-size: 14px;
  font-weight: 600;
}

.dropdown-select {
  width: 150px;
}

.dropdown_box .dif_text :deep(.ant-select-selection-item) {
  font-size: 14px;
}

.dropdown_box .ant-btn {
  margin: 0;
}
</style>
