<template>
  <div>
    <a-button class="editable-add-btn" style="margin-bottom: 8px; height: 24px; font-size: 12px; padding: 0 12px;" @click="handleAdd">{{ addText }}</a-button>
    <a-table
      bordered
      :data-source="dataSource"
      :columns="columns"
      :locale="{ emptyText: customEmptyText }"
    >
      <template #bodyCell="{ column, text, record }">
        <template v-if="column.dataIndex === 'name'">
          <div class="editable-cell">
            <div v-if="editableData[record.key]" class="editable-cell-input-wrapper">
              <a-input v-model:value="editableData[record.key].name" @pressEnter="save(record.key)" />
              <check-outlined class="editable-cell-icon-check" @click="save(record.key)" />
            </div>
            <div v-else class="editable-cell-text-wrapper">
              {{ text || ' ' }}
              <edit-outlined class="editable-cell-icon" @click="edit(record.key)" />
            </div>
          </div>
        </template>
        <template v-else-if="column.dataIndex === 'operation'">
          <a-popconfirm
            v-if="dataSource.length"
            title="Sure to delete?"
            @confirm="onDelete(record.key)"
          >
            <a>Delete</a>
          </a-popconfirm>
        </template>
      </template>
    </a-table>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue';
import { cloneDeep } from 'lodash-es';
import { CheckOutlined, EditOutlined } from '@ant-design/icons-vue';

// 接收父组件传递的 props
const props = defineProps({
  columns: {
    type: Array,
    required: true,
  },
  data: {
    type: Array,
    required: true,
  },
  addText: {
    type: String,
    default: 'Add',
  },
});

// 定义内部状态
const dataSource = ref(props.data);
const editableData = reactive({});

// 自定义 "No Data" 提示
const customEmptyText = '暂无数据';

// 添加新行
const handleAdd = () => {
  const newData = {
    key: `${dataSource.value.length}`,
    name: '',
    age: 0,
    address: '',
  };
  dataSource.value.push(newData);
};

// 编辑行
const edit = (key) => {
  editableData[key] = cloneDeep(dataSource.value.find(item => key === item.key));
};

// 保存行
const save = (key) => {
  Object.assign(dataSource.value.find(item => key === item.key), editableData[key]);
  delete editableData[key];
};

// 删除行
const onDelete = (key) => {
  dataSource.value = dataSource.value.filter(item => item.key !== key);
};
</script>

<style scoped lang="less">
.editable-cell {
  position: relative;
  .editable-cell-input-wrapper,
  .editable-cell-text-wrapper {
    padding-right: 24px;
  }

  .editable-cell-text-wrapper {
    padding: 5px 24px 5px 5px;
  }

  .editable-cell-icon,
  .editable-cell-icon-check {
    position: absolute;
    right: 0;
    width: 20px;
    cursor: pointer;
  }

  .editable-cell-icon {
    margin-top: 4px;
    display: none;
  }

  .editable-cell-icon-check {
    line-height: 28px;
  }

  .editable-cell-icon:hover,
  .editable-cell-icon-check:hover {
    color: #108ee9;
  }

  .editable-add-btn {
    margin-bottom: 8px;
  }
}

.editable-cell:hover .editable-cell-icon {
  display: inline-block;
}

.custom-empty-text {
  padding: 8px;
  text-align: center;
  color: rgba(0, 0, 0, 0.45);
}
</style>