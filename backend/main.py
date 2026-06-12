from typing import Union, List, Dict, Any
import os
import subprocess
import json
import tempfile
from fastapi_offline import FastAPIOffline
from fastapi import UploadFile, File, Form, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, StreamingResponse  # 添加这行
from pydantic import BaseModel
import os  
import io  
import zipfile  
import uvicorn

# 导入算法模块
from interface.convert_to_json import resource_to_json, task_to_json
from interface.pre_process import fk1_pre_process, fk2_pre_process
from interface.pre_process_json import fk1_pre_process_json, fk2_pre_process_json

app = FastAPIOffline(
    title="航天器任务规划系统API",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
)

# 添加CORS中间件
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:5174", "http://127.0.0.1:5174","https://astroscheduler.cn","https://www.astroscheduler.cn"],  # 替换为您的前端URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 创建临时目录用于存储上传的文件
TEMP_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "interface")
os.makedirs(TEMP_DIR, exist_ok=True)

# 模型定义
class AlgorithmResponse(BaseModel):
    success: bool
    message: str
    data: Union[Dict[str, Any], List[Dict[str, Any]], None] = None

# 保存JSON数据的模型
class SaveJsonRequest(BaseModel):
    data: Any  # 修改为Any类型，接受任何数据类型
    file_name: str
    file_path: str

# 1. 数据转换接口
@app.post("/api/convert_csv_to_json", response_model=AlgorithmResponse)
async def convert_data(
    ck_file: UploadFile = None,
    task_non_file: UploadFile = None,
    task_con_file: UploadFile = None,
    key_points_file: UploadFile = None
):
    try:
        input_path = os.path.join(TEMP_DIR, "backend_input_data")
        output_path = os.path.join(TEMP_DIR, "transfer_json_output")
        os.makedirs(output_path, exist_ok=True)
        
        result_data = {}
        
        # 处理测控资源文件
        if ck_file:
            ck_path = os.path.join(input_path, "ck.csv")
            with open(ck_path, "wb") as f:
                f.write(await ck_file.read())
            
            # 转换资源数据
            resource_json_path = os.path.join(output_path, "测控资源.json")
            resource_to_json(ck_path, resource_json_path)
            
            # 读取转换后的资源数据
            with open(resource_json_path, "r", encoding="utf-8") as f:
                result_data["resource"] = json.load(f)

        # 处理任务相关文件
        if all([task_non_file, task_con_file, key_points_file]):
            # 保存任务文件
            task_non_path = os.path.join(input_path, "task_non.csv")
            task_con_path = os.path.join(input_path, "task_con.csv")
            key_points_path = os.path.join(input_path, "key_points.csv")
            
            with open(task_non_path, "wb") as f:
                f.write(await task_non_file.read())
            with open(task_con_path, "wb") as f:
                f.write(await task_con_file.read())
            with open(key_points_path, "wb") as f:
                f.write(await key_points_file.read())
            
            # 转换任务数据
            task_json_path = os.path.join(output_path, "taskDetail.json")
            task_to_json(task_non_path, task_con_path, key_points_path, task_json_path)
            
            # 读取转换后的任务数据
            with open(task_json_path, "r", encoding="utf-8") as f:
                result_data["task"] = json.load(f)
        
        # 检查是否有数据被处理
        if not result_data:
            return AlgorithmResponse(
                success=False,
                message="未提供有效的输入文件",
                data=None
            )
        
        return AlgorithmResponse(
            success=True,
            message="数据转换成功",
            data=result_data
        )
        
    except Exception as e:
        return AlgorithmResponse(
            success=False,
            message=f"数据转换失败: {str(e)}",
            data=None
        )

