---
baseline_commit: 1c2960f
---

# Story 1.5: 任务可行时间窗与资源占用展示

Status: done

## Story

As a 任务规划人员，
I want to 在任务详情页维护资源需求表达式并计算该任务的可行时间窗，
so that 我可以查看任务的备选测控弧段、对应时段和资源占用，并在任务列表中批量完成同样的预处理。

## Acceptance Criteria

### AC1 - 资源需求表达式动作语义清晰

1. 任务详情页“资源需求表达式”下方的按钮按以下顺序和文案显示：`校验表达式`、`清空`、`计算可行时间窗`。
2. 不再显示“保存”按钮；原“校验表达式”按钮改为“计算可行时间窗”。
3. “校验表达式”只执行现有的本地表达式校验：
   - 校验资源和资源组是否来自当前规划包；
   - 校验 `and`、`or`、括号和操作数顺序；
   - 通过或失败均给出明确反馈，不调用后端，不生成时间窗。
4. “计算可行时间窗”必须先完成同一套表达式校验。表达式无效、当前任务不存在或没有可用任务/资源数据时按钮不可用或不发起请求，并保留用户输入和错误原因。
5. 表达式校验通过后，计算动作将规范化表达式写回当前任务的 `resourceRequirement`，然后发起预处理请求；不再需要单独保存动作。后端失败时保留用户输入，并显示可继续修正或重试的错误状态。
6. 计算按钮有加载状态，计算期间不能重复提交；计算成功但结果数量为 0 时显示“未找到可行时间窗”，不能提示为成功安排。

### AC2 - 单任务计算可行时间窗

1. 在任务详情页点击“计算可行时间窗”只计算当前任务，当前任务通过稳定的 `taskKey` 传递，不能因任务名称相似、连续任务后缀或数组下标而误匹配其他任务。
2. 单任务计算成功后，当前任务的备选测控弧段写入预处理结果 Store，并立即驱动“时段”和“资源占用”两个区域更新；其他任务已有的预处理结果保持不变。
3. 单任务计算不能覆盖算法运行所需的整包弧段文件。单任务接口可以使用独立临时输出目录或仅返回内存结果，但不得把只含一个任务的结果写入批量预处理的规范输出位置。
4. 响应中的每个候选方案至少包含以下可归属字段：
   - `task_key` 或等价稳定任务标识；
   - `task_name`；
   - `tracking_plan_id`；
   - `start_time`、`end_time`、`duration`；
   - 测控站和测控资源 ID 列表（兼容当前 `cekong_resource` 结构）。
5. 单任务计算失败时保留上一次结果但标记为过期，或明确清空并提示，不能无提示地继续展示与当前表达式不对应的旧弧段。

### AC3 - 任务列表批量计算保持兼容

1. 任务列表页现有“计算可行时间窗”按钮继续计算当前规划包中的全部任务，不传单任务筛选参数。
2. 批量计算结果覆盖本次规划包的预处理结果，并通过稳定的任务 key/name 关联每个任务；不存在可行时间窗的任务继续在现有结果反馈中列出。
3. 批量接口原有请求和响应字段保持兼容，现有 `continuous_events_data`、`discrete_events_data`、文件信息和错误反馈仍可被现有运行流程使用。
4. 单任务和批量计算必须共用同一套后端预处理逻辑、资源表达式过滤逻辑和前端事件归一化逻辑，不能维护两套近似实现。

### AC4 - 资源需求表达式参与候选弧段筛选

1. 计算请求包含当前任务的资源需求表达式；批量请求包含每个任务各自的表达式。
2. 后端不使用 JavaScript/Python `eval` 执行表达式，而是使用受限 token/parser 处理当前前端支持的资源名、资源组名、`and`、`or` 和括号。
3. 资源 token 映射到测控资源的规范名称，至少兼容前端当前使用的 `resourceName` 与后端 `station`/`craft` 组合。资源组 token 使用其包含资源列表并排除排除列表后的成员集合。
4. 对候选方案评估表达式：`and` 要求同一候选方案满足所有分支，`or` 满足任一分支；候选方案中的资源 ID、测控站和规范资源名均可用于匹配。表达式为空时保持旧行为，使用预处理算法生成的全部候选弧段。
5. 表达式合法但没有任何满足资源需求的候选方案时，接口返回成功的空结果和可读原因，不返回 HTTP/业务错误；这样前端可以区分“计算失败”和“没有可行时间窗”。
6. 算例、算法 JAR、现有预处理的光照/阴影和关键点约束逻辑不在本 Story 中重写。资源表达式只作为候选弧段过滤条件接入。

