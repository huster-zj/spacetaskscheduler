/*
 * @Author: Jerry
 * @Date: 2025-01-11 10:33:55
 * @LastEditors: Do not edit
 * @LastEditTime: 2025-02-26 09:39:25
 * @FilePath: \spacetaskscheduler\src\stores\useCekongResourceListStore.js
 */
// import { useCekongResourceListStore } from '@/stores/useCekongResourceListStore.js'

import { defineStore } from 'pinia'
import { ref } from 'vue'
import { nanoid } from 'nanoid'

export const useCekongResourceListStore = defineStore('cekongResourceList', () => {
  // 定义一个数组来存储 cekongResource 对象
  const cekongResourceList = ref([])

  // 定义cekongResource对象的属性
  const createCekongResource = (cekong_resource_name='', min_visible_duration=0, max_visible_duration=0, avg_visible_duration=0, sum_visible_duration=0, visible_time_window=[]) => {
    // 根据传入的参数创建一个cekongResource对象
    cekong_resource_name = visible_time_window[0].station + '-' + visible_time_window[0].craft    //测控资源默认名称：测站-目标航天器
    // 获取测控资源的最小可见时长、最大可见时长、平均可见时长、总可见时长
    const visible_duration_list = visible_time_window.map(item => item.duration)      //抽取可见离散时间信息中的可见时长并存为列表
    min_visible_duration = Math.min(...visible_duration_list)     //最小可见时长
    max_visible_duration = Math.max(...visible_duration_list)     //最大可见时长
    sum_visible_duration = visible_duration_list.reduce((a, b) => a + b)    //总可见时长
    avg_visible_duration = sum_visible_duration / visible_duration_list.length    //平均可见时长

    return {
      key: nanoid(),
      cekong_resource_name: cekong_resource_name,
      min_visible_duration: min_visible_duration,
      max_visible_duration: max_visible_duration,
      avg_visible_duration: avg_visible_duration,
      sum_visible_duration: sum_visible_duration,
      visible_time_window: visible_time_window
    }
  }

  // 根据导入一系列测控弧段数据创建cekongResource列表
  const importCekongResourceList = (import_visible_time_window_list) => {

    // 将导入的一系列测控弧段数据分组，将测站-目标航天器相同的测控弧段数据分为一组
    const grouped_visible_time_window_list = import_visible_time_window_list.reduce((acc, cur) => {
      const cekong_resource_name = cur.station + '-' + cur.craft
      if (!acc[cekong_resource_name]) {
        acc[cekong_resource_name] = []
      }
      acc[cekong_resource_name].push(cur)
      return acc
    }, {})

    // 根据分组后的测控弧段数据创建 cekong_resource_list 列表
    const cekong_resource_list = Object.values(grouped_visible_time_window_list).map(visible_time_window => {
      console.log('visivewivbib:',visible_time_window);
      return createCekongResource('', 0, 0, 0, 0, visible_time_window)
    })

    // 将创建的cekongResource列表中的元素添加到cekongResourceList中
    // console.log('cekong_resource_list',cekong_resource_list);
    cekongResourceList.value.push(...cekong_resource_list)
  }

  // 

  return {
    cekongResourceList,
    createCekongResource,
    importCekongResourceList
  }
},
{
  // 定义一个持久化的策略，将数据存储在 sessionStorage 中
  persist: {
  enabled: true,
  key: 'cekongResourceList',
  storage: sessionStorage
  }
 }
)