# 2. 预处理接口
@app.post("/api/preprocess_task_timewindow", response_model=AlgorithmResponse)
async def preprocess_data(
    # CSV 文件输入，使用 File() 显式声明
    ck_file: UploadFile = None,
    task_non_file: UploadFile = None,
    task_con_file: UploadFile = None,
    key_points_file: UploadFile = None,
    sun_file: UploadFile = None,
    umbra_file: UploadFile = None,
    # 新增 JSON 输入
    ck_json: UploadFile = None,
    task_json: UploadFile = None
):
    try:
        # 修改这里 - 使用 TEMP_DIR 而不是 input_path
        backend_input_path = os.path.join(TEMP_DIR, "backend_input_data")
        output_path = os.path.join(TEMP_DIR, "preprocess_output")
        os.makedirs(backend_input_path, exist_ok=True)
        os.makedirs(output_path, exist_ok=True)

        # 初始化路径变量为 None
        input_ck_path = None
        input_task_non_path = None
        input_task_con_path = None
        key_points_path = None
        input_ck_json_path = None
        input_task_json_path = None

        # 修改这里 - 设置固定的光照和阴影文件路径
        sun_file_path = os.path.join(TEMP_DIR, "source_data_show", "CSS_TIANHE_48274_Sun.csv")
        umbra_file_path = os.path.join(TEMP_DIR, "source_data_show", "CSS_TIANHE_48274_Umbra.csv")

        # 检查固定文件是否存在
        if not os.path.exists(sun_file_path):
            print(f"警告: 光照文件不存在: {sun_file_path}")
            sun_file_path = None
            
        if not os.path.exists(umbra_file_path):
            print(f"警告: 阴影文件不存在: {umbra_file_path}")
            umbra_file_path = None
                
        # 保存 CSV 文件
        if ck_file:
            input_ck_path = os.path.join(backend_input_path, "ck.csv")
            with open(input_ck_path, "wb") as f:
                f.write(await ck_file.read())
                
        if task_non_file:
            input_task_non_path = os.path.join(backend_input_path, "task_non.csv")
            with open(input_task_non_path, "wb") as f:
                f.write(await task_non_file.read())
                
        if task_con_file:
            input_task_con_path = os.path.join(backend_input_path, "task_con.csv")
            with open(input_task_con_path, "wb") as f:
                f.write(await task_con_file.read())
                
        if key_points_file:
            key_points_path = os.path.join(backend_input_path, "key_points.csv")
            with open(key_points_path, "wb") as f:
                f.write(await key_points_file.read())

        # 保存 JSON 文件
        if ck_json:
            input_ck_json_path = os.path.join(backend_input_path, "测控资源.json")
            with open(input_ck_json_path, "wb") as f:
                f.write(await ck_json.read())
                
        if task_json:
            input_task_json_path = os.path.join(backend_input_path, "taskDetail.json")
            with open(input_task_json_path, "wb") as f:
                f.write(await task_json.read())

        # 修改输出逻辑，只打印非None的路径
        print("输入文件路径:")
        print(f"测控资源文件: {input_ck_path if input_ck_path else '未上传'}")
        print(f"非连续跟踪任务文件: {input_task_non_path if input_task_non_path else '未上传'}")
        print(f"连续跟踪任务文件: {input_task_con_path if input_task_con_path else '未上传'}")
        print(f"关键点文件: {key_points_path if key_points_path else '未上传'}")
        print(f"光照文件: {sun_file_path if sun_file_path else '未上传'}")
        print(f"阴影文件: {umbra_file_path if umbra_file_path else '未上传'}")
        print(f"测控资源JSON文件: {input_ck_json_path if input_ck_json_path else '未上传'}")
        print(f"任务JSON文件: {input_task_json_path if input_task_json_path else '未上传'}")


        result_data = {}
        
        # 判断输入类型和处理流程
        has_csv_inputs = all(path is not None for path in [
        input_ck_path, input_task_non_path, input_task_con_path
])
        has_json_inputs = all(path is not None for path in [
            input_ck_json_path, input_task_json_path
        ])
        
        if not has_csv_inputs and not has_json_inputs:
            return AlgorithmResponse(
                success=False,
                message="错误: 需要提供CSV格式输入文件或JSON格式输入文件",
                data=None
            )

        # 原始处理流程(CSV)
        if has_csv_inputs:
            # 处理非连续跟踪任务（原始处理）
            non_con_output_path = os.path.join(output_path, "非连续跟踪飞控事件原始处理结果")
            os.makedirs(non_con_output_path, exist_ok=True)
            fk1_pre_process(
                fk_file_path=input_task_non_path,
                key_points_file_path=key_points_path,
                ck_file_path=input_ck_path,
                sun_file_path=sun_file_path,
                umbra_file_path=umbra_file_path,
                output_path=non_con_output_path
            )
            result_data['non_continuous_original'] = os.listdir(non_con_output_path)

            # 处理连续跟踪任务（原始处理）
            con_output_path = os.path.join(output_path, "连续跟踪跟踪飞控事件原始处理结果")
            os.makedirs(con_output_path, exist_ok=True)
            fk2_pre_process(
                fk_file_path=input_task_con_path,
                ck_file_path=input_ck_path,
                output_path=con_output_path
            )
            result_data['continuous_original'] = os.listdir(con_output_path)

        # JSON处理流程
        if has_json_inputs:
            # 处理非连续跟踪任务（JSON处理）
            non_con_json_output_path = os.path.join(output_path, "非连续跟踪飞控事件JSON处理结果")
            os.makedirs(non_con_json_output_path, exist_ok=True)
            fk1_pre_process_json(
                fk_file_path=input_task_json_path,
                ck_file_path=input_ck_json_path,
                sun_file_path=sun_file_path,
                umbra_file_path=umbra_file_path,
                output_path=non_con_json_output_path
            )
            result_data['non_continuous_json'] = os.listdir(non_con_json_output_path)

            # 处理连续跟踪任务（JSON处理）
            con_json_output_path = os.path.join(output_path, "连续跟踪飞控事件JSON处理结果")
            os.makedirs(con_json_output_path, exist_ok=True)
            fk2_pre_process_json(
                fk_file_path=input_task_json_path,
                ck_file_path=input_ck_json_path,
                output_path=con_json_output_path
            )
            result_data['continuous_json'] = os.listdir(con_json_output_path)

            # 添加这部分：读取生成的结果文件内容
            try:
                # 读取连续跟踪结果
                con_result_file = os.path.join(con_json_output_path, "连续跟踪遥控事件预处理备选弧段.json")
                if os.path.exists(con_result_file):
                    with open(con_result_file, "r", encoding="utf-8") as f:
                        result_data['continuous_events_data'] = json.load(f)
                else:
                    result_data['continuous_events_data'] = []
                
                # 读取非连续跟踪结果  
                non_con_result_file = os.path.join(non_con_json_output_path, "非连续跟踪遥控事件预处理备选弧段.json")
                if os.path.exists(non_con_result_file):
                    with open(non_con_result_file, "r", encoding="utf-8") as f:
                        result_data['discrete_events_data'] = json.load(f)
                else:
                    result_data['discrete_events_data'] = []
                    
            except Exception as e:
                print(f"读取结果文件失败: {str(e)}")
                result_data['continuous_events_data'] = []
                result_data['discrete_events_data'] = []

        if not result_data:
            return AlgorithmResponse(
                success=False,
                message="处理完成但没有生成结果数据",
                data=None
            )

        return AlgorithmResponse(
            success=True,
            message="数据预处理成功",
            data=result_data
        )
        
    except Exception as e:
        return AlgorithmResponse(
            success=False,
            message=f"数据预处理失败: {str(e)}",
            data=None
        )

