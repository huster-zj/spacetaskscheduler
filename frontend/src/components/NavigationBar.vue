<template>
  <nav class="command-bar" aria-label="主要功能">
    <div class="command-bar__scroll">
      <div class="command-bar__inner">
        <section class="command-group" aria-labelledby="nav-project">
          <span id="nav-project" class="command-group__label">项目</span>
          <div class="command-group__items">
            <button class="command-item" type="button" @click="handleCreatePackage">
              <PlusCircleOutlined aria-hidden="true" />
              <span>新建</span>
            </button>
            <a-upload :show-upload-list="false" :before-upload="handleFileChangeHandler" accept=".sts,.zip">
              <button class="command-item" type="button">
                <FolderOpenOutlined aria-hidden="true" />
                <span>打开</span>
              </button>
            </a-upload>
            <button class="command-item" type="button" @click="saveZipFileHandler">
              <FolderOutlined aria-hidden="true" />
              <span>另存为</span>
            </button>
            <RouterLink
              to="/attributes"
              class="command-item"
              :class="{ 'is-active': isRouteActive(['/attributes']) }"
              :aria-current="isRouteActive(['/attributes']) ? 'page' : undefined"
            >
              <PicLeftOutlined aria-hidden="true" />
              <span>属性</span>
            </RouterLink>
          </div>
        </section>

        <section class="command-group" aria-labelledby="nav-view">
          <span id="nav-view" class="command-group__label">视图</span>
          <div class="command-group__items">
            <RouterLink
              to="/main_view"
              class="command-item"
              :class="{ 'is-active': isRouteActive(['/main_view']) }"
              :aria-current="isRouteActive(['/main_view']) ? 'page' : undefined"
            >
              <LayoutOutlined aria-hidden="true" />
              <span>主视图</span>
            </RouterLink>
          </div>
        </section>

        <section class="command-group" aria-labelledby="nav-resource">
          <span id="nav-resource" class="command-group__label">资源</span>
          <div class="command-group__items">
            <RouterLink
              to="/resource"
              class="command-item"
              :class="{ 'is-active': isRouteActive(resourceRoutes) }"
              :aria-current="isRouteActive(resourceRoutes) ? 'page' : undefined"
            >
              <UnorderedListOutlined aria-hidden="true" />
              <span>资源</span>
            </RouterLink>
            <RouterLink
              to="/resource_group"
              class="command-item"
              :class="{ 'is-active': isRouteActive(resourceGroupRoutes) }"
              :aria-current="isRouteActive(resourceGroupRoutes) ? 'page' : undefined"
            >
              <ClusterOutlined aria-hidden="true" />
              <span>资源组</span>
            </RouterLink>
          </div>
        </section>

        <section class="command-group" aria-labelledby="nav-task">
          <span id="nav-task" class="command-group__label">任务</span>
          <div class="command-group__items">
            <RouterLink
              to="/task"
              class="command-item"
              :class="{ 'is-active': isRouteActive(taskRoutes) }"
              :aria-current="isRouteActive(taskRoutes) ? 'page' : undefined"
            >
              <BarsOutlined aria-hidden="true" />
              <span>任务</span>
            </RouterLink>
            <RouterLink
              to="/temporal_constraint"
              class="command-item"
              :class="{ 'is-active': isRouteActive(temporalRoutes) }"
              :aria-current="isRouteActive(temporalRoutes) ? 'page' : undefined"
            >
              <FieldTimeOutlined aria-hidden="true" />
              <span>时态约束</span>
            </RouterLink>
            <RouterLink
              to="/logical_constraint"
              class="command-item"
              :class="{ 'is-active': isRouteActive(logicalRoutes) }"
              :aria-current="isRouteActive(logicalRoutes) ? 'page' : undefined"
            >
              <PartitionOutlined aria-hidden="true" />
              <span>逻辑约束</span>
            </RouterLink>
          </div>
        </section>

        <section class="command-group" aria-labelledby="nav-schedule">
          <span id="nav-schedule" class="command-group__label">调度</span>
          <div class="command-group__items">
            <RouterLink
              to="/operating"
              class="command-item"
              :class="{ 'is-active': isRouteActive(['/operating']) }"
              :aria-current="isRouteActive(['/operating']) ? 'page' : undefined"
            >
              <PlayCircleOutlined aria-hidden="true" />
              <span>运行</span>
            </RouterLink>
            <RouterLink
              to="/result"
              class="command-item"
              :class="{ 'is-active': isRouteActive(['/result']) }"
              :aria-current="isRouteActive(['/result']) ? 'page' : undefined"
            >
              <CalculatorOutlined aria-hidden="true" />
              <span>调度结果</span>
            </RouterLink>
            <RouterLink
              to="/report"
              class="command-item"
              :class="{ 'is-active': isRouteActive(reportRoutes) }"
              :aria-current="isRouteActive(reportRoutes) ? 'page' : undefined"
            >
              <FileTextOutlined aria-hidden="true" />
              <span>报告</span>
            </RouterLink>
          </div>
        </section>

        <section class="command-group command-group--help" aria-labelledby="nav-help">
          <span id="nav-help" class="command-group__label">帮助</span>
          <div class="command-group__items">
            <RouterLink
              to="/help"
              class="command-item"
              :class="{ 'is-active': isRouteActive(['/help']) }"
              :aria-current="isRouteActive(['/help']) ? 'page' : undefined"
            >
              <QuestionCircleOutlined aria-hidden="true" />
              <span>帮助中心</span>
            </RouterLink>
            <RouterLink
              to="/license"
              class="command-item"
              :class="{ 'is-active': isRouteActive(['/license']) }"
              :aria-current="isRouteActive(['/license']) ? 'page' : undefined"
            >
              <SolutionOutlined aria-hidden="true" />
              <span>许可证</span>
            </RouterLink>
            <RouterLink
              to="/about"
              class="command-item"
              :class="{ 'is-active': isRouteActive(['/about']) }"
              :aria-current="isRouteActive(['/about']) ? 'page' : undefined"
            >
              <InfoCircleOutlined aria-hidden="true" />
              <span>关于</span>
            </RouterLink>
          </div>
        </section>

        <div class="quick-tools" aria-label="常用功能快捷入口">
          <RouterLink
            to="/main_view"
            class="quick-tool"
            :class="{ 'is-active': isRouteActive(['/main_view']) }"
            title="主视图"
            aria-label="主视图"
          >
            <LayoutOutlined aria-hidden="true" />
          </RouterLink>
          <RouterLink
            to="/resource"
            class="quick-tool"
            :class="{ 'is-active': isRouteActive(resourceRoutes) }"
            title="资源"
            aria-label="资源"
          >
            <UnorderedListOutlined aria-hidden="true" />
          </RouterLink>
          <RouterLink
            to="/task"
            class="quick-tool"
            :class="{ 'is-active': isRouteActive(taskRoutes) }"
            title="任务"
            aria-label="任务"
          >
            <BarsOutlined aria-hidden="true" />
          </RouterLink>
          <RouterLink
            to="/operating"
            class="quick-tool"
            :class="{ 'is-active': isRouteActive(['/operating']) }"
            title="运行"
            aria-label="运行"
          >
            <PlayCircleOutlined aria-hidden="true" />
          </RouterLink>
          <RouterLink
            to="/report"
            class="quick-tool"
            :class="{ 'is-active': isRouteActive(reportRoutes) }"
            title="报告"
            aria-label="报告"
          >
            <FileTextOutlined aria-hidden="true" />
          </RouterLink>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { message } from 'ant-design-vue'
