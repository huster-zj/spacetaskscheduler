<!--
 * @Author: Jerry
 * @Date: 2024-10-09 15:13:15
 * @LastEditors: Do not edit
 * @LastEditTime: 2025-02-26 14:43:21
 * @FilePath: \spacetaskscheduler\src\views\resource\ResourceGroup.vue
-->
<template>
  <Steps :current_page="page" />
  <section class="page-shell list-page">
    <ShowTable :columns="columns" :data="data">
    <!-- 头部搜索栏+导入资源按钮 -->
    <template #special_btn>
      <Dropdown before_select_text="场景：" :selectList="strategyList">
        <template #special_content>
          <a-button class="text_create" @click="handleGenerate">生成</a-button>
        </template>
      </Dropdown>
      <RouterBtn toPath="/new_resource_group" btnWidth="80px" btnText="自定义" />
    </template>
    <!-- 资源组列表 -->
    <template #column_name="record">
      <!-- <RouterLink :to="{
          name:ResourceGroupDetail,
          params:{
            group_name:record.column1.name
          }
          }"> -->
      <RouterLink :to="`/resource_group_detail/${record.column1.name}`">
        {{ record.column1.name }}
      </RouterLink>
    </template>
    <template #column_action="action">
      <span>
        <!-- <span @click="goToDetailPage(action.column1.name)"> -->
        <!-- <RouterLink :to="{
          name:ResourceGroupDetail,
          params:{
            group_name:action.column1.name
          }
          }"> -->
        <RouterLink :to="`/resource_group_detail/${action.column1.name}`">
          <FormOutlined />
        </RouterLink>
        <a-divider type="vertical" />
        <a-popconfirm title="是否删除该数据？" ok-text="是" cancel-text="否" @confirm="deleteResourceGroup(action.column1.key)">
          <CloseOutlined />
        </a-popconfirm>
      </span>
    </template>
    </ShowTable>
  </section>


</template>
<script setup>
import { ref, reactive, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import ShowTable from '@/components/table/show_table.vue'
import Dropdown from '@/components/dropdown/drop_down.vue'
import RouterBtn from '@/components/button/router-button.vue'
import { resourceGroupGenerator } from '@/services/ResourceGroupGenerator'
import { useResourceGroupListStore } from '@/stores/useResourceGroupListStore.js'
import { useRouter } from 'vue-router'
import Steps from '@/components/Steps.vue'
const page = ref(3)    // 当前所在页面对应的value,计数从0开始,传递给Steps组件

// const resourceGroupListStore = useResourceGroupListStore()
const { customResourceGroupList } = useResourceGroupListStore()

// 将customResourceGroup中的数据映射到data（主要是resourceGroupName转换为name），然后data作为行数据传递给ShowTable组件
const data = reactive([])

const handleGenerate = () => {
  try {
    // 根据当前选中的策略生成资源组
    const newGroups = resourceGroupGenerator.generateResourceGroup(strategyValue.value)
    
    // 将生成的资源组添加到 pinia store
    newGroups.forEach(group => {
      customResourceGroupList.push(group)
    })
    
    // 更新表格数据
    mapCustomResourceGroupToData()
    
    message.success('资源组生成成功')
  } catch (error) {
    message.error('资源组生成失败：' + error.message)
  }
}

const mapCustomResourceGroupToData = () => {
  for (let i = 0; i < customResourceGroupList.length; i++) {
    // // 添加customResourceGroupList空值检查
    // if (!customResourceGroupList?.value) {
    //   console.warn('customResourceGroupList is not initialized')
    // }
    // 确保 data[i] 已经被初始化为一个对象
    if (!data[i]) {
      data[i] = {
        key: '',
        name: '',
        resource_type: '',
        resource_note: '',
        resource_name: ''
      };
    }

    data[i].key = customResourceGroupList[i].key
    data[i].name = customResourceGroupList[i].resourceGroupName
    data[i].resource_note = customResourceGroupList[i].resourceGroupNote
    data[i].resource_type = customResourceGroupList[i].resourceType

    // 获取所有资源名称
    const allNames = customResourceGroupList[i].includeResourceList.map(resource => 
      resource.name.split('-').map(part => part.trim())
    )

    // 找出重复的部分
    const repeatedNames = new Set()
    const allParts = allNames.flat()
    allParts.forEach(part => {
      if (allParts.filter(p => p === part).length > 1) {
        repeatedNames.add(part)
      }
    })

    // 过滤掉重复的部分，只保留唯一的名称
    const uniqueNames = new Set()
    allNames.forEach(nameParts => {
      nameParts.forEach(part => {
        if (!repeatedNames.has(part)) {
          uniqueNames.add(part)
        }
      })
    })

    // 将剩余的名称组合成字符串
    data[i].resource_name = Array.from(uniqueNames).join('、')
  }
}

onMounted(() => {
  mapCustomResourceGroupToData()
})

// 定义策略列表
let strategyList = reactive([
  {
    id: 'strategy1',
    value: '空间站',
    label: '空间站'
  },
  {
    id: 'strategy2',
    value: '海洋工程',
    label: '海洋工程'
  },
  {
    id: 'strategy3',
    value: '无人机',
    label: '无人机',
    disabled: false
  }
])

// 默认选中第一个策略
let strategyValue = ref('')
strategyValue.value = strategyList[0].value
console.log(strategyValue.value)

onMounted(() => {
  strategyValue.value = strategyList[0].value
})

const columns = reactive([
  {
    title: '资源组名称',
    dataIndex: 'name',
    key: 'name'
  },
  {
    title: '资源组包含内容',
    dataIndex: 'resource_name',
    key: 'resource_name'
  },
  {
    title: '资源组类型',
    dataIndex: 'resource_type',
    key: 'resource_type'
  },
  {
    title: '备注',
    key: 'resource_note',
    dataIndex: 'resource_note'
  },
  {
    title: '操作',
    key: 'action'
  }
])
// const data = reactive([
//   {
//     key: '1',
//     name: '天链203相关测控资源',
//     resource_name: '东风站-天链203、厦门站-天链203',
//     resource_type: '航天器',
//     resource_note: '无'
//   },
//   {
//     key: '2',
//     name: '天链105相关测控资源',
//     resource_name: '东风站-天链105、厦门站-天链105',
//     resource_type: '航天器',
//     resource_note: '无'
//   },
//   {
//     key: '3',
//     name: '天链104相关测控资源',
//     resource_name: '东风站-天链104、厦门站-天链104',
//     resource_type: '航天器',
//     resource_note: '无'
//   },
//   {
//     key: '4',
//     name: '梦天站相关测控资源',
//     resource_name: '梦天站-天链203、梦天站-天舟7',
//     resource_type: '未知',
//     resource_note: '无'
//   }
// ])

function deleteResourceGroup(key) {
  // 删除该行数据
  data.splice(
    data.findIndex((item) => item.key === key),
    1
  )
  // 删除pinia中customResourceGroupList中对应的数据
  customResourceGroupList.splice(
    customResourceGroupList.findIndex((item) => item.key === key),
    1
  )
}

// 跳转到详情页面
const router = useRouter()
// const goToDetailPage = (value) => {
//   console.log("vbvfebrebhervalue",value);
//   router.push({ name: 'ResourceGroupDetail', params: { name:value } });
// };

</script>

<style scoped>
.text_create {
  margin: 0 8px;
}
</style>