### AC5 - 任务详情页展示真实时段数据

1. `时段_任务` 不再使用硬编码示例数据，读取当前任务的任务属性 Store，展示其已配置的单次/周期时间段或离散时间窗；缺少配置时展示明确空状态。
2. `时段_可能性` 读取当前任务的预处理候选弧段，按 `tracking_plan_id` 展示备选方案、开始时间、结束时间、持续时长和测控资源；时间戳统一使用现有日期格式化工具，不能直接把 Unix 秒数当作可读时间展示。
3. 表格数量、展开标题和内容与实际数据一致；没有计算结果、正在计算、无可行时间窗、请求失败分别有可识别状态，不能用旧占位行伪装成结果。
4. 任务详情通过路由刷新、重新打开规划包或恢复包含 `executionDetail` 的规划包后，已有预处理结果仍能回显；旧规划包缺少新增元数据时按空结果兼容。

### AC6 - 任务详情页展示真实资源占用数据

1. `资源占用_任务` 和 `资源占用_可能性` 不再使用 `r1`、`r2` 等硬编码数据，完全由当前任务的候选弧段和资源需求数据派生。
2. `资源占用_任务` 至少展示测控资源 ID、测控站/资源名称、对应备选方案、占用开始时间、占用结束时间和占用时长；同一候选方案包含多个测控资源时逐资源展示。
3. `资源占用_可能性` 按备选方案汇总资源列表、资源数、开始/结束时间和时长，能够看出一个方案由哪些测控弧段组成。
4. 这些记录是“备选方案的预计占用”，不能直接写入资源详情页的 `useOccupancyStore` 并冒充已安排占用；算法实际安排继续由现有调度结果/调度状态展示。
5. 没有候选结果时显示空状态和计算提示；接口返回错误时显示错误提示且不清除表达式；桌面端和 390px 移动端表格都只能在表格区域横向滚动，不得撑破页面。

### AC7 - 接口、错误和状态边界

1. 保留 `/api/preprocess_task_timewindow` 作为批量入口，并通过可选的 `task_key`（或等价明确字段）表达单任务范围；缺少该字段表示批量计算。若实现者选择新增单任务路由，必须保留旧路由行为并复用同一服务函数。
2. JSON 请求至少继续支持当前 `task_json`、`ck_json` 上传字段；如资源组不能从现有资源 JSON 推导，则增加一个可选的资源目录/资源组 JSON 字段，字段结构和向后兼容行为必须写入 API README。
3. 单任务响应必须带范围、任务标识、候选事件和无结果原因；批量响应保持既有字段并可附加范围/统计字段。成功、空结果、输入错误、后端异常四种状态不能混用。
4. CORS 继续允许现有本地前端端口；前端网络失败时显示“请确认后端服务正在运行并检查 CORS 设置”类明确提示，不吞掉后端返回的业务错误。
5. 不改变 `/api/schedule_algorithm_heuristic` 的入参和启发式算法实现。批量计算仍产生算法所需的规范弧段输入；单任务结果不能破坏随后批量运行算法的流程。

## Tasks / Subtasks

- [x] Task 1: 明确并实现预处理服务的单任务/批量契约 (AC: 2, 3, 4, 7)
  - [x] 扩展 `backend/main.py` 的预处理请求范围识别，单任务使用独立输出上下文，批量保持当前规范输出和算法输入。
  - [x] 在 `backend/interface/pre_process_json.py` 或紧邻的后端 helper 中支持任务 key 精确筛选、资源表达式过滤和资源组展开；不修改既有光照、阴影、关键点和连续/非连续弧段生成算法。
  - [x] 统一返回当前字段与候选事件数据，补充稳定任务标识、范围和空结果原因；更新 `frontend/API_README.md` 与 `backend/interface/README.md`。
  - [x] 保持 CORS、异常响应和旧批量调用兼容，避免单任务请求覆盖批量算法文件。

