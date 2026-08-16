---
title: '重构工程构建与持续集成基线'
type: 'refactor'
created: '2026-08-16'
status: 'done'
baseline_commit: 'f5e515e6536c83db1170f11ba119375862f9abd9'
context:
  - 'README.md'
  - 'frontend/package.json'
  - 'backend/requirements.txt'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** 当前前端只有跳过类型检查的 `build-only` 能成功，正式 `npm run build` 会被 JavaScript 模块声明和 `Task.vue` 类型错误阻断；仓库也没有自动验证流程，后端旧版数值依赖无法在现代 Python 环境稳定安装，因此合并后的回归只能依赖人工发现。

**Approach:** 修复现有前端类型边界和任务导入页面的真实类型问题，整理可重复执行的前后端验证命令，并新增 GitHub Actions，在每次推送和 PR 上从干净环境安装依赖、运行测试与正式构建。

## Boundaries & Constraints

**Always:** `npm run build` 必须同时执行 Vue/TypeScript 检查与 Vite 生产打包；前端单元测试必须提供非监听的一次性命令；CI 使用 Node.js 20 和 Python 3.11，且不依赖本机 Java、COPT 安装或商业许可证；后端依赖更新后必须在全新虚拟环境可安装并通过现有测试；保留三种调度算法、API 响应和页面行为。

**Ask First:** 如果通过验收必须关闭 TypeScript 严格检查、跳过失败测试、移除 FastAPI Offline 文档能力，或改变预处理/求解业务逻辑，应停止并说明原因。

**Never:** 不用全局 `any` 声明、`@ts-ignore` 或降低构建门槛掩盖错误；不在 CI 写入 COPT 密钥或许可证；不提交 `node_modules`、构建产物、虚拟环境、运行缓存或新的算法输出；不顺带实现多用户任务隔离、服务端认证或算法升级。

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|---------------|----------------------------|----------------|
| 前端正式构建 | 全新安装 `package-lock.json` 后执行正式构建 | 类型检查、生产打包均成功，已有 59 个单测继续通过 | 任一阶段失败时返回非零状态 |
| 后端干净安装 | Python 3.11、无 COPT 的新虚拟环境 | 运行依赖可安装，普通求解器和 API 测试通过，真实 COPT 冒烟测试明确跳过 | 不把缺少 COPT 当作 CI 失败，也不伪造 COPT 成功 |
| PR 自动验证 | 向目标分支提交前后端改动 | GitHub Actions 分别展示前端和后端检查结果 | 任一必需检查失败即阻止绿色验收 |

</frozen-after-approval>

## Code Map

- `frontend/tsconfig.app.json` -- Vue 应用与存量 JavaScript 模块的渐进式类型边界。
- `frontend/src/views/task/Task.vue` -- 当前正式类型检查中的具体参数、文件读取、异常和结果列表错误。
- `frontend/package.json` -- 开发、一次性测试和正式构建命令入口。
- `backend/requirements.txt` -- FastAPI、预处理和数值计算运行依赖。
- `backend/requirements-dev.txt` -- pytest/TestClient 等开发验证依赖。
- `.github/workflows/ci.yml` -- 前后端干净环境自动验证。
- `.gitignore` -- 全仓库 Python、Node、编辑器和本地运行产物忽略规则。
- `README.md` -- 受支持版本、本地验证命令和最新回归基线。

## Tasks & Acceptance

