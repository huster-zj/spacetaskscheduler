---
baseline_commit: 8c5e4cc0afc66cb2fa759fb86700d8f19dfeeab7
---

# Story 1.8: 属性自动保存与调度工作台 UI/UX 重构

Status: review

## Story

作为航天任务规划人员，
我希望属性配置在编辑后自动保存，并让整个调度工作台拥有更有层次、更精致、更具专业感的视觉和交互体验，
以便我可以连续配置规划包而不被“保存”按钮打断，并能快速识别当前流程、数据状态和可执行操作。

## Acceptance Criteria

### A. 属性页自动保存

1. `/attributes` 页面不再显示“保存”按钮，也不通过保存按钮自动跳转到 `/resource`；用户仍可通过全局导航和规划步骤条进入其他页面。
2. 属性页以下字段发生变化后自动写入现有 `useConfigStore().basicConfig`，并继续通过现有 Pinia 持久化机制保存：规划包名称、描述、时间范围、资源优先级上下限与规则、任务优先级上下限与规则。
3. 自动保存使用防抖，避免一次输入触发多次写入；防抖期间显示明确的“待保存/正在保存”状态，完成后显示“已保存”和最近保存时间，不使用每次输入都弹出的全局 toast。
4. 首次加载、从 Store 同步到本地表单、打开历史规划包或导入 `.sts` 时不得误判为用户编辑，不产生多余保存或覆盖刚恢复的数据。
5. 用户在防抖窗口内离开属性页时，待保存变更必须先刷新到 Store；刷新页面或切换到资源页后，属性值保持最新。自动保存失败时保留表单值，显示可理解的失败状态，并允许后续编辑重试。
6. 自动保存只负责当前配置状态和既有本地持久化，不自动下载 `.sts` 文件、不改变“另存为”、打开、新建、历史规划包和后端接口行为。

### B. 全局 UI/UX 重构

7. 所有已注册路由继续可访问，现有导航、步骤条、Pinia Store、文件导入/导出、预处理、COPT、分支定价切割、报告和算法结果行为保持不变；本 Story 不修改 `backend/`、算法 JAR 或 API 数据契约。
8. 全局视觉形成统一的“专业调度工作台”风格：信息层次、状态色、间距、边框、控件尺寸、表格、弹窗、空状态和加载状态一致；视觉上更有空间层次和操作反馈，但不使用大面积渐变、装饰光斑、营销式 Hero、卡片嵌套或纯装饰动画。
9. 工作台首页、属性、资源、资源组、任务、约束、主视图、运行、结果、报告、帮助、许可证和关于页面使用统一的页面标题、上下文说明、工具栏和内容分区；用户在当前页面能清楚看到当前流程位置、页面状态和下一步可执行操作。
10. 主要操作优先使用现有 Ant Design Vue 组件和 `@ant-design/icons-vue` 图标；图标按钮具有 `title` 或可访问名称，按钮、输入框、表格操作和弹窗保持清晰的 hover/focus/disabled/loading 状态。
11. 动效只用于导航切换、保存状态、面板展开、加载和结果反馈，短、可中断且不影响输入；遵守 `prefers-reduced-motion`，不使用会导致布局跳动或遮挡内容的动画。
12. 在 1440x900、1024x768 和 390x844 视口下，页面无页面级横向溢出、文字裁切、按钮重叠或固定层遮挡；导航、步骤条和数据密集区只在自身容器内滚动，移动端关键触控目标不小于 44px。
13. UI 重构不得改变现有字段含义、表格列、路由路径、数据结构、事件顺序、接口调用、错误分支和算法运行流程；发现旧页面存在与本 Story 无关的类型债务时，不扩大范围修复。

### C. 验证与交付

14. 新增针对自动保存的单元测试，至少覆盖：初始挂载不保存、防抖合并连续修改、时间范围修改、离开页面前刷新待保存内容、保存失败状态和保存按钮不存在。
15. 新增或调整共享 UI/UX 回归测试，覆盖导航当前态、全局状态反馈和关键页面外壳；现有测试不得因视觉重构失效。
16. `npx vitest run` 与 `npm run build-only` 通过；如运行 `npm run build` 或 `npm run type-check`，不得新增上一条 UI/UX story 已记录之外的类型错误。
17. 完成关键路由在三种视口下的浏览器验收，检查控制台错误、自动保存状态、属性值恢复、导航与核心操作；交付前记录实际验证结果，不以截图或静态代码检查代替交互验证。

## Tasks / Subtasks

