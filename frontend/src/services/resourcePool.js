import { nanoid } from 'nanoid'

const text = (value) => String(value ?? '').trim()
const normalizedName = (value) => text(value).toLocaleLowerCase()

const memberName = (value) => {
  if (typeof value === 'string') return text(value)
  if (!value || typeof value !== 'object') return ''
  return text(
    value.resourceName ||
      value.resource_name ||
      value.resourceGroupName ||
      value.resource_group_name ||
      value.name ||
      value.value ||
      value.key
  )
}

const unique = (values) => [...new Set((values || []).map(memberName).filter(Boolean))]

export const normalizeResourcePool = (value = {}) => {
  const source = value && typeof value === 'object' ? value : {}
  const selectionMode = source.selectionMode || source.mode || 'all'
  const requiredCount = Number(source.requiredCount ?? source.count)
  return {
    key: text(source.key || source.id) || nanoid(),
    taskKey: text(source.taskKey || source.task_key),
    poolName: text(source.poolName || source.name),
    selectionMode: selectionMode === 'count' ? 'count' : 'all',
    requiredCount: Number.isInteger(requiredCount) && requiredCount > 0 ? requiredCount : null,
    resourceList: unique(source.resourceList || source.resources),
    resourceGroupList: unique(source.resourceGroupList || source.groups)
  }
}

export const createResourcePool = (value = {}) => normalizeResourcePool(value)

const names = (items, field) => new Set((items || []).map((item) => text(item?.[field] || item?.name)).filter(Boolean))
const normalizedNames = (items, field) => new Set(
  (items || []).map((item) => normalizedName(item?.[field] || item?.name)).filter(Boolean)
)

export const expandResourcePoolMembers = (pool, resources = [], resourceGroups = []) => {
  const resourceNames = names(resources, 'resourceName')
  const groups = new Map(
    (resourceGroups || []).map((group) => [
      text(group?.resourceGroupName || group?.name),
      unique(group?.includeResourceList || group?.include).filter((name) =>
        resourceNames.has(name) && !unique(group?.excludeResourceList || group?.exclude).includes(name)
      )
    ])
  )
  const members = new Set(unique(pool?.resourceList).filter((name) => resourceNames.has(name)))
  unique(pool?.resourceGroupList).forEach((groupName) => {
    ;(groups.get(groupName) || []).forEach((name) => members.add(name))
  })
  return [...members]
}

export const validateResourcePool = (value, {
  resources = [],
  resourceGroups = [],
  existingPools = []
} = {}) => {
  const pool = normalizeResourcePool(value)
  const errors = []
  const resourceNames = names(resources, 'resourceName')
  const groupNames = names(resourceGroups, 'resourceGroupName')
  const normalizedResourceNames = normalizedNames(resources, 'resourceName')
  const normalizedGroupNames = normalizedNames(resourceGroups, 'resourceGroupName')
  const existingNames = new Set(
    (existingPools || [])
      .filter((item) => text(item?.key || item?.id) !== pool.key)
      .map((item) => normalizedName(item?.poolName || item?.name))
      .filter(Boolean)
  )

  const normalizedPoolName = normalizedName(pool.poolName)
  if (!pool.poolName) errors.push('资源池名称不能为空')
  if (['and', 'or'].includes(normalizedPoolName)) errors.push('资源池名称不能使用表达式运算符')
  if (
    normalizedResourceNames.has(normalizedPoolName) ||
    normalizedGroupNames.has(normalizedPoolName) ||
    existingNames.has(normalizedPoolName)
  ) {
    errors.push('资源池名称不能与资源、资源组或其他资源池重名')
  }
  if (!pool.resourceList.length && !pool.resourceGroupList.length) {
    errors.push('资源池至少需要加入一个资源或资源组')
  }
  pool.resourceList.forEach((name) => {
    if (!resourceNames.has(name)) errors.push('资源池包含未配置资源：' + name)
  })
  pool.resourceGroupList.forEach((name) => {
    if (!groupNames.has(name)) errors.push('资源池包含未配置资源组：' + name)
  })

  const memberCount = expandResourcePoolMembers(pool, resources, resourceGroups).length
  if (memberCount === 0) errors.push('资源池展开后至少需要包含一个有效资源')
  if (pool.selectionMode === 'count') {
    if (!Number.isInteger(pool.requiredCount) || pool.requiredCount <= 0) {
      errors.push('指定数量必须是正整数')
    } else if (pool.requiredCount > memberCount) {
      errors.push('指定数量不能超过资源池展开后的成员数量（' + memberCount + '）')
    }
  }

  return { valid: errors.length === 0, errors, pool, memberCount }
}