# 3. 调度算法接口
@app.post("/api/schedule_algorithm_heuristic", response_model=AlgorithmResponse)
async def heuristic_algorithm():
    try:
        # 使用后端内部的固定文件路径
        input_path = os.path.join(TEMP_DIR, "backend_input_data")
        jar_path = os.path.join(TEMP_DIR, "java", "your-project-1.0.0-jar-with-dependencies.jar")
        task_json_path = os.path.join(TEMP_DIR, "transfer_json_output", "taskDetail2.json")
        resource_json_path = os.path.join(TEMP_DIR, "transfer_json_output", "测控资源.json")
        non_con_arc_json_path = os.path.join(TEMP_DIR, "preprocess_output", "非连续跟踪飞控事件JSON处理结果", "非连续跟踪遥控事件预处理备选弧段.json")
        con_arc_json_path = os.path.join(TEMP_DIR, "preprocess_output", "连续跟踪飞控事件JSON处理结果", "连续跟踪遥控事件预处理备选弧段.json")
        output_path = os.path.join(TEMP_DIR, "algorithm_output")
        os.makedirs(output_path, exist_ok=True)
        
        # 检查必需文件是否存在
        required_files = {
            "JAR文件": jar_path,
            "任务JSON文件": task_json_path,
            "资源JSON文件": resource_json_path,
            "非连续弧段JSON文件": non_con_arc_json_path,
            "连续弧段JSON文件": con_arc_json_path
        }
        
        missing_files = []
        for file_desc, file_path in required_files.items():
            if not os.path.exists(file_path):
                missing_files.append(f"{file_desc}: {file_path}")
        
        if missing_files:
            return AlgorithmResponse(
                success=False,
                message=f"以下必需文件不存在:\n" + "\n".join(missing_files),
                data=None
            )
        
        # 构建JAR参数
        jar_args = [
            task_json_path,
            resource_json_path,
            non_con_arc_json_path,
            con_arc_json_path,
            output_path
        ]
        
        # 执行JAR
        java_cmd = ["java", "-jar", jar_path]
        java_cmd.extend(jar_args)
        
        print(f"执行命令: {' '.join(java_cmd)}")
        
        result = subprocess.run(
            java_cmd,
            check=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            universal_newlines=True
        )
        
        # 读取输出结果
        output_files = os.listdir(output_path)
        output_data = {}
        output_text = ""


        # 读取所有文件
        for file in output_files:
            file_path = os.path.join(output_path, file)
            if file.endswith(".json"):
                with open(file_path, "r", encoding="utf-8") as f:
                    output_data[file] = json.load(f)
            elif file == "output.txt":
                # 尝试多种编码读取 txt 文件
                output_text = ""
                tried = False
                for enc in ["utf-8", "gbk", "gb2312", "latin-1"]:
                    try:
                        with open(file_path, "r", encoding=enc) as f:
                            output_text = f.read()
                        tried = True
                        break
                    except Exception:
                        continue
                if not tried:
                    # 最后兜底：忽略非法字节
                    with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                        output_text = f.read()
                        
        return AlgorithmResponse(
            success=True,
            message="调度算法执行成功",
            data={
                "output_files": output_files,
                "output_data": output_data,
                "output_text": output_text,  # 添加txt内容
                "log": result.stdout
            }
        )
    except subprocess.CalledProcessError as e:
        return AlgorithmResponse(
            success=False,
            message=f"算法执行失败: {e.stderr}",
            data=None
        )
    except Exception as e:
        return AlgorithmResponse(
            success=False,
            message=f"调度算法执行失败: {str(e)}",
            data=None
        )

