---
baseline_commit: d3cc1fde2d21c780837664edbc48ec50faaae760
---

# Story 1.3: 时态约束可编辑性与内置说明完善

Status: review

## Story

作为航天任务规划人员，
我希望可以稳定进入并编辑锚定需求和时态约束，在计算过程中保持界面稳定，并清楚了解当前算法能力与项目说明，
以便不中断地完成规划配置并准确理解系统现状。

## Acceptance Criteria

1. 从导航栏进入“时态约束”时页面可以正常加载；任务或约束为空、任务已删除、历史数据不完整时均不冻结，并提供可理解的空状态或返回路径。
2. 两项锚定需求均可选择任务、替换任务和清除；锚定任务不得重复选择，任务名称、优先级和备注会随当前任务数据更新并持久化。
3. 用户可新增和编辑时态约束；编辑入口按约束唯一标识定位，任务、约束类型、最小/最大间隔、计时点和备注保存后正确回显；无效或失效链接不导致页面异常。
4. 点击“计算可行时间窗”后，导入任务区域的尺寸与位置保持稳定；导入和预处理拥有独立加载状态，运行期间阻止重复或冲突操作，请求成功和失败后均恢复可用。
5. 运行配置页在算法区域直接提示“目前仅接入启发式算法”，未接入算法保持不可运行且不会误导用户。
6. 关于页不再展示“研究背景”，改为“指导老师”；帮助中心、许可证和关于三个页面采用一致、克制且更易扫描的文档布局。
7. 桌面端与 390px 移动端的时态约束、任务工具栏、运行配置和三个文档页无内容重叠、裁切或页面级横向溢出。
8. 不修改后端、算法 JAR、调度策略和 API 契约，不新增依赖；相关单元测试、`npm run build-only`、改动文件 ESLint 与差异检查通过。

## Tasks / Subtasks

- [x] Task 1: 修复时态约束状态与路由链路 (AC: 1-3)
  - [x] 为锚定数据补充空值、失效任务和持久化防护
  - [x] 使用约束 key 进入编辑页并修复 Store 更新接口
  - [x] 为新增、编辑和无效链接补充校验与反馈
- [x] Task 2: 稳定任务计算工具栏 (AC: 4)
  - [x] 分离任务导入与预处理加载状态
  - [x] 固定按钮尺寸并阻止重复或冲突操作
- [x] Task 3: 完善算法提示与内置文档 (AC: 5-7)
  - [x] 在算法区显示当前接入范围并禁用未接入选项
  - [x] 将关于页“研究背景”替换为“指导老师”
  - [x] 统一帮助、许可证和关于页的导航、分区和响应式样式
- [x] Task 4: 回归测试与验收 (AC: 8)
  - [x] 增加约束 Store 和关键页面状态测试
  - [x] 运行单元测试、生产构建、ESLint 和差异检查
  - [x] 验证桌面与移动端关键流程

## Dev Notes

### Guardrails

- 严禁修改或提交 `backend/` 下本地验收生成的数据文件。
- 复用 Vue 3、Pinia、Ant Design Vue 和现有主题变量，不新增依赖。
- 时态约束编辑应使用稳定 key 定位，避免任务名称包含连字符、重名或改名后路由失效。
- Store 更新必须集中处理，不在页面中依赖共享对象的隐式深层变更。
- 文档页只做工具型信息呈现优化，不改为营销页面，不加入外部文档跳转。

### Current State

- `TemporalConstraint.vue` 在挂载时无条件访问两条锚定数据，并维护一份与 Store 共享引用的本地约束数组。
- `TemConstraintDetail.vue` 通过两个任务名称查找约束，未命中时立即读取 `undefined`，且调用 Store 更新方法的参数与定义不一致。
- `modal-task.vue` 对失效的已选任务直接读取 `.key`，历史数据引用已删除任务时会抛错。
- `Task.vue` 用同一个 `loading` 同时控制导入和预处理，计算期间错误改变导入按钮尺寸。
- `Operating.vue` 只在运行未接入算法时弹出警告，页面未直接说明当前能力范围。
- `About.vue` 的“研究背景”不符合当前内容要求，三个文档页的信息层级仍可进一步统一。

### References

- [Source: _bmad-output/implementation-artifacts/1-2-feature-completion.md]
- [Source: _bmad-output/planning-artifacts/ux-designs/ux-spacetaskscheduler-2026-08-14/DESIGN.md]
- [Source: frontend/src/views/task/taskTem/TemporalConstraint.vue]
- [Source: frontend/src/views/task/taskTem/TemConstraintDetail.vue]
- [Source: frontend/src/views/task/Task.vue]
- [Source: frontend/src/views/Operating.vue]
- [Source: frontend/src/components/DocumentationPage.vue]

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- 2026-08-15: 从已合并 Story 1.2 内容创建 Story 1.3 分支，确认本地后端输出为用户验收数据，不纳入改动。
- 2026-08-15: 排查约束编辑链路、任务工具栏加载状态和内置文档结构，确定前端范围内的修复方案。

### Completion Notes List

- 空锚定数组会在导入和页面进入时恢复为两条标准锚定记录，失效任务会安全清除。
- 时态约束新增、按 key 编辑、删除和无效 key 回退均已覆盖；任务名包含连字符时不再依赖名称拼接路由。
- 任务导入与可行时间窗预处理使用独立加载状态，按钮尺寸固定且两个操作互斥。
- 运行页显示“目前仅接入启发式算法”，帮助中心、许可证和关于均为站内说明页面。
- 关于页使用“指导老师”分区，包含唐坚强、祁超和张征，并保留张建、蔡清林开发及实验室同仁致谢信息。
- 已完成 1440x900 和 390x844 浏览器验收；没有发现页面级横向溢出或本 Story 页面运行时错误。

### File List

- _bmad-output/implementation-artifacts/1-3-temporal-constraints-and-docs.md
- _bmad-output/planning-artifacts/ux-designs/ux-spacetaskscheduler-2026-08-14/EXPERIENCE.md
- frontend/src/components/TemporalConstraintEditor.vue
- frontend/src/components/DocumentationPage.vue
- frontend/src/components/modal/modal-task.vue
- frontend/src/components/table/show_table.vue
- frontend/src/router/index.js
- frontend/src/services/samplePlanningPackages.js
- frontend/src/stores/__tests__/constraintStores.spec.js
- frontend/src/stores/useAnchorContraintListStore.js
- frontend/src/stores/useTemConstraintsListStore.js
- frontend/src/utils/fileHandler.js
- frontend/src/views/About.vue
- frontend/src/views/Help.vue
- frontend/src/views/License.vue
- frontend/src/views/Operating.vue
- frontend/src/views/task/Task.vue
- frontend/src/views/task/taskTem/CustomTemConstraints.vue
- frontend/src/views/task/taskTem/TemConstraintDetail.vue
- frontend/src/views/task/taskTem/TemporalConstraint.vue

## Change Log

- 2026-08-15: 创建 Story 1.3，明确约束可编辑性、计算期间布局稳定、算法提示和内置文档优化范围。
