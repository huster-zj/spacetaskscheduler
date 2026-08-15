---
baseline_commit: 2eaaeaa5dc7dcfc5e472cb650461b10e55758f82
---

# Story 1.4: 任务资源需求与调度结果回显

Status: review

## Story

作为航天任务规划人员，
我希望在任务详情页用资源表达式配置任务所需资源，并在算法运行后看到该任务的具体安排，
以便确认任务的资源需求、调度状态和最终安排，并在运行完成后直接进入调度结果页。

## Acceptance Criteria

1. 任务详情页的“资源需求”可以按任务独立编辑。
   - 从 `/task_detail/:key` 打开详情时，资源需求编辑器使用当前任务的 `taskKey`，不能把数据写入其他任务或新建重复任务。
   - 资源需求输入框可编辑，并支持新增、修改、清空和重新编辑一个资源需求表达式；不再使用禁用输入框或仅打印日志的占位交互。
   - 表达式支持当前业务需要的资源名、资源组名、`and`、`or` 以及成对括号，例如 `资源A and (资源B or 资源组C)`；资源和资源组候选项必须来自现有 Pinia 数据，不得使用 `r1`、`template1` 等硬编码演示数据。
   - 点击资源、资源组或运算符时将 token 插入当前光标位置，用户也可以直接键盘编辑；表达式显示内容与保存后的内容一致。
   - 保存前校验空表达式、未知资源/资源组 token、括号不匹配和不完整运算符；校验失败保留用户输入并给出可理解提示，不清空其他任务数据。

2. 资源需求可持久化且兼容现有规划包和算法接口。
   - 以任务 `key` 为关联键保存规范化的 `resourceRequirement` 字符串；优先复用现有 `taskBasicInfoList` 的同任务记录，避免另造一套无法对齐的任务数据结构。
   - 新建任务默认资源需求为空；旧版任务数据或旧版 `.sts` 缺少该字段时安全回退为空字符串，不阻止规划包打开。
   - 任务详情编辑、任务列表切换、`.sts` 另存为/重新打开后，资源需求表达式保持一致；导入任务时也能恢复该字段。
   - `Generate_Json.js`、规划包快照和任务导入/恢复链路保留该字段；不改变后端请求格式中现有必需字段，不修改后端、算法 JAR、预处理算法或算法接口契约。现有后端不识别该字段时不得因此运行失败，也不得在界面中宣称算法已经使用了新的表达式约束。
   - 资源需求编辑器及资源池表格的空状态应是真实空状态；不能用静态资源、静态资源池或静态占用数据冒充当前规划包内容。

3. 算法运行后，任务详情页显示当前任务的具体调度情况。
   - 运行成功后打开任意任务详情页，页面“调度情况”区域按任务名称/任务 key 稳定匹配当前算法输出和预处理数据，不能只依赖任务名称拼接路由，也不能显示固定 `Poss1` 示例。
   - 已安排任务至少展示：调度状态、开始时间、结束时间、持续时长、测控资源、弧段/跟踪方案标识和必要备注；信息来自现有 `useAlgorithmOutput`、`usePreprocessOutput` 与 `scheduleData` 解析链路。
   - 未安排、未生成结果、解析失败和没有运行结果时分别提供清晰状态或空状态；不能把“无结果”误显示为已安排。
   - 有可用潜在冲突数据时，在任务详情中显示冲突任务、冲突资源和相关时间；没有冲突时显示明确的空状态。
   - 刷新页面或重新打开包含 `executionDetail.json` 的规划包后，已保存的算法输出仍能驱动任务详情回显；不能依赖只在当前组件实例中存在的临时数组。

4. 运行成功后进入调度结果页。
   - 在运行页选择当前已接入的算法并点击“运行”，预处理和算法均成功后自动导航到 `/result`，而不是 `/main_view`。
   - `/result` 使用已有调度结果解析和展示逻辑，能看到与任务详情一致的状态、时间、弧段和资源；不得通过重复解析或硬编码生成另一套结果。
   - 预处理失败、算法失败、输出为空或输出解析失败时留在运行页，显示现有错误反馈并保持当前配置可继续操作，不得误跳转到结果页。
   - 若保留运行结果弹窗，弹窗确认、关闭和成功后的自动导航不能互相冲突；任何成功完成路径的最终目标都必须是 `/result`。

5. 交互和回归质量符合现有工作台规范。
   - 继续使用 Vue 3、Vue Router、Pinia、Ant Design Vue、dayjs 和现有主题变量，不新增依赖、不引入第二套表达式编辑器或组件库。
   - 表达式输入、候选 token、保存/清空、任务安排表和空状态在桌面端及 390px 移动端不重叠、不裁切、不产生页面级横向溢出；表格需要横向滚动时限制在表格区域内。
   - 增加针对资源需求表达式校验/持久化、任务调度结果映射和成功/失败导航的自动化测试；运行 `npx vitest run --silent`、改动文件 ESLint、`npm run build-only` 和 `git diff --check` 均通过。