import { useRoute, useRouter } from 'vue-router'
import { handleFileChange, resetPlanningPackage, saveZipFile } from '@/utils/fileHandler'

const route = useRoute()
const router = useRouter()

const resourceRoutes = ['/resource', '/resource_detail', '/cekong_resource', '/cekong_resource_detail']
const resourceGroupRoutes = ['/resource_group', '/new_resource_group', '/resource_group_detail']
const taskRoutes = ['/task', '/task_detail']
const temporalRoutes = ['/temporal_constraint', '/custom_tem_constraint', '/tem_constraint_detail']
const logicalRoutes = ['/logical_constraint', '/custom_logical_constraint', '/logical_constraint_detail']
const reportRoutes = ['/report', '/report_content']

const isRouteActive = (paths) => paths.some((path) => route.path === path || route.path.startsWith(`${path}/`))

const saveZipFileHandler = async () => {
  try {
    const result = await saveZipFile()
    message.success(`已保存 ${result.filename}`)
  } catch (error) {
    message.error(error.message || '规划包保存失败')
  }
}

const handleFileChangeHandler = async (file) => {
  try {
    await handleFileChange(file)
    message.success(`已打开 ${file.name}`)
    await router.push('/attributes')
  } catch (error) {
    message.error(error.message || '规划包打开失败')
  }
  return false
}

