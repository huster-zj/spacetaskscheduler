---
baseline_commit: 11c0ac486354565f82e905eb9af9cce0cee418e1
---

# Story 1.2: 核心业务功能补全

Status: review

## Story

作为航天任务规划人员，
我希望规划包可以可靠地创建、保存、恢复并通过真实数据查看调度过程与结果，
以便系统在算法能力不变的前提下形成完整、可信的日常工作闭环。

## Acceptance Criteria

1. 首页历史文档来自本地持久化的真实规划包快照，支持搜索、打开、下载和删除；没有历史时展示明确空状态，不再显示硬编码示例。
2. 新建规划包会清理当前工作数据并进入属性配置；打开 `.sts` 后完整恢复配置、资源、资源组、任务、约束、占用、调度状态、预处理及算法输出，并自动进入属性页。
3. `.sts` 文件包含格式版本和清单，导入前完成结构校验；导入失败时给出可理解反馈且不破坏当前数据；兼容 Story 1.1 及此前生成的旧格式文件。
4. 任务甘特图、资源甘特图和日程表仅使用当前 Pinia 数据、预处理数据与算法输出，支持数据变化后刷新、空状态和时间粒度切换，不再使用硬编码演示数据或生产环境无效的皮肤路径。
5. `/result` 使用独立结果页，展示调度概览、已分配/未分配状态、时间、弧段和资源，并对未运行、无结果及解析失败提供清晰状态。
6. 报告入口中的任务、资源、冲突与摘要基于当前规划包和调度结果动态生成；报告详情与下载内容不再包含固定示例项目。
7. 不修改后端算法、JAR、调度策略、预处理算法或现有算法接口契约；只消费已有接口返回和 Store 数据。
8. 新增规划包往返、算法输出解析、甘特图数据转换及核心页面状态测试；`npm run build-only` 和单元测试通过，桌面与移动端关键工作流无重叠和页面级横向溢出。

## Tasks / Subtasks

- [x] Task 1: 完成规划包与历史记录闭环 (AC: 1-3)
  - [x] 建立版本化规划包快照、校验和旧格式兼容
  - [x] 完整序列化和恢复所有业务 Store，包括 `Map` 状态
  - [x] 将新建、打开、另存为与历史文档操作接入统一服务
- [x] Task 2: 接入真实调度可视化 (AC: 4)
  - [x] 建立算法输出、预处理弧段与任务/资源定义的转换层
  - [x] 重构甘特图生命周期、时间粒度、提示和空状态
  - [x] 移除日程表硬编码数据和静态文件兜底
- [x] Task 3: 完成调度结果与报告 (AC: 5-6)
  - [x] 注册并实现独立 `/result` 页面
  - [x] 基于当前数据生成动态报告和筛选项
- [x] Task 4: 回归测试与验收 (AC: 7-8)
  - [x] 增加纯数据服务和 Store 测试
  - [x] 运行单元测试、生产构建和差异检查
  - [x] 验证桌面/移动端首页、主视图、结果和报告工作流

## Dev Notes

### Guardrails

- 严禁修改 `backend/`、`interface/java/`、算法 JAR 或算法请求/响应契约。
- 复用 Vue 3、Pinia、Ant Design Vue、DHTMLX Gantt、JSZip 和 dayjs；不新增依赖。
- 规划包导入采用“先完整解析校验，再一次性恢复 Store”，任何错误不得留下半导入状态。
- 旧格式中被 `JSON.stringify(Map)` 丢失的数据只能安全降级为空集合，不能虚构恢复内容。
- 所有可视化和报告必须显示真实空状态，不得使用示例任务、示例资源或固定报告作为接口失败回退。

### Current State and Preservation Map

- `utils/fileHandler.js`: 当前导出四个 JSON，但 `Map` 内容丢失；导入异步不可等待且没有恢复占用、调度和锚定数据。
- `stores/useFileDetailStore.js`: 当前六条历史数据全部硬编码，且没有持久化或规划包快照。
- `components/mainview/*_view.vue`: 当前从 `taskView.js`、`resourceView.js` 读取固定 2024 年示例。
- `TaskGanttComponent.vue` / `ResourceGanttComponent.vue`: 当前只在挂载时解析，使用全局 singleton 和 `node_modules` 动态皮肤链接。
- `calendar.vue`: 当前接口失败后仍保留示例结果，造成数据可信度问题。
- `router/index.js`: `/result` 当前错误地复用 `MainView.vue`；`views/Result.vue` 仍为占位组件。
- `Report.vue` / `useReportContentStore.js`: 当前筛选项、冲突数和报告正文均为固定示例。

### Testing Baseline

- `npm run build-only`: 通过，3177 个模块完成生产构建。
- `npx vitest run`: 通过，1 个测试文件、4 个测试。
- 工作区未跟踪的 `.codex-auth-temp/` 与本 Story 无关，禁止纳入提交。

### References

