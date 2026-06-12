import glob
import os
import re
import copy
import sys
import pandas as pd
import json
import numpy as np
from typing import List, Dict

def intersection(base_interval, intervals):
    base_start, base_end = base_interval
    intersected_intervals = []
    for inter in intervals:
        start, end = inter
        inter_start = max(base_start, start)
        inter_end = min(base_end, end)
        if inter_start <= inter_end:
            intersected_intervals.append([inter_start, inter_end])
    return intersected_intervals


def load_ck_data(ck_file_path: str) -> pd.DataFrame:
    """读取测控资源JSON数据，支持不同缩进格式"""
    try:
        with open(ck_file_path, 'r', encoding='utf-8') as f:
            ck_data = json.load(f)  # json.load 会自动处理不同的缩进格式

        # 过滤掉无效数据（缺少必要字段的记录）
        valid_records = []
        required_fields = ['id', 'station', 'start_time', 'end_time', 'duration', 'craft']
        
        for record in ck_data:
            if all(field in record for field in required_fields):
                valid_records.append(record)
            else:
                print(f"警告: 跳过无效记录: {record}")

        # 创建 DataFrame
        df = pd.DataFrame(valid_records)
        
        # 重命名列
        df = df.rename(columns={
            'id': 'ID',
            'station': 'Station',
            'start_time': 'Start_Timestamp',
            'end_time': 'End_Timestamp',
            'duration': 'Duration_Timestamp',
            'craft': 'Satellite',
        })

        # 转换时间戳
        df['Start_Timestamp'] = pd.to_datetime(df['Start_Timestamp']).astype(np.int64) // 10 ** 9
        df['End_Timestamp'] = pd.to_datetime(df['End_Timestamp']).astype(np.int64) // 10 ** 9

        print(f"成功加载 {len(valid_records)} 条有效记录")
        return df

    except json.JSONDecodeError as e:
        print(f"JSON解析错误: {e}")
        raise
    except Exception as e:
        print(f"加载数据失败: {e}")
        raise


def load_fk_data(fk_file_path: str, type: bool) -> pd.DataFrame:
    """读取飞控事件数据并转换格式，合并子事件ID"""
    with open(fk_file_path, 'r', encoding='utf-8') as f:
        task_data = json.load(f)

    tasks = []
    head_dict = {item['key']: item for item in task_data['taskFormHeadList']}
    basic_info_dict = {item['key']: item for item in task_data['taskBasicInfoList']}
    prop_dict = {item['key']: item for item in task_data['taskPropList']}
    duration_dict = {item['key']: item for item in task_data['taskDurationList']}

    for head in task_data['taskFormHeadList']:
        key = head['key']
        original_task_name = head['taskName']

        base_task_id = original_task_name
        # # 提取基础ID（去掉_后缀）
        # if '_' in original_task_name:
        #     base_task_id = original_task_name.split('_')[0]  # 例如 FK-1-11_1 -> FK-1-11
        # else:
        #     base_task_id = original_task_nam

        # 检查前缀是否匹配非连续/连续任务类型
        expected_prefix = "FK-1" if type else "FK-2"
        if not base_task_id.startswith(expected_prefix):
            print(f"跳过不匹配前缀的任务: {original_task_name} (基础ID: {base_task_id})")
            continue

        # 从 basic_info_dict 获取关键点约束
        key_constraints = basic_info_dict[key].get('keyPointConstraint', [])
        print(f"处理任务: {original_task_name}, 约束: {key_constraints}")

        # 检查数据完整性
        if key not in prop_dict or key not in duration_dict:
            print(f"跳过不完整的数据，key: {key}")
            continue

        prop = prop_dict[key]
        duration = duration_dict[key]

        # 检查时间窗口
        if not prop.get('singleDiscreteData'):
            print(f"跳过没有时间窗口的任务: {original_task_name}")
            continue

        # 构建任务数据（新增Constraints字段）
        for time_window in prop['singleDiscreteData']:
            if base_task_id in [t['ID'] for t in tasks]:
                continue
            task = {
                'ID': base_task_id,
                'Spacecraft': 'TIANHE',
                'Early_Start_Timestamp': pd.to_datetime(time_window['startTime']).timestamp(),
                'Last_End_Timestamp': pd.to_datetime(time_window['endTime']).timestamp(),
                'Duration': duration['fixedDuration'],
                'Sun': int(head['state']),
                'Constraints': key_constraints  # 新增约束字段
            }
            tasks.append(task)
    return pd.DataFrame(tasks)

def format_output_json(df: pd.DataFrame) -> List[Dict]:
    """格式化输出JSON"""
    result = []
    for plan_id in df['跟踪方案ID'].unique():
        plan_data = df[df['跟踪方案ID'] == plan_id]
        first_row = plan_data.iloc[0]

        cekong_resource = []
        for _, row in plan_data.iterrows():
            cekong_resource.append({
                "cekong_station": row['测控站'],
                "cekong_resource_id": row['测控资源ID']
            })

        task_data = {
            "task_name": first_row['飞控事件ID'],
            "tracking_plan_id": plan_id,
            "start_time": int(first_row['开始时间']),
            "end_time": int(first_row['结束时间']),
            "duration": int(first_row['事件持续时间']),
            "task_to_craft": first_row['事件对应航天器'],
            "cekong_resource": cekong_resource
        }
        result.append(task_data)
    return result