const handleCreatePackage = async () => {
  resetPlanningPackage()
  await router.push('/attributes')
  message.success('已新建空白规划包')
}

</script>

<style scoped>
.command-bar {
  min-width: 0;
  height: 100%;
  background: var(--sts-surface-raised);
}

.command-bar__scroll {
  height: 100%;
  overflow-x: auto;
  overscroll-behavior-x: contain;
  scrollbar-width: thin;
  scrollbar-color: var(--sts-border-strong) transparent;
}

.command-bar__scroll::-webkit-scrollbar {
  height: 4px;
}

.command-bar__scroll::-webkit-scrollbar-thumb {
  border-radius: 2px;
  background: var(--sts-border-strong);
}

.command-bar__inner {
  display: flex;
  width: max-content;
  min-width: 100%;
  min-height: 72px;
  padding: 5px 0;
  align-items: stretch;
}

.command-group {
  display: flex;
  position: relative;
  padding: 0 10px 15px;
  align-items: center;
  border-right: 1px solid var(--sts-border);
}

.command-group:first-child {
  padding-left: 4px;
}

.command-group__label {
  position: absolute;
  right: 10px;
  bottom: 0;
  left: 10px;
  color: var(--sts-ink-muted);
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0;
  line-height: 16px;
  text-align: center;
  text-transform: uppercase;
}

.command-group__items {
  display: flex;
  align-items: center;
  gap: 4px;
}

.command-item {
  display: inline-flex;
  min-width: 50px;
  min-height: 46px;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 3px;
  padding: 4px 6px;
  border: 0;
  border-radius: var(--sts-radius-md);
  background: transparent;
  color: var(--sts-ink-secondary);
  font-size: 12px;
  line-height: 1.2;
  white-space: nowrap;
  cursor: pointer;
  transition: background-color var(--sts-transition-fast), color var(--sts-transition-fast),
    box-shadow var(--sts-transition-fast);
}

.command-item:hover {
  background: var(--sts-surface-subtle);
  color: var(--sts-ink-primary);
}

.command-item.is-active,
.command-item.router-link-active {
  background: var(--sts-primary-soft);
  color: var(--sts-primary-hover);
  font-weight: 600;
  box-shadow: inset 0 -2px 0 var(--sts-primary);
}

.command-item .anticon {
  font-size: 18px;
}

.quick-tools {
  display: grid;
  grid-template-columns: repeat(3, 36px);
  grid-template-rows: repeat(2, 36px);
  flex: 0 0 auto;
  margin-left: auto;
  padding: 0 4px 0 10px;
  align-content: center;
  gap: 3px 4px;
}

.quick-tool {
  display: inline-flex;
  width: 36px;
  height: 36px;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--sts-border);
  border-radius: var(--sts-radius-md);
  color: var(--sts-ink-secondary);
  transition: border-color var(--sts-transition-fast), background-color var(--sts-transition-fast),
    color var(--sts-transition-fast), box-shadow var(--sts-transition-fast);
}

.quick-tool:hover {
  border-color: var(--sts-primary);
  background: var(--sts-primary-soft);
  color: var(--sts-primary-hover);
}

.quick-tool.is-active {
  border-color: var(--sts-primary);
  background: var(--sts-primary-soft);
  color: var(--sts-primary-hover);
  box-shadow: inset 0 -2px 0 var(--sts-primary);
}

@media (max-width: 767px) {
  .command-bar__inner {
    min-height: 68px;
    padding: 4px 0;
  }

  .command-group {
    padding-right: 10px;
    padding-left: 10px;
    padding-bottom: 16px;
  }

  .command-group:first-child {
    padding-left: 4px;
  }

  .command-group__label {
    right: 10px;
    left: 10px;
  }

  .command-item {
    min-width: 50px;
    min-height: 42px;
  }

  .quick-tools {
    padding-left: 10px;
  }
}
</style>
