---
title: '2026 示例规划包与内置使用指南'
type: 'feature'
created: '2026-08-15'
status: 'done'
baseline_commit: '11c0ac486354565f82e905eb9af9cce0cee418e1'
context:
  - '{project-root}/_bmad-output/implementation-artifacts/1-2-feature-completion.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** 当前下载的 CSV ZIP 不能作为规划包导入，示例年份过旧且不能保证启发式流程直接处理；帮助、许可证和关于仍跳转外部网站。

**Approach:** 建立自包含的新手使用闭环：参考并适当简化临时材料，提供多个可选择的 2026 `.sts` 示例；运行启发式算法前自动预处理；将帮助、MIT 许可证和团队介绍改为项目内置页面，并在迁移验收后删除临时目录。

## Boundaries & Constraints

**Always:** 示例通过当前解析校验，资源、任务和约束键值对应且时间均在 2026 年；提供“小型连续任务”“非连续测控任务”“综合演示”，单选下载 `.sts`，多选下载含独立 `.sts` 的 ZIP；每个示例真实完成预处理和现有启发式算法执行；流程图复制到正式目录；关于页写明“华中科技大学管理系统工程研究中心祁超团队”，张建、蔡清林全程开发，唐坚强、祁超、张征指导，实验室同仁提供帮助；正式产物不得引用临时目录。

**Ask First:** 修改算法 JAR、后端算法 API 契约、`.sts` 格式版本、MIT 许可证类型或上述人员署名。

**Never:** 不把 CSV ZIP 标为规划包；不用 50/100/150/200 任务压测数据作默认示例；不保留飞书/Gitee 外链；不修改算法逻辑；不提前删除临时目录。

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|---------------|----------------------------|----------------|
| 单个示例 | 选择一个场景 | 下载可直接打开的 `.sts`，不改变当前工作区 | 生成失败时保留工作区并明确提示 |
| 多个示例 | 勾选多个场景 | 下载 ZIP，内部每项均为独立 `.sts` | 未选中时禁用下载 |
| 合集误导入 | 将合集 ZIP 交给“打开” | 提示先解压并选择其中 `.sts` | 不恢复任何 Store |
| 算法运行 | 打开示例后点击运行 | 自动预处理，再调用现有启发式接口并展示结果 | 预处理失败时不调用算法，显示具体阶段 |

</frozen-after-approval>

## Code Map

- `frontend/src/components/AppHeader.vue` -- 多示例选择、单选/多选下载入口。
- `frontend/src/services/samplePlanningPackages.js` -- 2026 场景目录、简化数据和打包编排。
- `frontend/src/utils/fileHandler.js` -- 可复用 Blob 构建、合集识别与安全导入。
- `frontend/src/views/Operating.vue` -- 启发式运行前的自动预处理顺序和反馈。
- `frontend/src/components/NavigationBar.vue`、`frontend/src/router/index.js`、`frontend/src/views/{Help,License,About}.vue` -- 内置说明入口、路由和页面。
- `frontend/src/services/__tests__/samplePlanningPackages.spec.js`、`frontend/src/utils/__tests__/fileHandler.spec.js` -- 示例与归档回归测试。

## Tasks & Acceptance

**Execution:**
- [x] `frontend/src/services/__tests__/samplePlanningPackages.spec.js`、`frontend/src/utils/__tests__/fileHandler.spec.js` -- 覆盖三个 2026 示例、单/多下载、格式校验和合集误导入。
- [x] `frontend/src/services/samplePlanningPackages.js`、`frontend/src/utils/fileHandler.js` -- 按现有 Store 契约构造简化算例并复用正式 `.sts` 打包逻辑。
- [x] `frontend/src/components/AppHeader.vue` -- 用紧凑多选弹层替换后端 CSV 下载，保持顶栏布局稳定。
- [x] `frontend/src/views/Operating.vue` -- 启发式执行前串行预处理，区分预处理与算法错误。
- [x] `frontend/src/views/{Help,License,About}.vue`、`frontend/src/assets/help/` -- 编写内置内容并迁移必要素材。
- [x] `frontend/src/components/NavigationBar.vue`、`frontend/src/router/index.js` -- 将外链改为应用内路由。
- [x] `_bmad-output/implementation-artifacts/1-2-feature-completion.md`、`临时目录_参考完删除/` -- 记录文件与验收结果，确认无引用后删除临时目录。