- [Source: _bmad-output/implementation-artifacts/1-1-ui-ux-refactor.md]
- [Source: frontend/src/utils/fileHandler.js]
- [Source: frontend/src/stores/useFileDetailStore.js]
- [Source: frontend/src/services/Algorithm.js]
- [Source: frontend/src/services/Preprocess.js]
- [Source: frontend/src/services/ParseFile.js]
- [Source: frontend/src/components/mainview/calendar.vue]
- [Source: frontend/src/router/index.js]

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- 2026-08-14: 基于 `origin/v2_main` 合并提交 `11c0ac4` 创建 Story 1.2 分支并完成基线检查。
- 2026-08-14: 新增版本化 `.sts` 快照、导入校验、旧格式兼容和 Store 往返测试，统一首页与顶栏文件操作。
- 2026-08-14: 用当前 Store、预处理结果和算法输出替换甘特图、日程表、结果页及报告中的静态示例数据。
- 2026-08-14: 完成桌面端与 390px 移动端浏览器验收；报告详情可直接访问且动态生成，关键页面无页面级横向溢出或控制台错误。
- 2026-08-14: `npx vitest run`、`npm run build-only`、改动文件 ESLint 与 `git diff --check` 通过；类型检查仅保留 Story 1.1 已记录的基线问题。
- 2026-08-15: 新增三个 2026 示例规划包，单选生成 `.sts`、多选生成合集 ZIP，并为合集误导入提供针对性提示。
- 2026-08-15: 运行页改为先预处理当前规划包、再调用启发式算法；三个示例均通过本地 FastAPI 与 JAR 端到端验证。
- 2026-08-15: 帮助中心、MIT 许可证和关于改为站内页面，迁移正式流程图资源并删除临时参考目录；桌面和移动端验收通过。
- 2026-08-15: 完成评审修复，补强离散资源匹配、分段任务归并、多时间窗、v2 完整性校验、解析失败提示和运行前旧结果清理。

### Completion Notes List

- 首页历史文档已改为可持久化的真实规划包快照，支持搜索、打开、下载、删除和空状态。
- `.sts` 已升级为带版本与清单的完整业务快照；导入采用先解析校验、后一次性恢复的方式，并兼容旧文件。
- 任务/资源甘特图、日程表、独立调度结果页和六类报告均读取当前业务数据，不再使用固定演示内容。
- 算法、后端、JAR 与现有接口契约未改动；本 Story 未新增依赖。
- 当前共 4 个常规测试文件、23 个测试全部通过，生产构建通过。
- 顶栏提供三个 2026 场景的多选下载入口，生成文件均可由当前规划包解析器直接打开。
- 帮助中心、许可证和关于已完全内置；关于页记录开发、指导与致谢信息，运行时不再依赖外部文档。
- 新增可按环境变量启用的算法集成测试，三个示例均确认使用当前任务数据完成预处理和启发式调度。

### File List

- _bmad-output/implementation-artifacts/1-2-feature-completion.md
- _bmad-output/implementation-artifacts/deferred-work.md (new)
- _bmad-output/implementation-artifacts/spec-sample-planning-packages.md (new)
- frontend/src/assets/help/planning-workflow.png (new)
- frontend/src/components/AppHeader.vue
- frontend/src/components/BaseGanttComponent.vue (new)
- frontend/src/components/DocumentationPage.vue (new)
- frontend/src/components/NavigationBar.vue
- frontend/src/components/__tests__/AppChrome.spec.js
- frontend/src/components/ResourceGanttComponent.vue
- frontend/src/components/TaskGanttComponent.vue
- frontend/src/components/mainview/calendar.vue
- frontend/src/components/mainview/resource_view.vue
- frontend/src/components/mainview/task_view.vue
- frontend/src/composables/useDynamicReports.js (new)
- frontend/src/router/index.js
- frontend/src/services/ParseFile.js
- frontend/src/services/ResourceViewTransfer.js (deleted)
- frontend/src/services/__tests__/samplePlanningPackages.integration.spec.js (new)
- frontend/src/services/__tests__/samplePlanningPackages.spec.js (new)
- frontend/src/services/__tests__/scheduleData.spec.js (new)
- frontend/src/services/samplePlanningPackages.js (new)
- frontend/src/services/scheduleData.js (new)
- frontend/src/stores/resourceView.js (deleted)
- frontend/src/stores/taskView.js (deleted)
- frontend/src/stores/useFileDetailStore.js
- frontend/src/stores/useReportContentStore.js (deleted)
- frontend/src/utils/__tests__/fileHandler.spec.js (new)
- frontend/src/utils/fileHandler.js
- frontend/src/views/About.vue (new)
- frontend/src/views/Attributes.vue
- frontend/src/views/Help.vue (new)
- frontend/src/views/License.vue (new)
- frontend/src/views/MainView.vue
- frontend/src/views/Operating.vue
- frontend/src/views/Report.vue
- frontend/src/views/ReportContent.vue
- frontend/src/views/Result.vue
- frontend/src/views/WorkSpace.vue
- frontend/src/views/resource/resourceList/CekongResource.vue

## Change Log

- 2026-08-14: 创建 Story 1.2，明确历史规划包、文件往返、真实甘特图、结果页、动态报告和算法禁区。
- 2026-08-14: 完成核心业务功能补全、自动化测试与桌面/移动端验收，Story 状态更新为 `review`。
- 2026-08-15: 补充 2026 示例规划包、运行前自动预处理和内置产品说明，完成三算例真实算法验收并清理临时参考材料。
- 2026-08-15: 完成代码评审修复与全量回归，延期并发隔离、运行期间切换保护和未保存内容确认。
