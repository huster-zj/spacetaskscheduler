import csv
import json
import os
import argparse
from datetime import datetime, timezone

def resource_to_json(csv_file_path, json_file_path):
    """将测控资源CSV转换为JSON"""
    data = []
    with open(csv_file_path, newline='', encoding='utf-8') as csvfile:
        reader = csv.reader(csvfile)
        for row in reader:
            if reader.line_num == 1:
                continue  # 跳过标题行
            id, start_time, end_time, duration, craft, station = row
            start_time = datetime.fromtimestamp(int(start_time), timezone.utc).strftime('%Y-%m-%d %H:%M:%S')
            end_time = datetime.fromtimestamp(int(end_time), timezone.utc).strftime('%Y-%m-%d %H:%M:%S')
            duration = int(duration)
            if craft.startswith("CSS_"):
                craft = craft[4:]
            data.append({
                "id": id,
                "station": station,
                "craft": craft,
                "start_time": start_time,
                "end_time": end_time,
                "duration": duration
            })
    with open(json_file_path, 'w', encoding='utf-8') as jsonfile:
        json.dump(data, jsonfile, ensure_ascii=False, indent=4)

def load_key_point_constraints(csv_path):
    """加载关键时间点约束"""
    constraints = {}
    with open(csv_path, newline='', encoding='utf-8') as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            task_id = row['Task_ID']
            if task_id not in constraints:
                constraints[task_id] = []
            constraints[task_id].append({
                "id": len(constraints[task_id]) + 1,
                "taskTimePoint": int(row['Task_Timepoint']),
                "taskKeyPoint": int(row['Task_Key_Timepoint']),
                "offset": int(row['Offset'])
            })
    return constraints

def task_to_json(non_continuous_csv_path, continuous_csv_path, key_point_path, json_file_path):
    """将飞控事件CSV转换为JSON"""
    data = {
        "taskFormHeadList": [],
        "taskBasicInfoList": [],
        "taskPropList": [],
        "taskDurationList": [],
        "taskSchedulerStateMap": {}
    }

    # 加载关键点约束
    key_point_constraints = load_key_point_constraints(key_point_path)

    def process_row(row):
        task_name = row['ID']
        start_time = int(row['Early_Start_Timestamp'])
        end_time = int(row['Last_End_Timestamp'])
        start_time_str = datetime.fromtimestamp(start_time, timezone.utc).strftime('%Y-%m-%d %H:%M:%S')
        end_time_str = datetime.fromtimestamp(end_time, timezone.utc).strftime('%Y-%m-%d %H:%M:%S')
        spacecraft = row['Spacecraft']
        sun = row['Sun']
        if spacecraft.startswith("CSS_"):
            spacecraft = spacecraft[4:]
        duration = int(row['Duration'])

        # 构建基础任务项
        base_task = {
            "key": task_name,
            "taskName": task_name,
            "taskNotes": spacecraft,
            "state": sun,
            "priority": 1,
            "isExclusiveTask": False
        }

        # 添加关键点约束
        if task_name in key_point_constraints:
            base_task["keyPointConstraint"] = key_point_constraints[task_name]

        return base_task, start_time_str, end_time_str, duration, spacecraft

    def read_csv_and_append_data(csv_file_path):
        with open(csv_file_path, newline='', encoding='utf-8') as csvfile:
            reader = csv.DictReader(csvfile)
            for row in reader:
                if row['is_Data_Task'] == '0':
                    base_task, start_time_str, end_time_str, duration, _ = process_row(row)
                    task_name = row['ID']

                    data["taskFormHeadList"].append(base_task)
                    data["taskPropList"].append({
                        "key": task_name,
                        "availability": 1,
                        "timeWindowType": 2,
                        "selectedTimeOption": 1,
                        "selectedTimeOption2": 1,
                        "selectedTimeOption3": 1,
                        "selectedTimeOption4": 1,
                        "minIntervalTime1": None,
                        "maxIntervalTime1": None,
                        "minIntervalTime2": None,
                        "maxIntervalTime2": None,
                        "singlePeriodData": [],
                        "singleDiscreteData": [
                            {
                                "id": 1,
                                "startTime": start_time_str,
                                "endTime": end_time_str,
                                "notes": ""
                            }
                        ],
                        "repeatPeriodData": [],
                        "repeatDiscreteData": []
                    })

                    data["taskDurationList"].append({
                        "key": task_name,
                        "durationType": 1,
                        "fixedDuration": duration,
                        "minTotalDuration": 0,
                        "needsRestrict": False,
                        "needsFullWindow": False,
                        "allowsSegmentedCompletion": False,
                        "allowsResourceChange": False,
                        "segmentMinDuration": 0,
                        "maxOverlapDuration": 0,
                        "exactOverlapDuration": 0,
                        "overlapType": 1
                    })

                elif row['is_Data_Task'] == '1':
                    for suffix in ['_1', '_2']:
                        task_name = row['ID'] + suffix
                        base_task, start_time_str, end_time_str, duration, _ = process_row(row)
                        base_task["key"] = task_name
                        base_task["taskName"] = task_name
                        base_task["isExclusiveTask"] = True

                        data["taskFormHeadList"].append(base_task)
                        data["taskPropList"].append({
                            "key": task_name,
                            "availability": 1,
                            "timeWindowType": 2,
                            "selectedTimeOption": 1,
                            "selectedTimeOption2": 1,
                            "selectedTimeOption3": 1,
                            "selectedTimeOption4": 1,
                            "minIntervalTime1": None,
                            "maxIntervalTime1": None,
                            "minIntervalTime2": None,
                            "maxIntervalTime2": None,
                            "singlePeriodData": [],
                            "singleDiscreteData": [
                                {
                                    "id": 1,
                                    "startTime": start_time_str,
                                    "endTime": end_time_str,
                                    "notes": ""
                                }
                            ],
                            "repeatPeriodData": [],
                            "repeatDiscreteData": [
                                {
                                    "id": 1,
                                    "startTime": start_time_str,
                                    "endTime": end_time_str,
                                    "notes": ""
                                }
                            ]
                        })

                        data["taskDurationList"].append({
                            "key": task_name,
                            "durationType": 1,
                            "fixedDuration": duration,
                            "minTotalDuration": 0,
                            "needsRestrict": False,
                            "needsFullWindow": False,
                            "allowsSegmentedCompletion": False,
                            "allowsResourceChange": False,
                            "segmentMinDuration": 0,
                            "maxOverlapDuration": 0,
                            "exactOverlapDuration": 0,
                            "overlapType": 1
                        })

    read_csv_and_append_data(non_continuous_csv_path)
    read_csv_and_append_data(continuous_csv_path)

    with open(json_file_path, 'w', encoding='utf-8') as jsonfile:
        json.dump(data, jsonfile, ensure_ascii=False, indent=4)

