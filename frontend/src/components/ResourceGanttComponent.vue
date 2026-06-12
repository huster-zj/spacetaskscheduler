<template>
  <div ref="ganttContainer" style='width:100%; height:100%;'></div>
</template>

<script>
import { gantt } from 'dhtmlx-gantt';

export default {
  props: {
    tasks: {
      type: Object,
      default() {
        return { data: [], links: [] }
      }
    },
    skin: {
      type: String,
      default: 'terrace'
    },
  },

  watch: {
    skin: {
      immediate: true,
      handler(newSkin) {
        this.changeSkin(newSkin);
      }
    }
  },

  mounted() {
    // gantt.config.date_format = "%d-%m-%Y %H:%i";
    // gantt.config.min_column_width = 20;
    // gantt.config.duration_unit = "minute";
    // gantt.config.duration_step = 60;
    // gantt.config.scale_height = 75;

    // gantt.config.scales = [
    //   { unit: "day", step: 1, format: "%F %j" },
    //   { unit: "hour", step: 1, format: "%g %a" },
    //   { unit: "minute", step: 15, format: "%i" }
    // ];
    gantt.config.date_format = "%Y-%m-%d";

    // 配置任务列表的列，移除最后一列的加号按钮
    gantt.config.columns = [
      { name: "text", label: "资源名称", width: "*", tree: true },
      { name: "start_date", label: "开始时间", align: "center" },
      { name: "duration", label: "持续时间", align: "center" }
    ];

    // 启用提示框插件
    gantt.plugins({
      tooltip: true
    });

    gantt.attachEvent("onGanttReady", function () {
      var tooltips = gantt.ext.tooltips;
      tooltips.tooltip.setViewport(gantt.$task_data);
    });

    gantt.templates.tooltip_text = (start, end, task) => {
      const formatDate = gantt.date.date_to_str("%Y-%m-%d"); // 使用 YYYY-MM-DD 格式化日期
      return `<b>资源:</b> ${task.text}<br/>
              <b>计划时间窗口:</b> ${formatDate(task.earliestStart)} - ${formatDate(task.latestEnd)}<br/>
              <b>调度后时间窗口:</b> ${formatDate(task.startDate)} - ${formatDate(task.endDate)}<br/>`;
    };

    gantt.templates.task_text = function (start, end, task) {
      return renderLabel(task.progress1, 'nearly_done', task.left1)
    };

    gantt.init(this.$refs.ganttContainer);
    gantt.parse(this.tasks);
  },

  beforeUnmount() {
    gantt.clearAll();
  },

  methods: {
    changeSkin(name) {
      const link = document.createElement('link');

      link.onload = () => {
        gantt.resetSkin();
        gantt.render();
      };

      link.rel = 'stylesheet';
      link.type = 'text/css';
      link.id = 'skin';
      link.href = `../../node_modules/dhtmlx-gantt/codebase/skins/dhtmlxgantt_${name}.css`;

      const oldLink = document.querySelector('#skin');
      if (oldLink) {
        document.head.replaceChild(link, oldLink);
      } else {
        document.head.appendChild(link);
      }
    },
  }
}

// 渲染自定义进度条
function percenToString(num) {
  return Math.floor(num * 100) + '%';
}

function renderLabel(progress, status, left) {
  var relWidth = progress * 100;
  var cssClass = "custom_progress " + status;
  return `
    <div class='${cssClass}' style='width:${relWidth}%; position: absolute; left: ${left * 100}%;'>
    </div>
  `;
}
</script>

<style>
@import "../../node_modules/dhtmlx-gantt/codebase/dhtmlxgantt.css";

.custom_progress {
  display: inline-block;
  vertical-align: top;
  text-align: center;
  height: 100%;
}

.gantt_task_content {
  padding-top: 0;
}

.custom_progress.nearly_done {
  background-color: #91DF84;
}

.custom_progress.in_progress {
  background-color: #E39191;
}
</style>