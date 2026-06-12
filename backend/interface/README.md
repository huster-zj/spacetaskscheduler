<!--
 * @Author: Jerry
 * @Date: 2025-03-25 10:34:58
 * @LastEditors: Do not edit
 * @LastEditTime: 2025-05-15 08:38:18
 * @FilePath: \spacetaskscheduler\interface\README.md
-->
# 航天器任务规划接口项目

## 项目简介
本项目为航天器任务规划软件开发接口和算例。主要实现以下功能:

## 问题
1.生成任务的数据
2.预处理部分

### 接口功能
1. **测控资源导入接口**
   - 输入: CSV格式的测控资源数据
   - 输出: 标准化的JSON格式测控资源数据

2. **任务导入接口**
   - 输入: JSON格式的任务详情数据
   - 输出: 标准化的任务数据结构

3. **可行时间窗计算接口**
   - 输入:
     - 测控资源数据
     - 任务需求数据
     - 关键时间点约束
        - 飞控事件时间点只可选择开始或结束时间
        - 关键点——1表示进阴影时间点，2表示出阴影时间点，3表示进光照时间点，4表示出光照时间点，5表示进入测控弧段时间点，6表示出测控弧段时间点。
        - 偏移
   - 输出:
     - 可行时间窗列表
     - 每个时间窗的具体参数

4. **调度算法接口**
   - 实现启发式算法
   - 输入:
     - 可行时间窗数据
     - 任务优先级
     - 资源约束
   - 输出:
     - 最优调度方案
     - 调度评价指标

## 算例设计
1. **基础算例**
   - 单任务单资源场景
   - 简单约束条件
   - 验证基本功能

2. **进阶算例**
   - 多任务多资源场景
   - 复杂约束条件
   - 性能测试用例

## 项目结构
```
interface/
├── 数据格式/  
├── 系统设计算例/   
│   ├── task_data_3_16/
│   ├── 测控站集合.csv/     
│   ├── 测控资源整合_3_3.csv/    
│   ├── 算例说明.docx/            
├── java/                   
└── output/                   
```

## 数据格式说明
- 测控资源数据: CSV格式
- 任务数据: JSON格式
- 输出结果: JSON格式

### 1. 数据转换 (convert_to_json.py)

#### 测试环境脚本
```powershell
# 标准测试
$TEST_ROOT = "D:/workplace/code/python_project/spacecraft/interface/系统测试算例"
$TEST_ROOT = "C:/Users/20685/Desktop/interface/系统测试算例"
$TEST_ROOT = "C:/Users/James/Desktop/实验室/TaskScheduler/interface/系统测试算例"

# 同时转换测控资源和任务
python convert_to_json.py `
    --input_ck "$TEST_ROOT/测控资源整合_3_3.csv" `
    --input_task_non "$TEST_ROOT/task_data_3_16/非连续跟踪任务数据/非连续跟踪任务数据_16_2days_equ.csv" `
    --input_task_con "$TEST_ROOT/task_data_3_16/连续跟踪任务数据/连续跟踪任务数据_3_2days_equ.csv" `
    --key_points "$TEST_ROOT/task_data_3_16/关键点约束/关键时间点约束.csv" `
    --output "./"

# 只转换测控资源
python convert_to_json.py `
    --input_ck "$TEST_ROOT/测控资源整合_3_3.csv" `
    --output "./"

# 只转换任务
python convert_to_json.py `
    --input_task_non "$TEST_ROOT/task_data_3_16/非连续跟踪任务数据/非连续跟踪任务数据_16_2days_equ.csv" `
    --input_task_con "$TEST_ROOT/task_data_3_16/连续跟踪任务数据/连续跟踪任务数据_3_2days_equ.csv" `
    --key_points "$TEST_ROOT/task_data_3_16/关键点约束/关键时间点约束.csv" `
    --output "./"
    

