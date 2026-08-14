---
baseline_commit: 6e6034f78f17775c07dd6d86e649840022c7284a
---

# Story 1.1: 全项目 UI/UX 视觉重构

Status: review

## Story

作为空间任务规划人员，
我希望整个调度系统拥有统一、清晰且响应式的专业界面，
以便在不改变任何业务功能的前提下更高效地浏览、配置和检查规划数据。

## Acceptance Criteria

1. 所有现有路由、Pinia 状态、API 调用、文件导入/导出、算法执行、表单提交和列表操作保持原业务行为与数据契约。
2. 应用使用统一的颜色、字体、间距、圆角、边框、按钮、表格、表单、弹窗和状态反馈规范，符合 `DESIGN.md` 与 `EXPERIENCE.md`。
3. 品牌栏、全局导航和规划步骤条在当前路由/步骤上提供清晰状态，并保留原跳转与命令行为。
4. 首页、属性、主视图、资源、资源组、任务、时态约束、逻辑约束、运行、报告及其详情页面都继承统一外壳；不出现卡片嵌套或营销页式布局。
5. 在 1440x900、1024x768 和 390x844 视口下，应用外壳、导航、表单和按钮不重叠；数据密集区域可在自身容器内横向滚动。
6. 键盘焦点可见，图标命令有可访问名称，文本与关键控件保持可读对比度。
7. 新增共享外壳/导航的针对性测试并通过；`npm run build-only` 通过；完整 `npm run build` 不新增基线之外的类型错误。

## Tasks / Subtasks

- [x] Task 1: 建立视觉规范与全局设计 token (AC: 2, 5, 6)
  - [x] 创建 BMad `DESIGN.md` 与 `EXPERIENCE.md`
  - [x] 新增全局样式入口，统一基础元素和 Ant Design 组件
- [x] Task 2: 重构应用外壳、品牌栏和全局导航 (AC: 1, 2, 3, 5, 6)
  - [x] 保留下载、打开、另存为、路由和外部帮助行为
  - [x] 增加当前路由状态和窄屏滚动布局
- [x] Task 3: 重构规划步骤条和工作台信息层级 (AC: 1, 2, 3, 4, 5)
  - [x] 保留步骤索引与原路由映射
  - [x] 统一工作台标题、流程入口、历史文档与状态显示
- [x] Task 4: 统一全项目共享表格、表单和页面容器 (AC: 1, 2, 4, 5, 6)
  - [x] 通过共享样式覆盖列表、详情、运行、报告和主视图
  - [x] 数据表与双列表在窄屏内部滚动
- [x] Task 5: 回归测试与视觉验收 (AC: 1-7)
  - [x] 添加并运行共享 UI 单元测试
  - [x] 运行打包和基线类型检查对比
  - [x] 浏览器检查关键路由、控制台和三种视口

## Dev Notes

### Guardrails

- 不修改 `frontend/src/stores`、`frontend/src/services`、后端、算法或数据结构。
- 不新增 UI 依赖；复用 Ant Design Vue 3.2.20 与 `@ant-design/icons-vue`。
- 允许调整 Vue 模板语义和 CSS；脚本只做表现层所需的路由状态或可访问性改动。
- 保留现有路由路径，包括当前未注册的快捷报告链接，避免扩大功能范围。
- 当前完整构建已有 `Task.vue` 隐式 any/unknown 和 JS 模块声明缺失错误；本 Story 不修复这些类型债务，但不得增加新错误。
- 当前仓库没有单元测试文件；本 Story 从共享 UI 开始建立最小回归覆盖。

### Current State and Preservation Map

- `AppHeader.vue`: 下载 `/api/download_test_files` 并生成带日期文件名，必须原样保留。
- `NavigationBar.vue`: 文件打开/另存为、一级路由、外部帮助/关于与报告快捷入口必须保留。
- `Steps.vue`: 现有 0-9 索引和路由映射必须保留，索引 5 仍不跳转。
- `WorkSpace.vue`: 搜索、筛选、Pinia 历史文档数据和表格内容保持不变。
- 页面级组件：不得改变现有 `v-model`、emit、Store patch、API 调用、消息或弹窗分支。

