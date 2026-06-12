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
    "continuous_json": [...]
  }
}
```

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

1. 所有上传的文件将临时存储在服务器的`temp`目录中，处理完成后不会自动删除。
2. 在生产环境中，应该限制CORS设置，只允许特定的来源访问API。
3. 调度算法需要Java环境支持，请确保服务器上已安装Java。
4. 使用FastAPIOffline确保在网络状态不佳时也能正常加载API文档。 