# 航天器任务规划系统API

## 项目简介

航天器任务规划系统API是一个基于FastAPI的RESTful API服务，用于处理空间站任务规划、资源调度等功能。该API提供了三个主要功能：csv到json数据转换、任务的可行时间窗数据预处理和任务调度算法（启发式）。使用FastAPIOffline确保在网络状态不佳时也能正常加载API文档。

## API文档

启动服务后，可以通过访问 http://localhost:8000/docs 查看Swagger UI文档。由于使用了FastAPIOffline，即使在没有网络连接的情况下，API文档也能正常加载。

## API端点

### 1. 数据转换接口

**端点**: `/api/convert_csv_to_json`

**方法**: POST

**描述**: 将CSV格式的测控资源和任务数据转换为JSON格式。

**请求参数**:
- `ck_file`: 测控资源CSV文件
- `task_non_file`: 非连续跟踪任务CSV文件
- `task_con_file`: 连续跟踪任务CSV文件

**响应**:
```json
{
  "success": true,
  "message": "数据转换成功",
  "data": {
    "resource": [...],
    "task": {...}
  }
}
```

### 2. 预处理接口

**端点**: `/api/preprocess_task_timewindow`

**方法**: POST

**描述**: 对测控资源和任务数据进行预处理，生成可行时间窗。

**请求参数**:
- `ck_file`: 测控资源CSV文件
- `task_non_file`: 非连续跟踪任务CSV文件
- `task_con_file`: 连续跟踪任务CSV文件
- `key_points_file`: 关键时间点约束CSV文件
- `sun_file` / `umbra_file`: 可选光照和阴影CSV文件；上传文件按原始时间使用，未上传时使用接口内置数据
- JSON模式可使用 `ck_json` 与 `task_json` 代替上述CSV文件
- `algorithm_task_json`: 可选的算法任务JSON；批量预处理成功后作为启发式算法的任务输入，未提供时回退到 `task_json`
- `resource_catalog_json`: 可选的资源目录，包含 `resourceGroups` 和 `resourcePools` 数组
- `task_key`: 可选的任务稳定key；传入时只计算该任务，不传时计算整包任务

**响应**:
```json
{
  "success": true,
  "message": "数据预处理成功",
  "data": {
    "resource": [...],
    "task": {...},
    "non_continuous_original": [...],
    "continuous_original": [...],
    "non_continuous_json": [...],
    "continuous_json": [...],
    "scope": "batch",
    "task_key": null,
    "task_name": null,
    "continuous_events_data": [...],
    "discrete_events_data": [...],
    "no_result_tasks": [...]
  }
}
```

JSON模式下，`task_key` 用于单任务计算。单任务结果只返回当前任务的备选弧段，不覆盖批量预处理和算法使用的规范输出；省略 `task_key` 时保持原有批量行为。每次请求使用独立临时目录，批量结果仅在预处理和资源表达式筛选全部成功后发布；发布过程与启发式算法读取使用同一互斥保护，避免读到不同批次的混合文件。候选事件结构为 `task_key`、`task_name`、`tracking_plan_id`、`start_time`、`end_time`、`duration`、`task_to_craft` 和 `cekong_resource`。表达式合法但没有匹配弧段时接口仍返回 `success: true`，并返回空事件数组及 `no_result_tasks`。当任务时间范围与内置光照/阴影数据不重叠时，接口只为内置数据在临时目录生成对齐副本；用户上传的光照/阴影文件不会被平移或改写。

资源需求表达式支持资源名、资源组名和资源池名。资源池结构为 `taskKey`、`poolName`、`selectionMode`、`requiredCount`、`resourceList` 和 `resourceGroupList`；`all` 要求候选方案包含池内展开后的全部资源，`count` 要求至少包含 `requiredCount` 个池成员。资源组会先应用包含和排除列表，再加入资源池；资源池也会随任务 JSON 的 `taskResourcePoolList` 保存。

### 3. 调度算法接口

**端点**: `/api/schedule_algorithm_heuristic`

**方法**: POST

**描述**: 执行任务调度算法，生成最优调度方案。

**请求参数**:
- `jar_file`: 调度算法JAR文件
- `task_json`: 任务JSON文件
- `resource_json`: 资源JSON文件
- `non_con_arc_json`: 非连续跟踪遥控事件预处理备选弧段JSON文件
- `con_arc_json`: 连续跟踪遥控事件预处理备选弧段JSON文件

**响应**:
```json
{
  "success": true,
  "message": "调度算法执行成功",
  "data": {
    "output_files": [...],
    "output_data": {...},
    "log": "..."
  }
}
```

### 健康检查接口

**端点**: `/health`

**方法**: GET

**描述**: 检查API服务是否正常运行。

**响应**:
```json
{
  "status": "ok"
}
```

## 使用示例

### 使用curl调用API

1. 数据转换:
```bash
curl -X POST "http://localhost:8000/api/convert_csv_to_json" \
  -H "accept: application/json" \
  -H "Content-Type: multipart/form-data" \
  -F "ck_file=@测控资源整合_3_3.csv" \
  -F "task_non_file=@非连续跟踪任务数据_16_2days_equ.csv" \
  -F "task_con_file=@连续跟踪任务数据_3_2days_equ.csv"
```

2. 数据预处理:
```bash
curl -X POST "http://localhost:8000/api/preprocess_task_timewindow" \
  -H "accept: application/json" \
  -H "Content-Type: multipart/form-data" \
  -F "ck_file=@测控资源整合_3_3.csv" \
  -F "task_non_file=@非连续跟踪任务数据_16_2days_equ.csv" \
  -F "task_con_file=@连续跟踪任务数据_3_2days_equ.csv" \
  -F "key_points_file=@关键时间点约束.csv"
```

3. 调度算法:
```bash
curl -X POST "http://localhost:8000/api/schedule_algorithm_heuristic" \
  -H "accept: application/json" \
  -H "Content-Type: multipart/form-data" \
  -F "jar_file=@your-project-1.0.0-jar-with-dependencies.jar" \
  -F "task_json=@taskDetail.json" \
  -F "resource_json=@测控资源.json" \
  -F "non_con_arc_json=@非连续跟踪遥控事件预处理备选弧段.json" \
  -F "con_arc_json=@连续跟踪遥控事件预处理备选弧段.json"
```

## 注意事项

1. 预处理上传文件按请求隔离存储在临时目录中，并在请求结束后自动清理；批量成功结果会发布到算法规范目录。
2. 在生产环境中，应该限制CORS设置，只允许特定的来源访问API。
3. 调度算法需要Java环境支持，请确保服务器上已安装Java。
4. 使用FastAPIOffline确保在网络状态不佳时也能正常加载API文档。
