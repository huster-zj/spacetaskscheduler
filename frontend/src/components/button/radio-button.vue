<!-- 使用说明： 
 :radio_beforeText=""，传递单选框前面的内容
 :radio_selection=''，传递单选框要显示的数据
import RadioBtn from '@/components/button/radio-button.vue'
  -->

<template>
 <div class="radio">
    <span class="radio_text">{{ radio_beforeText1 }}</span>
    <div class="radio_selection">
      <a-radio-group v-model:value="radioValue" name="radioGroup">
        <a-radio v-for="item in radio_selection1" :key="item.id" :value="item.value">{{ item.label }}</a-radio>
      </a-radio-group>
    </div>
  </div>
  <!-- <button @click="outputData">点击输出选中的选项数据</button> -->
</template>

<script setup>
import { ref, reactive,defineProps, onMounted } from 'vue';

let props = defineProps({
  // 下拉框前的文字
  radio_beforeText: {
    type: String,
    default: null,
  },
  // 下拉框中的内容
  radio_selection: {
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

let {radio_beforeText:radio_beforeText1,radio_selection:radio_selection1,special_result:special_result1 } = props
radio_beforeText1 = ref(radio_beforeText1)
radio_selection1 = reactive(radio_selection1)

const radioValue = ref(radio_selection1[0].value)
onMounted(()=>{if(special_result1){
  console.log('special_result1',special_result1);
  
  radioValue.value = special_result1
  // radioValue.value = 'bdebvhedb'
  console.log('更新radioValue',radioValue.value);
}})
function outputData() {
  console.log('选中的选项数据：', radioValue.value)
}


defineExpose({
  radioValue
})

</script>

<style scoped>
.radio {
  display: flex;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 12px 20px;
  margin: 0;
}

.radio .radio_text {
  color: var(--sts-ink-secondary);
  font-size: 14px;
  font-weight: 600;
}

.radio .radio_selection .ant-radio-wrapper {
  margin: 0 20px 8px 0;
  font-size: 14px;
}
</style>
