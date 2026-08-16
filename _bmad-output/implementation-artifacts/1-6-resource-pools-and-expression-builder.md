---
baseline_commit: 1c2960fcf9a4ebca263b2208393b6c673ff44f85
---

# Story 1.6: 任务资源池与资源需求表达式构建器

Status: done

## Story

As a 任务规划人员，
I want to 在任务资源需求中创建可复用的资源池，并选择池内全部资源或指定数量资源，
so that 我可以用接近 STK Scheduler 的方式表达任务所需的资源组合并计算可行时间窗。

## Acceptance Criteria

### AC1 - 资源池模型与规划包兼容

1. 资源池为任务级数据，包含稳定 key、taskKey、名称、资源成员、资源组成员、选择模式和指定数量。
2. 资源池名称在当前任务内不能为空，不能与资源名称、资源组名称或其他资源池重名。
3. 资源池至少包含一个资源或资源组；指定数量模式必须为正整数且不超过池展开后的成员数量。
4. 新规划包保存和打开时保留资源池；旧规划包缺少资源池字段时按空列表兼容。
5. 任务 JSON 与资源目录请求保留资源池数据，批量和单任务计算使用同一份定义。

### AC2 - 表达式编辑区与 STK 风格资源池编辑

1. 运算符 `and`、`or`、`(`、`)` 与“校验表达式”、清空、计算按钮处于同一操作行，窄屏可换行。
2. 资源、资源组和已保存资源池均可插入表达式；未知名称、运算符顺序和括号错误有明确反馈。
3. 任务详情中可创建、编辑、删除资源池；可将资源和资源组加入或移出当前编辑池。
4. 资源池可选择“池内全部资源”或“池内指定数量资源”；指定数量可用数字输入调整。
5. 保存资源池后名称可通过按钮插入资源需求表达式，不自动覆盖用户当前表达式。

### AC3 - 后端表达式和资源池语义

1. 后端继续使用受限 parser，不使用 `eval`；表达式支持资源、资源组、资源池、`and`、`or` 和括号。
2. 资源组先展开包含资源并移除排除资源；资源池合并直接资源和资源组展开后的成员并去重。
3. `all` 模式要求候选弧段包含池展开后的全部成员；`count` 模式要求至少包含指定数量成员。
4. 资源池可与资源或资源组混合出现在表达式中；合法但无匹配候选时返回成功空结果。
5. 单任务计算仍使用临时目录，不覆盖批量算法规范弧段文件。

### AC4 - 回归与验证

1. 前端测试覆盖资源池校验、表达式候选、持久化和旧包兼容。
2. 后端测试覆盖资源池 all/count、资源组展开、表达式混用、空结果和旧调用兼容。
3. 完成前端 Vitest、ESLint、生产构建、Python 测试和 `git diff --check`。
4. 用户本地验收通过后再删除参考临时目录；本 Story 不提交该目录内容。

## Tasks / Subtasks

- [x] Task 1: 新增任务级资源池模型、Store 和纯逻辑校验
  - [x] 定义稳定字段和旧数据默认值
  - [x] 覆盖新增、编辑、删除、重名和数量校验
- [x] Task 2: 接入任务 JSON、规划包快照和导入恢复
  - [x] 保存/恢复资源池并兼容旧规划包
  - [x] 将资源池随预处理请求传递
- [x] Task 3: 重构资源需求编辑区
  - [x] 合并操作符与操作按钮
  - [x] 完成资源池构建、编辑、删除和表达式插入
- [x] Task 4: 扩展后端 parser/evaluator
  - [x] 支持资源池 all/count 和资源组展开
  - [x] 保留单任务/批量接口行为
- [x] Task 5: 测试与验证
  - [x] 补齐前后端测试
  - [x] 执行测试、构建、lint 和差异检查
  - [x] 用户本地验收通过后删除参考临时目录

## Dev Notes

- 复用 `frontend/src/services/resourceRequirement.js` 的表达式 parser，不新增第二套前端编辑器。
- 复用 `backend/interface/preprocess_support.py` 的受限 parser/evaluator；不修改启发式算法 JAR 和核心弧段生成算法。
- 资源池按任务级保存于独立 `taskResourcePoolList` 字段，避免改变四个任务明细列表的对齐规则。
- 资源池成员保存资源/资源组名称，计算时依据当前资源目录和资源组展开；成员失效时显示明确校验错误。
- 保留 `D:\Projects\spacetaskscheduler\临时目录` 作为用户验收参考资料，完成验收前不删除、不引用运行时路径、不提交目录内容。

## Dev Agent Record

### Implementation Plan

- 新增资源池纯逻辑服务和任务级 Pinia Store。
- 扩展任务 JSON、规划包 snapshot、导入恢复和预处理资源目录。
- 将资源池编辑器与表达式操作区整合到任务详情页。
- 在后端候选弧段过滤中实现资源池展开与 all/count 语义。

### Debug Log

- 2026-08-15: 基于 Story 1.5 已完成的资源表达式过滤和单任务预处理契约，确认资源池应作为任务级表达式操作数实现。

### Completion Notes List

- 已新增任务级资源池模型与 Pinia Store，支持资源、资源组成员以及 all/count 选择模式。
- 已将资源池保存到任务 JSON 和规划包快照，旧规划包缺少 taskResourcePoolList 时自动使用空数组。
- 已将资源池名称接入资源需求表达式候选，并将运算符合并到校验表达式操作行。
- 后端受限 parser/evaluator 已支持资源池与资源、资源组混合表达式；all 要求全部成员，count 要求满足指定数量。
- 已保留单任务临时输出与批量规范输出隔离，不修改启发式算法 JAR 和核心弧段生成逻辑。
- 用户本地验收已通过，参考临时目录已删除且未加入代码或规划包。
- 提交前审查补齐资源池大小写重名、空成员展开、非法数量、未知表达式提前校验和并发请求结果保护。
- 最终验证：Vitest 47 个通过、1 个既有集成测试跳过；Python 测试 12 个通过；定向 ESLint、Vite 生产打包、Python 编译和差异检查通过。全量 `vue-tsc` 仍受项目既有 JavaScript 模块声明与 `Task.vue` 类型问题阻塞，未作为本 Story 扩大修复范围。

### File List

- _bmad-output/implementation-artifacts/1-6-resource-pools-and-expression-builder.md
- frontend/src/components/task/requirement/resource_requirement.vue
- frontend/src/services/resourcePool.js
- frontend/src/services/resourceRequirement.js
- frontend/src/services/Generate_Json.js
- frontend/src/services/TaskTransfer.js
- frontend/src/services/__tests__/TaskTransfer.spec.js
- frontend/src/services/Preprocess.js
- frontend/src/stores/useTaskResourcePoolStore.js
- frontend/src/stores/keyManager.js
- frontend/src/utils/fileHandler.js
- frontend/src/services/__tests__/resourcePool.spec.js
- frontend/src/utils/__tests__/fileHandler.spec.js
- frontend/API_README.md
- backend/interface/preprocess_support.py
- backend/main.py
- backend/tests/test_resource_pools.py
- backend/interface/README.md

### Change Log

- 2026-08-15: 创建 Story 1.6，明确 STK Scheduler 风格资源池、表达式编辑和后端筛选范围。
- 2026-08-15: 完成资源池模型、编辑器、规划包持久化、后端 all/count 过滤及自动化验证，状态更新为 review。
- 2026-08-16: 用户本地验收通过；已删除参考临时目录并将 Story 状态更新为 done。
- 2026-08-16: 完成提交前分层审查并修复资源池校验与并发边界；最终回归为前端 45 通过/1 跳过、后端 12 通过。