# 中期测试
$TEST_ROOT = "D:/workplace/code/python_project/spacecraft/interface/系统测试算例——中期测试"
$TEST_ROOT = "C:/Users/20685/Desktop/interface/系统测试算例——中期测试"
$TEST_ROOT = "C:/Users/James/Desktop/实验室/TaskScheduler/interface/系统测试算例——中期测试"
# 同时转换测控资源和任务
python convert_to_json.py `
    --input_ck "$TEST_ROOT/测控资源整合_0_2.csv" `
    --input_task_non "$TEST_ROOT/task_data_1_4/非连续跟踪任务数据/非连续跟踪任务数据_4_1days_equ.csv" `
    --input_task_con "$TEST_ROOT/task_data_1_4/连续跟踪任务数据/连续跟踪任务数据_1_1days_equ.csv" `
    --key_points "$TEST_ROOT/task_data_1_4/关键点约束/关键时间点约束.csv" `
    --output "./"

# 只转换测控资源
python convert_to_json.py `
    --input_ck "$TEST_ROOT/测控资源整合_0_2.csv" `
    --output "./"

# 只转换任务
python convert_to_json.py `
    --input_task_non "$TEST_ROOT/task_data_1_4/非连续跟踪任务数据/非连续跟踪任务数据_4_1days_equ.csv" `
    --input_task_con "$TEST_ROOT/task_data_1_4/连续跟踪任务数据/连续跟踪任务数据_1_1days_equ.csv" `
    --key_points "$TEST_ROOT/task_data_1_4/关键点约束/关键时间点约束.csv" `
    --output "./"
```

### 2. 预处理 (run_pre_process.py)

#### 测试环境脚本
```powershell
# 标准测试
## 原始逻辑和json逻辑
$TEST_ROOT = "D:/workplace/code/python_project/spacecraft/interface"
$TEST_ROOT = "C:/Users/20685/Desktop/interface"
$TEST_ROOT = "C:/Users/James/Desktop/实验室/TaskScheduler/interface"
python run_pre_process.py `
    --input_ck "$TEST_ROOT/系统测试算例/测控资源整合_3_3.csv" `
    --input_task_non "$TEST_ROOT/系统测试算例/task_data_3_16/非连续跟踪任务数据/非连续跟踪任务数据_16_2days_equ.csv" `
    --input_task_con "$TEST_ROOT/系统测试算例/task_data_3_16/连续跟踪任务数据/连续跟踪任务数据_3_2days_equ.csv" `
    --input_sun "$TEST_ROOT/CSS_TIANHE_48274_Sun.csv"`
    --input_umbra "$TEST_ROOT/CSS_TIANHE_48274_Umbra.csv"`
    --key_points "$TEST_ROOT/系统测试算例/task_data_3_16/关键点约束/关键时间点约束.csv" `
    --input_ck_json "$TEST_ROOT/测控资源.json" `
    --input_task_json "$TEST_ROOT/taskDetail.json" `
    --output "./"

## 原始逻辑
$TEST_ROOT = "D:/workplace/code/python_project/spacecraft/interface"
$TEST_ROOT = "C:/Users/20685/Desktop/interface"
$TEST_ROOT = "C:/Users/James/Desktop/实验室/TaskScheduler/interface"
python run_pre_process.py `
    --input_ck "$TEST_ROOT/系统测试算例/测控资源整合_3_3.csv" `
    --input_task_non "$TEST_ROOT/系统测试算例/task_data_3_16/非连续跟踪任务数据/非连续跟踪任务数据_16_2days_equ.csv" `
    --input_task_con "$TEST_ROOT/系统测试算例/task_data_3_16/连续跟踪任务数据/连续跟踪任务数据_3_2days_equ.csv" `
    --input_sun "$TEST_ROOT/CSS_TIANHE_48274_Sun.csv"`
    --input_umbra "$TEST_ROOT/CSS_TIANHE_48274_Umbra.csv"`
    --key_points "$TEST_ROOT/系统测试算例/task_data_3_16/关键点约束/关键时间点约束.csv" `
    --output "./"

## json逻辑
$TEST_ROOT = "D:/workplace/code/python_project/spacecraft/interface"
$TEST_ROOT = "C:/Users/20685/Desktop/interface"
$TEST_ROOT = "C:/Users/James/Desktop/实验室/TaskScheduler/interface"
python run_pre_process.py `
    --input_sun "$TEST_ROOT/CSS_TIANHE_48274_Sun.csv"`
    --input_umbra "$TEST_ROOT/CSS_TIANHE_48274_Umbra.csv"`
    --input_ck_json "$TEST_ROOT/测控资源.json" `
    --input_task_json "$TEST_ROOT/taskDetail.json" `
    --output "./"
    

