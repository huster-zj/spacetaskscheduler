import JSZip from 'jszip'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'

import { useOccupancyStore } from '@/stores/resourceDetailNumStore'
import { useSchedulerStateStore } from '@/stores/taskDetailNumStore'
import { useConfigStore } from '@/stores/useConfigStore'
import {
  PLANNING_PACKAGE_COLLECTION_FILE,
  createPlanningPackageSnapshot,
  readPlanningPackage,
  restorePlanningPackageSnapshot
} from '@/utils/fileHandler'

const minimalPackage = (overrides = {}) => ({
  manifest: { format: 'space-task-scheduler', version: 2 },
  basicConfig: { packageName: '测试规划包' },
  resourceDetail: {
    resourceFormHeadList: [],
    resourceBasicInfoList: [],
    resourceUsabilityList: [],
    resourceThreePartsList: [],
    resourceOccupancyMap: [['resource-1', [{ taskName: '任务 1' }]]]
  },
  taskDetail: {
    taskFormHeadList: [],
    taskBasicInfoList: [],
    taskPropList: [],
    taskDurationList: [],
    taskSchedulerStateMap: [['task-1', { taskScheduleData: [], potentialConflictData: [] }]]
  },
  constraints: {
    anchorConstraintList: [],
    temporalConstraintList: [],
    logicalConstraintList: []
  },
  resourceCatalog: { resourceGroupList: [], cekongResourceList: [] },
  execution: {
    preprocessOutput: { continuousEvents: [], discreteEvents: [] },
    algorithmOutput: { outputText: '' }
  },
  ...overrides
})

const toFile = async (packageData) => {
  const zip = new JSZip()
  const filenames = {
    constraints: 'constraintDetail.json',
    execution: 'executionDetail.json'
  }
  Object.entries(packageData).forEach(([name, value]) => {
    zip.file(filenames[name] || `${name}.json`, JSON.stringify(value))
  })
  const bytes = await zip.generateAsync({ type: 'uint8array' })
  return { name: 'test.sts', arrayBuffer: async () => bytes }
}

