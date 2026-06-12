<template>
  <div class="form-container">
    <a-row>
      <a-col :span="24">
        <div class="form-section">
          <a-typography-title :level="3">容纳量</a-typography-title>
          <a-row :gutter="8">
            <a-col :span="4">
              <div class="form-item">
                <a-checkbox v-model:checked="isUnlimited" class="checkbox-label">无上限</a-checkbox>
              </div>
            </a-col>
            <a-col :span="8">
              <div class="form-item">
                <label for="maxaccom" class="form-label">最大容纳量：</label>
                <a-input-number id="maxaccom" v-model:value="resourceThreeParts.maxaccom" :disabled="isUnlimited"
                  :min="1" :precision="0" class="form-input input-custom" placeholder="请输入最大容纳量" />
              </div>
            </a-col>
          </a-row>
        </div>

        <div class="form-section">
          <a-typography-title :level="3">数量</a-typography-title>
          <a-row :gutter="32">
            <a-col :span="12">
              <div class="form-item">
                <a-checkbox class="checkbox-label">存在数量属性</a-checkbox>
              </div>
            </a-col>
          </a-row>
          <a-row :gutter="32">
            <a-col :span="7">
              <div class="form-item">
                <label class="form-label">容量类型：</label>
                <a-select v-model:value="resourceThreeParts.selectedType" class="form-input" style="width: 200px;">
                  <a-select-option :value="1">消耗型</a-select-option>
                  <a-select-option :value="2">可重复利用型</a-select-option>
                  <a-select-option :value="3">状态模式</a-select-option>
                </a-select>
              </div>
            </a-col>
            <a-col :span="12">
              <div class="form-item">
                <label for="unit" class="form-label">单位：</label>
                <a-input id="unit" v-model:value="resourceThreeParts.unit" class="form-input input-custom"
                  placeholder="请输入单位" style="width: 15%;" />
              </div>
            </a-col>
          </a-row>
          <a-row :gutter="32">
            <a-col :span="12">
              <div class="form-item">
                <label class="form-label" style="font-weight: bold;">数量范围</label>
              </div>
            </a-col>
          </a-row>
          <a-row>
            <a-col :span="12">
              <div class="form-item">
                <label class="form-label">初始数量：</label>
                <a-input-number v-model:value="resourceThreeParts.initialQuantity" :min="0" :precision="0"
                  class="form-input" />
              </div>
            </a-col>
          </a-row>
          <a-row :gutter="5">
            <a-col :span="6">
              <div class="form-item">
                <label class="form-label">最大数量：</label>
                <a-input-number v-model:value="resourceThreeParts.maxQuantity" :min="0" :precision="0"
                  class="form-input" />
              </div>
            </a-col>
            <a-col :span="6">
              <div class="form-item">
                <a-select v-model:value="resourceThreeParts.selectedConstraint" class="form-input"
                  style="width: 200px;">
                  <a-select-option :value="1">硬约束</a-select-option>
                  <a-select-option :value="2">软约束</a-select-option>
                </a-select>
              </div>
            </a-col>
            <a-col :span="6">
              <div class="form-item">
                <label class="form-label">最小数量：</label>
                <a-input-number v-model:value="resourceThreeParts.minQuantity" :min="0" :precision="0"
                  class="form-input" />
              </div>
            </a-col>
            <a-col :span="5">
              <div class="form-item">
                <a-select v-model:value="resourceThreeParts.selectedConstraint2" class="form-input"
                  style="width: 200px;">
                  <a-select-option :value="1">硬约束</a-select-option>
                  <a-select-option :value="2">软约束</a-select-option>
                </a-select>
              </div>
            </a-col>
          </a-row>
          <a-row :gutter="32">
            <a-col :span="12">
              <div class="form-item">
                <label class="form-label">模式总数：</label>
                <a-input-number v-model:value="resourceThreeParts.statemodes" :min="0" :precision="0"
                  class="form-input" />
              </div>
            </a-col>
          </a-row>
          <a-row :gutter="32">
            <a-col :span="10">
              <EditableTable :columns="modeColumns" :data="modeData" addText="Add" />
            </a-col>
            <a-col :span="10">
              <EditableTable :columns="matrixColumns" :data="matrixData" addText="Add" />
            </a-col>
          </a-row>
        </div>

        <div class="form-section2">
          <a-typography-title :level="3">资源占用时长</a-typography-title>
          <a-row :gutter="32">
            <a-col :span="24">
              <div class="form-item">
                <a-radio-group v-model:value="resourceThreeParts.value" class="form-input vertical-radio-group">
                  <a-radio :value="1" class="checkbox-label">使用任务时长</a-radio>
                  <div class="flex-container">
                    <a-radio :value="2" class="checkbox-label">替代任务固定时长</a-radio>
                    <div v-if="resourceThreeParts.value === 2">
                      <label class="form-label">固定时长：</label>
                      <DurationPicker :modelValue="resourceThreeParts.fixedDuration"
                        v-model:value="resourceThreeParts.fixedDuration" class="form-input input-custom"
                        @updateValue="onUpdateFixedDuration" />
                    </div>
                  </div>
                  <div class="flex-container">
                    <a-radio :value="3" class="checkbox-label">使用效率因子替代任务时长</a-radio>
                    <div v-if="resourceThreeParts.value === 3">
                      <label class="form-label">效率因子：</label>
                      <a-input-number v-model:value="resourceThreeParts.efficiencyFactor" :min="0" :max="100"
                        :formatter="value => `${value}%`" :parser="value => value.replace('%', '')"
                        class="form-input input-custom" />
                    </div>
                  </div>
                </a-radio-group>
              </div>
            </a-col>
          </a-row>
        </div>
      </a-col>
    </a-row>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useThreePartsStore } from '@/stores/resourceDetailNumStore'; // 确保路径正确