- [x] Task 2: 扩展前端预处理服务和结果 Store (AC: 2, 3, 7)
  - [x] 为 `Preprocess.js` 增加单任务调用参数，发送当前任务 key、完整资源 JSON、任务 JSON 和必要的资源组目录；批量调用继续使用完整规划包。
  - [x] 在 `usePreprocessOutput.js` 增加按任务替换/合并/清除候选结果的方法，单任务只更新目标任务，批量替换全量结果，并保留旧规划包默认结构。
  - [x] 在 `ParseFile.js` 或通用 service 中归一化 `task_key`、任务名、方案、时间和多资源字段，前端表格与主视图复用同一归一化结果。
  - [x] 任务表达式计算前先规范化并更新当前任务记录；成功、空结果、失败和过期结果状态不能混淆。

- [x] Task 3: 重构资源表达式操作区 (AC: 1, 4)
  - [x] 修改 `frontend/src/components/task/requirement/resource_requirement.vue` 的按钮文案、调用顺序、加载状态和键盘行为。
  - [x] 复用 `resourceRequirement.js` 的候选集合和 parser；不新增第二套表达式编辑器，不通过字符串拼接或动态执行表达式。
  - [x] 保留清空、资源/资源组 token 插入、未知 token、括号错误和任务不存在等已有反馈。

- [x] Task 4: 用任务 Store 和预处理结果实现时段展示 (AC: 5)
  - [x] 将 `taskKey` 传入 `time_segment.vue`，从任务属性读取任务时间窗，从预处理 Store 读取备选弧段。
  - [x] 删除全部静态 `taskTimeData`、`possibilityData` 和 `possibilityTimeWindowData`，使用共享日期/持续时长格式化工具。
  - [x] 增加未计算、加载中、无结果、失败和有结果状态，表格标题数量与实际行数一致。

- [x] Task 5: 用候选弧段实现资源占用展示 (AC: 6)
  - [x] 将 `taskKey` 传入 `resource_occupation.vue`，按统一事件模型展开候选方案中的测控站和资源 ID。
  - [x] 删除全部静态资源占用和可能性数据，区分“候选预计占用”和实际调度占用，不写入资源占用 Store。
  - [x] 为表格配置稳定 row key、空状态、错误状态和局部横向滚动，覆盖窄屏布局。

- [x] Task 6: 接入任务列表批量计算并回归现有流程 (AC: 3, 7)
  - [x] 保留 `frontend/src/views/task/Task.vue` 的批量按钮和无可行时间窗反馈，改用新的结果 Store 查询逻辑，不能用数组下标判断任务。
  - [x] 验证任务详情、主视图、调度运行、调度结果和规划包重新打开流程仍读取同一份预处理数据。
  - [x] 确认单任务计算后再点击任务列表批量计算，结果会正确覆盖为全量结果，且算法接口仍能读取批量弧段文件。

- [x] Task 7: 测试、参考资料清理和验收 (AC: 1-7)
  - [x] 添加 Vitest 覆盖表达式按钮语义、单任务结果隔离、批量覆盖、任务 key 匹配、弧段归一化、时间/资源占用映射和空/错状态。
  - [x] 如修改后端解析逻辑，添加对应的 Python 测试或可重复的接口级测试，至少覆盖空表达式、资源组、`and/or`、单任务筛选和无候选结果。
  - [x] 运行 `npx vitest run --silent`、改动文件 ESLint、`npm run build-only` 和 `git diff --check`；手工检查桌面端与 390px 移动端。
  - [x] 用户验收通过后删除 `D:\Projects\spacetaskscheduler\临时目录`，确认源代码、规划包和 README 不再引用该目录；不得提交该目录内容。

## Dev Notes

### Existing Implementation to Extend

