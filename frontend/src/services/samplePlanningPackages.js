import JSZip from 'jszip'

import {
  PLANNING_PACKAGE_COLLECTION_FILE,
  PLANNING_PACKAGE_COLLECTION_FORMAT,
  PLANNING_PACKAGE_FORMAT,
  PLANNING_PACKAGE_VERSION,
  createPlanningPackageBlob,
  createPlanningPackageBytes,
  downloadBlob
} from '@/utils/fileHandler'

const clone = (value) => JSON.parse(JSON.stringify(value))

const SCENARIO_START = '2026-09-14 00:00:00'
const SCENARIO_END = '2026-09-18 00:00:00'

const makeResource = (key, station, windows) => ({
  formHead: {
    key,
    resourceName: `${station}-TIANHE`,
    resourceNotes: '天宫空间站测控资源',
    resourceType: '测控资源',
    priority: 1
  },
  basicInfo: {
    key,
    prepareTime: 0,
    breakDownTime: 0,
    bufferTime: 0
  },
  usability: {
    key,
    availability: 1,
    timeWindowType: 2,
    availabilityPeriodData: [],
    unavailablePeriodData: [],
    availabilityDiscreteData: windows.map((window, index) => ({
      id: index + 1,
      startTime: window[0],
      endTime: window[1],
      notes: `CK-${station}-${String(index + 1).padStart(2, '0')}`
    })),
    unavailabilityDiscreteData: []
  },
  threeParts: {
    key,
    maxaccom: 1,
    unit: '项',
    initialQuantity: 1,
    maxQuantity: 1,
    minQuantity: 0,
    statemodes: 0,
    fixedDuration: 0,
    efficiencyFactor: 1,
    selectedType: 2,
    selectedConstraint: 1,
    selectedConstraint2: 1,
    value: 1
  }
})

const makeTask = ({ key, window, duration, priority = 1, note }) => ({
  formHead: {
    key,
    taskName: key,
    taskNotes: note || '天宫空间站飞控任务',
    state: 0,
    priority,
    isExclusiveTask: false
  },
  basicInfo: {
    key,
    schedulePreference: '',
    timePointPreference: '',
    startTimePreference: '',
    keyPointConstraint: []
  },
  prop: {
    key,
    availability: 1,
    timeWindowType: 2,
    selectedTimeOption: 1,
    selectedTimeOption2: 1,
    selectedTimeOption3: 1,
    selectedTimeOption4: 1,
    minIntervalTime1: null,
    maxIntervalTime1: null,
    minIntervalTime2: null,
    maxIntervalTime2: null,
    singlePeriodData: [],
    singleDiscreteData: [
      {
        id: 1,
        startTime: window[0],
        endTime: window[1],
        notes: '2026 任务可执行窗口'
      }
    ],
    repeatPeriodData: [],
    repeatDiscreteData: []
  },
  duration: {
    key,
    durationType: 1,
    fixedDuration: duration,
    minTotalDuration: 0,
    needsRestrict: false,
    needsFullWindow: false,
    allowsSegmentedCompletion: false,
    allowsResourceChange: false,
    segmentMinDuration: 0,
    maxOverlapDuration: 0,
    exactOverlapDuration: 0,
    overlapType: 1
  }
})