**Execution:**
- [x] `frontend/tsconfig.app.json`、`frontend/src/views/task/Task.vue` -- 允许存量 JavaScript 被 TypeScript 正确解析，并为 TypeScript 代码补齐最小准确类型，不改变导入和预处理行为。
- [x] `frontend/package.json` -- 增加稳定的一次性单测命令，确保正式构建仍包含类型检查。
- [x] `backend/requirements.txt`、`backend/requirements-dev.txt` -- 将不兼容 Python 3.11 的数值依赖更新到受支持范围，并约束 FastAPI TestClient 的兼容版本。
- [x] `.github/workflows/ci.yml` -- 在 push 与 pull request 上并行执行前端安装、单测、正式构建及后端安装、pytest。
- [x] `.gitignore` 与已跟踪 `__pycache__`/`.pyc` -- 建立全仓库忽略规则并从版本控制删除缓存，不删除业务输入和示例数据。
- [x] `README.md` -- 移除“正式构建已知失败”的说明，记录统一的本地验证方式和 COPT 在 CI 中的可选边界。

**Acceptance Criteria:**
- Given 合并后的干净仓库，when 执行前端一次性单测和 `npm run build`，then 全部测试通过且类型检查与生产资源构建成功。
- Given Python 3.11 新虚拟环境，when 安装运行与开发依赖并执行 `pytest`，then 依赖安装成功，非 COPT 测试全部通过且 COPT 缺失仅产生预期跳过。
- Given 一个新的 push 或 PR，when GitHub Actions 运行，then 前端和后端两个检查均可独立定位失败并以退出状态反映结果。
- Given 查看本次差异，when 检查算法、接口和运行数据，then 业务行为未改变，仓库不再跟踪 Python 字节码缓存。

## Design Notes

本次采用渐进式 TypeScript 边界：允许应用现有 `.js` 模块参与模块解析但不立即启用 `checkJs`，同时保持 `.ts` 与 Vue `lang="ts"` 代码检查有效。这样可以恢复正式构建门禁，又不把全量 JavaScript 迁移伪装成一个小型基线修复。CI 不安装 COPT；现有测试负责验证缺失运行时的明确行为，本地带许可证环境继续承担真实 COPT 冒烟验收。

## Verification

**Commands:**
- `cd frontend && npm ci && npm run test:unit:run && npm run build` -- expected: 59 个单测通过，类型检查与 Vite 构建成功。
- `python -m venv .venv-ci && .venv-ci/Scripts/python -m pip install -r backend/requirements.txt -r backend/requirements-dev.txt` -- expected: Python 3.11 干净安装成功。
- `.venv-ci/Scripts/python -m pytest backend/tests -q` -- expected: 非 COPT 测试通过，未安装 COPT 时仅真实求解冒烟用例跳过。
- `git status --short` -- expected: 不出现 `__pycache__`、`.pyc`、`dist` 或依赖目录。

## Suggested Review Order

**自动验证入口**

- 前后端独立作业建立合并前的统一质量门禁。
  [`ci.yml:1`](../../.github/workflows/ci.yml#L1)

- 一次性 Vitest 命令保证本地和 CI 都能稳定退出。
  [`package.json:11`](../../frontend/package.json#L11)

**前端类型边界**

- 渐进解析存量 JavaScript，同时保持 TypeScript 与 Vue 检查。
  [`tsconfig.app.json:7`](../../frontend/tsconfig.app.json#L7)

- 上传、文件读取、异常和结果列表使用明确类型。
  [`Task.vue:131`](../../frontend/src/views/task/Task.vue#L131)

**后端可安装性**

- Python 3.11 数值依赖与显式编码保证干净安装。
  [`requirements.txt:1`](../../backend/requirements.txt#L1)

- TestClient 兼容范围避免 Starlette 旧接口失效。
  [`requirements-dev.txt:13`](../../backend/requirements-dev.txt#L13)

- COPT 业务校验测试使用替身隔离商业运行时。
  [`test_solvers.py:72`](../../backend/tests/test_solvers.py#L72)

**仓库与文档**

- 全仓库忽略规则阻止缓存、依赖和密钥进入提交。
  [`.gitignore:1`](../../.gitignore#L1)

- 运行要求、三种算法和正式验收命令保持一致。
  [`README.md:208`](../../README.md#L208)

- 审查发现但不属于本次范围的问题集中延期。
  [`deferred-work.md:9`](deferred-work.md#L9)