### Testing Baseline

- `npm run build-only`: 通过。
- `npm run build`: 失败，基线错误集中在 `main.ts` 路由声明、`Task.vue` 类型和 JS 模块声明。
- `npm run test:unit -- --run`: 无测试文件，基线失败。

### References

- [Source: _bmad-output/planning-artifacts/ux-designs/ux-spacetaskscheduler-2026-08-14/DESIGN.md]
- [Source: _bmad-output/planning-artifacts/ux-designs/ux-spacetaskscheduler-2026-08-14/EXPERIENCE.md]
- [Source: frontend/package.json]
- [Source: frontend/src/router/index.js]
- [Source: frontend/src/App.vue]
- [Source: frontend/src/components/AppHeader.vue]
- [Source: frontend/src/components/NavigationBar.vue]
- [Source: frontend/src/components/Steps.vue]

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- 2026-08-14: 建立 `v2_main` 最新提交、打包、类型检查和测试基线。
- 2026-08-14: `npx vitest run` 通过，共 1 个测试文件、3 个测试。
- 2026-08-14: `npm run build-only` 通过，生产构建完成 3177 个模块转换。
- 2026-08-14: `npm run type-check` 仅保留基线中的 `main.ts` 路由声明、`Task.vue` 隐式类型和 JS 模块声明错误，未发现新增 UI 类型错误。
- 2026-08-14: 浏览器检查 `/`、`/attributes`、`/main_view`、`/resource`、`/task`、`/operating`、`/report`，并验证资源与任务导航跳转。
- 2026-08-14: 在 1440x900、1024x768、390x844 视口完成布局检查，无页面级横向溢出或控件重叠。
- 2026-08-14: `git diff --check` 通过，无空白错误。
- 2026-08-14: 根据本地验收反馈复测顶部单行导航及内容比例；属性、首页、资源、任务页面在 1024px 下均占满可用宽度，导航超宽内容限制在自身滚动区域。
- 2026-08-14: 验收反馈调整后重新运行 `npx vitest run` 与 `npm run build-only`，3 个测试及 3177 模块生产构建全部通过。
- 2026-08-14: 第二轮验收反馈后校准品牌图标与导航图标中心线，并在 1440x900、390x844 下确认无页面级横向溢出。
- 2026-08-14: 常用功能快捷区改为主视图、资源、任务、运行、报告五个有效路由；补充路由断言后 3 个测试及生产构建通过。
- 2026-08-14: 第三轮验收反馈后检查属性页步骤条：桌面端高度 41px、移动端高度 47px，均为单行内部滚动且无页面级横向溢出。
- 2026-08-14: 品牌图标调整为桌面 48px、移动端 40px，实测上下留白分别为 14px/14px 与 19px/19px；3 个测试及生产构建通过。
- 2026-08-14: 第四轮验收反馈后按旧版分组语义复查流程条：5 个主节点、5 个子节点、4 个阶段边界，组内连接 72px、跨组连接 136px。
- 2026-08-14: 流程条桌面宽度限制为 1320px 并居中，移动端 355px 容器内滚动 1128px 流程内容；页面无横向溢出，3 个测试及生产构建通过。

### Completion Notes List

- BMad UX 双规范已创建，Story 以最新提交 `6e6034f` 为基线进入开发。
- 新增全局设计 token 与 Ant Design Vue 统一覆盖，形成克制、专业、数据密集型工作台视觉体系。
- 重构应用外壳、导航、步骤条、工作台、资源、任务、约束、运行、报告及详情视图，保留现有路由、状态、API 与交互行为。
- 窄屏导航、步骤条、表格和甘特图使用容器内滚动，修复移动端表单栅格边界偏移。
- 新增共享外壳与导航单元测试；单元测试和生产构建通过，类型检查未增加基线之外的错误。
- 根据本地验收反馈，将品牌栏与导航合并为单行工具栏，仅保留品牌图标和示例数据下载图标；移除当前工作区、规划包编辑及属性页“规划属性”标题。
- 放宽全局内容宽度并收紧页面左右内边距，产品名称与系统说明改在页脚展示。
- 品牌图标已与导航图标行对齐；“关于”右侧快捷区移动到下载按钮左侧，以两行图标提供五个常用页面跳转。
- 品牌图标改为更大尺寸并在顶栏内保持相等上下留白；属性配置页恢复规划步骤条，流程标题与紧凑步骤同排显示，并移除末尾进度数字。
- 产品名称统一为“航天任务调度工具”；流程条按新建规划包、资源、任务、算法四阶段着色，并恢复旧版大/小节点和组内短线、跨组长线的区分方式。

