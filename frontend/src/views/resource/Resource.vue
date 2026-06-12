<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <!-- <button @click="cekongResourceListStore.importCekongResourceList(test_cekong_resource)">点击调用导入测控资源数据函数</button> -->
  <Steps :current_page="page" />
  <!-- 资源列表 -->
  <ShowTable :columns="columns" :data="formHeadList">
    <!-- 特定按钮功能 -->
    <template #special_btn>
      <div class="import_resource">
        <a-upload :show-upload-list="false" :beforeUpload="handleCekongResourceFile">
          <a-button>
            <div class="text">导入测控资源</div>
          </a-button>
        </a-upload>
        <a-upload :show-upload-list="false">
          <a-button>
            <div class="text">导入器上资源</div>
          </a-button>
        </a-upload>
        <a-upload :show-upload-list="false">
          <a-button>
            <div class="text">导入航天员</div>
          </a-button>
        </a-upload>
        <a-upload :show-upload-list="false">
          <a-button>
            <div class="text">从文件导入</div>
          </a-button>
        </a-upload>
        <RouterLink to="/resource_detail">
          <div class="custom_btn">自定义</div>
        </RouterLink>
      </div>
    </template>
    <template #column_name="record">
      {{ record.column1.resourceName }}
    </template>
    <template #column_action="action">
      <span>
        <RouterLink :to="`/resource_detail/${action.column1.key}`">
          <FormOutlined />
        </RouterLink>
        <a-divider type="vertical" />
        <a-popconfirm title="是否删除该数据？" ok-text="是" cancel-text="否" @confirm="deleteResource(action.column1.key)">
          <CloseOutlined />
        </a-popconfirm>
      </span>
    </template>
  </ShowTable>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { RouterLink } from 'vue-router'
import { useFormHeadStore } from '@/stores/resourceDetailNumStore.js'
import ShowTable from '@/components/table/show_table.vue'
import Steps from '@/components/Steps.vue'
import { useCekongResourceListStore } from '@/stores/useCekongResourceListStore.js'
import { useRouter } from 'vue-router'
import { deleteResourceKey } from '@/stores/keyManager.js'
import { message } from 'ant-design-vue'  // 添加 message 导入


const page = ref(2)    // 当前所在页面对应的value,计数从0开始,传递给Steps组件

const columns = reactive([
  {
    title: '资源名称',
    dataIndex: 'resourceName',
    key: 'resourceName'
  },
  {
    title: '资源优先级',
    dataIndex: 'priority',
    key: 'priority'
  },
  {
    title: '资源类型',
    dataIndex: 'resourceType',
    key: 'resourceType'
  },
  {
    title: '备注',
    key: 'resourceNotes',
    dataIndex: 'resourceNotes'
  },
  {
    title: '操作',
    key: 'action'
  }
])

const formHeadStore = useFormHeadStore()
const { formHeadList } = formHeadStore

const loading = ref(false)
const ckFile = ref(null)
const ckFileName = ref('')

// 导入测控资源
const router = useRouter()

const cekongResourceListStore = useCekongResourceListStore()

// 修改handleCekongResourceFile函数
async function handleCekongResourceFile(file) {
  // 更新文件状态
  ckFile.value = file
  ckFileName.value = file.name
  loading.value = true

  try {
    let jsonData = null
    const fileExtension = file.name.split('.').pop().toLowerCase()

    // 如果是CSV文件，先转换为JSON
    if (fileExtension === 'csv') {
      const formData = new FormData()
      formData.append('ck_file', file)

      const response = await fetch('http://localhost:8000/api/convert_csv_to_json', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()
      if (!result.success) {
        throw new Error(result.message || 'CSV转换失败')
      }
      jsonData = result.data.resource
    } 
    // 如果是JSON文件，直接读取
    else if (fileExtension === 'json') {
      jsonData = await new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = (e) => {
          try {
            resolve(JSON.parse(e.target.result))
          } catch (error) {
            reject(new Error('JSON解析失败'))
          }
        }
        reader.onerror = () => reject(new Error('文件读取失败'))
        reader.readAsText(file)
      })
    } else {
      throw new Error('不支持的文件格式，请上传 .json 或 .csv 文件')
    }

    // 统一处理JSON数据
    if (jsonData) {
      await cekongResourceListStore.importCekongResourceList(jsonData)
      message.success('测控资源导入成功')
      router.push('/cekong_resource')
    } else {
      throw new Error('数据处理失败')
    }
  } catch (error) {
    console.error('文件处理失败:', error)
    message.error('文件处理失败：' + error.message)
  } finally {
    loading.value = false
  }

  return false // 阻止自动上传
}

function deleteResource(key) {
  deleteResourceKey(key)
}
</script>

<style scoped>
.import_resource {
  /* background-color: pink; */
  display: flex;
  justify-content: space-between;
  /* background-color: pink; */
}

.import_resource .ant-btn,
.import_resource .custom_btn {
  /* background-color: pink; */
  margin-right: 30px;
  height: 40px;
  font-size: 18px;
  color: #2e2e2e;
  border: 1.5px solid hsl(0, 1%, 57%);
  border-radius: 10px;
  padding: 5px 10px;
  background-color: #f7f8fa;
}

.import_resource a {
  padding: 0;
  /* 取消a自带的格式 */
}

.import_resource a:hover {
  background-color: inherit;
  /* 取消背景色变化 */
}
</style>