## Tasks / Subtasks

- [x] Task 1: 建立任务资源需求的数据归属和快照兼容层 (AC: 1-2)
  - [x] 在 `taskDetailNumStore.js` 为每个任务基本信息提供 `resourceRequirement` 默认值和响应式更新路径。
  - [x] 让 `TaskDetail.vue` 将 `taskKey` 传入 `Requirement.vue` 与资源需求编辑器，处理无效 key 和新建任务状态。
  - [x] 更新 `Generate_Json.js`、任务导入恢复和 `fileHandler.js` 的规划包快照回读，兼容缺少字段的旧数据。
- [x] Task 2: 实现基于真实资源数据的表达式编辑器 (AC: 1-2, 5)
  - [x] 重构 `resource_requirement.vue`，以资源 Store 和资源组 Store 生成候选项，移除硬编码资源、资源池和占用示例。
  - [x] 支持 token 插入、光标位置编辑、运算符/括号、清空和保存；集中实现表达式 token 化/校验，避免在模板中拼接字符串。
  - [x] 对资源需求为空、规划包没有资源或资源组、任务数据缺失提供可理解空状态，并保留用户已输入内容。
  - [x] 评估 `resource_pool_table.vue` 的事件边界；资源池的加入/移除必须更新任务编辑器使用的真实候选集合，不能只修改组件内部临时数组。
- [x] Task 3: 将调度结果映射到任务详情 (AC: 3)
  - [x] 重构 `scheduler_state.vue`，复用 `ParseFile.js`、`scheduleData.js` 和现有输出 Store，按当前 task key/name 显示任务安排。
  - [x] 删除无 `taskKey` 时写入 `Poss1` 的演示回退；无结果时使用 Ant Design 空状态或状态提示。
  - [x] 统一已安排、未安排、未生成结果、解析失败和潜在冲突的数据模型，保证任务详情、主视图和结果页不显示相互矛盾的结果。
  - [x] 保证 `.sts` 导入的 `execution` 数据和刷新后的 Store 仍可驱动详情页回显。
- [x] Task 4: 调整运行成功后的导航 (AC: 4)
  - [x] 在 `Operating.vue` 使用现有 Router 实例或命名路由，在算法成功且有有效输出后跳转 `/result`。
  - [x] 移除成功路径到 `/main_view` 的跳转；保留失败路径、运行锁定和现有 message 状态。
  - [x] 确认结果页和任务详情页共用同一份算法输出/预处理数据，不在运行页额外维护一份结果副本。
- [x] Task 5: 自动化测试与浏览器验收 (AC: 5)
  - [x] 覆盖表达式 token 候选、括号/未知 token校验、任务 key 隔离和旧快照缺省字段。
  - [x] 覆盖算法结果与任务详情的匹配、未安排/空结果状态和运行成功/失败导航。
  - [x] 在桌面端和 390px 移动端验收任务详情、运行页、结果页及刷新/重新打开流程。

## Dev Notes

### Current State and Required Changes

- `frontend/src/views/task/TaskDetail.vue` 当前把 `taskKey` 传给基本信息、属性、时长和调度情况，但没有传给 `Requirement`；资源需求因此无法绑定具体任务。
- `frontend/src/components/task/requirement/resource_requirement.vue` 当前的资源约束输入框是 `disabled`，`calculateFeasibleTimeWindow` 只打印日志，资源和资源池列表是静态 `r1/r2`、`template1/template2`，创建资源池按钮没有行为，`ResourcePoolTable` 的列表修改只存在于组件内部。
- `frontend/src/components/task/scheduler_state.vue` 有 `taskKey` 时只读取 `schedulerStateMap`，没有把算法输出解析结果写入或映射进来；没有 `taskKey` 时会向 Store 写入 `Poss1` 示例数据，必须移除。
- `frontend/src/services/scheduleData.js` 已有 `createScheduleResult`，可从算法输出、预处理事件和任务定义生成统一结果；应扩展或复用该转换层，不要在任务详情中复制一套文本解析正则。
- `frontend/src/services/ParseFile.js` 已提供 `normalizePreprocessEvents`、`parseOutputContent` 和 `isAssignedStatus`，应作为结果状态和资源列表的统一来源。
- `frontend/src/views/Operating.vue` 当前成功后打开输出弹窗，弹窗按钮通过 `RouterLink` 指向 `/main_view`；成功后应改为进入 `/result`，错误分支留在运行页。
- `frontend/src/views/Result.vue` 已展示统一调度结果表，并从 `useAlgorithmOutput`、`usePreprocessOutput` 和任务定义生成 `scheduleResult`；任务详情应复用同一数据源。
- `frontend/src/stores/taskDetailNumStore.js` 的任务数据按多个同 key 数组对齐，`useSchedulerStateStore` 的 Map 已有规划包序列化；不要通过数组索引把一个任务的结果写到另一个任务。

