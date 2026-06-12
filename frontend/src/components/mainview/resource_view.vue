<template>
  <div class="container">
    <div class="gantt-control" v-if="showSkinOptions">
      <a-radio-group v-model:value="currentSkin" option-type="button" @change="changeSkin">
        <a-radio-button value="terrace">默认</a-radio-button>
        <a-radio-button value="skyblue">Skyblue</a-radio-button>
        <a-radio-button value="meadow">Meadow</a-radio-button>
        <a-radio-button value="broadway">Broadway</a-radio-button>
        <a-radio-button value="material">Material</a-radio-button>
        <a-radio-button value="contrast_white">Light</a-radio-button>
        <a-radio-button value="contrast_black">Dark</a-radio-button>
      </a-radio-group>
    </div>
    <GanttComponent class="left-container" :tasks="tasks" :skin="currentSkin"></GanttComponent>
  </div>
</template>

<script>
import { ref } from 'vue';
import { storeToRefs } from 'pinia'
import GanttComponent from '@/components/ResourceGanttComponent.vue';
import { useResourceViewStore } from '@/stores/resourceView';

export default {
  name: 'ResourceView',
  components: { GanttComponent },
  props: {
    showSkinOptions: {
      type: Boolean,
      default: false
    }
  },
  data() {
    const resourceViewStore = useResourceViewStore();

    const { rawTasks } = storeToRefs(resourceViewStore);

    return {
      rawTasks,
      tasks: {
        data: []
      },
      currentSkin: ref('terrace')
    };
  },

  created() {
    this.tasks.data = this.convertTaskData(this.rawTasks);
    console.log('资源数据', this.tasks.data);
  },
  methods: {
    changeSkin(e) {
      this.currentSkin = e.target.value;
    },
    convertTaskData(rawData) {
      return rawData.map(task => {
        const earliestStart = new Date(task.earliest_start);
        const latestEnd = new Date(task.latest_end);
        const duration = (latestEnd - earliestStart) / (1000 * 60 * 60 * 24); // 计算持续时间（天数）

        const startDate = new Date(task.start_date);
        const endDate = new Date(task.end_date);

        const progress1 = (endDate - startDate) / (1000 * 60 * 60 * 24) / duration;
        const left1 = (startDate - earliestStart) / (1000 * 60 * 60 * 24) / duration;

        return {
          id: task.id,
          text: task.text,
          start_date: task.earliest_start,
          duration: duration,
          progress1: progress1,
          left1: left1,
          open: true,
          parent: task.parent || null,
          earliestStart: earliestStart,
          latestEnd: latestEnd,
          startDate: startDate,
          endDate: endDate
        };
      });
    }
  }
}
</script>

<style scoped>
html,
body {
  height: 100%;
  margin: 0;
  padding: 0;
}

.container {
  height: 100vh;
  width: 100%;
}

.left-container {
  overflow: hidden;
  position: relative;
  height: calc(100vh - 52px);
}

.gantt-control {
  display: flex;
  gap: 10px;
  padding: 10px;
}
</style>