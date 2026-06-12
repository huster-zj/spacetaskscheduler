<template>
  <a-table :dataSource="localData" :columns="columns" rowKey="id">
    <template #bodyCell="{ column, record }">
      <template v-if="column.key === 'operation'">
        <template v-if="editingRecord === record">
          <a-typography-link @click="save(record)">√</a-typography-link>
          <a @click="cancel(record)" style="margin-left: 8px;">×</a>
        </template>
        <template v-else>
          <FormOutlined @click="edit(record)" style="margin-right: 8px;" />
          <PlusOutlined @click="addRow(record)" style="margin-right: 8px;" />
          <a-popconfirm title="是否删除该数据？" ok-text="是" cancel-text="否" @confirm="handleDelete(record)">
            <CloseOutlined />
          </a-popconfirm>
        </template>
      </template>
      <template v-else>
        <template v-if="editingRecord === record">
          <template v-if="column.dataIndex === 'windowCount'">
            <a-input-number v-model:value="editableData[record.id][column.dataIndex]" :precision="0"
              style="width: 100px;" />
          </template>
          <template v-else-if="column.dataIndex === 'cycleClass'">
            <a-select v-model:value="editableData[record.id][column.dataIndex]" style="width: 100px;">
              <a-select-option :value="1">每年</a-select-option>
              <a-select-option :value="2">每月</a-select-option>
              <a-select-option :value="3">每周</a-select-option>
              <a-select-option :value="4">每天</a-select-option>
              <a-select-option :value="5">每小时</a-select-option>
              <a-select-option :value="6">每分</a-select-option>
              <a-select-option :value="7">自定义</a-select-option>
            </a-select>
          </template>
          <template v-else-if="column.dataIndex === 'taskTimePoint'">
            <a-select v-model:value="editableData[record.id][column.dataIndex]" style="width: 100px;">
              <a-select-option :value="1">开始</a-select-option>
              <a-select-option :value="2">结束</a-select-option>
            </a-select>
          </template>
          <template v-else-if="column.dataIndex === 'taskKeyPoint'">
            <a-select v-model:value="editableData[record.id][column.dataIndex]" style="width: 200px;">
              <a-select-option :value="1">进阴影时间点</a-select-option>
              <a-select-option :value="2">出阴影时间点</a-select-option>
              <a-select-option :value="3">进光照时间点</a-select-option>
              <a-select-option :value="4">出光照时间点</a-select-option>
              <a-select-option :value="5">进测控弧段时间点</a-select-option>
              <a-select-option :value="6">出测控弧段时间点</a-select-option>
            </a-select>
          </template>
          <template v-else-if="column.dataIndex === 'repeatType'">
            <a-select v-model:value="editableData[record.id][column.dataIndex]" style="width: 100px;">
              <a-select-option :value="1">周期</a-select-option>
              <a-select-option :value="2">时间窗</a-select-option>
            </a-select>
          </template>
          <template v-else>
            <a-input v-model:value="editableData[record.id][column.dataIndex]" style="width: 200px;" />
          </template>
        </template>
        <template v-else>
          <template v-if="column.dataIndex === 'cycleClass'">
            {{ cycleClassText(record[column.dataIndex]) }}
          </template>
          <template v-else-if="column.dataIndex === 'taskTimePoint'">
            {{ taskTimePointText(record[column.dataIndex]) }}
          </template>
          <template v-else-if="column.dataIndex === 'taskKeyPoint'">
            {{ taskKeyPointText(record[column.dataIndex]) }}
          </template>
          <template v-else-if="column.dataIndex === 'repeatType'">
            {{ record[column.dataIndex] === 1 ? '周期' : '时间窗' }}
          </template>
          <template v-else>
            {{ record[column.dataIndex] }}
          </template>
        </template>
      </template>
    </template>
  </a-table>
</template>

<script setup>
import { defineProps, reactive, ref } from 'vue';
import { FormOutlined, CloseOutlined, PlusOutlined } from '@ant-design/icons-vue';

const props = defineProps({
  data: Array,
  columns: Array
});

const emit = defineEmits(['updateValue']);

const localData = reactive([...props.data]);
const editingRecord = ref(null);
const editableData = reactive({});

localData.forEach(record => {
  editableData[record.id] = { ...record };
});

const edit = (record) => {
  editingRecord.value = record;
};

const save = (record) => {
  // 保存逻辑
  Object.assign(record, editableData[record.id]);
  editingRecord.value = null;
};

const cancel = (record) => {
  editableData[record.id] = { ...record };
  editingRecord.value = null;
};

const handleDelete = (record) => {
  const index = localData.findIndex(item => item.id === record.id);
  if (index !== -1) {
    localData.splice(index, 1);
    // 触发更新事件
    emit('updateValue', localData);
  }
};

const addRow = (record) => {
  const newRow = { id: Date.now() }; // 使用当前时间戳作为新行的唯一ID
  props.columns.forEach(column => {
    newRow[column.dataIndex] = ''; // 初始化每个列的数据
  });
  const index = localData.findIndex(item => item.id === record.id);
  if (index !== -1) {
    localData.splice(index + 1, 0, newRow);
    editableData[newRow.id] = { ...newRow };
  } else {
    // 如果没有找到记录，直接添加到末尾
    localData.push(newRow);
    editableData[newRow.id] = { ...newRow };
  }
  console.log('localData after addRow:', localData);
  emit('updateValue', localData);
};

const cycleClassText = (value) => {
  const cycleClassMap = {
    1: '每年',
    2: '每月',
    3: '每周',
    4: '每天',
    5: '每小时',
    6: '每分',
    7: '自定义'
  };
  return cycleClassMap[value] || value;
};
const taskTimePointText = (value) => {
  const taskTimePointMap = {
    1: '开始',
    2: '结束'
  };
  return taskTimePointMap[value] || value;
};
const taskKeyPointText = (value) => {
  const taskKeyPointMap = {
    1: '进阴影时间点',
    2: '出阴影时间点',
    3: '进光照时间点',
    4: '出光照时间点',
    5: '进测控弧段时间点',
    6: '出测控弧段时间点'
  };
  return taskKeyPointMap[value] || value;
};
</script>