### Resource Expression Contract

- 资源候选来自 `useFormHeadStore`（资源名称）和 `useResourceGroupListStore`（`resourceGroupName`）。资源需求保存为当前任务基本信息记录上的 `resourceRequirement` 字符串，默认值为 `''`，避免新增无法与任务对齐的第二套主数据。
- 表达式编辑器可以将 UI token 规范化为字符串，但必须保留用户可读的资源/资源组名称；校验时使用当前候选名称集合，保存后资源名称变化应产生明确的失效提示，而不是静默替换。
- 当前后端 `pre_process_json.py` 只消费任务表头、关键点约束、任务属性和时长，未定义资源表达式字段。实现应保留该字段并保证后端忽略额外字段时仍能运行；不得为了让前端字段“生效”而修改算法或后端契约。本 Story 的验收重点是可编辑、可保存、可回显和不破坏现有运行链路。
- 规划包校验仍要求四个任务列表长度和 key 对齐；若使用现有 `taskBasicInfoList` 字段，不要改变对齐规则。旧包没有 `resourceRequirement` 时按空字符串兼容。

### Schedule Result Contract

- 调度结果优先使用 `createScheduleResult` 的统一行结构：`id`、`status`、`assigned`、`startTimeLabel`、`endTimeLabel`、`durationMinutes`、`arcId`、`resources`、`resourceLabel` 和 `event`。
- 任务详情匹配顺序应以稳定 `taskKey`/任务名为主，并兼容连续任务可能存在的 `_1`、`_2` 等后缀；不能依赖包含连字符的字符串拼接路由。
- `schedulerStateMap` 若继续作为任务详情的展示缓存，必须集中提供清空/写入方法并在算法成功后更新；否则直接从统一 `scheduleResult` 计算，不能保留占位数据和统一结果不一致的双写状态。
- 没有算法输出时，详情页应显示“尚未生成调度结果”；解析失败时显示解析失败；未分配任务显示未分配原因或状态，而不是填充空字符串让用户误认为安排成功。

### Architecture and UX Guardrails

- 使用现有工作台主题：输入和按钮高度约 36px，普通圆角不超过 8px，数据表格局部滚动，正文使用现有中文系统字体和主题色。
- 资源表达式是工具型编辑器，优先使用可读的输入、候选 token 按钮/菜单和明确的状态反馈；不使用营销式说明、复杂装饰或新的可视化库。
- 任务安排信息是数据表，桌面端可使用横向滚动承载完整列；移动端必须保持任务状态和关键时间可读，不能把宽表撑出页面。
- 继续使用 Ant Design `message`、`a-alert`、`a-empty` 和现有图标；图标按钮提供 `title` 或可访问名称，键盘可以完成表达式输入和保存。

### Boundaries and Regression Prevention

- 不修改 `backend/`、`interface/java/`、算法 JAR、预处理算法、后端路由或现有接口必需字段；不得把本地验收生成的 backend/interface 输出文件纳入提交。
- 不删除或替换已有 `/result`、`scheduleData`、规划包快照和输出解析能力；任务详情、结果页、主视图应共享同一解析结果。
- 不在资源需求、调度情况或结果页保留 `r1`、`template1`、`Poss1` 等静态演示数据。
- 不把算法运行成功误判为所有任务均已安排；必须区分成功、未安排、空输出和解析失败。

### Testing Standards

- 测试框架为 Vitest，测试放在对应 `__tests__` 目录，优先测试纯表达式解析/校验、快照兼容和结果映射函数，再补页面关键状态测试。
- 至少覆盖：有效表达式、空表达式、未知 token、括号不匹配、任务 A/B 数据隔离、旧快照缺少字段、已安排与未安排结果、无输出/解析失败、运行成功导航 `/result`。
- 完成后运行 `npx vitest run --silent`、改动文件 ESLint、`npm run build-only` 和 `git diff --check`；使用浏览器检查 1440px 或默认桌面视口、390x844 移动视口和刷新/重新打开规划包流程。

### Project Structure Notes

