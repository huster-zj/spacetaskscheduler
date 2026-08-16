import JSZip from 'jszip'

import {
  useBasicInfoStore as resource_useBasicInfoStore,
  useFormHeadStore as resource_useFormHeadStore,
  useOccupancyStore as resource_useOccupancyStore,
  useThreePartsStore as resource_useThreePartsStore,
  useUsabilityStore as resource_useUsabilityStore
} from '@/stores/resourceDetailNumStore'
import {
  useBasicInfoStore as task_useBasicInfoStore,
  useDurationStore as task_useDurationStore,
  useFormHeadStore as task_useFormHeadStore,
  usePropStore as task_usePropStore,
  useSchedulerStateStore as task_useSchedulerStateStore
} from '@/stores/taskDetailNumStore'
import { useTaskResourcePoolStore } from '@/stores/useTaskResourcePoolStore'
import { useAlgorithmOutputStore } from '@/stores/useAlgorithmOutput'
import {
  createDefaultAnchorConstraints,
  normalizeAnchorConstraints,
  useAnchorContraintListStore
} from '@/stores/useAnchorContraintListStore'
import { useCekongResourceListStore } from '@/stores/useCekongResourceListStore'
import { useConfigStore } from '@/stores/useConfigStore'
import { useFileDetailStore } from '@/stores/useFileDetailStore'
import { useLogicalConstraintsListStore } from '@/stores/useLogicalConstraintsListStore'
import { usePreprocessOutputStore } from '@/stores/usePreprocessOutput'
import { useResourceGroupListStore } from '@/stores/useResourceGroupListStore'
import { useTemConstraintsListStore } from '@/stores/useTemConstraintsListStore'

export const PLANNING_PACKAGE_FORMAT = 'space-task-scheduler'
export const PLANNING_PACKAGE_VERSION = 2
export const PLANNING_PACKAGE_COLLECTION_FILE = 'sample-collection.json'
export const PLANNING_PACKAGE_COLLECTION_FORMAT = 'space-task-scheduler-sample-collection'

const EMPTY_CONFIG = {
  packageName: '',
  packageDescription: '',
  timeRange: [],
  resourceMinValue: 1,
  resourceMaxValue: 10,
  resourceRule: 1,
  taskMinValue: 1,
  taskMaxValue: 10,
  taskRule: 1
}

const EMPTY_ANCHOR_CONSTRAINTS = createDefaultAnchorConstraints()

const clone = (value) => JSON.parse(JSON.stringify(value))
const mapToEntries = (value) => Array.from(value instanceof Map ? value.entries() : [])

const entriesToMap = (value) => {
  if (Array.isArray(value)) {
    return new Map(value.filter((entry) => Array.isArray(entry) && entry.length === 2))
  }
  return new Map()
}

const requireObject = (value, label) => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`${label} 格式不正确`)
  }
}

const requireArray = (value, label) => {
  if (!Array.isArray(value)) {
    throw new Error(`${label} 必须是数组`)
  }
}

const requireAlignedLists = (label, lists) => {
  const [head, ...details] = lists
  if (details.some((list) => list.length !== head.length)) {
    throw new Error(`${label}各明细列表长度不一致`)
  }

  head.forEach((item, index) => {
    requireObject(item, `${label}列表第 ${index + 1} 项`)
    if (item.key === undefined || item.key === null || item.key === '') {
      throw new Error(`${label}列表第 ${index + 1} 项缺少 key`)
    }

    details.forEach((list) => {
      requireObject(list[index], `${label}明细第 ${index + 1} 项`)
      if (String(list[index].key) !== String(item.key)) {
        throw new Error(`${label}各明细列表第 ${index + 1} 项 key 不一致`)
      }
    })
  })
}

const normalizeTaskBasicInfoList = (list) => list.map((item) => ({
  ...item,
  resourceRequirement: item.resourceRequirement ?? ''
}))

const normalizeTaskResourcePoolList = (list) => (Array.isArray(list) ? list : [])