- `frontend/src/components/task/requirement.vue` 已把 `taskKey` 传给资源表达式组件，但时段和资源占用组件仍需接收并使用该 key。
- `frontend/src/components/task/requirement/resource_requirement.vue` 已有候选资源/资源组生成、token 插入和 `validateResourceExpression`；当前按钮仍是“保存 / 清空 / 校验表达式”，保存逻辑直接写入 `resourceRequirement`，需要按本 Story 改为校验和计算。
- `frontend/src/components/task/requirement/time_segment.vue` 与 `resource_occupation.vue` 当前全是静态 `r1`、`r2` 和示例时间，必须彻底改为 Store/预处理结果驱动。
- `frontend/src/views/task/Task.vue` 已有批量“计算可行时间窗”入口，当前根据预处理结果的 `task_name` 生成无结果列表；改动时要保留弹窗和批量反馈，但改用稳定任务关联。
- `frontend/src/services/Preprocess.js` 当前先通过 `/api/save_json` 写固定文件，再以 `task_json`/`ck_json` 调用 `/api/preprocess_task_timewindow`；单任务流程不得写坏这些批量算法输入。
- `frontend/src/services/ParseFile.js` 的 `normalizePreprocessEvents` 已统一 `tracking_plan_id`、时间和资源字段，是时段、资源占用、主视图和调度结果的首选转换入口。
- `frontend/src/stores/usePreprocessOutput.js` 当前只持有 `continuousEvents` 和 `discreteEvents` 并持久化到 sessionStorage；新增元数据必须提供旧结构默认值。
- `frontend/src/utils/fileHandler.js` 的 `executionDetail` 已保存和恢复预处理结果。若扩展结果结构，`readPlanningPackage` 必须兼容缺少新增字段的旧 `.sts` 包。
- `frontend/src/services/Generate_Json.js` 已将任务基本信息中的 `resourceRequirement` 带入任务 JSON；不得因为后端适配而移除该字段。

### Backend Contract and Reference Data

- 当前 FastAPI 入口为 `backend/main.py`，批量预处理端点是 `POST /api/preprocess_task_timewindow`，JSON 模式使用 `task_json` 和 `ck_json` 两个上传字段，并返回 `continuous_events_data` 与 `discrete_events_data`。
- 当前后端调用 `fk1_pre_process_json` 和 `fk2_pre_process_json` 生成两类候选弧段，`format_output_json` 的标准输出为：
  `task_name`、`tracking_plan_id`、`start_time`、`end_time`、`duration`、`task_to_craft`、`cekong_resource[{cekong_station, cekong_resource_id}]`。
- 当前 `pre_process_json.py` 会从 `taskFormHeadList`、`taskBasicInfoList`、`taskPropList`、`taskDurationList` 组合任务，按 `FK-1`/`FK-2` 选择非连续/连续处理；实现单任务筛选时必须精确匹配任务 key/name，不能用数组位置或只取字符串前缀。
- 当前后端使用固定 `backend/interface/preprocess_output` 和 `transfer_json_output` 目录，且算法端点从这些规范位置读取。单任务计算必须使用独立输出上下文或只返回结果，批量计算才能更新规范位置。
- `临时目录\事件与资源整合处理说明1.docx` 说明了两类预处理的输入和“备选跟踪方案集合”输出；`临时目录\task_data\task_data_10_30` 中的任务、测控资源、关键点约束和预处理 CSV 是参考数据，不是运行时依赖。
- 参考输出 CSV 的列为 `飞控事件ID`、`跟踪方案ID`、`测控站`、`测控资源ID`、`开始时间`、`结束时间`、`事件持续时间`、`事件对应航天器`；JSON 实现应保持等价语义并兼容当前英文键名。

### Resource Expression Mapping

- 前端资源候选来自 `useResourceDetailNumStore().formHeadList` 的 `resourceName` 与 `useResourceGroupListStore().customResourceGroupList` 的 `resourceGroupName`。
- 资源组数据包含 `includeResourceList` 和 `excludeResourceList`。发送给后端时建立显式目录映射，不把前端显示名称直接当作任意路径或代码执行内容。
- `ResourceTransfer_Reverse.js` 当前导出的测控资源包含 `id`、`station`、`craft`、`start_time`、`end_time`、`duration`；资源显示名称通常可由 `station-craft` 归一化。实现应同时兼容已有资源名称和直接出现的 station/resource ID。
- 过滤应发生在候选方案生成之后或候选方案资源集合确定之后，不能修改测控弧段的时间计算规则。空表达式保持旧行为，合法表达式无匹配时返回空候选而非抛异常。

