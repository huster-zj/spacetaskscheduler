<!--
 * @Author: Jerry
 * @Date: 2025-01-11 10:33:55
 * @LastEditors: Do not edit
 * @LastEditTime: 2025-06-05 17:01:32
 * @FilePath: \spacetaskscheduler\src\components\mainview\calendar.vue
-->
<template>
  <div class="calendar-container">
    <a-table :columns="output_columns" :dataSource="output_data" rowKey="id" />
    <a-table :columns="preprocess_columns" :dataSource="preprocess_data" rowKey="tracking_plan_id" />
  </div>
</template>

<script>
import { parseOutputFile, parsePreprocessFiles} from '@/services/ParseFile.js';
import eventBus from '@/utils/eventBus';

export default {
  name: 'CalendarView',
  data() {
    return {
      output_columns: [
        { title: '飞控事件ID', dataIndex: 'id', key: 'id' },
        { title: '是否分配', dataIndex: 'status', key: 'status' },
        { title: '开始时间', dataIndex: 'startTime', key: 'startTime' },
        { title: '结束时间', dataIndex: 'endTime', key: 'endTime' },
        { title: '选择的弧段ID', dataIndex: 'arcId', key: 'arcId' }
      ],
      output_data: [
        {
          id: 'FK-2-1',
          status: '是',
          startTime: '1699200286.00',
          endTime: '1699204066.00',
          arcId: 'Plan_2_1'
        }
      ],
      preprocess_columns: [
        { title: '飞控事件ID', dataIndex: 'task_name', key: 'task_name' },
        { title: '跟踪计划ID', dataIndex: 'tracking_plan_id', key: 'tracking_plan_id' },
        { title: '开始时间', dataIndex: 'start_time', key: 'start_time' },
        { title: '结束时间', dataIndex: 'end_time', key: 'end_time' },
        { title: '持续时间', dataIndex: 'duration', key: 'duration' },
        { title: '目标航天器', dataIndex: 'task_to_craft', key: 'task_to_craft' },
        { title: '测控资源', dataIndex: 'cekong_resource', key: 'cekong_resource'},
      ],
      preprocess_data: [
        {
          task_name: 'FK-2-1',
          tracking_plan_id: 'Plan_2_1',
          start_time: '1699200286.00',
          end_time: '1699204066.00',
          duration: '3780.00',
          task_to_craft: 'Craft_2',
          cekong_resource: 'CK-TIANLIAN_2-02-2'
        },
      ]
    };
  },
  mounted() {
    // 监听算法执行成功事件
    eventBus.on('algorithmSuccess', this.refreshOutputData);
    // 监听预处理成功事件
    eventBus.on('preprocessSuccess', this.refreshPreprocessData);
    // 初始加载数据
    this.refreshOutputData();
    this.refreshPreprocessData();
  },
  beforeUnmount() {
    // 组件销毁前移除事件监听
    eventBus.off('algorithmSuccess', this.refreshOutputData);
    eventBus.off('preprocessSuccess', this.refreshPreprocessData);
  },
  methods: {
    async refreshPreprocessData() {
      const preprocessResult = await parsePreprocessFiles();
      if (preprocessResult) {
        this.preprocess_data = preprocessResult;
      }
    },
    async refreshOutputData() {
      const result = await parseOutputFile();
      if (result && result.data) {
        this.output_data = result.data;
      }
    }
  }
};
</script>

<style scoped>
/* 添加样式以适应表格布局 */
</style>