const normalizePreprocessOutput = (value) => ({
  continuousEvents: Array.isArray(value?.continuousEvents) ? value.continuousEvents : [],
  discreteEvents: Array.isArray(value?.discreteEvents) ? value.discreteEvents : [],
  taskStates: value?.taskStates && typeof value.taskStates === 'object'
    ? value.taskStates
    : {}
})

const validateSnapshot = (snapshot) => {
  requireObject(snapshot, '规划包')
  requireObject(snapshot.basicConfig, '基本配置')
  requireObject(snapshot.resourceDetail, '资源数据')
  requireObject(snapshot.taskDetail, '任务数据')

  ;[
    ['资源列表', snapshot.resourceDetail.resourceFormHeadList],
    ['资源基本信息', snapshot.resourceDetail.resourceBasicInfoList],
    ['资源可用性', snapshot.resourceDetail.resourceUsabilityList],
    ['资源属性', snapshot.resourceDetail.resourceThreePartsList],
    ['任务列表', snapshot.taskDetail.taskFormHeadList],
    ['任务基本信息', snapshot.taskDetail.taskBasicInfoList],
    ['任务属性', snapshot.taskDetail.taskPropList],
    ['任务时长', snapshot.taskDetail.taskDurationList]
  ].forEach(([label, value]) => requireArray(value, label))

  requireAlignedLists('资源', [
    snapshot.resourceDetail.resourceFormHeadList,
    snapshot.resourceDetail.resourceBasicInfoList,
    snapshot.resourceDetail.resourceUsabilityList,
    snapshot.resourceDetail.resourceThreePartsList
  ])
  requireAlignedLists('任务', [
    snapshot.taskDetail.taskFormHeadList,
    snapshot.taskDetail.taskBasicInfoList,
    snapshot.taskDetail.taskPropList,
    snapshot.taskDetail.taskDurationList
  ])

  snapshot.taskDetail.taskBasicInfoList = normalizeTaskBasicInfoList(
    snapshot.taskDetail.taskBasicInfoList
  )
  snapshot.taskDetail.taskResourcePoolList = normalizeTaskResourcePoolList(
    snapshot.taskDetail.taskResourcePoolList
  )

  return snapshot
}

const getStores = () => ({
  config: useConfigStore(),
  resourceFormHead: resource_useFormHeadStore(),
  resourceBasicInfo: resource_useBasicInfoStore(),
  resourceUsability: resource_useUsabilityStore(),
  resourceThreeParts: resource_useThreePartsStore(),
  resourceOccupancy: resource_useOccupancyStore(),
  taskFormHead: task_useFormHeadStore(),
  taskBasicInfo: task_useBasicInfoStore(),
  taskProp: task_usePropStore(),
  taskDuration: task_useDurationStore(),
  taskSchedulerState: task_useSchedulerStateStore(),
  taskResourcePools: useTaskResourcePoolStore(),
  anchorConstraints: useAnchorContraintListStore(),
  temporalConstraints: useTemConstraintsListStore(),
  logicalConstraints: useLogicalConstraintsListStore(),
  resourceGroups: useResourceGroupListStore(),
  cekongResources: useCekongResourceListStore(),
  preprocessOutput: usePreprocessOutputStore(),
  algorithmOutput: useAlgorithmOutputStore()
})