### UI / UX Guardrails

- 继续使用 Vue 3、Vue Router、Pinia、Ant Design Vue、dayjs 和现有主题变量，不新增依赖或第二套表格/表达式组件。
- 工具按钮高度、普通圆角、表格字体和间距遵循 `_bmad-output/planning-artifacts/ux-designs/ux-spacetaskscheduler-2026-08-14/DESIGN.md`；主要操作使用现有图标和 Ant Design loading/message/alert/empty。
- 表格数据区域允许横向滚动，但页面本身不能产生不可控横向溢出。所有候选结果必须能区分“候选弧段”与“已安排占用”，不能只靠颜色表达状态。

### Boundaries

- 不修改启发式算法 JAR、算法输出格式、`/api/schedule_algorithm_heuristic` 的调用契约或现有连续/非连续弧段核心算法，除非为传递筛选结果必须做最小兼容适配。
- 不删除或替换现有调度结果页、Gantt 转换、规划包 `executionDetail` 快照和批量任务计算入口。
- 不把临时目录中的脚本、CSV、EXE/DLL、图片或文档复制进源码，也不在实现中引用该目录的绝对路径。
- 不把备选弧段直接写入资源详情页的真实占用 Store；候选数据和算法已安排数据必须保持不同状态。

### Testing Requirements

- 前端至少覆盖：有效/无效表达式、按钮动作不串线、单任务结果隔离、批量覆盖、重复任务名/后缀 key 匹配、连续任务多资源方案、无可行时间窗、网络错误和旧快照缺字段。
- 后端至少覆盖：无 `task_key` 的批量兼容、带 `task_key` 的单任务筛选、表达式资源/资源组映射、`and/or` 逻辑、空表达式旧行为、合法但无匹配方案和错误响应。
- 验收时检查：任务详情中表达式更新后重新计算；任务列表批量计算；刷新和重新打开规划包；单任务计算后运行算法；任务详情、主视图和结果页看到的弧段资源一致。

## References

