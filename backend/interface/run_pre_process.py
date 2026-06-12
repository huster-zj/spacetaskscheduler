'''
Author: Jerry
Date: 2025-04-11 11:11:01
LastEditors: Do not edit
LastEditTime: 2025-05-15 08:39:50
FilePath: \spacetaskscheduler\interface\run_pre_process.py
'''
"""
功能：执行数据预处理流程，支持显式指定JSON输入路径
"""
import os
import argparse
from pre_process import fk1_pre_process, fk2_pre_process
from pre_process_json import fk1_pre_process_json, fk2_pre_process_json

def main():
    parser = argparse.ArgumentParser(description='数据预处理工具')

    # 原始处理输入参数
    parser.add_argument('--input_ck', required=False, help='测控资源CSV文件路径')
    parser.add_argument('--input_task_non', required=False, help='非连续跟踪任务CSV路径')
    parser.add_argument('--input_task_con', required=False, help='连续跟踪任务CSV路径')
    parser.add_argument('--input_sun', required=False, help='光照CSV路径')
    parser.add_argument('--input_umbra', required=False, help='阴影CSV路径')
    parser.add_argument('--key_points', required=False, help='关键时间点约束CSV路径')

    # 新增JSON处理输入参数
    parser.add_argument('--input_ck_json', required=False, help='测控资源JSON文件路径')
    parser.add_argument('--input_task_json', required=False, help='飞控任务JSON文件路径')

    # 输出参数
    parser.add_argument('--output', required=True, help='接口目录路径')

    args = parser.parse_args()

    # 确保接口目录存在
    os.makedirs(args.output, exist_ok=True)

    # 判断输入类型和处理流程
    has_csv_inputs = any([args.input_ck, args.input_task_non, args.input_task_con])
    has_json_inputs = all([args.input_ck_json, args.input_task_json])
    
    if not has_csv_inputs and not has_json_inputs:
        print("错误: 需要提供CSV格式输入文件或JSON格式输入文件")
        parser.print_help()
        return 1

    # 原始处理流程(CSV)
    if has_csv_inputs:
        if all([args.input_ck, args.input_task_non, args.input_task_con]):
            print("执行原始处理流程...")
            
            print("处理非连续跟踪任务（原始处理）...")
            fk1_pre_process(
                fk_file_path=args.input_task_non,
                key_points_file_path=args.key_points,
                ck_file_path=args.input_ck,
                sun_file_path=args.input_sun,
                umbra_file_path=args.input_umbra,
                output_path=os.path.join(args.output, "非连续跟踪飞控事件原始处理结果")
            )

            print("处理连续跟踪任务（原始处理）...")
            fk2_pre_process(
                fk_file_path=args.input_task_con,
                ck_file_path=args.input_ck,
                output_path=os.path.join(args.output, "连续跟踪跟踪飞控事件原始处理结果")
            )
        else:
            print("警告: 原始处理需要完整的CSV输入文件")
            missing = []
            if not args.input_ck:
                missing.append("--input_ck")
            if not args.input_task_non:
                missing.append("--input_task_non")
            if not args.input_task_con:
                missing.append("--input_task_con")
            print(f"缺少参数: {', '.join(missing)}")

    # JSON处理流程
    if has_json_inputs:
        print("执行JSON处理流程...")
        
        print("处理非连续跟踪任务（JSON处理）...")
        fk1_pre_process_json(
            fk_file_path=args.input_task_json,
            ck_file_path=args.input_ck_json,
            sun_file_path=args.input_sun,
            umbra_file_path=args.input_umbra,
            output_path=os.path.join(args.output, "非连续跟踪飞控事件JSON处理结果")
        )

        print("处理连续跟踪任务（JSON处理）...")
        fk2_pre_process_json(
            fk_file_path=args.input_task_json,
            ck_file_path=args.input_ck_json,
            output_path=os.path.join(args.output, "连续跟踪飞控事件JSON处理结果")
        )

if __name__ == "__main__":
    main()