**Acceptance Criteria:**
- Given 任一示例已下载并重新打开，when 浏览属性、资源、任务、主视图和报告，then 显示一致的 2026 场景数据且无 `basicConfig.json` 错误。
- Given 后端启发式服务可用，when 打开任一示例并点击运行，then 自动预处理成功、算法读取本次示例并产生可展示结果，而非沿用旧文件。
- Given 用户进入帮助、许可证或关于，when 浏览和返回，then 全程不离开应用，流程图可见，MIT 文本及指定署名准确。
- Given 实施完成，when 搜索仓库并执行生产构建，then 不存在临时目录路径引用，临时目录已删除且正式资源仍正常显示。

## Spec Change Log

- 2026-08-15：根据评审补强离散资源匹配、分段任务归并、多时间窗、v2 完整性校验、解析失败提示和运行前旧结果清理。

## Design Notes

示例用 JavaScript 工厂维护并复用正式打包逻辑。复杂约束可删减，但不能绕过端到端算法验证。

## Verification

**Commands:**
- `npx vitest run` -- 示例、归档及既有单元测试通过。
- `npm run build-only` -- 生产构建成功。
- `npx eslint <changed-files>`、`git diff --check` -- 无代码和空白错误。
- `rg "临时目录_参考完删除|feishu.cn|gitee.com" frontend backend` -- 无运行时临时路径和旧外链。

**Results:** 23 个常规测试通过；3 个示例均通过真实预处理和 JAR 启发式算法集成测试；生产构建、改动文件 ESLint 及 1440x900/390x844 浏览器验收通过。

**Manual checks (if no CLI):**
- 在 1440x900 与 390x844 下验证示例选择器和三个内置页面；逐个导入示例并通过本地 FastAPI/JAR 完成预处理、启发式运行、结果与报告检查。

## Suggested Review Order

**规划包闭环**

- 先看版本校验、平行数据对齐和兼容策略。
  [`fileHandler.js:106`](../../frontend/src/utils/fileHandler.js#L106)

- 再看历史规划包的打开、下载和恢复入口。
  [`WorkSpace.vue:152`](../../frontend/src/views/WorkSpace.vue#L152)

**实时调度呈现**

- 算法输出在这里关联预处理弧段、任务和资源。
  [`scheduleData.js:61`](../../frontend/src/services/scheduleData.js#L61)

- 任务与资源甘特图在这里保留全部有效时间窗。
  [`scheduleData.js:171`](../../frontend/src/services/scheduleData.js#L171)

- 结果页明确区分未运行、解析失败和有效结果。
  [`Result.vue:16`](../../frontend/src/views/Result.vue#L16)

**示例与运行**

- 三套 2026 算例及单选、多选打包逻辑集中维护。
  [`samplePlanningPackages.js:274`](../../frontend/src/services/samplePlanningPackages.js#L274)

- 顶栏用紧凑选择器暴露示例下载能力。
  [`AppHeader.vue:87`](../../frontend/src/components/AppHeader.vue#L87)

- 运行入口先清旧结果，再预处理并调用现有算法。
  [`Operating.vue:102`](../../frontend/src/views/Operating.vue#L102)

**内置文档**

- 路由统一承载结果、帮助、许可证和关于页面。
  [`index.js:56`](../../frontend/src/router/index.js#L56)

- 帮助页内置完整流程和正式迁移后的流程图。
  [`Help.vue:2`](../../frontend/src/views/Help.vue#L2)

- 团队署名与指导信息在关于页集中呈现。
  [`About.vue:7`](../../frontend/src/views/About.vue#L7)

**回归保障**

- 规划包测试覆盖 v1 兼容、v2 严格校验和合集识别。
  [`fileHandler.spec.js:58`](../../frontend/src/utils/__tests__/fileHandler.spec.js#L58)

- 数据转换测试覆盖离散资源、分段任务和多时间窗。
  [`scheduleData.spec.js:12`](../../frontend/src/services/__tests__/scheduleData.spec.js#L12)

- 真实集成测试逐一运行三个示例并恢复后端文件。
  [`samplePlanningPackages.integration.spec.js:47`](../../frontend/src/services/__tests__/samplePlanningPackages.integration.spec.js#L47)