# 中期测试
## 原始逻辑和json逻辑
$TEST_ROOT = "D:/workplace/code/python_project/spacecraft/interface"
$TEST_ROOT = "C:/Users/20685/Desktop/interface"
$TEST_ROOT = "C:/Users/James/Desktop/实验室/TaskScheduler/interface"
python run_pre_process.py `
    --input_ck "$TEST_ROOT/系统测试算例——中期测试/测控资源整合_0_2.csv" `
    --input_task_non "$TEST_ROOT/系统测试算例——中期测试/task_data_1_4/非连续跟踪任务数据/非连续跟踪任务数据_4_1days_equ.csv" `
    --input_task_con "$TEST_ROOT/系统测试算例——中期测试/task_data_1_4/连续跟踪任务数据/连续跟踪任务数据_1_1days_equ.csv" `
    --input_sun "$TEST_ROOT/CSS_TIANHE_48274_Sun.csv"`
    --input_umbra "$TEST_ROOT/CSS_TIANHE_48274_Umbra.csv"`
    --key_points "$TEST_ROOT/系统测试算例——中期测试/task_data_1_4/关键点约束/关键时间点约束.csv" `
    --input_ck_json "$TEST_ROOT/测控资源.json" `
    --input_task_json "$TEST_ROOT/taskDetail.json" `
    --output "./"

## 原始逻辑
$TEST_ROOT = "D:/workplace/code/python_project/spacecraft/interface"
$TEST_ROOT = "C:/Users/20685/Desktop/interface"
$TEST_ROOT = "C:/Users/James/Desktop/实验室/TaskScheduler/interface"
python run_pre_process.py `
    --input_ck "$TEST_ROOT/系统测试算例——中期测试/测控资源整合_0_2.csv" `
    --input_task_non "$TEST_ROOT/系统测试算例——中期测试/task_data_1_4/非连续跟踪任务数据/非连续跟踪任务数据_4_1days_equ.csv" `
    --input_task_con "$TEST_ROOT/系统测试算例——中期测试/task_data_1_4/连续跟踪任务数据/连续跟踪任务数据_1_1days_equ.csv" `
    --input_sun "$TEST_ROOT/CSS_TIANHE_48274_Sun.csv"`
    --input_umbra "$TEST_ROOT/CSS_TIANHE_48274_Umbra.csv"`
    --key_points "$TEST_ROOT/系统测试算例——中期测试/task_data_1_4/关键点约束/关键时间点约束.csv" `
    --output "./"

## json逻辑
$TEST_ROOT = "D:/workplace/code/python_project/spacecraft/interface"
$TEST_ROOT = "C:/Users/20685/Desktop/interface"
$TEST_ROOT = "C:/Users/James/Desktop/实验室/TaskScheduler/interface"
python run_pre_process.py `
    --input_sun "$TEST_ROOT/CSS_TIANHE_48274_Sun.csv"`
    --input_umbra "$TEST_ROOT/CSS_TIANHE_48274_Umbra.csv"`
    --input_ck_json "$TEST_ROOT/测控资源.json" `
    --input_task_json "$TEST_ROOT/taskDetail.json" `
    --output "./"

```

### 3. 运行调度算法 (run_jar.py)

```powershell
$TEST_ROOT = "D:/workplace/code/python_project/spacecraft/interface"
$TEST_ROOT = "C:/Users/20685/Desktop/interface"
$TEST_ROOT = "C:/Users/James/Desktop/实验室/TaskScheduler/interface"
python run_jar.py `
    --jar_path "$TEST_ROOT/java/your-project-1.0.0-jar-with-dependencies.jar" `
    --input_task_json "$TEST_ROOT/taskDetail.json" `
    --input_ck_json "$TEST_ROOT/测控资源.json" `
    --input_non_pre_json "$TEST_ROOT/非连续跟踪飞控事件JSON处理结果/非连续跟踪遥控事件预处理备选弧段.json" `
    --input_con_pre_json "$TEST_ROOT/连续跟踪飞控事件JSON处理结果/连续跟踪遥控事件预处理备选弧段.json" `
    --output "output" 

```

## 接口文档
详细接口说明请参考 `docs/` 目录下的文档。

## 许可证
MIT License

## 中期测试
情形1：因为任务的属性设置不对而无法安排
将FK-1-1的Duration从3600改为360，即可分配

情形2：因为资源不足而无法安排
补充CK-2-TIANLIAN_2-02-1的数据 CK-TIANLIAN_2-02-2,1699207299,1699210166,2867,CSS_TIANHE,TIANLIAN_2-02 ，即可分配
CK-TIANLIAN_2-02-1,1699201451,1699204335,2884,CSS_TIANHE,TIANLIAN_2-02