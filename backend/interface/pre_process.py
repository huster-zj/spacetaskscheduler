import glob
import os
import re
import copy
import pandas as pd


def intersection(base_interval, intervals):
    base_start, base_end = base_interval
    intersected_intervals = []
    for inter in intervals:
        start, end = inter
        # 计算交集
        inter_start = max(base_start, start)
        inter_end = min(base_end, end)

        # 确保交集是有效的
        if inter_start <= inter_end:
            intersected_intervals.append([inter_start, inter_end])

    return intersected_intervals


def fk1_pre_process(fk_file_path, key_points_file_path, ck_file_path, sun_file_path, umbra_file_path, output_path):
    sun = pd.read_csv(sun_file_path)
    umbra = pd.read_csv(umbra_file_path)
    sun_interval = []
    umbra_interval = []
    for s_index, s in sun.iterrows():
        sun_interval.append([s['start_timestamp'], s['end_timestamp']])
    for u_index, u in umbra.iterrows():
        umbra_interval.append([u['start_timestamp'], u['end_timestamp']])
    cks = pd.read_csv(ck_file_path)
    fks = pd.read_csv(fk_file_path)
    key_points = pd.read_csv(key_points_file_path)
    sun_interval = []
    umbra_interval = []
    for s_index, s in sun.iterrows():
        sun_interval.append([s['start_timestamp'], s['end_timestamp']])
    for u_index, u in umbra.iterrows():
        umbra_interval.append([u['start_timestamp'], u['end_timestamp']])

    def in_interval(base_interval, intervals):
        base_start, base_end = base_interval
        for inter in intervals:
            start, end = inter
            if base_start >= start and base_end <= end:
                return True
        return False

    # 针对非连续跟踪的遥控事件生成
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
        if fk['is_Data_Task'] == 1:
            task_ids = [fk['ID'] + '-1', fk['ID'] + '-2']  # 创建两个新的任务ID
            print(task_ids)
            tasks_to_process = [fk] * 2  # 创建两个任务的副本
        else:
            task_ids = [fk['ID']]
            tasks_to_process = [fk]
        for task, task_id in zip(tasks_to_process, task_ids):
            print(task)
            target_row = key_points[key_points['Task_ID'] == fk['ID']]
            if len(target_row) != 0:
                task_point = target_row['Task_Timepoint'].iloc[0]
                key_point = target_row['Task_Key_Timepoint'].iloc[0]
                offset = target_row['Offset'].iloc[0]
            for ck_index, ck in cks.iterrows():
                if ck['Satellite'] != fk['Spacecraft']:
                    continue
                if ck['Start_Timestamp'] >= fk['Last_End_Timestamp'] or ck['End_Timestamp'] <= fk[
                        'Early_Start_Timestamp'] or ck['Duration_Timestamp'] < fk['Duration']:
                    continue
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
                                        plan_id = plan_id + 1
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
                                        plan_id = plan_id + 1
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
                                        plan_id = plan_id + 1
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
                                        plan_id = plan_id + 1
                            elif key_point == 5:
                                fk_id_list.append(task_id)
                                ck_satation_list.append(ck['Station'])
                                ck_number_list.append(ck['ID'])
                                st_list.append(ck['Start_Timestamp']+offset)
                                et_list.append(ck['Start_Timestamp']+offset+fk['Duration'])
                                fk_duration_list.append(fk['Duration'])
                                fk_satellite_list.append(fk['Spacecraft'])
                                plan_id_list.append('Plan_1_' + str(plan_id))
                                plan_id = plan_id + 1
                            elif key_point == 6:
                                fk_id_list.append(task_id)
                                ck_satation_list.append(ck['Station'])
                                ck_number_list.append(ck['ID'])
                                st_list.append(ck['End_Timestamp'] + offset - fk['Duration'])
                                et_list.append(ck['End_Timestamp'] + offset)
                                fk_duration_list.append(fk['Duration'])
                                fk_satellite_list.append(fk['Spacecraft'])
                                plan_id_list.append('Plan_1_' + str(plan_id))
                                plan_id = plan_id + 1
                        else:
                            fk_id_list.append(task_id)
                            ck_satation_list.append(ck['Station'])
                            ck_number_list.append(ck['ID'])
                            st_list.append(ck['Start_Timestamp'])
                            et_list.append(ck['End_Timestamp'])
                            fk_duration_list.append(fk['Duration'])
                            fk_satellite_list.append(fk['Spacecraft'])
                            plan_id_list.append('Plan_1_' + str(plan_id))
                            plan_id = plan_id + 1
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
                                                plan_id = plan_id + 1
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
                                                plan_id = plan_id + 1
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
                                            plan_id = plan_id + 1
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
                                            plan_id = plan_id + 1
                                else:
                                    fk_id_list.append(task_id)
                                    ck_satation_list.append(ck['Station'])
                                    ck_number_list.append(ck['ID'])
                                    st_list.append(interval[0])
                                    et_list.append(interval[1])
                                    fk_duration_list.append(fk['Duration'])
                                    fk_satellite_list.append(fk['Spacecraft'])
                                    plan_id_list.append('Plan_1_' + str(plan_id))
                                    plan_id = plan_id + 1
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
                                                plan_id = plan_id + 1
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
                                                plan_id = plan_id + 1
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
                                            plan_id = plan_id + 1
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
                                            plan_id = plan_id + 1
                                else:
                                    fk_id_list.append(task_id)
                                    ck_satation_list.append(ck['Station'])
                                    ck_number_list.append(ck['ID'])
                                    st_list.append(interval[0])
                                    et_list.append(interval[1])
                                    fk_duration_list.append(fk['Duration'])
                                    fk_satellite_list.append(fk['Spacecraft'])
                                    plan_id_list.append('Plan_1_' + str(plan_id))
                                    plan_id = plan_id + 1
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
                                        plan_id = plan_id + 1
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
                                        plan_id = plan_id + 1
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
                                        plan_id = plan_id + 1
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
                                        plan_id = plan_id + 1
                            elif key_point == 5:
                                interval = [ck['Start_Timestamp']+offset, ck['Start_Timestamp']+offset+fk['Duration']]
                                if in_interval(interval, [[fk['Early_Start_Timestamp'], ck['End_Timestamp']]]):
                                    fk_id_list.append(task_id)
                                    ck_satation_list.append(ck['Station'])
                                    ck_number_list.append(ck['ID'])
                                    st_list.append(interval[0])
                                    et_list.append(interval[1])
                                    fk_duration_list.append(fk['Duration'])
                                    fk_satellite_list.append(fk['Spacecraft'])
                                    plan_id_list.append('Plan_1_' + str(plan_id))
                                    plan_id = plan_id + 1
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
                                    plan_id = plan_id + 1
                        else:
                            fk_id_list.append(task_id)
                            ck_satation_list.append(ck['Station'])
                            ck_number_list.append(ck['ID'])
                            st_list.append(fk['Early_Start_Timestamp'])
                            et_list.append(ck['End_Timestamp'])
                            fk_duration_list.append(fk['Duration'])
                            fk_satellite_list.append(fk['Spacecraft'])
                            plan_id_list.append('Plan_1_' + str(plan_id))
                            plan_id = plan_id + 1
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
                                                plan_id = plan_id + 1
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
                                                plan_id = plan_id + 1
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
                                            plan_id = plan_id + 1
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
                                            plan_id = plan_id + 1
                                else:
                                    fk_id_list.append(task_id)
                                    ck_satation_list.append(ck['Station'])
                                    ck_number_list.append(ck['ID'])
                                    st_list.append(interval[0])
                                    et_list.append(interval[1])
                                    fk_duration_list.append(fk['Duration'])
                                    fk_satellite_list.append(fk['Spacecraft'])
                                    plan_id_list.append('Plan_1_' + str(plan_id))
                                    plan_id = plan_id + 1
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
                                                plan_id = plan_id + 1
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
                                                plan_id = plan_id + 1
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
                                            plan_id = plan_id + 1
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
                                            plan_id = plan_id + 1
                                else:
                                    fk_id_list.append(task_id)
                                    ck_satation_list.append(ck['Station'])
                                    ck_number_list.append(ck['ID'])
                                    st_list.append(interval[0])
                                    et_list.append(interval[1])
                                    fk_duration_list.append(fk['Duration'])
                                    fk_satellite_list.append(fk['Spacecraft'])
                                    plan_id_list.append('Plan_1_' + str(plan_id))
                                    plan_id = plan_id + 1
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
                                        plan_id = plan_id + 1
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
                                        plan_id = plan_id + 1
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
                                        plan_id = plan_id + 1
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
                                        plan_id = plan_id + 1
                            elif key_point == 5:
                                interval = [ck['Start_Timestamp'] + offset, ck['Start_Timestamp'] + offset + fk['Duration']]
                                if in_interval(interval, [[ck['Start_Timestamp'], fk['Last_End_Timestamp']]]):
                                    fk_id_list.append(task_id)
                                    ck_satation_list.append(ck['Station'])
                                    ck_number_list.append(ck['ID'])
                                    st_list.append(interval[0])
                                    et_list.append(interval[1])
                                    fk_duration_list.append(fk['Duration'])
                                    fk_satellite_list.append(fk['Spacecraft'])
                                    plan_id_list.append('Plan_1_' + str(plan_id))
                                    plan_id = plan_id + 1
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
                                    plan_id = plan_id + 1
                        else:
                            fk_id_list.append(task_id)
                            ck_satation_list.append(ck['Station'])
                            ck_number_list.append(ck['ID'])
                            st_list.append(ck['Start_Timestamp'])
                            et_list.append(fk['Last_End_Timestamp'])
                            fk_duration_list.append(fk['Duration'])
                            fk_satellite_list.append(fk['Spacecraft'])
                            plan_id_list.append('Plan_1_' + str(plan_id))
                            plan_id = plan_id + 1
                    elif fk['Sun'] == 1:
                        interval_list= intersection([ck['Start_Timestamp'], fk['Last_End_Timestamp']], sun_interval)
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
                                                plan_id = plan_id + 1
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
                                                plan_id = plan_id + 1
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
                                            plan_id = plan_id + 1
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
                                            plan_id = plan_id + 1
                                else:
                                    fk_id_list.append(task_id)
                                    ck_satation_list.append(ck['Station'])
                                    ck_number_list.append(ck['ID'])
                                    st_list.append(interval[0])
                                    et_list.append(interval[1])
                                    fk_duration_list.append(fk['Duration'])
                                    fk_satellite_list.append(fk['Spacecraft'])
                                    plan_id_list.append('Plan_1_' + str(plan_id))
                                    plan_id = plan_id + 1
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
                                                plan_id = plan_id + 1
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
                                                plan_id = plan_id + 1
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
                                            plan_id = plan_id + 1
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
                                            plan_id = plan_id + 1
                                else:
                                    fk_id_list.append(task_id)
                                    ck_satation_list.append(ck['Station'])
                                    ck_number_list.append(ck['ID'])
                                    st_list.append(interval[0])
                                    et_list.append(interval[1])
                                    fk_duration_list.append(fk['Duration'])
                                    fk_satellite_list.append(fk['Spacecraft'])
                                    plan_id_list.append('Plan_1_' + str(plan_id))
                                    plan_id = plan_id + 1

    data = {'飞控事件ID': fk_id_list,
            '跟踪方案ID': plan_id_list,
            '测控站': ck_satation_list,
            '测控资源ID': ck_number_list,
            '开始时间': st_list,
            '结束时间': et_list,
            '事件持续时间': fk_duration_list,
            '事件对应航天器': fk_satellite_list}
    df = pd.DataFrame(data)
    if not os.path.exists(output_path):
        os.makedirs(output_path)
    df.to_csv(output_path+'/非连续跟踪遥控事件预处理备选弧段.csv', index=False)


