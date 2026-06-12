/*
 * @Author: Jerry
 * @Date: 2025-05-26 14:28:48
 * @LastEditors: Do not edit
 * @LastEditTime: 2025-05-26 14:29:01
 * @FilePath: \spacetaskscheduler\src\utils\timezone.js
 */
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'

// 加载插件
dayjs.extend(utc)
dayjs.extend(timezone)

// 设置默认时区为中国时区
dayjs.tz.setDefault('Asia/Shanghai')

export default dayjs