- [Source: frontend/src/components/task/requirement.vue]
- [Source: frontend/src/components/task/requirement/resource_requirement.vue]
- [Source: frontend/src/components/task/requirement/time_segment.vue]
- [Source: frontend/src/components/task/requirement/resource_occupation.vue]
- [Source: frontend/src/views/task/Task.vue]
- [Source: frontend/src/services/Preprocess.js]
- [Source: frontend/src/services/ParseFile.js]
- [Source: frontend/src/stores/usePreprocessOutput.js]
- [Source: frontend/src/utils/fileHandler.js]
- [Source: frontend/src/services/Generate_Json.js]
- [Source: frontend/src/services/ResourceTransfer_Reverse.js]
- [Source: backend/main.py]
- [Source: backend/interface/pre_process_json.py]
- [Source: frontend/API_README.md#2.-预处理接口]
- [Source: backend/interface/README.md#接口功能]
- [Source: _bmad-output/planning-artifacts/ux-designs/ux-spacetaskscheduler-2026-08-14/DESIGN.md]
- [Source: _bmad-output/planning-artifacts/ux-designs/ux-spacetaskscheduler-2026-08-14/EXPERIENCE.md]
- [Source: 临时目录/事件与资源整合处理说明1.docx]
- [Source: 临时目录/task_data/task_data_10_30/非连续跟踪预处理后数据/非连续跟踪遥控事件预处理备选弧段_30_2days_equ.csv]
- [Source: 临时目录/task_data/task_data_10_30/连续跟踪预处理后数据/连续跟踪遥控事件预处理备选弧段_10_0days_equ.csv]
- [Source: _bmad-output/implementation-artifacts/1-4-task-resource-requirements-and-results.md]
- [Source: _bmad-output/implementation-artifacts/deferred-work.md#Story 1.2 评审延期项]

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- 2026-08-15: 从 Story 1.4 分支创建 `codex/story-1-5-feasible-time-windows-and-resource-occupancy`。
- 2026-08-15: 检查当前前端表达式编辑器、任务列表批量预处理、预处理 Store、事件归一化和 FastAPI JSON 预处理接口。
- 2026-08-15: 检查 `临时目录` 中的预处理说明、任务/资源 CSV 与备选弧段 CSV；确认其仅作为参考资料，不作为运行时依赖。
- 2026-08-15: 工作区存在用户本地的 `backend/interface/*` 验收输出修改和未跟踪的 `临时目录` 参考资料，不纳入本 Story。
- 2026-08-15: 完成 Story 1.5 的单任务/批量预处理契约、资源表达式安全过滤、任务结果状态和候选弧段归一化。
- 2026-08-15: 将任务详情的时段与资源占用改为真实 Store 数据驱动，补充空结果、过期结果、错误和窄屏表格状态。
- 2026-08-15: 支持上传光照/阴影文件，并为与内置数据不重叠的任务使用临时日期对齐副本；不修改算法核心或规范输出契约。
- 2026-08-15: 完成前端 39 个单元测试、后端 5 个纯逻辑测试、接口级单任务验证、生产构建、改动文件 ESLint 和桌面/390px 页面检查；等待用户本地验收。

### Completion Notes List

- 已完成安全的资源需求表达式解析，支持资源、资源组、`and`、`or` 和括号，并在候选弧段生成后过滤。
- 单任务计算使用临时输入/输出目录，按稳定 `task_key` 返回结果并合并到当前任务；批量计算继续写入算法所需的规范弧段文件。
- 任务详情的“时段”和“资源占用”已移除静态示例数据，改为展示任务属性、候选测控方案、资源、时间和预计占用，并区分实际调度结果。
- 规划包快照与旧格式恢复兼容新增 `taskStates`，刷新或重新打开规划包后可恢复预处理状态。
- 用户本地验收已通过，参考临时目录已删除且未加入代码或规划包。
- 提交前审查已补齐请求级临时目录、批量结果成功后原子发布、算法读取互斥、零候选表达式提前校验和前端最后请求覆盖保护。
- 最终验证：Vitest 47 个通过、1 个既有集成测试跳过；Python 测试 12 个通过；定向 ESLint、Vite 生产打包、Python 编译和差异检查通过。全量 `vue-tsc` 仍受项目既有 JavaScript 模块声明与 `Task.vue` 类型问题阻塞，未作为本 Story 扩大修复范围。

### Implementation Plan

- 先在后端增加安全的资源表达式解析、任务精确筛选和单任务临时输出，保持批量算法输入不变。
- 再扩展前端预处理请求、结果 Store 和事件归一化，使单任务结果按 key 合并、批量结果全量替换。
- 最后把任务详情的时段与资源占用组件改为真实数据驱动，并补齐单元/接口测试和构建验证。
- 额外补充上传/内置光照与阴影输入的日期适配，仅生成临时副本，避免 2026 示例任务因内置参考数据日期不同而全部返回空结果。

### File List

- backend/main.py
- backend/interface/preprocess_support.py
- backend/interface/README.md
- backend/tests/test_preprocess_support.py
- frontend/API_README.md
- frontend/src/components/task/requirement.vue
- frontend/src/components/task/requirement/resource_occupation.vue
- frontend/src/components/task/requirement/resource_requirement.vue
- frontend/src/components/task/requirement/time_segment.vue
- frontend/src/services/ParseFile.js
- frontend/src/services/Preprocess.js
- frontend/src/services/preprocessData.js
- frontend/src/services/scheduleData.js
- frontend/src/stores/usePreprocessOutput.js
- frontend/src/utils/fileHandler.js
- frontend/src/views/task/Task.vue
- frontend/src/services/__tests__/preprocessData.spec.js
- frontend/src/stores/__tests__/preprocessOutput.spec.js
- _bmad-output/implementation-artifacts/1-5-feasible-time-windows-and-resource-occupancy.md

### Change Log

- 2026-08-15: Implemented Story 1.5 feature set and moved the story record to the local acceptance stage; PR and temporary-reference cleanup remain pending user confirmation.
- 2026-08-16: 用户本地验收通过；已删除参考临时目录，完成提交前回归验证并将 Story 状态更新为 done。
- 2026-08-16: 完成提交前分层审查，修复并发发布、零候选表达式校验和请求结果覆盖边界；最终回归为前端 45 通过/1 跳过、后端 12 通过。