const createSnapshot = ({ name, description, createdAt, resources, tasks }) => ({
  manifest: {
    format: PLANNING_PACKAGE_FORMAT,
    version: PLANNING_PACKAGE_VERSION,
    createdAt
  },
  basicConfig: {
    packageName: name,
    packageDescription: description,
    timeRange: [SCENARIO_START, SCENARIO_END],
    resourceMinValue: 1,
    resourceMaxValue: 10,
    resourceRule: 1,
    taskMinValue: 1,
    taskMaxValue: 10,
    taskRule: 1
  },
  resourceDetail: {
    resourceFormHeadList: resources.map(({ formHead }) => formHead),
    resourceBasicInfoList: resources.map(({ basicInfo }) => basicInfo),
    resourceUsabilityList: resources.map(({ usability }) => usability),
    resourceThreePartsList: resources.map(({ threeParts }) => threeParts),
    resourceOccupancyMap: []
  },
  taskDetail: {
    taskFormHeadList: tasks.map(({ formHead }) => formHead),
    taskBasicInfoList: tasks.map(({ basicInfo }) => basicInfo),
    taskPropList: tasks.map(({ prop }) => prop),
    taskDurationList: tasks.map(({ duration }) => duration),
    taskSchedulerStateMap: []
  },
  constraints: {
    anchorConstraintList: [],
    temporalConstraintList: [],
    logicalConstraintList: []
  },
  resourceCatalog: {
    resourceGroupList: [],
    cekongResourceList: []
  },
  execution: {
    preprocessOutput: { continuousEvents: [], discreteEvents: [] },
    algorithmOutput: { outputText: '' }
  }
})

const sharedResources = () => [
  makeResource('resource-tl201', 'TIANLIAN_2-01', [
    ['2026-09-14 00:30:00', '2026-09-14 08:30:00'],
    ['2026-09-15 01:00:00', '2026-09-15 09:00:00'],
    ['2026-09-16 02:00:00', '2026-09-16 10:00:00']
  ]),
  makeResource('resource-tl202', 'TIANLIAN_2-02', [
    ['2026-09-14 06:00:00', '2026-09-14 14:00:00'],
    ['2026-09-15 07:00:00', '2026-09-15 15:00:00'],
    ['2026-09-16 08:00:00', '2026-09-16 16:00:00']
  ]),
  makeResource('resource-beijing', 'BEIJING', [
    ['2026-09-14 12:00:00', '2026-09-14 20:00:00'],
    ['2026-09-15 13:00:00', '2026-09-15 21:00:00'],
    ['2026-09-16 14:00:00', '2026-09-16 22:00:00']
  ])
]

const scenarioFactories = {
  'small-continuous': () =>
    createSnapshot({
      name: '2026 小型连续任务',
      description: '3 个连续跟踪任务与 2 个天链测控资源，适合快速体验完整调度流程。',
      createdAt: '2026-09-01T00:00:00.000Z',
      resources: sharedResources().slice(0, 2),
      tasks: [
        makeTask({
          key: 'FK-2-1',
          window: ['2026-09-14 00:00:00', '2026-09-14 16:00:00'],
          duration: 5400,
          priority: 3,
          note: '核心舱连续跟踪任务'
        }),
        makeTask({
          key: 'FK-2-2',
          window: ['2026-09-15 00:00:00', '2026-09-15 17:00:00'],
          duration: 4800,
          priority: 2,
          note: '实验舱连续跟踪任务'
        }),
        makeTask({
          key: 'FK-2-3',
          window: ['2026-09-16 01:00:00', '2026-09-16 18:00:00'],
          duration: 4200,
          priority: 1,
          note: '组合体连续跟踪任务'
        })
      ]
    }),
  'non-continuous-control': () =>
    createSnapshot({
      name: '2026 非连续测控任务',
      description: '6 个非连续飞控任务与 3 个测控资源，展示资源竞争和优先级安排。',
      createdAt: '2026-09-02T00:00:00.000Z',
      resources: sharedResources(),
      tasks: [
        ['FK-1-1', '2026-09-14 00:00:00', '2026-09-14 10:00:00', 900, 3],
        ['FK-1-2', '2026-09-14 05:00:00', '2026-09-14 21:00:00', 720, 2],
        ['FK-1-3', '2026-09-15 00:00:00', '2026-09-15 11:00:00', 840, 3],
        ['FK-1-4', '2026-09-15 06:00:00', '2026-09-15 22:00:00', 600, 1],
        ['FK-1-5', '2026-09-16 01:00:00', '2026-09-16 12:00:00', 780, 2],
        ['FK-1-6', '2026-09-16 07:00:00', '2026-09-16 23:00:00', 660, 1]
      ].map(([key, start, end, duration, priority]) =>
        makeTask({ key, window: [start, end], duration, priority })
      )
    }),
  'integrated-demo': () =>
    createSnapshot({
      name: '2026 综合演示',
      description: '连续与非连续任务混合场景，用于体验规划包、预处理、调度结果和报告。',
      createdAt: '2026-09-03T00:00:00.000Z',
      resources: sharedResources(),
      tasks: [
        makeTask({
          key: 'FK-2-11',
          window: ['2026-09-14 00:00:00', '2026-09-14 16:00:00'],
          duration: 4500,
          priority: 3,
          note: '综合演示连续跟踪任务'
        }),
        makeTask({
          key: 'FK-2-12',
          window: ['2026-09-15 00:00:00', '2026-09-15 17:00:00'],
          duration: 4200,
          priority: 2,
          note: '综合演示连续跟踪任务'
        }),
        makeTask({
          key: 'FK-1-11',
          window: ['2026-09-14 04:00:00', '2026-09-14 20:00:00'],
          duration: 720,
          priority: 3
        }),
        makeTask({
          key: 'FK-1-12',
          window: ['2026-09-15 05:00:00', '2026-09-15 21:00:00'],
          duration: 840,
          priority: 2
        }),
        makeTask({
          key: 'FK-1-13',
          window: ['2026-09-16 06:00:00', '2026-09-16 22:00:00'],
          duration: 600,
          priority: 1
        })
      ]
    })
}

