<template>
  <div class="page-shell detail-list-page">
    <div class="header">
      <h1 class="page-heading">{{ cekongResourceDetail.visible_time_window[0].station }}对{{ cekongResourceDetail.visible_time_window[0].craft }}的可见性报告</h1>
    </div>
    <div class="detail">
      <ShowTable :columns="columns" :data="dataSource" :searchIsShow=false />
    </div>
  </div>
</template>

<script setup>
import ShowTable from '@/components/table/show_table.vue'
import { useCekongResourceListStore } from '@/stores/useCekongResourceListStore.js'

const columns = [
  {
    title: '开始历元',
    dataIndex: 'start_time',
    key: 'start_time',
  },
  {
    title: '结束历元',
    dataIndex: 'end_time',
    key: 'end_time',
  },
  {
    title: '持续时长',
    dataIndex: 'duration',
    key: 'duration',
  },
]

// 接收路由传递的参数
let props_route = defineProps({
  cekong_resource_key: {
    type: String,
    required: true
  },
  cekong_resource_name: {
    type: String,
    required: true
  }
})

// 根据路由传递的参数，获取当前测控资源的详细信息
const { cekongResourceList } = useCekongResourceListStore();
let cekongResourceDetail = cekongResourceList.find(item => item.key === props_route.cekong_resource_key)
console.log('cekongResourceDetail:',cekongResourceDetail);

// 将匹配到的测控资源信息提取必要数据赋值给dataSource
const propertiesToRemove = ['station', 'craft'];      // 要删除的属性列表
// 处理后的数据
const dataSource = cekongResourceDetail.visible_time_window.map(item => {
  const newItem = { ...item };
  propertiesToRemove.forEach(prop => {
    delete newItem[prop];
  });
  return newItem;
});

</script>

<style scoped>
.header {
  margin-bottom: 16px;
}

</style>