def fk1_pre_process_json(fk_file_path, ck_file_path, sun_file_path, umbra_file_path, output_path):
    sun = pd.read_csv(sun_file_path)
    umbra = pd.read_csv(umbra_file_path)
    sun_interval = []
    umbra_interval = []
    for s_index, s in sun.iterrows():
        sun_interval.append([s['start_timestamp'], s['end_timestamp']])
    for u_index, u in umbra.iterrows():
        umbra_interval.append([u['start_timestamp'], u['end_timestamp']])

    # 加载数据（修改关键点约束来源）
    cks = load_ck_data(ck_file_path)
    fks = load_fk_data(fk_file_path, True)  # 该函数已修改为从JSON获取约束
    print(cks)
    print(fks)

    def in_interval(base_interval, intervals):
        base_start, base_end = base_interval
        for inter in intervals:
            start, end = inter
            if base_start >= start and base_end <= end:
                return True
        return False

    # 以下为完整原有处理逻辑（仅修改约束获取方式）
    fk_id_list = []
    ck_satation_list = []
    plan_id_list = []
    ck_number_list = []
    st_list = []
    et_list = []
    fk_duration_list = []
    fk_satellite_list = []
    plan_id = 1

    for fk_index, fk in fks.iterrows():
        # 从飞控任务数据直接获取约束（原csv读取改为从fk数据获取）
        constraints = fk['Constraints']  # 格式：[{"taskTimePoint":x, "taskKeyPoint":y, "offset":z},...]

        # 将约束转换为原csv格式的DataFrame结构以兼容原有逻辑
        constraint_rows = []
        for cons in constraints:
            constraint_rows.append({
                'Task_ID': fk['ID'],
                'Task_Timepoint': cons['taskTimePoint'],
                'Task_Key_Timepoint': cons['taskKeyPoint'],
                'Offset': cons['offset']
            })
        target_row = pd.DataFrame(constraint_rows)

        # 原有处理逻辑完全保留
        task_ids = [fk['ID']]
        tasks_to_process = [fk]
        for task, task_id in zip(tasks_to_process, task_ids):
            # 使用转换后的约束数据
            if len(target_row) != 0:
                task_point = target_row['Task_Timepoint'].iloc[0]
                key_point = target_row['Task_Key_Timepoint'].iloc[0]
                offset = target_row['Offset'].iloc[0]
            else:
                task_point = key_point = offset = None

            # 原有测控资源处理逻辑（超过500行完整保留）
            for ck_index, ck in cks.iterrows():
                # 调试输出：检查测控资源条件
                if ck['Satellite'] != fk['Spacecraft']:
                    # print(f"Skipping CK {ck['ID']} due to Satellite mismatch")
                    continue
                if (ck['Start_Timestamp'] >= fk['Last_End_Timestamp'] or
                        ck['End_Timestamp'] <= fk['Early_Start_Timestamp'] or
                        ck['Duration_Timestamp'] < fk['Duration']):
                    # print(f"Skipping CK {ck['ID']} due to time/duration constraints")
                    continue
                # print(f"Processing CK {ck['ID']} for FK {task_id}")
                if ck['Start_Timestamp'] >= fk['Early_Start_Timestamp'] and ck['End_Timestamp'] <= fk[
                    'Last_End_Timestamp'] and ck['Duration_Timestamp'] >= fk['Duration']:
                    if fk['Sun'] == 0:
                        if len(target_row) != 0:
                            if key_point == 1:
                                # 先找所有进阴影点，然后按照偏移给出事件开始时间和结束时间，然后必须在这个备选弧段
                                inter_list = []
                                for interval in umbra_interval:
                                    if task_point == 1:
                                        st_key = interval[0] + offset
                                        et_key = st_key + fk['Duration']
                                        inter_list.append([st_key, et_key])
                                    elif task_point == 2:
                                        et_key = interval[0] + offset
                                        st_key = et_key - fk['Duration']
                                        inter_list.append([st_key, et_key])
                                for interval in inter_list:
                                    if in_interval(interval, [[ck['Start_Timestamp'], ck['End_Timestamp']]]):
                                        fk_id_list.append(task_id)
                                        ck_satation_list.append(ck['Station'])
                                        ck_number_list.append(ck['ID'])
                                        st_list.append(interval[0])
                                        et_list.append(interval[1])
                                        fk_duration_list.append(fk['Duration'])
                                        fk_satellite_list.append(fk['Spacecraft'])
                                        plan_id_list.append('Plan_1_' + str(plan_id))
                                        plan_id += 1
                            elif key_point == 2:
                                # 先找所有出阴影点，然后按照偏移给出事件开始时间和结束时间，然后必须在这个备选弧段
                                inter_list = []
                                for interval in umbra_interval:
                                    if task_point == 1:
                                        st_key = interval[1] + offset
                                        et_key = st_key + fk['Duration']
                                        inter_list.append([st_key, et_key])
                                    elif task_point == 2:
                                        et_key = interval[1] + offset
                                        st_key = et_key - fk['Duration']
                                        inter_list.append([st_key, et_key])
                                for interval in inter_list:
                                    if in_interval(interval, [[ck['Start_Timestamp'], ck['End_Timestamp']]]):
                                        fk_id_list.append(task_id)
                                        ck_satation_list.append(ck['Station'])
                                        ck_number_list.append(ck['ID'])
                                        st_list.append(interval[0])
                                        et_list.append(interval[1])
                                        fk_duration_list.append(fk['Duration'])
                                        fk_satellite_list.append(fk['Spacecraft'])
                                        plan_id_list.append('Plan_1_' + str(plan_id))
                                        plan_id += 1
                            elif key_point == 3:
                                inter_list = []
                                for interval in sun_interval:
                                    if task_point == 1:
                                        st_key = interval[0] + offset
                                        et_key = st_key + fk['Duration']
                                        inter_list.append([st_key, et_key])
                                    elif task_point == 2:
                                        et_key = interval[0] + offset
                                        st_key = et_key - fk['Duration']
                                        inter_list.append([st_key, et_key])
                                for interval in inter_list:
                                    if in_interval(interval, [[ck['Start_Timestamp'], ck['End_Timestamp']]]):
                                        fk_id_list.append(task_id)
                                        ck_satation_list.append(ck['Station'])
                                        ck_number_list.append(ck['ID'])
                                        st_list.append(interval[0])
                                        et_list.append(interval[1])
                                        fk_duration_list.append(fk['Duration'])
                                        fk_satellite_list.append(fk['Spacecraft'])
                                        plan_id_list.append('Plan_1_' + str(plan_id))
                                        plan_id += 1
                            elif key_point == 4:
                                inter_list = []
                                for interval in sun_interval:
                                    if task_point == 1:
                                        st_key = interval[1] + offset
                                        et_key = st_key + fk['Duration']
                                        inter_list.append([st_key, et_key])
                                    elif task_point == 2:
                                        et_key = interval[1] + offset
                                        st_key = et_key - fk['Duration']
                                        inter_list.append([st_key, et_key])
                                for interval in inter_list:
                                    if in_interval(interval, [[ck['Start_Timestamp'], ck['End_Timestamp']]]):
                                        fk_id_list.append(task_id)
                                        ck_satation_list.append(ck['Station'])
                                        ck_number_list.append(ck['ID'])
                                        st_list.append(interval[0])
                                        et_list.append(interval[1])
                                        fk_duration_list.append(fk['Duration'])
                                        fk_satellite_list.append(fk['Spacecraft'])
                                        plan_id_list.append('Plan_1_' + str(plan_id))
                                        plan_id += 1
                            elif key_point == 5:
                                fk_id_list.append(task_id)
                                ck_satation_list.append(ck['Station'])
                                ck_number_list.append(ck['ID'])
                                st_list.append(ck['Start_Timestamp'] + offset)
                                et_list.append(ck['Start_Timestamp'] + offset + fk['Duration'])
                                fk_duration_list.append(fk['Duration'])
                                fk_satellite_list.append(fk['Spacecraft'])
                                plan_id_list.append('Plan_1_' + str(plan_id))
                                plan_id += 1
                            elif key_point == 6:
                                fk_id_list.append(task_id)
                                ck_satation_list.append(ck['Station'])
                                ck_number_list.append(ck['ID'])
                                st_list.append(ck['End_Timestamp'] + offset - fk['Duration'])
                                et_list.append(ck['End_Timestamp'] + offset)
                                fk_duration_list.append(fk['Duration'])
                                fk_satellite_list.append(fk['Spacecraft'])
                                plan_id_list.append('Plan_1_' + str(plan_id))
                                plan_id += 1
                        else:
                            fk_id_list.append(task_id)
                            ck_satation_list.append(ck['Station'])
                            ck_number_list.append(ck['ID'])
                            st_list.append(ck['Start_Timestamp'])
                            et_list.append(ck['End_Timestamp'])
                            fk_duration_list.append(fk['Duration'])
                            fk_satellite_list.append(fk['Spacecraft'])
                            plan_id_list.append('Plan_1_' + str(plan_id))
                            plan_id += 1
                    elif fk['Sun'] == 1:
                        interval_list = intersection([ck['Start_Timestamp'], ck['End_Timestamp']], sun_interval)
                        for interval in interval_list:
                            if interval[1] - interval[0] >= fk['Duration']:
                                if len(target_row) != 0:
                                    if key_point == 3:
                                        inter_list = []
                                        for interval1 in sun_interval:
                                            if task_point == 1:
                                                st_key = interval1[0] + offset
                                                et_key = st_key + fk['Duration']
                                                inter_list.append([st_key, et_key])
                                            elif task_point == 2:
                                                et_key = interval1[0] + offset
                                                st_key = et_key - fk['Duration']
                                                inter_list.append([st_key, et_key])
                                        for interval1 in inter_list:
                                            if in_interval(interval1, [[interval[0], interval[1]]]):
                                                fk_id_list.append(task_id)
                                                ck_satation_list.append(ck['Station'])
                                                ck_number_list.append(ck['ID'])
                                                st_list.append(interval1[0])
                                                et_list.append(interval1[1])
                                                fk_duration_list.append(fk['Duration'])
                                                fk_satellite_list.append(fk['Spacecraft'])
                                                plan_id_list.append('Plan_1_' + str(plan_id))
                                                plan_id += 1
                                    elif key_point == 4:
                                        inter_list = []
                                        for interval1 in sun_interval:
                                            if task_point == 1:
                                                st_key = interval1[1] + offset
                                                et_key = st_key + fk['Duration']
                                                inter_list.append([st_key, et_key])
                                            elif task_point == 2:
                                                et_key = interval1[1] + offset
                                                st_key = et_key - fk['Duration']
                                                inter_list.append([st_key, et_key])
                                        for interval1 in inter_list:
                                            if in_interval(interval1, [[interval[0], interval[1]]]):
                                                fk_id_list.append(task_id)
                                                ck_satation_list.append(ck['Station'])
                                                ck_number_list.append(ck['ID'])
                                                st_list.append(interval1[0])
                                                et_list.append(interval1[1])
                                                fk_duration_list.append(fk['Duration'])
                                                fk_satellite_list.append(fk['Spacecraft'])
                                                plan_id_list.append('Plan_1_' + str(plan_id))
                                                plan_id += 1
                                    elif key_point == 5:
                                        st_key = ck['Start_Timestamp'] + offset
                                        et_key = st_key + fk['Duration']
                                        if in_interval([st_key, et_key], [[interval[0], interval[1]]]):
                                            fk_id_list.append(task_id)
                                            ck_satation_list.append(ck['Station'])
                                            ck_number_list.append(ck['ID'])
                                            st_list.append(ck['Start_Timestamp'] + offset)
                                            et_list.append(ck['Start_Timestamp'] + offset + fk['Duration'])
                                            fk_duration_list.append(fk['Duration'])
                                            fk_satellite_list.append(fk['Spacecraft'])
                                            plan_id_list.append('Plan_1_' + str(plan_id))
                                            plan_id += 1
                                    elif key_point == 6:
                                        st_key = ck['End_Timestamp'] + offset - fk['Duration']
                                        et_key = ck['End_Timestamp'] + offset
                                        if in_interval([st_key, et_key], [[interval[0], interval[1]]]):
                                            fk_id_list.append(task_id)
                                            ck_satation_list.append(ck['Station'])
                                            ck_number_list.append(ck['ID'])
                                            st_list.append(ck['End_Timestamp'] + offset - fk['Duration'])
                                            et_list.append(ck['End_Timestamp'] + offset)
                                            fk_duration_list.append(fk['Duration'])
                                            fk_satellite_list.append(fk['Spacecraft'])
                                            plan_id_list.append('Plan_1_' + str(plan_id))
                                            plan_id += 1
                                else:
                                    fk_id_list.append(task_id)
                                    ck_satation_list.append(ck['Station'])
                                    ck_number_list.append(ck['ID'])
                                    st_list.append(interval[0])
                                    et_list.append(interval[1])
                                    fk_duration_list.append(fk['Duration'])
                                    fk_satellite_list.append(fk['Spacecraft'])
                                    plan_id_list.append('Plan_1_' + str(plan_id))
                                    plan_id += 1
                    elif fk['Sun'] == 2:
                        interval_list = intersection([ck['Start_Timestamp'], ck['End_Timestamp']], umbra_interval)
                        for interval in interval_list:
                            if interval[1] - interval[0] >= fk['Duration']:
                                if len(target_row) != 0:
                                    if key_point == 1:
                                        inter_list = []
                                        for interval1 in umbra_interval:
                                            if task_point == 1:
                                                st_key = interval1[0] + offset
                                                et_key = st_key + fk['Duration']
                                                inter_list.append([st_key, et_key])
                                            elif task_point == 2:
                                                et_key = interval1[0] + offset
                                                st_key = et_key - fk['Duration']
                                                inter_list.append([st_key, et_key])
                                        for interval1 in inter_list:
                                            if in_interval(interval1, [[interval[0], interval[1]]]):
                                                fk_id_list.append(task_id)
                                                ck_satation_list.append(ck['Station'])
                                                ck_number_list.append(ck['ID'])
                                                st_list.append(interval1[0])
                                                et_list.append(interval1[1])
                                                fk_duration_list.append(fk['Duration'])
                                                fk_satellite_list.append(fk['Spacecraft'])
                                                plan_id_list.append('Plan_1_' + str(plan_id))
                                                plan_id += 1
                                    elif key_point == 2:
                                        inter_list = []
                                        for interval1 in umbra_interval:
                                            if task_point == 1:
                                                st_key = interval1[1] + offset
                                                et_key = st_key + fk['Duration']
                                                inter_list.append([st_key, et_key])
                                            elif task_point == 2:
                                                et_key = interval1[1] + offset
                                                st_key = et_key - fk['Duration']
                                                inter_list.append([st_key, et_key])
                                        for interval1 in inter_list:
                                            if in_interval(interval1, [[interval[0], interval[1]]]):
                                                fk_id_list.append(task_id)
                                                ck_satation_list.append(ck['Station'])
                                                ck_number_list.append(ck['ID'])
                                                st_list.append(interval1[0])
                                                et_list.append(interval1[1])
                                                fk_duration_list.append(fk['Duration'])
                                                fk_satellite_list.append(fk['Spacecraft'])
                                                plan_id_list.append('Plan_1_' + str(plan_id))
                                                plan_id += 1
                                    elif key_point == 5:
                                        st_key = ck['Start_Timestamp'] + offset
                                        et_key = st_key + fk['Duration']
                                        if in_interval([st_key, et_key], [[interval[0], interval[1]]]):
                                            fk_id_list.append(task_id)
                                            ck_satation_list.append(ck['Station'])
                                            ck_number_list.append(ck['ID'])
                                            st_list.append(ck['Start_Timestamp'] + offset)
                                            et_list.append(ck['Start_Timestamp'] + offset + fk['Duration'])
                                            fk_duration_list.append(fk['Duration'])
                                            fk_satellite_list.append(fk['Spacecraft'])
                                            plan_id_list.append('Plan_1_' + str(plan_id))
                                            plan_id += 1
                                    elif key_point == 6:
                                        st_key = ck['End_Timestamp'] + offset - fk['Duration']
                                        et_key = ck['End_Timestamp'] + offset
                                        if in_interval([st_key, et_key], [[interval[0], interval[1]]]):
                                            fk_id_list.append(task_id)
                                            ck_satation_list.append(ck['Station'])
                                            ck_number_list.append(ck['ID'])
                                            st_list.append(ck['End_Timestamp'] + offset - fk['Duration'])
                                            et_list.append(ck['End_Timestamp'] + offset)
                                            fk_duration_list.append(fk['Duration'])
                                            fk_satellite_list.append(fk['Spacecraft'])
                                            plan_id_list.append('Plan_1_' + str(plan_id))
                                            plan_id += 1
                                else:
                                    fk_id_list.append(task_id)
                                    ck_satation_list.append(ck['Station'])
                                    ck_number_list.append(ck['ID'])
                                    st_list.append(interval[0])
                                    et_list.append(interval[1])
                                    fk_duration_list.append(fk['Duration'])
                                    fk_satellite_list.append(fk['Spacecraft'])
                                    plan_id_list.append('Plan_1_' + str(plan_id))
                                    plan_id += 1
                if ck['Start_Timestamp'] <= fk['Early_Start_Timestamp'] and ck['End_Timestamp'] <= fk[
                    'Last_End_Timestamp']:
                    if ck['End_Timestamp'] - fk['Early_Start_Timestamp'] < fk['Duration']:
                        continue
                    if fk['Sun'] == 0:
                        if len(target_row) != 0:
                            if key_point == 1:
                                # 先找所有进阴影点，然后按照偏移给出事件开始时间和结束时间，然后必须在这个备选弧段
                                inter_list = []
                                for interval in umbra_interval:
                                    if task_point == 1:
                                        st_key = interval[0] + offset
                                        et_key = st_key + fk['Duration']
                                        inter_list.append([st_key, et_key])
                                    elif task_point == 2:
                                        et_key = interval[0] + offset
                                        st_key = et_key - fk['Duration']
                                        inter_list.append([st_key, et_key])
                                for interval in inter_list:
                                    if in_interval(interval, [[fk['Early_Start_Timestamp'], ck['End_Timestamp']]]):
                                        fk_id_list.append(task_id)
                                        ck_satation_list.append(ck['Station'])
                                        ck_number_list.append(ck['ID'])
                                        st_list.append(interval[0])
                                        et_list.append(interval[1])
                                        fk_duration_list.append(fk['Duration'])
                                        fk_satellite_list.append(fk['Spacecraft'])
                                        plan_id_list.append('Plan_1_' + str(plan_id))
                                        plan_id += 1
                            elif key_point == 2:
                                # 先找所有出阴影点，然后按照偏移给出事件开始时间和结束时间，然后必须在这个备选弧段
                                inter_list = []
                                for interval in umbra_interval:
                                    if task_point == 1:
                                        st_key = interval[1] + offset
                                        et_key = st_key + fk['Duration']
                                        inter_list.append([st_key, et_key])
                                    elif task_point == 2:
                                        et_key = interval[1] + offset
                                        st_key = et_key - fk['Duration']
                                        inter_list.append([st_key, et_key])
                                for interval in inter_list:
                                    if in_interval(interval, [[fk['Early_Start_Timestamp'], ck['End_Timestamp']]]):
                                        fk_id_list.append(task_id)
                                        ck_satation_list.append(ck['Station'])
                                        ck_number_list.append(ck['ID'])
                                        st_list.append(interval[0])
                                        et_list.append(interval[1])
                                        fk_duration_list.append(fk['Duration'])
                                        fk_satellite_list.append(fk['Spacecraft'])
                                        plan_id_list.append('Plan_1_' + str(plan_id))
                                        plan_id += 1
                            elif key_point == 3:
                                inter_list = []
                                for interval in sun_interval:
                                    if task_point == 1:
                                        st_key = interval[0] + offset
                                        et_key = st_key + fk['Duration']
                                        inter_list.append([st_key, et_key])
                                    elif task_point == 2:
                                        et_key = interval[0] + offset
                                        st_key = et_key - fk['Duration']
                                        inter_list.append([st_key, et_key])
                                for interval in inter_list:
                                    if in_interval(interval, [[fk['Early_Start_Timestamp'], ck['End_Timestamp']]]):
                                        fk_id_list.append(task_id)
                                        ck_satation_list.append(ck['Station'])
                                        ck_number_list.append(ck['ID'])
                                        st_list.append(interval[0])
                                        et_list.append(interval[1])
                                        fk_duration_list.append(fk['Duration'])
                                        fk_satellite_list.append(fk['Spacecraft'])
                                        plan_id_list.append('Plan_1_' + str(plan_id))
                                        plan_id += 1
                            elif key_point == 4:
                                inter_list = []
                                for interval in sun_interval:
                                    if task_point == 1:
                                        st_key = interval[1] + offset
                                        et_key = st_key + fk['Duration']
                                        inter_list.append([st_key, et_key])
                                    elif task_point == 2:
                                        et_key = interval[1] + offset
                                        st_key = et_key - fk['Duration']
                                        inter_list.append([st_key, et_key])
                                for interval in inter_list:
                                    if in_interval(interval, [[fk['Early_Start_Timestamp'], ck['End_Timestamp']]]):
                                        fk_id_list.append(task_id)
                                        ck_satation_list.append(ck['Station'])
                                        ck_number_list.append(ck['ID'])
                                        st_list.append(interval[0])
                                        et_list.append(interval[1])
                                        fk_duration_list.append(fk['Duration'])
                                        fk_satellite_list.append(fk['Spacecraft'])
                                        plan_id_list.append('Plan_1_' + str(plan_id))
                                        plan_id += 1
                            elif key_point == 5:
                                interval = [ck['Start_Timestamp'] + offset,
                                            ck['Start_Timestamp'] + offset + fk['Duration']]
                                if in_interval(interval, [[fk['Early_Start_Timestamp'], ck['End_Timestamp']]]):
                                    fk_id_list.append(task_id)
                                    ck_satation_list.append(ck['Station'])
                                    ck_number_list.append(ck['ID'])
                                    st_list.append(interval[0])
                                    et_list.append(interval[1])
                                    fk_duration_list.append(fk['Duration'])
                                    fk_satellite_list.append(fk['Spacecraft'])
                                    plan_id_list.append('Plan_1_' + str(plan_id))
                                    plan_id += 1
                            elif key_point == 6:
                                interval = [ck['End_Timestamp'] + offset - fk['Duration'], ck['End_Timestamp'] + offset]
                                if in_interval(interval, [[fk['Early_Start_Timestamp'], ck['End_Timestamp']]]):
                                    fk_id_list.append(task_id)
                                    ck_satation_list.append(ck['Station'])
                                    ck_number_list.append(ck['ID'])
                                    st_list.append(interval[0])
                                    et_list.append(interval[1])
                                    fk_duration_list.append(fk['Duration'])
                                    fk_satellite_list.append(fk['Spacecraft'])
                                    plan_id_list.append('Plan_1_' + str(plan_id))
                                    plan_id += 1
                        else:
                            fk_id_list.append(task_id)
                            ck_satation_list.append(ck['Station'])
                            ck_number_list.append(ck['ID'])
                            st_list.append(fk['Early_Start_Timestamp'])
                            et_list.append(ck['End_Timestamp'])
                            fk_duration_list.append(fk['Duration'])
                            fk_satellite_list.append(fk['Spacecraft'])
                            plan_id_list.append('Plan_1_' + str(plan_id))
                            plan_id += 1
                    elif fk['Sun'] == 1:
                        interval_list = intersection([fk['Early_Start_Timestamp'], ck['End_Timestamp']], sun_interval)
                        for interval in interval_list:
                            if interval[1] - interval[0] >= fk['Duration']:
                                if len(target_row) != 0:
                                    if key_point == 3:
                                        inter_list = []
                                        for interval1 in sun_interval:
                                            if task_point == 1:
                                                st_key = interval1[0] + offset
                                                et_key = st_key + fk['Duration']
                                                inter_list.append([st_key, et_key])
                                            elif task_point == 2:
                                                et_key = interval1[0] + offset
                                                st_key = et_key - fk['Duration']
                                                inter_list.append([st_key, et_key])
                                        for interval1 in inter_list:
                                            if in_interval(interval1, [[interval[0], interval[1]]]):
                                                fk_id_list.append(task_id)
                                                ck_satation_list.append(ck['Station'])
                                                ck_number_list.append(ck['ID'])
                                                st_list.append(interval1[0])
                                                et_list.append(interval1[1])
                                                fk_duration_list.append(fk['Duration'])
                                                fk_satellite_list.append(fk['Spacecraft'])
                                                plan_id_list.append('Plan_1_' + str(plan_id))
                                                plan_id += 1
                                    elif key_point == 4:
                                        inter_list = []
                                        for interval1 in sun_interval:
                                            if task_point == 1:
                                                st_key = interval1[1] + offset
                                                et_key = st_key + fk['Duration']
                                                inter_list.append([st_key, et_key])
                                            elif task_point == 2:
                                                et_key = interval1[1] + offset
                                                st_key = et_key - fk['Duration']
                                                inter_list.append([st_key, et_key])
                                        for interval1 in inter_list:
                                            if in_interval(interval1, [[interval[0], interval[1]]]):
                                                fk_id_list.append(task_id)
                                                ck_satation_list.append(ck['Station'])
                                                ck_number_list.append(ck['ID'])
                                                st_list.append(interval1[0])
                                                et_list.append(interval1[1])
                                                fk_duration_list.append(fk['Duration'])
                                                fk_satellite_list.append(fk['Spacecraft'])
                                                plan_id_list.append('Plan_1_' + str(plan_id))
                                                plan_id += 1
                                    elif key_point == 5:
                                        st_key = ck['Start_Timestamp'] + offset
                                        et_key = st_key + fk['Duration']
                                        if in_interval([st_key, et_key], [[interval[0], interval[1]]]):
                                            fk_id_list.append(task_id)
                                            ck_satation_list.append(ck['Station'])
                                            ck_number_list.append(ck['ID'])
                                            st_list.append(ck['Start_Timestamp'] + offset)
                                            et_list.append(ck['Start_Timestamp'] + offset + fk['Duration'])
                                            fk_duration_list.append(fk['Duration'])
                                            fk_satellite_list.append(fk['Spacecraft'])
                                            plan_id_list.append('Plan_1_' + str(plan_id))
                                            plan_id += 1
                                    elif key_point == 6:
                                        st_key = ck['End_Timestamp'] + offset - fk['Duration']
                                        et_key = ck['End_Timestamp'] + offset
                                        if in_interval([st_key, et_key], [[interval[0], interval[1]]]):
                                            fk_id_list.append(task_id)
                                            ck_satation_list.append(ck['Station'])
                                            ck_number_list.append(ck['ID'])
                                            st_list.append(ck['End_Timestamp'] + offset - fk['Duration'])
                                            et_list.append(ck['End_Timestamp'] + offset)
                                            fk_duration_list.append(fk['Duration'])
                                            fk_satellite_list.append(fk['Spacecraft'])
                                            plan_id_list.append('Plan_1_' + str(plan_id))
                                            plan_id += 1
                                else:
                                    fk_id_list.append(task_id)
                                    ck_satation_list.append(ck['Station'])
                                    ck_number_list.append(ck['ID'])
                                    st_list.append(interval[0])
                                    et_list.append(interval[1])
                                    fk_duration_list.append(fk['Duration'])
                                    fk_satellite_list.append(fk['Spacecraft'])
                                    plan_id_list.append('Plan_1_' + str(plan_id))
                                    plan_id += 1
                    elif fk['Sun'] == 2:
                        interval_list = intersection([fk['Early_Start_Timestamp'], ck['End_Timestamp']], umbra_interval)
                        for interval in interval_list:
                            if interval[1] - interval[0] >= fk['Duration']:
                                if len(target_row) != 0:
                                    if key_point == 1:
                                        inter_list = []
                                        for interval1 in umbra_interval:
                                            if task_point == 1:
                                                st_key = interval1[0] + offset
                                                et_key = st_key + fk['Duration']
                                                inter_list.append([st_key, et_key])
                                            elif task_point == 2:
                                                et_key = interval1[0] + offset
                                                st_key = et_key - fk['Duration']
                                                inter_list.append([st_key, et_key])
                                        for interval1 in inter_list:
                                            if in_interval(interval1, [[interval[0], interval[1]]]):
                                                fk_id_list.append(task_id)
                                                ck_satation_list.append(ck['Station'])
                                                ck_number_list.append(ck['ID'])
                                                st_list.append(interval1[0])
                                                et_list.append(interval1[1])
                                                fk_duration_list.append(fk['Duration'])
                                                fk_satellite_list.append(fk['Spacecraft'])
                                                plan_id_list.append('Plan_1_' + str(plan_id))
                                                plan_id += 1
                                    elif key_point == 2:
                                        inter_list = []
                                        for interval1 in umbra_interval:
                                            if task_point == 1:
                                                st_key = interval1[1] + offset
                                                et_key = st_key + fk['Duration']
                                                inter_list.append([st_key, et_key])
                                            elif task_point == 2:
                                                et_key = interval1[1] + offset
                                                st_key = et_key - fk['Duration']
                                                inter_list.append([st_key, et_key])
                                        for interval1 in inter_list:
                                            if in_interval(interval1, [[interval[0], interval[1]]]):
                                                fk_id_list.append(task_id)
                                                ck_satation_list.append(ck['Station'])
                                                ck_number_list.append(ck['ID'])
                                                st_list.append(interval1[0])
                                                et_list.append(interval1[1])
                                                fk_duration_list.append(fk['Duration'])
                                                fk_satellite_list.append(fk['Spacecraft'])
                                                plan_id_list.append('Plan_1_' + str(plan_id))
                                                plan_id += 1
                                    elif key_point == 5:
                                        st_key = ck['Start_Timestamp'] + offset
                                        et_key = st_key + fk['Duration']
                                        if in_interval([st_key, et_key], [[interval[0], interval[1]]]):
                                            fk_id_list.append(task_id)
                                            ck_satation_list.append(ck['Station'])
                                            ck_number_list.append(ck['ID'])
                                            st_list.append(ck['Start_Timestamp'] + offset)
                                            et_list.append(ck['Start_Timestamp'] + offset + fk['Duration'])
                                            fk_duration_list.append(fk['Duration'])
                                            fk_satellite_list.append(fk['Spacecraft'])
                                            plan_id_list.append('Plan_1_' + str(plan_id))
                                            plan_id += 1
                                    elif key_point == 6:
                                        st_key = ck['End_Timestamp'] + offset - fk['Duration']
                                        et_key = ck['End_Timestamp'] + offset
                                        if in_interval([st_key, et_key], [[interval[0], interval[1]]]):
                                            fk_id_list.append(task_id)
                                            ck_satation_list.append(ck['Station'])
                                            ck_number_list.append(ck['ID'])
                                            st_list.append(ck['End_Timestamp'] + offset - fk['Duration'])
                                            et_list.append(ck['End_Timestamp'] + offset)
                                            fk_duration_list.append(fk['Duration'])
                                            fk_satellite_list.append(fk['Spacecraft'])
                                            plan_id_list.append('Plan_1_' + str(plan_id))
                                            plan_id += 1
                                else:
                                    fk_id_list.append(task_id)
                                    ck_satation_list.append(ck['Station'])
                                    ck_number_list.append(ck['ID'])
                                    st_list.append(interval[0])
                                    et_list.append(interval[1])
                                    fk_duration_list.append(fk['Duration'])
                                    fk_satellite_list.append(fk['Spacecraft'])
                                    plan_id_list.append('Plan_1_' + str(plan_id))
                                    plan_id += 1
                if ck['Start_Timestamp'] >= fk['Early_Start_Timestamp'] and ck['End_Timestamp'] >= fk[
                    'Last_End_Timestamp']:
                    if fk['Last_End_Timestamp'] - ck['Start_Timestamp'] < fk['Duration']:
                        continue
                    if fk['Sun'] == 0:
                        if len(target_row) != 0:
                            if key_point == 1:
                                # 先找所有进阴影点，然后按照偏移给出事件开始时间和结束时间，然后必须在这个备选弧段
                                inter_list = []
                                for interval in umbra_interval:
                                    if task_point == 1:
                                        st_key = interval[0] + offset
                                        et_key = st_key + fk['Duration']
                                        inter_list.append([st_key, et_key])
                                    elif task_point == 2:
                                        et_key = interval[0] + offset
                                        st_key = et_key - fk['Duration']
                                        inter_list.append([st_key, et_key])
                                for interval in inter_list:
                                    if in_interval(interval, [[fk['Early_Start_Timestamp'], ck['End_Timestamp']]]):
                                        fk_id_list.append(task_id)
                                        ck_satation_list.append(ck['Station'])
                                        ck_number_list.append(ck['ID'])
                                        st_list.append(interval[0])
                                        et_list.append(interval[1])
                                        fk_duration_list.append(fk['Duration'])
                                        fk_satellite_list.append(fk['Spacecraft'])
                                        plan_id_list.append('Plan_1_' + str(plan_id))
                                        plan_id += 1
                            elif key_point == 2:
                                # 先找所有出阴影点，然后按照偏移给出事件开始时间和结束时间，然后必须在这个备选弧段
                                inter_list = []
                                for interval in umbra_interval:
                                    if task_point == 1:
                                        st_key = interval[1] + offset
                                        et_key = st_key + fk['Duration']
                                        inter_list.append([st_key, et_key])
                                    elif task_point == 2:
                                        et_key = interval[1] + offset
                                        st_key = et_key - fk['Duration']
                                        inter_list.append([st_key, et_key])
                                for interval in inter_list:
                                    if in_interval(interval, [[fk['Early_Start_Timestamp'], ck['End_Timestamp']]]):
                                        fk_id_list.append(task_id)
                                        ck_satation_list.append(ck['Station'])
                                        ck_number_list.append(ck['ID'])
                                        st_list.append(interval[0])
                                        et_list.append(interval[1])
                                        fk_duration_list.append(fk['Duration'])
                                        fk_satellite_list.append(fk['Spacecraft'])
                                        plan_id_list.append('Plan_1_' + str(plan_id))
                                        plan_id += 1
                            elif key_point == 3:
                                inter_list = []
                                for interval in sun_interval:
                                    if task_point == 1:
                                        st_key = interval[0] + offset
                                        et_key = st_key + fk['Duration']
                                        inter_list.append([st_key, et_key])
                                    elif task_point == 2:
                                        et_key = interval[0] + offset
                                        st_key = et_key - fk['Duration']
                                        inter_list.append([st_key, et_key])
                                for interval in inter_list:
                                    if in_interval(interval, [[fk['Early_Start_Timestamp'], ck['End_Timestamp']]]):
                                        fk_id_list.append(task_id)
                                        ck_satation_list.append(ck['Station'])
                                        ck_number_list.append(ck['ID'])
                                        st_list.append(interval[0])
                                        et_list.append(interval[1])
                                        fk_duration_list.append(fk['Duration'])
                                        fk_satellite_list.append(fk['Spacecraft'])
                                        plan_id_list.append('Plan_1_' + str(plan_id))
                                        plan_id += 1
                            elif key_point == 4:
                                inter_list = []
                                for interval in sun_interval:
                                    if task_point == 1:
                                        st_key = interval[1] + offset
                                        et_key = st_key + fk['Duration']
                                        inter_list.append([st_key, et_key])
                                    elif task_point == 2:
                                        et_key = interval[1] + offset
                                        st_key = et_key - fk['Duration']
                                        inter_list.append([st_key, et_key])
                                for interval in inter_list:
                                    if in_interval(interval, [[fk['Early_Start_Timestamp'], ck['End_Timestamp']]]):
                                        fk_id_list.append(task_id)
                                        ck_satation_list.append(ck['Station'])
                                        ck_number_list.append(ck['ID'])
                                        st_list.append(interval[0])
                                        et_list.append(interval[1])
                                        fk_duration_list.append(fk['Duration'])
                                        fk_satellite_list.append(fk['Spacecraft'])
                                        plan_id_list.append('Plan_1_' + str(plan_id))
                                        plan_id += 1
                            elif key_point == 5:
                                interval = [ck['Start_Timestamp'] + offset,
                                            ck['Start_Timestamp'] + offset + fk['Duration']]
                                if in_interval(interval, [[ck['Start_Timestamp'], fk['Last_End_Timestamp']]]):
                                    fk_id_list.append(task_id)
                                    ck_satation_list.append(ck['Station'])
                                    ck_number_list.append(ck['ID'])
                                    st_list.append(interval[0])
                                    et_list.append(interval[1])
                                    fk_duration_list.append(fk['Duration'])
                                    fk_satellite_list.append(fk['Spacecraft'])
                                    plan_id_list.append('Plan_1_' + str(plan_id))
                                    plan_id += 1
                            elif key_point == 6:
                                interval = [ck['End_Timestamp'] + offset - fk['Duration'], ck['End_Timestamp'] + offset]
                                if in_interval(interval, [[ck['Start_Timestamp'], fk['Last_End_Timestamp']]]):
                                    fk_id_list.append(task_id)
                                    ck_satation_list.append(ck['Station'])
                                    ck_number_list.append(ck['ID'])
                                    st_list.append(interval[0])
                                    et_list.append(interval[1])
                                    fk_duration_list.append(fk['Duration'])
                                    fk_satellite_list.append(fk['Spacecraft'])
                                    plan_id_list.append('Plan_1_' + str(plan_id))
                                    plan_id += 1
                        else:
                            fk_id_list.append(task_id)
                            ck_satation_list.append(ck['Station'])
                            ck_number_list.append(ck['ID'])
                            st_list.append(ck['Start_Timestamp'])
                            et_list.append(fk['Last_End_Timestamp'])
                            fk_duration_list.append(fk['Duration'])
                            fk_satellite_list.append(fk['Spacecraft'])
                            plan_id_list.append('Plan_1_' + str(plan_id))
                            plan_id += 1
                    elif fk['Sun'] == 1:
                        interval_list = intersection([ck['Start_Timestamp'], fk['Last_End_Timestamp']], sun_interval)
                        for interval in interval_list:
                            if interval[1] - interval[0] >= fk['Duration']:
                                if len(target_row) != 0:
                                    if key_point == 3:
                                        inter_list = []
                                        for interval1 in sun_interval:
                                            if task_point == 1:
                                                st_key = interval1[0] + offset
                                                et_key = st_key + fk['Duration']
                                                inter_list.append([st_key, et_key])
                                            elif task_point == 2:
                                                et_key = interval1[0] + offset
                                                st_key = et_key - fk['Duration']
                                                inter_list.append([st_key, et_key])
                                        for interval1 in inter_list:
                                            if in_interval(interval1, [[interval[0], interval[1]]]):
                                                fk_id_list.append(task_id)
                                                ck_satation_list.append(ck['Station'])
                                                ck_number_list.append(ck['ID'])
                                                st_list.append(interval1[0])
                                                et_list.append(interval1[1])
                                                fk_duration_list.append(fk['Duration'])
                                                fk_satellite_list.append(fk['Spacecraft'])
                                                plan_id_list.append('Plan_1_' + str(plan_id))
                                                plan_id += 1
                                    elif key_point == 4:
                                        inter_list = []
                                        for interval1 in sun_interval:
                                            if task_point == 1:
                                                st_key = interval1[1] + offset
                                                et_key = st_key + fk['Duration']
                                                inter_list.append([st_key, et_key])
                                            elif task_point == 2:
                                                et_key = interval1[1] + offset
                                                st_key = et_key - fk['Duration']
                                                inter_list.append([st_key, et_key])
                                        for interval1 in inter_list:
                                            if in_interval(interval1, [[interval[0], interval[1]]]):
                                                fk_id_list.append(task_id)
                                                ck_satation_list.append(ck['Station'])
                                                ck_number_list.append(ck['ID'])
                                                st_list.append(interval1[0])
                                                et_list.append(interval1[1])
                                                fk_duration_list.append(fk['Duration'])
                                                fk_satellite_list.append(fk['Spacecraft'])
                                                plan_id_list.append('Plan_1_' + str(plan_id))
                                                plan_id += 1
                                    elif key_point == 5:
                                        st_key = ck['Start_Timestamp'] + offset
                                        et_key = st_key + fk['Duration']
                                        if in_interval([st_key, et_key], [[interval[0], interval[1]]]):
                                            fk_id_list.append(task_id)
                                            ck_satation_list.append(ck['Station'])
                                            ck_number_list.append(ck['ID'])
                                            st_list.append(ck['Start_Timestamp'] + offset)
                                            et_list.append(ck['Start_Timestamp'] + offset + fk['Duration'])
                                            fk_duration_list.append(fk['Duration'])
                                            fk_satellite_list.append(fk['Spacecraft'])
                                            plan_id_list.append('Plan_1_' + str(plan_id))
                                            plan_id += 1
                                    elif key_point == 6:
                                        st_key = ck['End_Timestamp'] + offset - fk['Duration']
                                        et_key = ck['End_Timestamp'] + offset
                                        if in_interval([st_key, et_key], [[interval[0], interval[1]]]):
                                            fk_id_list.append(task_id)
                                            ck_satation_list.append(ck['Station'])
                                            ck_number_list.append(ck['ID'])
                                            st_list.append(ck['End_Timestamp'] + offset - fk['Duration'])
                                            et_list.append(ck['End_Timestamp'] + offset)
                                            fk_duration_list.append(fk['Duration'])
                                            fk_satellite_list.append(fk['Spacecraft'])
                                            plan_id_list.append('Plan_1_' + str(plan_id))
                                            plan_id += 1
                                else:
                                    fk_id_list.append(task_id)
                                    ck_satation_list.append(ck['Station'])
                                    ck_number_list.append(ck['ID'])
                                    st_list.append(interval[0])
                                    et_list.append(interval[1])
                                    fk_duration_list.append(fk['Duration'])
                                    fk_satellite_list.append(fk['Spacecraft'])
                                    plan_id_list.append('Plan_1_' + str(plan_id))
                                    plan_id += 1
                    elif fk['Sun'] == 2:
                        interval_list = intersection([ck['Start_Timestamp'], fk['Last_End_Timestamp']], umbra_interval)
                        for interval in interval_list:
                            if interval[1] - interval[0] >= fk['Duration']:
                                if len(target_row) != 0:
                                    if key_point == 1:
                                        inter_list = []
                                        for interval1 in umbra_interval:
                                            if task_point == 1:
                                                st_key = interval1[0] + offset
                                                et_key = st_key + fk['Duration']
                                                inter_list.append([st_key, et_key])
                                            elif task_point == 2:
                                                et_key = interval1[0] + offset
                                                st_key = et_key - fk['Duration']
                                                inter_list.append([st_key, et_key])
                                        for interval1 in inter_list:
                                            if in_interval(interval1, [[interval[0], interval[1]]]):
                                                fk_id_list.append(task_id)
                                                ck_satation_list.append(ck['Station'])
                                                ck_number_list.append(ck['ID'])
                                                st_list.append(interval1[0])
                                                et_list.append(interval1[1])
                                                fk_duration_list.append(fk['Duration'])
                                                fk_satellite_list.append(fk['Spacecraft'])
                                                plan_id_list.append('Plan_1_' + str(plan_id))
                                                plan_id += 1
                                    elif key_point == 2:
                                        inter_list = []
                                        for interval1 in umbra_interval:
                                            if task_point == 1:
                                                st_key = interval1[1] + offset
                                                et_key = st_key + fk['Duration']
                                                inter_list.append([st_key, et_key])
                                            elif task_point == 2:
                                                et_key = interval1[1] + offset
                                                st_key = et_key - fk['Duration']
                                                inter_list.append([st_key, et_key])
                                        for interval1 in inter_list:
                                            if in_interval(interval1, [[interval[0], interval[1]]]):
                                                fk_id_list.append(task_id)
                                                ck_satation_list.append(ck['Station'])
                                                ck_number_list.append(ck['ID'])
                                                st_list.append(interval1[0])
                                                et_list.append(interval1[1])
                                                fk_duration_list.append(fk['Duration'])
                                                fk_satellite_list.append(fk['Spacecraft'])
                                                plan_id_list.append('Plan_1_' + str(plan_id))
                                                plan_id += 1
                                    elif key_point == 5:
                                        st_key = ck['Start_Timestamp'] + offset
                                        et_key = st_key + fk['Duration']
                                        if in_interval([st_key, et_key], [[interval[0], interval[1]]]):
                                            fk_id_list.append(task_id)
                                            ck_satation_list.append(ck['Station'])
                                            ck_number_list.append(ck['ID'])
                                            st_list.append(ck['Start_Timestamp'] + offset)
                                            et_list.append(ck['Start_Timestamp'] + offset + fk['Duration'])
                                            fk_duration_list.append(fk['Duration'])
                                            fk_satellite_list.append(fk['Spacecraft'])
                                            plan_id_list.append('Plan_1_' + str(plan_id))
                                            plan_id += 1
                                    elif key_point == 6:
                                        st_key = ck['End_Timestamp'] + offset - fk['Duration']
                                        et_key = ck['End_Timestamp'] + offset
                                        if in_interval([st_key, et_key], [[interval[0], interval[1]]]):
                                            fk_id_list.append(task_id)
                                            ck_satation_list.append(ck['Station'])
                                            ck_number_list.append(ck['ID'])
                                            st_list.append(ck['End_Timestamp'] + offset - fk['Duration'])
                                            et_list.append(ck['End_Timestamp'] + offset)
                                            fk_duration_list.append(fk['Duration'])
                                            fk_satellite_list.append(fk['Spacecraft'])
                                            plan_id_list.append('Plan_1_' + str(plan_id))
                                            plan_id += 1
                                else:
                                    fk_id_list.append(task_id)
                                    ck_satation_list.append(ck['Station'])
                                    ck_number_list.append(ck['ID'])
                                    st_list.append(interval[0])
                                    et_list.append(interval[1])
                                    fk_duration_list.append(fk['Duration'])
                                    fk_satellite_list.append(fk['Spacecraft'])
                                    plan_id_list.append('Plan_1_' + str(plan_id))
                                    plan_id += 1

    data = {'飞控事件ID': fk_id_list,
            '跟踪方案ID': plan_id_list,
            '测控站': ck_satation_list,
            '测控资源ID': ck_number_list,
            '开始时间': st_list,
            '结束时间': et_list,
            '事件持续时间': fk_duration_list,
            '事件对应航天器': fk_satellite_list}
    df = pd.DataFrame(data)
    print(f"生成的DataFrame行数: {len(fk_id_list)}")  # 检查各列表长度是否一致
    print(f"DataFrame总行数: {len(df)}")

    # 转换为JSON格式
    output_data = format_output_json(df)

    # 保存JSON文件
    if not os.path.exists(output_path):
        os.makedirs(output_path)

    output_file = os.path.join(output_path, '非连续跟踪遥控事件预处理备选弧段.json')
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(output_data, f, indent=2, ensure_ascii=False)