# 4. 保存JSON数据接口
@app.post("/api/save_json", response_model=AlgorithmResponse)
async def save_json(request: SaveJsonRequest):
    try:
        # 确保目录存在
        os.makedirs(request.file_path, exist_ok=True)
        
        # 构建完整的文件路径
        full_path = os.path.join(request.file_path, request.file_name)
        
        # 将JSON数据写入文件
        with open(full_path, "w", encoding="utf-8") as f:
            json.dump(request.data, f, ensure_ascii=False, indent=4)
            
        return AlgorithmResponse(
            success=True,
            message=f"JSON数据已成功保存到: {full_path}",
            data={"file_path": full_path}
        )
    except Exception as e:
        return AlgorithmResponse(
            success=False,
            message=f"保存JSON数据失败: {str(e)}",
            data=None
        )

# 5. 下载示例数据文件
@app.get("/api/download_test_files")
async def download_test_files():
    try:
        test_files_path = os.path.join(TEMP_DIR, "download_test_data")
        
        # 检查目录是否存在
        if not os.path.exists(test_files_path):
            raise HTTPException(status_code=404, detail="示例数据文件目录不存在")
        
        # 获取目录中的所有文件
        files = [f for f in os.listdir(test_files_path) if os.path.isfile(os.path.join(test_files_path, f))]
        
        if not files:
            raise HTTPException(status_code=404, detail="示例数据文件目录为空")
        
        # 如果只有一个文件，直接返回该文件
        if len(files) == 1:
            file_path = os.path.join(test_files_path, files[0])
            return FileResponse(
                path=file_path,
                filename=files[0],
                media_type='application/octet-stream'
            )
        
        # 多个文件时，创建zip压缩包
        zip_buffer = io.BytesIO()
        
        with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
            for file_name in files:
                file_path = os.path.join(test_files_path, file_name)
                zip_file.write(file_path, file_name)
        
        zip_buffer.seek(0)
        
        # 返回zip文件流
        return StreamingResponse(
            io.BytesIO(zip_buffer.read()),
            media_type="application/zip",
            headers={
                "Content-Disposition": "attachment; filename=sample_data_files.zip",
                "Content-Type": "application/zip"
            }
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"下载失败: {str(e)}")

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)