export const SAMPLE_PLANNING_PACKAGES = [
  {
    id: 'small-continuous',
    name: '2026 小型连续任务',
    filename: '2026-small-continuous.sts',
    summary: '3 个任务 / 2 个资源'
  },
  {
    id: 'non-continuous-control',
    name: '2026 非连续测控任务',
    filename: '2026-non-continuous-control.sts',
    summary: '6 个任务 / 3 个资源'
  },
  {
    id: 'integrated-demo',
    name: '2026 综合演示',
    filename: '2026-integrated-demo.sts',
    summary: '5 个任务 / 3 个资源'
  }
]

const getSample = (id) => SAMPLE_PLANNING_PACKAGES.find((sample) => sample.id === id)

export const createSamplePlanningPackageSnapshot = (id) => {
  const factory = scenarioFactories[id]
  if (!factory) throw new Error(`示例规划包不存在: ${id}`)
  return clone(factory())
}

export const buildSamplePlanningPackageDownload = async (ids) => {
  const uniqueIds = [...new Set(ids || [])]
  if (!uniqueIds.length) throw new Error('请至少选择一个示例规划包')

  const selected = uniqueIds.map((id) => {
    const sample = getSample(id)
    if (!sample) throw new Error(`示例规划包不存在: ${id}`)
    return sample
  })

  if (selected.length === 1) {
    const [sample] = selected
    return {
      blob: await createPlanningPackageBlob(createSamplePlanningPackageSnapshot(sample.id)),
      filename: sample.filename
    }
  }

  const zip = new JSZip()
  zip.file(
    PLANNING_PACKAGE_COLLECTION_FILE,
    JSON.stringify(
      {
        format: PLANNING_PACKAGE_COLLECTION_FORMAT,
        version: 1,
        createdAt: new Date().toISOString(),
        packages: selected.map(({ id, name, filename }) => ({ id, name, filename }))
      },
      null,
      2
    )
  )

  for (const sample of selected) {
    const bytes = await createPlanningPackageBytes(createSamplePlanningPackageSnapshot(sample.id))
    zip.file(sample.filename, bytes)
  }

  const bytes = await zip.generateAsync({ type: 'uint8array' })
  return {
    blob: new Blob([bytes], { type: 'application/zip' }),
    filename: '2026-sample-planning-packages.zip'
  }
}

export const downloadSamplePlanningPackages = async (ids) => {
  const result = await buildSamplePlanningPackageDownload(ids)
  downloadBlob(result.blob, result.filename)
  return result
}