def have_common_elements(list1, list2):
    set1 = set(list1)
    set2 = set(list2)
    return not set1.isdisjoint(set2)

def fk2_pre_process_json(fk_file_path, ck_file_path, output_path):
    cks = load_ck_data(ck_file_path)
    fks = load_fk_data(fk_file_path, False)

    fk_id_list = []
    ck_satation_list = []
    plan_id_list = []
    ck_number_list = []
    plan_id_ck_list = []
    ck_number_plan_list = []
    st_list = []
    et_list = []
    fk_duration_list = []
    fk_satellite_list = []
    plan_id = 1

    for fk_index, fk in fks.iterrows():
        # print(fk['ID'])
        for ck_index, ck in cks.iterrows():
            if ck['Satellite'] != fk['Spacecraft']:
                continue
            if ck['Station'] not in ['TIANLIAN_2-01', 'TIANLIAN_2-02', 'TIANLIAN_2-03', 'TIANLIAN_1-05',
                                     'TIANLIAN_1-04', 'Tianlian103']:
                continue
            if ck['Start_Timestamp'] >= fk['Last_End_Timestamp'] - fk['Duration'] or ck['End_Timestamp'] <= fk[
                'Early_Start_Timestamp']:
                continue
            # print(ck['ID'])
            ck_com = []
            if ck['Start_Timestamp'] >= fk['Early_Start_Timestamp'] and ck['End_Timestamp'] <= fk['Last_End_Timestamp']:
                plan_ck_list = [ck]
                length = plan_ck_list[-1]['End_Timestamp'] - plan_ck_list[0]['Start_Timestamp']
                # print('Length = ' + str(length))
                while length < fk['Duration']:
                    flag = 0
                    ck_cal = copy.deepcopy(plan_ck_list[-1])
                    ck1s = copy.deepcopy(cks)
                    ck1s['new_sorting_column'] = ck_cal['End_Timestamp'] - ck1s['Start_Timestamp']
                    ck1s_sorted = ck1s.sort_values(by='new_sorting_column')
                    for ck_index1, ck1 in ck1s_sorted.iterrows():
                        if ck1['new_sorting_column'] < 0:
                            continue
                        if ck1['ID'] == ck['ID']:
                            continue
                        if ck1['ID'] in ck_com:
                            continue
                        if ck1['Satellite'] != fk['Spacecraft']:
                            continue
                        if ck1['Station'] not in ['TIANLIAN_2-01', 'TIANLIAN_2-02', 'TIANLIAN_2-03', 'TIANLIAN_1-05',
                                                  'TIANLIAN_1-04', 'Tianlian103']:
                            continue
                        if ck1['Start_Timestamp'] >= fk['Last_End_Timestamp'] or ck1['End_Timestamp'] <= \
                                fk['Early_Start_Timestamp']:
                            continue
                        if ck1['Start_Timestamp'] < ck['Start_Timestamp']:
                            continue
                        if ck1['End_Timestamp'] <= fk['Last_End_Timestamp']:
                            inter_intervals = intersection(
                                [plan_ck_list[-1]['Start_Timestamp'], plan_ck_list[-1]['End_Timestamp']],
                                [[ck1['Start_Timestamp'], ck1['End_Timestamp']]])
                        else:
                            inter_intervals = intersection(
                                [plan_ck_list[-1]['Start_Timestamp'], plan_ck_list[-1]['End_Timestamp']],
                                [[ck1['Start_Timestamp'], fk['Last_End_Timestamp']]])
                        if inter_intervals:
                            flag = 1
                            plan_ck_list.append(ck1)
                            ck_com.append(ck1['ID'])
                            # print(plan_ck_list)
                            if ck1['End_Timestamp'] <= fk['Last_End_Timestamp']:
                                length = plan_ck_list[-1]['End_Timestamp'] - plan_ck_list[0]['Start_Timestamp']
                            else:
                                length = fk['Last_End_Timestamp'] - plan_ck_list[0]['Start_Timestamp']
                            # print('New Length = ' + str(length))
                            break
                    if flag == 0 or length >= fk['Duration']:
                        break
                # print(plan_ck_list)
                if plan_ck_list[-1]['End_Timestamp'] <= fk['Last_End_Timestamp']:
                    length = plan_ck_list[-1]['End_Timestamp'] - plan_ck_list[0]['Start_Timestamp']
                else:
                    length = fk['Last_End_Timestamp'] - plan_ck_list[0]['Start_Timestamp']
                if length >= fk['Duration']:
                    list_temp = []
                    for ck_temp in plan_ck_list:
                        list_temp.append(ck_temp['ID'])
                    ck_number_plan_list.append(list_temp)
                    plan_id_ck_list.append('Plan_2_' + str(plan_id))
                    plan_id += 1
                    for ck_temp in plan_ck_list:
                        fk_id_list.append(fk['ID'])
                        ck_satation_list.append(ck_temp['Station'])
                        ck_number_list.append(ck_temp['ID'])
                        plan_id_list.append(plan_id_ck_list[-1])
                        if plan_ck_list[-1]['End_Timestamp'] <= fk['Last_End_Timestamp']:
                            st_list.append(plan_ck_list[0]['Start_Timestamp'])
                            et_list.append(plan_ck_list[-1]['End_Timestamp'])
                        else:
                            st_list.append(plan_ck_list[0]['Start_Timestamp'])
                            et_list.append(fk['Last_End_Timestamp'])
                        fk_duration_list.append(fk['Duration'])
                        fk_satellite_list.append(fk['Spacecraft'])
            elif ck['Start_Timestamp'] <= fk['Early_Start_Timestamp'] and ck['End_Timestamp'] <= fk[
                'Last_End_Timestamp']:
                plan_ck_list = [ck]
                length = plan_ck_list[-1]['End_Timestamp'] - fk['Early_Start_Timestamp']
                # print('Length = ' + str(length))
                while length < fk['Duration']:
                    flag = 0
                    ck1s = copy.deepcopy(cks)
                    ck_cal = copy.deepcopy(plan_ck_list[-1])
                    ck1s['new_sorting_column'] = ck_cal['End_Timestamp'] - ck1s['Start_Timestamp']
                    ck1s_sorted = ck1s.sort_values(by='new_sorting_column')
                    for ck_index1, ck1 in ck1s_sorted.iterrows():
                        if ck1['new_sorting_column'] < 0:
                            continue
                        if ck1['ID'] == ck['ID']:
                            continue
                        if ck1['ID'] in ck_com:
                            continue
                        if ck1['Satellite'] != fk['Spacecraft']:
                            continue
                        if ck1['Station'] not in ['TIANLIAN_2-01', 'TIANLIAN_2-02', 'TIANLIAN_2-03', 'TIANLIAN_1-05',
                                                  'TIANLIAN_1-04', 'Tianlian103']:
                            continue
                        if ck1['Start_Timestamp'] >= fk['Last_End_Timestamp'] or ck1['End_Timestamp'] <= \
                                fk['Early_Start_Timestamp']:
                            continue
                        if ck1['Start_Timestamp'] < ck['Start_Timestamp']:
                            continue
                        if ck1['End_Timestamp'] <= fk['Last_End_Timestamp']:
                            inter_intervals = intersection(
                                [fk['Early_Start_Timestamp'], plan_ck_list[-1]['End_Timestamp']],
                                [[ck1['Start_Timestamp'], ck1['End_Timestamp']]])
                        else:
                            inter_intervals = intersection(
                                [fk['Early_Start_Timestamp'], plan_ck_list[-1]['End_Timestamp']],
                                [[ck1['Start_Timestamp'], fk['Last_End_Timestamp']]])
                        if inter_intervals:
                            flag = 1
                            plan_ck_list.append(ck1)
                            ck_com.append(ck1['ID'])
                            # print(plan_ck_list)
                            if ck1['End_Timestamp'] <= fk['Last_End_Timestamp']:
                                length = plan_ck_list[-1]['End_Timestamp'] - fk['Early_Start_Timestamp']
                            else:
                                length = fk['Last_End_Timestamp'] - fk['Early_Start_Timestamp']
                            # print('New Length = ' + str(length))
                            break
                    if flag == 0 or length >= fk['Duration']:
                        break
                # print(plan_ck_list)
                if plan_ck_list[-1]['End_Timestamp'] <= fk['Last_End_Timestamp']:
                    length = plan_ck_list[-1]['End_Timestamp'] - fk['Early_Start_Timestamp']
                else:
                    length = fk['Last_End_Timestamp'] - fk['Early_Start_Timestamp']
                if length >= fk['Duration']:
                    list_temp = []
                    for ck_temp in plan_ck_list:
                        list_temp.append(ck_temp['ID'])
                    ck_number_plan_list.append(list_temp)
                    plan_id_ck_list.append('Plan_2_' + str(plan_id))
                    plan_id += 1
                    for ck_temp in plan_ck_list:
                        fk_id_list.append(fk['ID'])
                        ck_satation_list.append(ck_temp['Station'])
                        plan_id_list.append(plan_id_ck_list[-1])
                        ck_number_list.append(ck_temp['ID'])
                        if plan_ck_list[-1]['End_Timestamp'] <= fk['Last_End_Timestamp']:
                            st_list.append(fk['Early_Start_Timestamp'])
                            et_list.append(plan_ck_list[-1]['End_Timestamp'])
                        else:
                            st_list.append(fk['Early_Start_Timestamp'])
                            et_list.append(fk['Last_End_Timestamp'])
                        fk_duration_list.append(fk['Duration'])
                        fk_satellite_list.append(fk['Spacecraft'])

    data = {'飞控事件ID': fk_id_list,
        '跟踪方案ID': plan_id_list,
        '测控站': ck_satation_list,
        '测控资源ID': ck_number_list,
        '开始时间': st_list,
        '结束时间': et_list,
        '事件持续时间': fk_duration_list,
        '事件对应航天器': fk_satellite_list}
    df = pd.DataFrame(data)

    # 转换为JSON格式
    output_data = format_output_json(df)

    # 保存JSON文件
    if not os.path.exists(output_path):
        os.makedirs(output_path)

    output_file = os.path.join(output_path, '连续跟踪遥控事件预处理备选弧段.json')
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(output_data, f, indent=2, ensure_ascii=False)