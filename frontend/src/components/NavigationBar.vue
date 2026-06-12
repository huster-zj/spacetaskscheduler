<template>
  <div class="nav">
    <div class="nav_section">
      <span class="section_item">
        <RouterLink to="/attributes">
          <PlusCircleOutlined />
          新建
        </RouterLink>
      </span>
      <span class="section_item">
        <a-upload :show-upload-list="false" :before-upload="handleFileChangeHandler" accept=".zip">
          <div class="upload_content">
            <FolderOpenOutlined />
            <span class="upload_text"> 打开 </span>
          </div>
        </a-upload>
      </span>
      <span class="section_item">
        <div class="save_as" @click="saveZipFileHandler">
          <FolderOutlined />
          <span class="save_text">另存为</span>
        </div>
      </span>
      <span class="section_item">
        <RouterLink to="/attributes">
          <PicLeftOutlined />
          属性
        </RouterLink>
      </span>
      <span class="section_title">项目</span>
    </div>
    <div class="nav_section">
      <span class="section_item">
        <RouterLink to="/main_view">
          <LayoutOutlined />
          主视图
        </RouterLink>
      </span>
      <span class="section_title">视图</span>
    </div>
    <div class="nav_section">
      <span class="section_item">
        <RouterLink to="/resource">
          <UnorderedListOutlined />
          资源
        </RouterLink>
      </span>
      <span class="section_item">
        <RouterLink to="/resource_group">
          <MenuUnfoldOutlined />
          资源组
        </RouterLink>
      </span>
      <span class="section_title">资源</span>
    </div>
    <div class="nav_section">
      <span class="section_item">
        <RouterLink to="/task">
          <BarsOutlined />
          任务
        </RouterLink>
      </span>
      <span class="section_item">
        <RouterLink to="/temporal_constraint">
          <FieldTimeOutlined />
          时态约束
        </RouterLink>
      </span>
      <span class="section_item">
        <RouterLink to="/logical_constraint">
          <MenuUnfoldOutlined />
          逻辑约束
        </RouterLink>
      </span>
      <span class="section_title">任务</span>
    </div>
    <div class="nav_section">
      <span class="section_item">
        <RouterLink to="/operating">
          <PlayCircleOutlined />
          运行
        </RouterLink>
      </span>
      <span class="section_item">
        <RouterLink to="/result">
          <CalculatorOutlined />
          调度结果
        </RouterLink>
      </span>
      <span class="section_item">
        <RouterLink to="/report">
          <FileTextOutlined />
          报告
        </RouterLink>
      </span>
      <span class="section_title">调度</span>
    </div>
    <div class="nav_section">
      <span class="section_item">
        <RouterLink @click.prevent="openHelpDoc" to="">
          <QuestionCircleOutlined />
          帮助中心
        </RouterLink>
      </span>
      <span class="section_item">
        <RouterLink @click.prevent="openHelpDoc" to="">
          <SolutionOutlined />
          许可证
        </RouterLink>
      </span>
      <span class="section_item">
        <RouterLink @click.prevent="openAboutDoc" to="">
          <ProfileOutlined />
          关于
        </RouterLink>
      </span>
      <span class="section_title">帮助</span>
    </div>
    <div class="reserve_space"></div>

    <div class="quick_toolbar">
      <RouterLink to="/report_detail" title="冲突报告">
        <BugOutlined />
      </RouterLink>
      <br />
      <RouterLink to="/report_detail" title="调度报告">
        <AppstoreOutlined />
      </RouterLink>
      <RouterLink to="/report_detail" title="简短报告">
        <CarryOutOutlined />
      </RouterLink>
      <RouterLink to="/report_detail" title="任务报告">
        <ProfileOutlined />
      </RouterLink>
      <RouterLink to="/report_detail" title="资源报告">
        <ExceptionOutlined />
      </RouterLink>
    </div>
  </div>
</template>

<script setup>
import { saveZipFile, handleFileChange } from '@/utils/fileHandler'; // 引入新文件

// 保存 ZIP 文件
const saveZipFileHandler = async () => {
  await saveZipFile();
};

// 处理文件上传
const handleFileChangeHandler = async (file) => {
  return await handleFileChange(file);
};

const openHelpDoc = () => {
  window.open('https://jcnaybgukl26.feishu.cn/docx/PyPnduojBovsgMxp4R3cm4AvnWe', '_blank')
}
const openAboutDoc = () => {
  window.open('https://gitee.com/husterzj/spacetaskscheduler', '_blank')
}
</script>

<style scoped>
/* 导航栏样式 */
.nav {
  display: flex;
  justify-content: space-around;
  border: 2px solid #dbdada;
}

/* 每个模块的样式 */
.nav_section {
  display: flex;
  position: relative;
  height: 100px;
}

/* 模块标题样式 */
.nav_section .section_title {
  position: absolute;
  top: 83%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 18px;
}

/* 不同模块之间的分割线 */
.nav_section:not(:last-child)::after {
  content: '';
  position: absolute;
  right: -22px;
  top: 50%;
  transform: translateY(-50%);
  width: 2px;
  height: 100%;
  background-color: #e0e0e0;
}

/* 每个模块中的每个按钮 */
.nav_section .section_item {
  font-size: 18px;
}

.nav_section .section_item .upload_content {
  display: flex;
  padding: 0 10px;
  padding-top: 6px;
  line-height: 2.5;
  color: #333333;
  flex-direction: column;
  justify-content: space-around;
  align-items: center;
}


/* 每个按钮内部样式 */
.nav_section .section_item a,
.nav_section .section_item .save_as {
  display: flex;
  padding: 0 10px;
  padding-top: 5px;
  line-height: 2.5;
  color: #333333;
  flex-direction: column;
  justify-content: space-around;
  align-items: center;
}

/* 鼠标悬停在按钮上时 */
.nav_section .section_item a:hover,
.nav_section .section_item .upload_content:hover,
.nav_section .section_item .save_as:hover {
  background-color: hsla(165, 2%, 58%, 0.2);
  transition: 0.4s;
}

/* 打开按钮的图标样式 */
.nav_section .section_item .upload_content .anticon {
  font-size: 18px;
  color: #333333;
}

/* 打开按钮的文字样式 */
.nav_section .section_item .upload_content .upload_text {
  font-size: 18px;
  line-height: 2.4;
}

/* 快捷工具栏样式 */
.quick_toolbar {
  margin-right: -20px;
  text-align: center;
  width: 60px;
}

/* 快捷工具栏中每个按钮的样式 */
.quick_toolbar a .anticon {
  padding: 5px;
  font-size: 20px;
  font-weight: bold;
  color: #333333;
}

/* 预留空白区样式 */
.reserve_space {
  width: 400px;
}
</style>
