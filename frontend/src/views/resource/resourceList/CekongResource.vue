<!--
 * @Author: Jerry
 * @Date: 2025-01-11 10:33:55
 * @LastEditors: Do not edit
 * @LastEditTime: 2025-03-11 10:33:58
 * @FilePath: \spacetaskscheduler\src\views\resource\resourceList\CekongResource.vue
-->
<template>
  <div class="box">
    <!-- <h1 style="color: red;text-align: center;">TODO：导入的测控资源一定会被当成新的资源，没有判断导入的资源是否已经在列表中</h1> -->
    <SelectTable :columns="columns" :data="cekongResourceList1" :addBtnisShow="addBtnisShow" @addToResourceList="handleAddToResourceList">
      <template #column_name="record">
        <RouterLink :to="{name:'cekong_resource_detail',params:{cekong_resource_key:record.column1.key,cekong_resource_name:record.column1.cekong_resource_name}}" >
          <span class="cekong_resource_detail_link">{{ record.column1.cekong_resource_name }}</span>
        </RouterLink>
      </template>
    </SelectTable>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import SelectTable from '@/components/table/select_table.vue'
import { useCekongResourceListStore } from '@/stores/useCekongResourceListStore.js'
import ResourceTransferService from '@/services/ResourceTransfer.js'
import ResourceViewTransfer from '@/services/ResourceViewTransfer.js'

// 表格数据
const columns = reactive([
  {
    title: '资源名称',
    dataIndex: 'cekong_resource_name',
    key: 'name'
  },
  {
    title: '最小可见时长',
    dataIndex: 'min_visible_duration',
    key: 'min_visible_duration'
  },
  {
    title: '最大可见时长',
    dataIndex: 'max_visible_duration',
    key: 'max_visible_duration'
  },
  {
    title: '平均可见时长',
    dataIndex: 'avg_visible_duration',
    key: 'avg_visible_duration'
  },
  {
    title: '总时长',
    dataIndex: 'sum_visible_duration',
    key: 'sum_visible_duration'
  }
]);

const { cekongResourceList } = useCekongResourceListStore();
const cekongResourceList1 = reactive(cekongResourceList);

const addBtnisShow = ref(true);

// 处理添加至资源列表
const resourceTransfer = new ResourceTransferService()
const handleAddToResourceList = (selectedRows) => {
  console.log('添加至资源列表', selectedRows);
  // 调用服务处理数据转移
  const result = resourceTransfer.transferCekongResources(selectedRows)
  
  if (result.success) {
    console.log('资源转移成功:', result)
    // 从当前列表中删除选中的行数据
    selectedRows.forEach(row => {
      const index = cekongResourceList1.findIndex(item => item.key === row.key);
      if (index !== -1) {
        cekongResourceList1.splice(index, 1);
      }
    });
  } else {
    console.error('资源转移失败:', result.message)
  }

  // 创建实例和获取 store
  const resourceViewTransfer = new ResourceViewTransfer();
  
  // 先执行数据转换
  const result2 = resourceViewTransfer.transferToResourceView();
  if (!result2.success) {
    console.error('资源数据转换失败:', result2.message);
  }
};

</script>

<style scoped>
/* .box {
  margin-top: 40px;
} */
/* 显示可通过点击测控资源名称进入该测控资源详情页 */
.cekong_resource_detail_link {
  color: #1890ff;
  cursor: pointer;
}
</style>