export const createPlanningPackageSnapshot = () => {
  const stores = getStores()
  stores.anchorConstraints.ensureAnchorConstraints()
  const snapshot = {
    manifest: {
      format: PLANNING_PACKAGE_FORMAT,
      version: PLANNING_PACKAGE_VERSION,
      createdAt: new Date().toISOString()
    },
    basicConfig: clone(stores.config.basicConfig),
    resourceDetail: {
      resourceFormHeadList: clone(stores.resourceFormHead.formHeadList),
      resourceBasicInfoList: clone(stores.resourceBasicInfo.basicInfoList),
      resourceUsabilityList: clone(stores.resourceUsability.usabilityList),
      resourceThreePartsList: clone(stores.resourceThreeParts.threePartsList),
      resourceOccupancyMap: clone(mapToEntries(stores.resourceOccupancy.occupancyMap))
    },
    taskDetail: {
      taskFormHeadList: clone(stores.taskFormHead.formHeadList),
      taskBasicInfoList: clone(stores.taskBasicInfo.basicInfoList),
      taskPropList: clone(stores.taskProp.propList),
      taskDurationList: clone(stores.taskDuration.durationList),
      taskSchedulerStateMap: clone(mapToEntries(stores.taskSchedulerState.schedulerStateMap)),
      taskResourcePoolList: clone(stores.taskResourcePools.taskResourcePoolList)
    },
    constraints: {
      anchorConstraintList: clone(stores.anchorConstraints.anchorContraintList),
      temporalConstraintList: clone(stores.temporalConstraints.temConstraintsList),
      logicalConstraintList: clone(stores.logicalConstraints.logicalConstraintsList)
    },
    resourceCatalog: {
      resourceGroupList: clone(stores.resourceGroups.customResourceGroupList),
      cekongResourceList: clone(stores.cekongResources.cekongResourceList)
    },
    execution: {
      preprocessOutput: normalizePreprocessOutput(clone(stores.preprocessOutput.preprocessOutput)),
      algorithmOutput: clone(stores.algorithmOutput.algorithmOutput)
    }
  }

  return validateSnapshot(snapshot)
}

export const restorePlanningPackageSnapshot = (inputSnapshot) => {
  const snapshot = validateSnapshot(clone(inputSnapshot))
  const stores = getStores()
  const constraints = snapshot.constraints || {}
  const resourceCatalog = snapshot.resourceCatalog || {}
  const execution = snapshot.execution || {}

  stores.config.basicConfig = { ...EMPTY_CONFIG, ...snapshot.basicConfig }
  stores.resourceFormHead.formHeadList = snapshot.resourceDetail.resourceFormHeadList
  stores.resourceBasicInfo.basicInfoList = snapshot.resourceDetail.resourceBasicInfoList
  stores.resourceUsability.usabilityList = snapshot.resourceDetail.resourceUsabilityList
  stores.resourceThreeParts.threePartsList = snapshot.resourceDetail.resourceThreePartsList
  stores.resourceOccupancy.occupancyMap = entriesToMap(snapshot.resourceDetail.resourceOccupancyMap)

  stores.taskFormHead.formHeadList = snapshot.taskDetail.taskFormHeadList
  stores.taskBasicInfo.basicInfoList = snapshot.taskDetail.taskBasicInfoList
  stores.taskProp.propList = snapshot.taskDetail.taskPropList
  stores.taskDuration.durationList = snapshot.taskDetail.taskDurationList
  stores.taskSchedulerState.schedulerStateMap = entriesToMap(snapshot.taskDetail.taskSchedulerStateMap)
  stores.taskResourcePools.replaceResourcePools(snapshot.taskDetail.taskResourcePoolList || [])

  stores.anchorConstraints.anchorContraintList = normalizeAnchorConstraints(
    constraints.anchorConstraintList
  )
  stores.anchorConstraints.ensureAnchorConstraints()
  stores.temporalConstraints.temConstraintsList = clone(constraints.temporalConstraintList || [])
  stores.logicalConstraints.logicalConstraintsList = clone(constraints.logicalConstraintList || [])
  stores.resourceGroups.customResourceGroupList = clone(resourceCatalog.resourceGroupList || [])
  stores.cekongResources.cekongResourceList = clone(resourceCatalog.cekongResourceList || [])
  stores.preprocessOutput.preprocessOutput = normalizePreprocessOutput(execution.preprocessOutput)
  stores.algorithmOutput.algorithmOutput = clone(execution.algorithmOutput || { outputText: '' })

  return snapshot
}