import EditableTable from '@/components/table/edit_table.vue';
import DurationPicker from '@/components/DurationPicker.vue';

const props = defineProps({
  resourceKey: {
    type: String,
    default: null
  }
});

console.log('ThreeParts.vue, resourceKey:', props.resourceKey);

// 使用 Pinia store
const threePartsStore = useThreePartsStore();

// 从 store 中解构出响应式数据
const { threePartsList, addResourceThreeParts } = threePartsStore;

let resourceThreeParts;

if (props.resourceKey) {
  resourceThreeParts = threePartsList.find((item) => item.key === props.resourceKey);
} else {
  // 初始化一个新的 threeParts 对象
  const newThreeParts = {
    maxaccom: '',
    unit: '',
    initialQuantity: 0,
    maxQuantity: 0,
    minQuantity: 0,
    statemodes: 0,
    fixedDuration: '',
    efficiencyFactor: 0,
    selectedType: 1,
    selectedConstraint: 1,
    selectedConstraint2: 1,
    value: 1
  };

  // 添加新的 threeParts 到 store
  addResourceThreeParts(newThreeParts);

  // 获取刚添加的 threeParts
  resourceThreeParts = threePartsList[threePartsList.length - 1]; // 获取最后添加的 threeParts

}

const onUpdateFixedDuration = (newValue) => {
  resourceThreeParts.fixedDuration = newValue;
};

// 模式名称表格列配置
const modeColumns = [
  {
    title: '模式名称',
    dataIndex: 'name',
    editable: true,
  },
];

// 转移矩阵表格列配置
const matrixColumns = [
  {
    title: '转移矩阵',
    dataIndex: 'matrix',
    editable: true,
  },
];

// 初始数据为空
const modeData = ref([]);
const matrixData = ref([]);
const isUnlimited = ref(false)

</script>

<style scoped>
.form-container {
  display: flex;
  flex-direction: column;
  padding: 2rem;
  background-color: #ffffff;
  border-radius: 8px;
}

.form-section {
  margin-bottom: 1rem;
  /* 统一底部间距 */
}

.form-section2 {
  margin-top: 10px;
}

.form-item {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
}

.form-label {
  margin-right: 1rem;
  white-space: nowrap;
  font-size: 18px;
}

.input-custom {
  height: 30px;
  /* 统一输入框高度 */
  width: 30%;
  /* 统一输入框宽度 */
}

.checkbox-label {
  font-size: 18px;
  /* 设置复选框字体大小 */
}

.dropdown-link {
  font-size: 18px;
  /* 设置下拉框链接字体大小 */
}

.vertical-radio-group .ant-radio-wrapper {
  display: block;
  margin-bottom: 8px;
  /* 统一单选框的底部间距 */
}

.flex-container {
  display: flex;
  align-items: center;
}

.flex-container .checkbox-label {
  margin-right: 50px;
  /* 设置单选按钮和输入框之间的间距 */
}
</style>