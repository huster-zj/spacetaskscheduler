/*
 * @Author: Jerry
 * @Date: 2025-02-26 09:50:25
 * @LastEditors: Do not edit
 * @LastEditTime: 2025-05-26 13:39:28
 * @FilePath: \spacetaskscheduler\src\services\ResourceTransfer.js
 */
import { generateKey, getKey } from '../stores/keyManager.js'
import {
  useFormHeadStore,
  useBasicInfoStore,
  useUsabilityStore,
  useThreePartsStore,
  useOccupancyStore
} from '../stores/resourceDetailNumStore'

export default class ResourceTransferService {
  transferCekongResources(selectedRows) {
    console.log('ResourceTransferService 接收到的数据:', selectedRows)

    generateKey()

    const formHeadStore = useFormHeadStore()
    const basicInfoStore = useBasicInfoStore()
    const usabilityStore = useUsabilityStore()
    const threePartsStore = useThreePartsStore()
    const occupancyStore = useOccupancyStore()
    const { addResourceFormHead } = formHeadStore
    const { addResourceBasicInfo } = basicInfoStore
    const { addResourceUsability } = usabilityStore
    const { addResourceThreeParts } = threePartsStore
    const { addResourceOccupancy } = occupancyStore

    // 在这里添加数据处理逻辑
    try {
      selectedRows.forEach((row) => {
        const convertedTimeWindows = row.visible_time_window.map((window, index) => ({
          id: index + 1, // 自增ID
          startTime: window.start_time,
          endTime: window.end_time,
          notes: window.id // 使用原始数据的id作为备注
        }))

        generateKey()

        const newCeKongResource = {
          // formHead
          resourceName: row.cekong_resource_name,
          resourceNotes: '无',
          resourceType: '测控资源',
          priority: 1,
          // basicinfo
          prepareTime: 0,
          breakDownTime: 0,
          bufferTime: 0,
          // usability
          availability: 1,
          timeWindowType: 2,
          availabilityPeriodData: [],
          unavailablePeriodData: [],
          availabilityDiscreteData: convertedTimeWindows,
          unavailabilityDiscreteData: [],
          // threeParts
          maxaccom: '',
          unit: '',
          initialQuantity: 0,
          maxQuantity: 0,
          minQuantity: 0,
          statemodes: 0,
          fixedDuration: '',
          efficiencyFactor: 0,
          selectedType: 1,
          selectedConstraint: 1,
          selectedConstraint2: 1,
          value: 1,
          // occupancy
          taskName: '',
          minPrepStartTime: '',
          actualPrepStartTime: '',
          startTime: '',
          endTime: '',
          cooldownEndTime: '',
          taskQuantity: 0
        }

        addResourceFormHead(newCeKongResource)
        addResourceBasicInfo(newCeKongResource)
        addResourceUsability(newCeKongResource)
        addResourceThreeParts(newCeKongResource)
        addResourceOccupancy(getKey(), newCeKongResource)
      })

      return {
        success: true,
        message: '资源转移成功',
        data: selectedRows
      }
    } catch (error) {
      return {
        success: false,
        message: error.message
      }
    }
  }
}
