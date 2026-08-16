---
title: '接入 COPT 与分支定价切割调度算法'
type: 'feature'
created: '2026-08-16'
status: 'review'
baseline_commit: '141c98bb0213044fba4a54cc154688b9062932b5'
context:
  - 'backend/main.py'
  - 'frontend/src/views/Operating.vue'
  - 'frontend/src/services/Algorithm.js'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** 系统当前仅能运行 Java 启发式算法；页面中的 COPT 和分支定价切割选项被禁用，无法用现有任务、资源和预处理候选弧段执行第二、第三种调度算法。COPT 已在本地完成授权与 Python 求解验证，但后端尚未具备稳定的调用适配。

**Approach:** 在 Python FastAPI 后端新增统一的算法调度入口和独立求解模块。COPT 使用 `coptpy` 建立 0/1 调度模型；分支定价切割参考 `临时参考/Tang/HTQ10_paper2_4` 的列生成、冲突切割思路，以当前规范 JSON 的候选弧段生成可调用的 Python 调度器。两者均返回现有结果页可解析的文本和结构化诊断数据。

## Boundaries & Constraints

**Always:** 以预处理后已发布的 `taskDetail2.json`、连续/非连续候选弧段 JSON 为唯一算法输入；每次调用创建独立模型/运行目录，不共享 COPT `Model`；结果继续遵守现有 `output_text` 表格和“使用的弧段总数”格式；COPT 不可用、授权失败、无候选弧段、无可行解或达到时间限制时返回明确的 API 错误或已求得可行解状态；所有新增求解代码使用 Python。

**Ask First:** 如果参考算法需要保留其 CPLEX Java 运行时、需要新的商业求解器授权，或需要改变任务语义（例如分段任务、连续跟踪任务的全弧段联合选择）才能正确迁移，应停止并说明差异，不把未验证的语义伪装为原算法。

**Never:** 不向浏览器暴露 COPT 密钥、许可证文件或 COPT 原生端口；不提交 `临时参考`、运行生成物、`__pycache__`、模型日志或许可证；不破坏现有启发式算法接口与输出；验收完成前不删除 `临时参考`，完成后才按用户授权删除整个目录。

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|---------------|----------------------------|----------------|
| COPT 成功求解 | 预处理后的任务和候选弧段，COPT Python 环境与授权有效 | 返回每个任务的分配状态、开始/结束时间、候选弧段 ID、总弧段数、目标值和求解状态；前端跳转结果页 | N/A |
| COPT 环境不可用 | `coptpy` 或本地 COPT DLL/授权无法加载 | 返回可操作的配置提示，前端保持运行页并显示失败原因 | 不回退到其他算法，不产生假结果 |
| 资源冲突或无解 | 两个或多个任务只能使用重叠资源弧段，或某任务无候选弧段 | COPT 明确报告不可行；分支定价切割生成最大可行完成方案并将未安排任务写入结果 | 不抛出未处理异常，结果可被现有页面解析 |
| 分支定价切割成功 | 预处理后的候选弧段和任务优先级 | Python 列生成/冲突切割求解器输出无资源重叠的调度方案、未分配任务与迭代统计 | 达到限定迭代或时间时返回当前可行方案和“时间限制”状态 |
| 前端算法选择 | 用户在运行页选择算法 1、2 或 3 后点击运行 | 先执行现有预处理，再将算法 ID 和目标 ID 传给统一后端接口；所有选项可选择 | API 错误保留当前页面和明确状态文本 |

</frozen-after-approval>

## Code Map

- `backend/main.py` -- FastAPI 路由、预处理产物发布和现有启发式算法入口。
- `backend/interface/preprocess_support.py` -- 已对资源需求过滤的候选弧段规范。
- `backend/solvers/` -- 新增 Python 求解器、输入规范化、结果渲染和 COPT 运行时加载。
- `backend/tests/` -- 新增候选弧段冲突、无候选、统一输出与 COPT 冒烟测试。
- `frontend/src/services/Algorithm.js` -- 后端算法 API 调用与输出状态保存。
- `frontend/src/views/Operating.vue` -- 算法与目标选择、运行状态和结果路由。
- `frontend/src/views/__tests__/Operating.spec.js` -- 三种算法的请求参数与页面状态测试。
- `临时参考/Tang/HTQ10_paper2_4/src/HBPC_new_HTQ_Cut1_Cut2_2/ColumnGen.java` -- 仅作为分支定价、主问题与冲突切割策略的参考。

## Tasks & Acceptance

