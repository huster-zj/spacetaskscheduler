<template>
  <section class="page-shell editor-page">
    <header class="page-header">
      <h1 class="page-heading">编辑资源组</h1>
    </header>
    <div class="box surface-panel">
      <div class="name-note">
      <span class="text">资源组名称：</span>
      <a-input v-model:value="groupItem.resourceGroupName" placeholder="请输入资源组名称"/>
      <span class="text">资源类型：</span>
      <a-input v-model:value="groupItem.resourceType" placeholder="请输入资源类型"/>
      <span class="text">备注：</span>
      <a-input v-model:value="groupItem.resourceGroupNote" placeholder="请输入资源组备注"/>
      </div>
      <NameActionTable :columns="columns" :includeList="groupItem.includeResourceList" :excludeList="groupItem.excludeResourceList" />
      <div class="saveBtn">
        <RouterBtn toPath="/resource_group" btnWidth="80px" btnText="保存" />
      </div>
    </div>
  </section>
</template>

<script setup>
import { reactive } from 'vue';
import RouterBtn from '@/components/button/router-button.vue'
import NameActionTable from '@/components/table/name_action_table.vue'; // 确保导入的组件名称正确
import { useResourceGroupListStore } from '@/stores/useResourceGroupListStore.js'

const { customResourceGroupList } = useResourceGroupListStore();

// 获取传递过来的数据
let props = defineProps({
  name: {
    type: String,
    required: true
  }
})
let {name:group_name} = props
// 获取与之匹配的详情页数据
const findGroupItem = (group_name, customResourceGroupList) => {
  return customResourceGroupList.find(item => item.resourceGroupName === group_name)
}
let groupItem = findGroupItem(group_name, customResourceGroupList)

// 列表行标题
let columns = reactive([
  {
    title: '资源名称',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: '操作',
    dataIndex: 'action',
    key: 'action',
  }
])
// 定义当前调度计划中包含的所有资源，便于显示已包含和未包含的资源组
let allResourceList = reactive([{
  key: '1',
  name: '资源1'
},
{
  key: '2',
  name: '资源2'
},
{
  key: '3',
  name: '资源3'
},
{
  key: '4',
  name: '资源4'},
])


</script>

<style scoped>
.box {
  padding: 24px;
}
.box .name-note {
  display: grid;
  grid-template-columns: max-content minmax(180px, 1fr) max-content minmax(180px, 1fr) max-content minmax(180px, 1fr);
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}
.box .name-note .text {
  color: var(--sts-ink-secondary);
  font-size: 14px;
  font-weight: 600;
}
.box .name-note .ant-input {
  width: 100%;
}
.box .saveBtn {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.page-header {
  margin-bottom: 16px;
}

@media (max-width: 900px) {
  .box .name-note {
    grid-template-columns: max-content minmax(0, 1fr);
  }
}

@media (max-width: 767px) {
  .box {
    padding: 16px;
  }

  .box .name-note {
    grid-template-columns: 1fr;
    gap: 6px;
  }
}
</style>