def have_common_elements(list1, list2):
    set1 = set(list1)
    set2 = set(list2)
    return not set1.isdisjoint(set2)


def fk2_pre_process(fk_file_path, ck_file_path, output_path):
    cks = pd.read_csv(ck_file_path)
    # key_points_file_path = '连续跟踪任务约束/连续任务关键点约束' + feature + '.csv'
    # key_points = pd.read_csv(key_points_file_path)

    fks = pd.read_csv(fk_file_path)
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
            if ck['Station'] not in ['TIANLIAN_2-01', 'TIANLIAN_2-02', 'TIANLIAN_2-03', 'TIANLIAN_1-05', 'TIANLIAN_1-04', 'Tianlian103']:
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
                    ck1s['new_sorting_column'] =  ck_cal['End_Timestamp']-ck1s['Start_Timestamp']
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
                        if ck1['Station'] not in ['TIANLIAN_2-01', 'TIANLIAN_2-02', 'TIANLIAN_2-03', 'TIANLIAN_1-05', 'TIANLIAN_1-04', 'Tianlian103']:
                            continue
                        if ck1['Start_Timestamp'] >= fk['Last_End_Timestamp'] or ck1['End_Timestamp'] <= \
                                fk['Early_Start_Timestamp']:
                            continue
                        if ck1['Start_Timestamp'] < ck['Start_Timestamp']:
                            continue
                        if ck1['End_Timestamp'] <= fk['Last_End_Timestamp']:
                            inter_intervals = intersection([plan_ck_list[-1]['Start_Timestamp'], plan_ck_list[-1]['End_Timestamp']],
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
            elif ck['Start_Timestamp'] <= fk['Early_Start_Timestamp'] and ck['End_Timestamp'] <= fk['Last_End_Timestamp']:
                plan_ck_list = [ck]
                length = plan_ck_list[-1]['End_Timestamp'] - fk['Early_Start_Timestamp']
                # print('Length = ' + str(length))
                while length < fk['Duration']:
                    flag = 0
                    ck1s = copy.deepcopy(cks)
                    ck_cal = copy.deepcopy(plan_ck_list[-1])
                    ck1s['new_sorting_column'] =  ck_cal['End_Timestamp']-ck1s['Start_Timestamp']
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
                        if ck1['Station'] not in ['TIANLIAN_2-01', 'TIANLIAN_2-02', 'TIANLIAN_2-03', 'TIANLIAN_1-05', 'TIANLIAN_1-04', 'Tianlian103']:
                            continue
                        if ck1['Start_Timestamp'] >= fk['Last_End_Timestamp'] or ck1['End_Timestamp'] <= \
                                fk['Early_Start_Timestamp']:
                            continue
                        if ck1['Start_Timestamp'] < ck['Start_Timestamp']:
                            continue
                        if ck1['End_Timestamp'] <= fk['Last_End_Timestamp']:
                            inter_intervals = intersection([fk['Early_Start_Timestamp'], plan_ck_list[-1]['End_Timestamp']],
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
    if not os.path.exists(output_path):
        os.makedirs(output_path)
    df.to_csv(output_path+'/连续跟踪遥控事件预处理备选弧段.csv', index=False)