**Execution:**
- [x] `backend/solvers/scheduling.py` -- 规范化任务与连续/非连续候选弧段，建立冲突图，输出兼容结果页的文本和 JSON。
- [x] `backend/solvers/copt_scheduler.py` -- 延迟加载 COPT，建立任务覆盖与资源重叠约束，支持最少弧段/最大完成度目标及状态映射。
- [x] `backend/solvers/branch_price_cut.py` -- 基于参考实现的列生成和冲突切割理念，用 Python 生成可行计划、迭代筛选冲突并给出受限状态。
- [x] `backend/main.py` -- 新增统一调度路由，保留旧启发式路由，并从规范目录读取输入、返回统一响应。
- [x] `frontend/src/services/Algorithm.js` 与 `frontend/src/views/Operating.vue` -- 解锁算法选项，向后端传递算法和目标并显示对应运行信息。
- [x] `backend/tests/` 与 `frontend/src/views/__tests__/Operating.spec.js` -- 覆盖输入转换、冲突排除、错误状态、COPT 求解和算法路由。
- [x] `临时参考/` -- 自动化、HTTP 与前端验收通过后已删除，且未进入 Git 提交。

**Acceptance Criteria:**
- Given 已成功预处理的规划包，when 选择 COPT 并运行，then 后端以 Python/COPT 完成模型求解且结果页展示可解析的调度结果。
- Given 当前 COPT 环境缺失或授权无效，when 选择 COPT 并运行，then 页面展示可操作错误而不将算法选择静默切换为启发式。
- Given 有资源时间冲突的候选弧段，when 选择分支定价切割并运行，then 输出中的已分配弧段不会在同一测控资源上时间重叠。
- Given 选择任一三种算法，when 预处理和求解完成，then 前端结果页、甘特图和报告仍可使用原有输出格式显示结果。
- Given 所有验收通过，when 查看提交内容，then 不包含授权、COPT 本机文件、运行产物、缓存目录或 `临时参考`。

## Design Notes

为保持当前系统结果链路，先将每个候选弧段视为一个不可分割的任务候选列，并按资源 ID 与实际占用区间构造冲突。这能完整覆盖现有非连续候选弧段数据。连续跟踪候选若包含多个资源，会作为一个原子列占用全部资源；后续可在任务 JSON 出现连续跟踪方案集合语义时扩展。

分支定价切割参考实现的核心是“候选计划列覆盖任务 + 资源弧段容量 + 冲突切割”，而非复用其中依赖 CPLEX 和旧 TXT 数据格式的 Java 代码。Python 版本将生成单任务列和同资源可串行组合列，利用冲突切割消除跨列重叠，再以有限迭代得到可行解；这保持算法思想并适配当前 JSON 契约。

## Verification

## Dev Agent Record

### Completion Notes

- COPT 8.0.6 Python API 在本机 sts 环境中成功加载；当前真实规划包返回 optimal、6 个已选弧段、目标值 4500.0。
- 分支定价切割真实规划包返回 optimal、6 个已选弧段、18 个候选列，已分配资源无时间重叠。
- 后端单元测试：18 passed, 1 skipped；统一接口已通过实际 FastAPI 服务和 HTTP 请求验证。
- 前端 Operating 单测：4 passed；npm run build-only 已通过。完整 npm run build 仍受既有 vue-tsc 类型错误影响。

### File List

- backend/main.py
- backend/solvers/__init__.py
- backend/solvers/scheduling.py
- backend/solvers/copt_scheduler.py
- backend/solvers/branch_price_cut.py
- backend/tests/conftest.py
- backend/tests/test_solvers.py
- backend/tests/test_schedule_api.py
- frontend/src/services/Algorithm.js
- frontend/src/views/Operating.vue
- frontend/src/views/__tests__/Operating.spec.js
- _bmad-output/implementation-artifacts/spec-2-algorithm-solvers.md

### Change Log

- 2026-08-16: 完成 COPT、分支定价切割求解器、统一 API、前端选择与自动化验收。

**Commands:**
- `C:\Users\20685\anaconda3\python.exe -m pytest backend/tests -q` -- 后端单元测试全部通过。
- `C:\Users\20685\anaconda3\python.exe -m pytest backend/tests/test_solvers.py -q` -- COPT 与分支定价切割的模型、冲突和错误路径通过。
- `npm test -- --run frontend/src/views/__tests__/Operating.spec.js` -- 三种算法选择和请求路由通过。
- `C:\Users\20685\anaconda3\python.exe -m uvicorn main:app --port 8000` 与前端开发服务 -- 使用本地规划包依次验证 COPT 和分支定价切割 API，结果页可打开。