- [x] Task 1: 建立属性页自动保存状态机（AC: 1-6, 14）
  - [x] 梳理 `Attributes.vue` 当前本地副本、`useConfigStore` 持久化和规划包导入/恢复时序。
  - [x] 移除保存按钮及其保存后跳转，增加防抖保存、初始化保护、离开前 flush 和可访问的内联状态反馈。
  - [x] 复用 `useConfigStore.updateConfig`，未创建第二套配置 Store。
  - [x] 验证输入校验、dayjs 时间范围转换和现有默认值保持不变。

- [x] Task 2: 设计并落地全局视觉层级（AC: 7-13）
  - [x] 基于现有 `theme.css`、`DESIGN.md` 和 `EXPERIENCE.md` 更新设计 token、表面层级、状态反馈、动效和响应式规则。
  - [x] 重构 `App.vue`、`AppHeader.vue`、`NavigationBar.vue`、`Steps.vue` 的品牌栏、导航、当前态和稳定动效，同时保留所有原有事件与路由。
  - [x] 统一页面级标题、工具栏、内容分区、空状态、加载状态、错误反馈和主次操作，不把页面改成卡片套卡片。
  - [x] 逐页校准工作台、属性、资源、任务、主视图、运行、结果和报告；数据表、甘特图、表单和弹窗保持容器稳定与局部滚动。
  - [x] 复用 Ant Design Vue 3.2.20、现有图标和现有依赖，不新增 UI 框架或手绘 SVG。

- [x] Task 3: 响应式、无障碍和动效验收（AC: 10-13, 17）
  - [x] 检查键盘 Tab 顺序、可见焦点、图标名称、状态文本和颜色之外的状态表达。
  - [x] 在 1440x900、1024x768、390x844 检查页面级溢出、控件重叠、文本折行和固定层遮挡。
  - [x] 确保 `prefers-reduced-motion` 下不依赖动画完成操作。

- [x] Task 4: 回归测试与交付记录（AC: 14-17）
  - [x] 添加自动保存测试和共享 UI 回归测试，使用 Vitest/Vue Test Utils 现有测试模式。
  - [x] 运行单元测试、生产构建、必要的定向 lint 和 `git diff --check`。
  - [x] 记录浏览器验收的路由、视口、核心操作、控制台状态和最终结果。

## Dev Notes

### Scope and product interpretation

- “酷炫”在本产品中解释为专业、清晰、有空间层次和即时反馈的调度工作台，不是营销页面或装饰性大屏。优先提升扫描效率、状态可见性、操作连续性和视觉精致度。
- 自动保存是属性配置的无按钮编辑体验，不等同于自动下载规划包。用户仍通过“另存为”导出 `.sts`，通过打开/历史文档恢复规划包。
- 本 Story 不改变资源、任务、约束详情页中已有的业务保存动作，除非实现统一视觉层时只调整其呈现，不改变处理逻辑。

### Existing implementation and preservation map

- `frontend/src/views/Attributes.vue` 当前使用 `reactive({ ...basicConfig.value })` 作为本地表单，深度监听 Store 回填；时间范围通过 computed 在 ISO 字符串与 dayjs 之间转换；`handleSubmit` 使用 `$patch` 后显示成功 toast，并被保存按钮和 `/resource` 链接调用。自动保存必须替换这条提交入口，不能同时保留两个来源。
- `frontend/src/stores/useConfigStore.js` 使用 `basicConfig` ref、`updateConfig` 和 `pinia-plugin-persistedstate` 的 `sessionStorage`。优先调用 `updateConfig`，不要绕过 Store 新增 localStorage 或直接改 DOM。
- `frontend/src/utils/fileHandler.js` 的 `restorePlanningPackageSnapshot` 会整体替换配置和业务 Store；导入/历史打开后要先完成表单同步，再允许自动保存 watcher 工作。
- `frontend/src/stores/useFileDetailStore.js` 保存的是完整规划包历史快照；本 Story 不在每个属性输入时自动生成 `.sts` 下载，也不擅自重写历史快照模型。
- `frontend/src/components/AppHeader.vue` 的示例规划包下载和退出登录、`frontend/src/components/NavigationBar.vue` 的新建/打开/另存为/导航、`frontend/src/components/Steps.vue` 的路径映射必须保留。
- 既有 UI/UX story 已建立 `frontend/src/assets/theme.css` 的 `--sts-*` token、Ant Design Vue 覆盖、局部横向滚动和三视口基线。扩展这些模式，不要重新引入另一套颜色/间距/组件约定。

### Auto-save implementation guardrails

