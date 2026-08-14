<template>
  <section class="page-shell editor-page">
    <header class="page-header">
      <h1 class="page-heading">新建资源组</h1>
    </header>
    <div class="box surface-panel">
      <div class="name-note">
      <span class="text">资源组名称：</span>
      <a-input v-model:value="new_resource_group.resourceGroupName" placeholder="请输入资源组名称"/>
      <span class="text">资源类型：</span>
      <a-input v-model:value="new_resource_group.resourceType" placeholder="请输入资源类型"/>
      <span class="text">备注：</span>
      <a-input v-model:value="new_resource_group.resourceGroupNote" placeholder="请输入资源组备注"/>
      </div>
      <NameActionTable :columns="columns" :includeList="includeList" :excludeList="excludeList" />
      <div class="saveBtn">
        <RouterBtn toPath="/resource_group" btnWidth="80px" btnText="保存" @click="saveResourceGroup" />
      </div>
    </div>
  </section>
</template>

<script setup>
import { reactive } from 'vue';
import RouterBtn from '@/components/button/router-button.vue'
import NameActionTable from '@/components/table/name_action_table.vue'; // 确保导入的组件名称正确
import { useResourceGroupListStore } from '@/stores/useResourceGroupListStore.js'
import { useFormHeadStore } from '@/stores/resourceDetailNumStore.js'
// import { log } from 'console';

const resourceGroupListStore = useResourceGroupListStore()
const {  addCustomResourceGroup } = useResourceGroupListStore();

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

const formHeadStore = useFormHeadStore()
let includeList = reactive([])
let excludeList = reactive(formHeadStore.formHeadList.map(item=>({
  key: item.key,
  name: item.resourceName
})));

// 新资源组数据
let new_resource_group = reactive({
  resourceGroupName: '',
  resourceType: '',
  resourceGroupNote: '',
  includeResourceList: [],
  excludeResourceList: [],
})

function saveResourceGroup() {
  // console.log('保存逻辑约束数据');
  new_resource_group.includeResourceList = includeList;
  new_resource_group.excludeResourceList = excludeList;
  resourceGroupListStore.addCustomResourceGroup(new_resource_group);
}

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