describe('planning package file handler', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('reads versioned packages and preserves serialized map entries', async () => {
    const snapshot = await readPlanningPackage(await toFile(minimalPackage()))

    expect(snapshot.manifest.version).toBe(2)
    expect(snapshot.basicConfig.packageName).toBe('测试规划包')
    expect(snapshot.resourceDetail.resourceOccupancyMap).toEqual([
      ['resource-1', [{ taskName: '任务 1' }]]
    ])
    expect(snapshot.taskDetail.taskSchedulerStateMap).toHaveLength(1)
  })

  it('defaults resource requirements when opening an older task snapshot', async () => {
    const legacyTask = {
      taskFormHeadList: [{ key: 'task-1', taskName: '任务 1' }],
      taskBasicInfoList: [{ key: 'task-1', schedulePreference: '' }],
      taskPropList: [{ key: 'task-1' }],
      taskDurationList: [{ key: 'task-1' }],
      taskSchedulerStateMap: []
    }
    const snapshot = await readPlanningPackage(await toFile(minimalPackage({ taskDetail: legacyTask })))

    expect(snapshot.taskDetail.taskBasicInfoList[0].resourceRequirement).toBe('')
  })

  it('keeps resource requirements isolated by task key in saved snapshots', () => {
    const taskDetail = {
      taskFormHeadList: [{ key: 'task-a' }, { key: 'task-b' }],
      taskBasicInfoList: [
        { key: 'task-a', resourceRequirement: '资源 A' },
        { key: 'task-b', resourceRequirement: '资源 B' }
      ],
      taskPropList: [{ key: 'task-a' }, { key: 'task-b' }],
      taskDurationList: [{ key: 'task-a' }, { key: 'task-b' }],
      taskSchedulerStateMap: []
    }

    restorePlanningPackageSnapshot(minimalPackage({ taskDetail }))
    const captured = createPlanningPackageSnapshot()

    expect(captured.taskDetail.taskBasicInfoList.map(({ key, resourceRequirement }) => ({ key, resourceRequirement })))
      .toEqual([
        { key: 'task-a', resourceRequirement: '资源 A' },
        { key: 'task-b', resourceRequirement: '资源 B' }
      ])
  })

  it('accepts legacy packages without optional files', async () => {
    const legacy = minimalPackage()
    delete legacy.manifest
    delete legacy.constraints
    delete legacy.resourceCatalog
    delete legacy.execution
    const snapshot = await readPlanningPackage(await toFile(legacy))

    expect(snapshot.manifest.version).toBe(1)
    expect(snapshot.constraints.anchorConstraintList).toHaveLength(2)
    expect(snapshot.execution.algorithmOutput.outputText).toBe('')
  })

  it('restores business stores and captures map values on the next save', () => {
    const packageData = minimalPackage()
    const snapshot = {
      manifest: packageData.manifest,
      basicConfig: packageData.basicConfig,
      resourceDetail: packageData.resourceDetail,
      taskDetail: packageData.taskDetail,
      constraints: {
        anchorConstraintList: [],
        temporalConstraintList: [],
        logicalConstraintList: []
      },
      resourceCatalog: { resourceGroupList: [], cekongResourceList: [] },
      execution: {
        preprocessOutput: { continuousEvents: [], discreteEvents: [] },
        algorithmOutput: { outputText: '' }
      }
    }

    restorePlanningPackageSnapshot(snapshot)
    const captured = createPlanningPackageSnapshot()

    expect(useConfigStore().basicConfig.packageName).toBe('测试规划包')
    expect(useOccupancyStore().occupancyMap).toBeInstanceOf(Map)
    expect(useSchedulerStateStore().schedulerStateMap).toBeInstanceOf(Map)
    expect(captured.resourceDetail.resourceOccupancyMap).toEqual(
      packageData.resourceDetail.resourceOccupancyMap
    )
    expect(captured.taskDetail.taskSchedulerStateMap).toEqual(
      packageData.taskDetail.taskSchedulerStateMap
    )
  })

  it('rejects packages missing required business data', async () => {
    const invalid = minimalPackage()
    delete invalid.taskDetail

    await expect(readPlanningPackage(await toFile(invalid))).rejects.toThrow('taskDetail.json')
  })

  it('requires the complete snapshot files declared by version 2 packages', async () => {
    const invalid = minimalPackage()
    delete invalid.execution

    await expect(readPlanningPackage(await toFile(invalid))).rejects.toThrow('executionDetail.json')
  })

  it('rejects packages created by unsupported future versions', async () => {
    const future = minimalPackage({
      manifest: { format: 'space-task-scheduler', version: 3 }
    })

    await expect(readPlanningPackage(await toFile(future))).rejects.toThrow('更高版本')
  })

  it('rejects parallel detail lists with different lengths', async () => {
    const invalid = minimalPackage({
      resourceDetail: {
        resourceFormHeadList: [{ key: 'resource-1' }],
        resourceBasicInfoList: [],
        resourceUsabilityList: [],
        resourceThreePartsList: [],
        resourceOccupancyMap: []
      }
    })

    await expect(readPlanningPackage(await toFile(invalid))).rejects.toThrow('资源各明细列表长度不一致')
  })

  it('rejects parallel detail lists whose keys are not aligned', async () => {
    const invalid = minimalPackage({
      taskDetail: {
        taskFormHeadList: [{ key: 'task-1' }],
        taskBasicInfoList: [{ key: 'task-2' }],
        taskPropList: [{ key: 'task-1' }],
        taskDurationList: [{ key: 'task-1' }],
        taskSchedulerStateMap: []
      }
    })

    await expect(readPlanningPackage(await toFile(invalid))).rejects.toThrow('任务各明细列表第 1 项 key 不一致')
  })

  it('identifies a sample collection before reporting missing planning-package files', async () => {
    const zip = new JSZip()
    zip.file(
      PLANNING_PACKAGE_COLLECTION_FILE,
      JSON.stringify({ format: 'space-task-scheduler-sample-collection', version: 1 })
    )
    zip.file('2026-small.sts', 'nested planning package')
    const bytes = await zip.generateAsync({ type: 'uint8array' })
    const collection = { name: '2026-samples.zip', arrayBuffer: async () => bytes }

    await expect(readPlanningPackage(collection)).rejects.toThrow(
      '这是示例规划包合集，请先解压 ZIP，再选择其中一个 .sts 文件打开'
    )
  })
})