export const createEmptyPlanningPackage = () => ({
  manifest: {
    format: PLANNING_PACKAGE_FORMAT,
    version: PLANNING_PACKAGE_VERSION,
    createdAt: new Date().toISOString()
  },
  basicConfig: clone(EMPTY_CONFIG),
  resourceDetail: {
    resourceFormHeadList: [],
    resourceBasicInfoList: [],
    resourceUsabilityList: [],
    resourceThreePartsList: [],
    resourceOccupancyMap: []
  },
  taskDetail: {
    taskFormHeadList: [],
    taskBasicInfoList: [],
    taskPropList: [],
    taskDurationList: [],
    taskSchedulerStateMap: [],
    taskResourcePoolList: []
  },
  constraints: {
    anchorConstraintList: clone(EMPTY_ANCHOR_CONSTRAINTS),
    temporalConstraintList: [],
    logicalConstraintList: []
  },
  resourceCatalog: {
    resourceGroupList: [],
    cekongResourceList: []
  },
  execution: {
    preprocessOutput: normalizePreprocessOutput(),
    algorithmOutput: { outputText: '' }
  }
})

export const resetPlanningPackage = () => {
  const snapshot = restorePlanningPackageSnapshot(createEmptyPlanningPackage())
  useFileDetailStore().setCurrentFile(null)
  return snapshot
}

const readJsonFile = async (zip, path, { required = false } = {}) => {
  const file = zip.file(path)
  if (!file) {
    if (required) {
      throw new Error(`规划包缺少 ${path}`)
    }
    return null
  }

  try {
    return JSON.parse(await file.async('string'))
  } catch {
    throw new Error(`${path} 不是有效的 JSON 文件`)
  }
}

export const readPlanningPackage = async (file) => {
  if (!file) {
    throw new Error('请选择规划包文件')
  }

  let zip
  try {
    zip = await JSZip.loadAsync(await file.arrayBuffer())
  } catch {
    throw new Error('无法读取该文件，请选择有效的 .sts 规划包')
  }

  const collectionManifest = await readJsonFile(zip, PLANNING_PACKAGE_COLLECTION_FILE)
  if (collectionManifest?.format === PLANNING_PACKAGE_COLLECTION_FORMAT) {
    throw new Error('这是示例规划包合集，请先解压 ZIP，再选择其中一个 .sts 文件打开')
  }

  const manifest = await readJsonFile(zip, 'manifest.json')
  if (manifest?.format && manifest.format !== PLANNING_PACKAGE_FORMAT) {
    throw new Error('该文件不是航天任务调度工具规划包')
  }

  const manifestVersion = Number(manifest?.version || 1)
  if (!Number.isInteger(manifestVersion) || manifestVersion < 1) {
    throw new Error('manifest.json 中的版本号无效')
  }
  if (manifestVersion > PLANNING_PACKAGE_VERSION) {
    throw new Error('该规划包由更高版本创建，请升级工具后再打开')
  }
  const requiresCompleteSnapshot = Boolean(manifest) && manifestVersion >= 2

  const [
    basicConfig,
    resourceDetail,
    taskDetail,
    constraints,
    resourceCatalog,
    execution,
    legacyAnchors
  ] = await Promise.all([
    readJsonFile(zip, 'basicConfig.json', { required: true }),
    readJsonFile(zip, 'resourceDetail.json', { required: true }),
    readJsonFile(zip, 'taskDetail.json', { required: true }),
    readJsonFile(zip, 'constraintDetail.json', { required: requiresCompleteSnapshot }),
    readJsonFile(zip, 'resourceCatalog.json', { required: requiresCompleteSnapshot }),
    readJsonFile(zip, 'executionDetail.json', { required: requiresCompleteSnapshot }),
    readJsonFile(zip, 'anchorContraintList.json')
  ])

  return validateSnapshot({
    manifest: manifest ? { ...manifest, version: manifestVersion } : {
      format: PLANNING_PACKAGE_FORMAT,
      version: 1,
      createdAt: new Date().toISOString()
    },
    basicConfig,
    resourceDetail: {
      resourceFormHeadList: resourceDetail.resourceFormHeadList || [],
      resourceBasicInfoList: resourceDetail.resourceBasicInfoList || [],
      resourceUsabilityList: resourceDetail.resourceUsabilityList || [],
      resourceThreePartsList: resourceDetail.resourceThreePartsList || [],
      resourceOccupancyMap: resourceDetail.resourceOccupancyMap || []
    },
    taskDetail: {
      taskFormHeadList: taskDetail.taskFormHeadList || [],
      taskBasicInfoList: taskDetail.taskBasicInfoList || [],
      taskPropList: taskDetail.taskPropList || [],
      taskDurationList: taskDetail.taskDurationList || [],
      taskSchedulerStateMap: taskDetail.taskSchedulerStateMap || [],
      taskResourcePoolList: taskDetail.taskResourcePoolList || []
    },
    constraints: constraints || {
      anchorConstraintList: legacyAnchors || clone(EMPTY_ANCHOR_CONSTRAINTS),
      temporalConstraintList: [],
      logicalConstraintList: []
    },
    resourceCatalog: resourceCatalog || { resourceGroupList: [], cekongResourceList: [] },
    execution: execution || {
      preprocessOutput: { continuousEvents: [], discreteEvents: [] },
      algorithmOutput: { outputText: '' }
    }
  })
}

