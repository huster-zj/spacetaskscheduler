<!-- 使用说明： 
 :toPath=""，传递点击按钮后跳转至哪个页面
 :btnWidth=''，传递按钮宽度
 :btnText=''，传递按钮内文本内容 
import RouterBtn from '@/components/button/router-button.vue'
 -->

<template>
  <RouterLink :to="toPath1">
    <div class="custom_btn" :style='{ width: btnWidth1 }' >{{ btnText1}}</div>
    <!-- <div class="custom_btn" :style='{ width: btnWidth1 }' @click="addDataLength">{{ btnText1}}</div> -->
  </RouterLink>
</template>

<script setup>
import { ref,defineProps } from 'vue';

let props = defineProps({
  toPath: {
    type: String,
    required: true
  },
  btnWidth: {
    type: String,
    default: '90px'
  },
  btnText: {
    type: String,
    default: '自定义'
  },
  // dataLength: {
  //   type: Number,
  //   default: 0
  // }
})

let { toPath:toPath1, btnWidth:btnWidth1,btnText:btnText1 } = props
// let { toPath:toPath1, btnWidth:btnWidth1,btnText:btnText1, dataLength:dataLength1 } = props
toPath1 = ref(toPath1);
btnWidth1 = ref(btnWidth1);
// dataLength1 = ref(dataLength1);

// function addDataLength() {
//   // dataLength1 += 1;
//   dataLength1.value += 1;
// }

</script>

<style scoped>
.custom_btn {
  display: inline-flex;
  min-width: 80px;
  min-height: 36px;
  align-items: center;
  justify-content: center;
  margin: 0;
  font-size: 14px;
  text-align: center;
  color: #ffffff;
  border: 1px solid var(--sts-primary);
  border-radius: var(--sts-radius-md);
  padding: 6px 14px;
  background: var(--sts-primary);
  font-weight: 500;
}

.custom_btn:hover {
  border-color: var(--sts-primary-hover);
  background: var(--sts-primary-hover);
  color: #ffffff;
}
</style>