def main():
    parser = argparse.ArgumentParser(description='航天任务数据转换工具')
    # 修改required为False
    parser.add_argument('--input_ck', required=False, help='测控资源CSV文件路径')
    parser.add_argument('--input_task_non', required=False, help='非连续跟踪任务CSV文件路径')
    parser.add_argument('--input_task_con', required=False, help='连续跟踪任务CSV文件路径')
    parser.add_argument('--key_points', required=False, help='关键时间点约束CSV文件路径')
    parser.add_argument('--output', required=True, help='JSON输出目录路径')
    args = parser.parse_args()

    os.makedirs(args.output, exist_ok=True)

    # 检查是否需要转换测控资源
    if args.input_ck:
        print("开始转换测控资源...")
        ck_json_path = os.path.join(args.output, "测控资源.json")
        resource_to_json(args.input_ck, ck_json_path)
        print(f"测控资源转换完成，输出路径: {ck_json_path}")

    # 检查是否需要转换飞控任务
    if all([args.input_task_non, args.input_task_con, args.key_points]):
        print("开始转换飞控任务...")
        task_json_path = os.path.join(args.output, "taskDetail.json")
        task_to_json(
            args.input_task_non,
            args.input_task_con,
            args.key_points,
            task_json_path
        )
        print(f"飞控任务转换完成，输出路径: {task_json_path}")
    elif any([args.input_task_non, args.input_task_con, args.key_points]):
        # 如果部分参数缺失，给出提示
        missing_params = []
        if not args.input_task_non:
            missing_params.append("--input_task_non")
        if not args.input_task_con:
            missing_params.append("--input_task_con")
        if not args.key_points:
            missing_params.append("--key_points")
        print(f"警告: 飞控任务转换需要完整的参数，当前缺少: {', '.join(missing_params)}")

    if not any([args.input_ck, args.input_task_non, args.input_task_con, args.key_points]):
        print("错误: 至少需要提供测控资源或完整的飞控任务参数")
        parser.print_help()
        return 1

if __name__ == "__main__":
    main()