const addSnapshotFiles = (zip, snapshot) => {
  const json = (value) => JSON.stringify(value, null, 2)
  zip.file('manifest.json', json(snapshot.manifest))
  zip.file('basicConfig.json', json(snapshot.basicConfig))
  zip.file('resourceDetail.json', json(snapshot.resourceDetail))
  zip.file('taskDetail.json', json(snapshot.taskDetail))
  zip.file('constraintDetail.json', json(snapshot.constraints))
  zip.file('resourceCatalog.json', json(snapshot.resourceCatalog))
  zip.file('executionDetail.json', json(snapshot.execution))
  zip.file('anchorContraintList.json', json(snapshot.constraints.anchorConstraintList))
}

const sanitizeFilename = (value) =>
  String(value || '')
    .trim()
    .replace(/[\\/:*?"<>|]/g, '-')
    .replace(/\.(sts|zip)$/i, '')

const defaultFilename = (snapshot) => {
  const packageName = sanitizeFilename(snapshot.basicConfig.packageName)
  if (packageName) return `${packageName}.sts`

  const now = new Date()
  const stamp = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
    String(now.getHours()).padStart(2, '0'),
    String(now.getMinutes()).padStart(2, '0')
  ].join('')
  return `${stamp}_规划包.sts`
}

export const downloadBlob = (blob, filename) => {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

export const createPlanningPackageBytes = async (snapshot) => {
  const validatedSnapshot = validateSnapshot(clone(snapshot))
  const zip = new JSZip()
  addSnapshotFiles(zip, validatedSnapshot)
  return zip.generateAsync({ type: 'uint8array' })
}

export const createPlanningPackageBlob = async (snapshot) => {
  const bytes = await createPlanningPackageBytes(snapshot)
  return new Blob([bytes], { type: 'application/zip' })
}

export const downloadPlanningPackageSnapshot = async (snapshot, filename) => {
  const validatedSnapshot = validateSnapshot(clone(snapshot))
  const blob = await createPlanningPackageBlob(validatedSnapshot)
  const outputFilename = `${sanitizeFilename(filename || defaultFilename(validatedSnapshot))}.sts`
  downloadBlob(blob, outputFilename)
  return { blob, filename: outputFilename }
}

export const saveZipFile = async () => {
  const snapshot = createPlanningPackageSnapshot()
  const historyStore = useFileDetailStore()
  const current = historyStore.getFile(historyStore.currentFileKey)
  const filename = current?.filename || defaultFilename(snapshot)
  const result = await downloadPlanningPackageSnapshot(snapshot, filename)
  const historyItem = historyStore.upsertFile({
    key: current?.key,
    filename: result.filename,
    snapshot,
    source: 'saved'
  })
  return { ...result, snapshot, historyItem }
}

export const handleFileChange = async (file) => {
  const snapshot = await readPlanningPackage(file)
  restorePlanningPackageSnapshot(snapshot)
  const historyItem = useFileDetailStore().upsertFile({
    filename: sanitizeFilename(file.name) + '.sts',
    snapshot,
    source: 'imported'
  })
  return { snapshot, historyItem }
}