- 使用明确的 `isHydrating`/`isReady` 或等价初始化保护，避免 `watch` 在 mount、Store 回填和导入恢复时触发保存。
- 防抖定时器必须可清理；组件卸载或路由离开前 flush 待保存变更，不能依赖定时器恰好执行。
- 不要为每次键盘输入发送全局 `message.success`。使用属性页内联 status，并在失败时保留用户输入和可理解错误。
- 自动保存状态文本必须有 `role="status"` 或等价可访问语义，不能只用颜色或动画表达。
- 保存动作应以当前配置的完整快照 patch 为单位，避免只保存最近改变的一个字段而丢失其他字段。
- 测试使用 fake timers 或等价可控时间机制；不得通过真实长时间等待掩盖竞态。

### UI/UX implementation guardrails

- 继续使用 Vue 3、Vue Router、Pinia、Ant Design Vue 3.2.20、`@ant-design/icons-vue`、DHTMLX Gantt、JSZip 和 dayjs；不要新增依赖。
- 保持现有路由路径和主流程；不得通过重命名路由或删除页面来“简化”重构。
- 视觉重构只改模板语义、样式、可访问性和表现层状态；Store、服务、算法、后端和数据结构不改。
- 常规页面段落使用无框布局或单层 surface panel；重复数据项可以使用单层卡片，但不得出现 card-in-card。
- 不使用负字距，不按视口宽度缩放字号；固定格式的工具栏、步骤条、表格和图标按钮保持稳定尺寸。
- 窄屏下只让导航、步骤条、表格、甘特图等自身容器滚动；`body` 不产生不可控横向滚动。
- 动效必须提供静态可用状态，时长短且不影响输入；尊重已有 `prefers-reduced-motion` 规则。

### Testing baseline and known risks

- 上一条 UI/UX story 已记录：`npx vitest run` 和 `npm run build-only` 曾通过；完整类型检查存在既有 `main.ts` 路由声明、`Task.vue` 类型和 JS 模块声明问题。本 Story 不得新增错误，也不以修复这些既有问题作为前置条件。
- 现有测试目录位于 `frontend/src/**/__tests__`；新增测试应靠近被测组件或 composable，使用现有 Vitest/Vue Test Utils 配置。
- 必须区分组件初始 hydration、用户输入、路由离开、导入恢复和手动另存为；这些时序是自动保存最容易产生回归的位置。
- 工作区当前存在用户未提交修改、运行生成文件以及未跟踪的部署/配置文件。开发时禁止 `git reset --hard`、`git clean`、批量覆盖无关文件或把这些文件纳入本 Story。

### Project Structure Notes

- 页面继续位于 `frontend/src/views/`，共享外壳位于 `frontend/src/components/`，设计 token 位于 `frontend/src/assets/theme.css`，自动保存 composable 如确有必要放在 `frontend/src/composables/`。
- 不把自动保存逻辑放入后端或文件下载服务；不在每个页面复制防抖代码。
- 若 UI 方向需要调整设计规范，应同步更新 `_bmad-output/planning-artifacts/ux-designs/ux-spacetaskscheduler-2026-08-14/DESIGN.md` 与 `EXPERIENCE.md`，保持文档和实际实现一致。
- 当前没有 `sprint-status.yaml`/epics 文件；本 Story 依据既有 `1-1` UI/UX story 和现有源码顺延编号为 1.8，不要因为缺少 sprint tracking 文件而重排已有 story。

### References

- [Source: `_bmad-output/implementation-artifacts/1-1-ui-ux-refactor.md`, Acceptance Criteria, Dev Notes, Completion Notes]
- [Source: `_bmad-output/implementation-artifacts/1-2-feature-completion.md`, AC 1-3 and deferred work on unsaved content]
- [Source: `_bmad-output/implementation-artifacts/deferred-work.md`, 未保存内容保护]
- [Source: `_bmad-output/planning-artifacts/ux-designs/ux-spacetaskscheduler-2026-08-14/DESIGN.md`, Brand & Style, Colors, Components]
- [Source: `_bmad-output/planning-artifacts/ux-designs/ux-spacetaskscheduler-2026-08-14/EXPERIENCE.md`, State Patterns, Accessibility Floor, Responsive & Platform]
- [Source: `frontend/src/views/Attributes.vue`, current form and explicit save handler]
- [Source: `frontend/src/stores/useConfigStore.js`, config Store and session persistence]
- [Source: `frontend/src/utils/fileHandler.js`, planning package snapshot/restore flow]
- [Source: `frontend/src/stores/useFileDetailStore.js`, local history snapshot model]
- [Source: `frontend/src/App.vue`, application chrome and footer]
- [Source: `frontend/src/components/AppHeader.vue`, header actions]
- [Source: `frontend/src/components/NavigationBar.vue`, file operations and navigation]
- [Source: `frontend/src/components/Steps.vue`, workflow route mapping]
- [Source: `frontend/src/assets/theme.css`, global tokens, Ant Design normalization, responsive rules]
- [Source: `frontend/package.json`, Vue/Pinia/Ant Design/Vitest scripts and dependency versions]

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Implementation Plan

