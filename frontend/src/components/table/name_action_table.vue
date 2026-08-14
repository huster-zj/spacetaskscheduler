<!-- 使用说明： 
 :columns=""，传递表格标题行数据
 :includeList=''，传递已包含表格的数据
 :excludeList=''，传递未包含表格的数据
import NameActionTable from '@/components/table/name_action_table.vue'; 
  -->

<template>
  <div class="two_table">
    <div class="incloud">
      <ShowTable :columns="columns" :data="filteredIncludeList">
        <template #special_content>
          <div class="text">已包含</div>
        </template>
        <template #column_action="action">
          <button class="icon-button" type="button" aria-label="移出项目" @click="deleteAction(action.column1.key)">
            <MinusOutlined />
          </button>
        </template>
      </ShowTable>
    </div>
    <div class="hint_box" aria-hidden="true">
      <ArrowRightOutlined />
      <ArrowLeftOutlined />
    </div>
    <div class="exclude">
      <ShowTable :columns="columns" :data="filteredExcludeList">
        <template #special_content>
          <div class="text">未包含</div>
        </template>
        <template #column_action="action">
          <button class="icon-button" type="button" aria-label="加入项目" @click="addAction(action.column1.key)">
            <PlusOutlined />
          </button>
        </template>
      </ShowTable>
    </div>
  </div>
  
  
</template>

<script setup>
import { ref, reactive, computed,defineProps } from 'vue';
import ShowTable from '@/components/table/show_table.vue'

const props = defineProps({
  columns: {
    type: Array,
    required: true,
  },
  includeList: {
    type: Array,
    required: true,
  },
  excludeList: {
    type: Array,
    required: true,
  }
})

let {columns,includeList,excludeList} = props
columns = reactive(columns)
includeList = reactive(includeList ? includeList : [])
excludeList = reactive(excludeList ? excludeList : [])

// 定义添加、删除操作
function deleteAction(value){
  console.log('delete');
  console.log(value);
  excludeList.unshift(includeList.find(item => item.key === value));
  includeList.splice(includeList.findIndex(item => item.key === value), 1);
}
function addAction(value){
  console.log('add');
  includeList.unshift(excludeList.find(item => item.key === value));
  excludeList.splice(excludeList.findIndex(item => item.key === value), 1);
}

// 计算属性：根据搜索查询过滤数据
// 已包含搜索框的输入值
const searchQueryIn = ref('');
const filteredIncludeList = computed(() => {
  if (!searchQueryIn.value) {
    return includeList;
  }
  return includeList.filter(item => (item.name && item.name.includes(searchQueryIn.value)) || (item.name2 && item.name2.includes(searchQueryIn.value)));
});
// 未包含搜索框的输入值
const searchQueryEx = ref('');
const filteredExcludeList = computed(() => {
  if (!searchQueryEx.value) {
    return excludeList;
  }
  return excludeList.filter(item => (item.name && item.name.includes(searchQueryEx.value)) || (item.name2 && item.name2.includes(searchQueryEx.value)));
});
</script>

<style scoped>
/* 两个表格并排显示 */
.two_table {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 48px minmax(0, 1fr);
  align-items: stretch;
  gap: 16px;
  width: 100%;
  margin: 20px 0 0;
}
/* 表格宽度设置 */
.incloud,.exclude {
  min-width: 0;
}
.hint_box {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 48px;
  color: var(--sts-ink-muted);
}
.hint_box .anticon {
  width: 32px;
  height: 32px;
  font-size: 20px;
  text-align: center;
}
.hint_box .anticon :deep(svg) {
  width: 22px;
  height: 22px;
}


/* 搜索框文本标题样式 */
.text {
  color: var(--sts-ink-primary);
  font-size: 16px;
  font-weight: 600;
}
/* 修改搜索框样式靠右 */
:deep(.container .header) {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-bottom: 0;
}

.icon-button {
  display: inline-grid;
  width: 36px;
  height: 36px;
  padding: 0;
  place-items: center;
  border: 1px solid var(--sts-border-strong);
  border-radius: var(--sts-radius-md);
  background: var(--sts-surface-raised);
  color: var(--sts-primary);
  cursor: pointer;
}

.icon-button:hover {
  border-color: var(--sts-primary);
  background: var(--sts-primary-soft);
}

@media (max-width: 900px) {
  .two_table {
    overflow-x: auto;
    grid-template-columns: minmax(300px, 1fr) 40px minmax(300px, 1fr);
    padding-bottom: 4px;
  }
}
</style>