### File List

- _bmad-output/planning-artifacts/ux-designs/ux-spacetaskscheduler-2026-08-14/.decision-log.md
- _bmad-output/planning-artifacts/ux-designs/ux-spacetaskscheduler-2026-08-14/DESIGN.md
- _bmad-output/planning-artifacts/ux-designs/ux-spacetaskscheduler-2026-08-14/EXPERIENCE.md
- _bmad-output/implementation-artifacts/1-1-ui-ux-refactor.md
- frontend/src/App.vue
- frontend/index.html
- frontend/src/assets/theme.css
- frontend/src/components/AppHeader.vue
- frontend/src/components/NavigationBar.vue
- frontend/src/components/Steps.vue
- frontend/src/components/__tests__/AppChrome.spec.js
- frontend/src/components/button/radio-button.vue
- frontend/src/components/button/router-button.vue
- frontend/src/components/dropdown/drop_down.vue
- frontend/src/components/mainview/calendar.vue
- frontend/src/components/mainview/resource_view.vue
- frontend/src/components/mainview/task_view.vue
- frontend/src/components/resource/occupancy.vue
- frontend/src/components/table/name_action_table.vue
- frontend/src/components/table/name_operate_table.vue
- frontend/src/components/table/resource_pool_table.vue
- frontend/src/components/table/select_table.vue
- frontend/src/components/table/show_table.vue
- frontend/src/components/task/requirement/resource_requirement.vue
- frontend/src/components/task/scheduler_state.vue
- frontend/src/components/timeSelector/select_interval.vue
- frontend/src/main.ts
- frontend/src/views/Attributes.vue
- frontend/src/views/MainView.vue
- frontend/src/views/Operating.vue
- frontend/src/views/Report.vue
- frontend/src/views/ReportContent.vue
- frontend/src/views/WorkSpace.vue
- frontend/src/views/resource/NewResourceGroup.vue
- frontend/src/views/resource/Resource.vue
- frontend/src/views/resource/ResourceDetail.vue
- frontend/src/views/resource/ResourceGroup.vue
- frontend/src/views/resource/ResourceGroupDetail.vue
- frontend/src/views/resource/resourceList/CekongResource.vue
- frontend/src/views/resource/resourceList/CekongResourceDetail.vue
- frontend/src/views/task/Task.vue
- frontend/src/views/task/TaskDetail.vue
- frontend/src/views/task/taskGroup/CustomLogicalContraint.vue
- frontend/src/views/task/taskGroup/LogicalConstraint.vue
- frontend/src/views/task/taskGroup/LogicalContraintDetail.vue
- frontend/src/views/task/taskTem/CustomTemConstraints.vue
- frontend/src/views/task/taskTem/TemConstraintDetail.vue
- frontend/src/views/task/taskTem/TemporalConstraint.vue

## Change Log

- 2026-08-14: 创建 Story 1.1，记录 UX 规范、验收标准、实现任务与基线风险。
- 2026-08-14: 完成全项目 UI/UX 视觉重构、响应式适配、共享外壳测试与三视口浏览器验收，Story 进入 review。
- 2026-08-14: 完成本地验收反馈调整，合并顶部栏、精简品牌与属性页信息并扩大内容可用宽度，重新进入 review。
- 2026-08-14: 完成第二轮验收反馈，校准品牌图标并将右侧占位图标重构为两行常用功能快捷入口。
- 2026-08-14: 完成第三轮验收反馈，放大品牌图标并重构规划步骤条为属性页可见的紧凑单行布局。
- 2026-08-14: 完成第四轮验收反馈，统一产品名称并按旧版层级重构居中的四色分组流程条。