- 任务详情组件继续位于 `frontend/src/components/task/`，任务页面位于 `frontend/src/views/task/`，通用数据转换放在 `frontend/src/services/`，Pinia 状态放在 `frontend/src/stores/`。
- 预计更新：`TaskDetail.vue`、`requirement.vue`、`requirement/resource_requirement.vue`、`scheduler_state.vue`、`Operating.vue`、`taskDetailNumStore.js`、`Generate_Json.js`、`TaskTransfer.js`、`fileHandler.js`，以及结果映射/表达式校验测试。
- 只有在现有模块无法承载纯逻辑时才新增小型 service/helper；不要把表达式解析、快照恢复和算法导航逻辑全部堆进单个 Vue 组件。

### References

- [Source: frontend/src/views/task/TaskDetail.vue]
- [Source: frontend/src/components/task/requirement.vue]
- [Source: frontend/src/components/task/requirement/resource_requirement.vue]
- [Source: frontend/src/components/task/scheduler_state.vue]
- [Source: frontend/src/stores/taskDetailNumStore.js]
- [Source: frontend/src/services/scheduleData.js]
- [Source: frontend/src/services/ParseFile.js]
- [Source: frontend/src/services/Generate_Json.js]
- [Source: frontend/src/services/TaskTransfer.js]
- [Source: frontend/src/utils/fileHandler.js]
- [Source: frontend/src/views/Operating.vue]
- [Source: frontend/src/views/Result.vue]
- [Source: frontend/src/stores/useResourceGroupListStore.js]
- [Source: _bmad-output/planning-artifacts/ux-designs/ux-spacetaskscheduler-2026-08-14/DESIGN.md#Components]
- [Source: _bmad-output/planning-artifacts/ux-designs/ux-spacetaskscheduler-2026-08-14/EXPERIENCE.md#Key Flows]
- [Source: _bmad-output/implementation-artifacts/1-3-temporal-constraints-and-docs.md#Completion Notes List]
- [Source: README.md#下一版本计划 (v1.1.0)]

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- 2026-08-15: 基于已合并 `v2_main` 创建 Story 1.4 分支，确认当前工作区 backend/interface 输出为本地验收数据，不纳入 Story。
- 2026-08-15: 排查任务详情、资源需求编辑器、任务调度状态、统一调度结果解析和运行页导航链路，确定前端数据与交互范围。

### Completion Notes List

- Ultimate context engine analysis completed - comprehensive developer guide created.
- 当前 Story 只定义前端任务资源需求和调度结果回显，不修改后端算法或接口契约。
- 已在任务基本信息记录增加 `resourceRequirement`，旧规划包缺少该字段时自动回退为空字符串，任务导入恢复原始 key 并保留资源需求。
- 已将资源表达式编辑器接入真实资源和资源组 Store，支持光标位置插入、键盘编辑、括号/运算符校验、保存和清空；资源池表格改为通过事件更新列表。
- 已移除 `Poss1` 占位数据，任务详情从统一 `scheduleResult` 显示已安排、未安排、未生成和解析失败状态，并保留真实潜在冲突空状态。
- 算法输出有效时运行页直接导航到 `/result`，空输出、解析失败和运行失败均留在运行页。
- 自动化验证：Vitest 34 个测试通过、1 个既有集成测试跳过；改动文件 ESLint 通过；`npm run build-only` 通过；桌面端和 390px 视口检查通过。
- `npm run type-check` 仍受项目原有 JS 模块声明和 `Task.vue` 隐式 any 问题影响；本次改动的构建和 ESLint 均通过。完整 `git diff --check` 仍会报告用户本地 `backend/interface` 验收输出的既有尾随空格，本次前端差异未发现该问题。

### File List

- _bmad-output/implementation-artifacts/1-4-task-resource-requirements-and-results.md
- frontend/src/components/table/resource_pool_table.vue
- frontend/src/components/task/requirement.vue
- frontend/src/components/task/requirement/resource_requirement.vue
- frontend/src/components/task/scheduler_state.vue
- frontend/src/services/Generate_Json.js
- frontend/src/services/TaskTransfer.js
- frontend/src/services/__tests__/TaskTransfer.spec.js
- frontend/src/services/__tests__/resourceRequirement.spec.js
- frontend/src/services/__tests__/scheduleData.spec.js
- frontend/src/services/resourceRequirement.js
- frontend/src/services/scheduleData.js
- frontend/src/stores/taskDetailNumStore.js
- frontend/src/utils/__tests__/fileHandler.spec.js
- frontend/src/utils/fileHandler.js
- frontend/src/views/Operating.vue
- frontend/src/views/__tests__/Operating.spec.js
- frontend/src/views/task/TaskDetail.vue

### Change Log

- 2026-08-15: 创建 Story 1.4，明确资源需求表达式、任务调度详情回显和运行成功跳转调度结果的实现范围与验收标准。
- 2026-08-15: 完成 Story 1.4 实现，状态更新为 review；补充资源表达式、调度结果映射、导航和回归测试记录。
