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
  /* background-color: pink; */
  margin-right: 30px;
  height: 40px;
  font-size: 18px;
  text-align: center;
  color: #2e2e2e;
  border: 1.5px solid hsl(0, 1%, 57%);
  border-radius: 10px;
  padding: 5px 10px;
  background-color: #ffffff;
}
</style>