- 先用 Attributes 组件测试定义初始化、防抖、离开 flush、失败状态和无保存按钮行为，再实现自动保存状态机。
- 在现有 `--sts-*` token 和 Ant Design Vue 组件上扩展专业调度工作台视觉，优先重构共享外壳并让页面通过全局模式继承。
- 逐页补齐标题、状态和内容层级，保持路由、Store、文件、算法和 API 行为不变。
- 运行全量前端测试与生产构建，并在桌面、平板和移动视口完成浏览器验收。

### Debug Log References

- 2026-08-18: No sprint-status or epics file found; used existing Story 1.1 and current source as the planning baseline and reserved story key `1-8-auto-save-and-uiux-redesign`.
- 2026-08-18: Confirmed attributes currently use a local reactive form plus explicit `handleSubmit`; `useConfigStore` already persists `basicConfig` through sessionStorage.
- 2026-08-18: Confirmed existing UI/UX token and responsive baseline; scope preserves all routes, stores, services, algorithms and backend contracts.
- 2026-08-18: Added `Attributes.spec.js` first in the RED phase; after unifying the test Pinia instance, all 5 auto-save tests pass.
- 2026-08-18: Reworked shared tokens, application chrome, command navigation, workflow steps, list surfaces and page-level context without changing route targets or business handlers.
- 2026-08-18: Browser smoke check initially exposed a blank async route during `out-in` transition; removed the incompatible shell transition and retained panel-level motion so lazy routes render reliably.
- 2026-08-18: Verified 1440x900, 1024x768 and 390x844 in headless Electron across attributes, resource, task, main view, operating and report routes; no page-level horizontal overflow or console errors observed.

### Completion Notes List

- Story context created for attribute auto-save and a substantial but behavior-preserving global UI/UX redesign.
- Auto-save boundaries, hydration protection, debounce/flush behavior, failure feedback and file export boundaries are explicit.
- Existing UI/UX design system, source paths, testing baseline, known type debt and dirty-worktree constraints are recorded for the developer.
- Task 1 implementation: removed the explicit attributes save action; added 400ms debounced Store updates, hydration protection, unmount flush, inline status and retryable error handling.
- Task 2 implementation: strengthened surface, focus, status, table and responsive tokens; refined the header, grouped navigation, workflow steps and shared list surface; added consistent context headers to resource, task, constraint and main-view pages; removed the login background gradient.
- Task 3 implementation: added route-active semantics, completion/current/upcoming step states, named icon actions, visible focus treatment, reduced-motion handling and scoped horizontal scrolling.
- Task 4 verification: `npx vitest run --pool=forks --maxWorkers=1 --minWorkers=1` passed 64 tests with 1 existing integration test skipped; `npm run build-only` passed; targeted ESLint passed; Story-scoped `git diff --check` passed; Cypress smoke check passed at all 3 viewports.

### File List

- `_bmad-output/implementation-artifacts/1-8-auto-save-and-uiux-redesign.md`
- `frontend/src/views/Attributes.vue`
- `frontend/src/views/__tests__/Attributes.spec.js`
- `frontend/src/assets/theme.css`
- `frontend/src/App.vue`
- `frontend/src/components/AppHeader.vue`
- `frontend/src/components/NavigationBar.vue`
- `frontend/src/components/Steps.vue`
- `frontend/src/components/table/show_table.vue`
- `frontend/src/components/__tests__/AppChrome.spec.js`
- `frontend/src/views/Login.vue`
- `frontend/src/views/MainView.vue`
- `frontend/src/views/resource/Resource.vue`
- `frontend/src/views/task/Task.vue`
- `frontend/src/views/task/taskTem/TemporalConstraint.vue`
- `frontend/src/views/task/taskGroup/LogicalConstraint.vue`
- `frontend/cypress/e2e/codex-ui-check.cy.ts`

## Change Log

- 2026-08-18: Completed attribute auto-save and shared UI/UX redesign implementation; status advanced to `review` pending local acceptance.
