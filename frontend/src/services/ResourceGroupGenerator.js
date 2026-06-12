import { nanoid } from 'nanoid'
import { reactive } from 'vue'
import { useFormHeadStore } from '@/stores/resourceDetailNumStore.js'

class ResourceGroupGenerator {
  generateResourceGroup(strategy) {
    switch (strategy) {
      case '空间站':
        return this.generateSpaceStationGroup()
      case '海洋工程':
        return this.generateOceanEngineeringGroup()
      case '无人机':
        return this.generateDroneGroup()
      default:
        throw new Error('未知的策略类型')
    }
  }

  generateSpaceStationGroup() {
    const formHeadStore = useFormHeadStore()
    let includeList = reactive([])
    let excludeList = reactive(formHeadStore.formHeadList.map(item=>({
      key: item.key,
      name: item.resourceName
    })));

    // 找出所有资源名称中的重复部分
    const findCommonParts = () => {
      const groups = {}
      
      // 将每个资源名称按'-'分割并分析
      excludeList.forEach(resource => {
        const [station, satellite] = resource.name.split('-')
        if (!groups[satellite]) {
          groups[satellite] = {
            stations: [],
            resources: []
          }
        }
        groups[satellite].stations.push(station)
        groups[satellite].resources.push(resource)
      })

      // 生成资源组
      const resourceGroups = []
      
      for (const [satellite, data] of Object.entries(groups)) {
        // 只处理有多个站点的卫星
        if (data.stations.length > 1) {
          // 创建新的资源组
          const group = {
            key: nanoid(),
            resourceGroupName: `${satellite}资源组`,
            resourceGroupNote: `无`,
            resourceType: '测控资源',
            includeResourceList: data.resources.map(resource => ({
              key: resource.key,
              name: resource.name
            })),
            // excludeResourceList为剩余的资源
            excludeResourceList: excludeList.filter(
              resource => !data.resources.find(r => r.key === resource.key)
            ).map(resource => ({
              key: resource.key,
              name: resource.name
            }))
          }
          
          resourceGroups.push(group)

          // 更新 includeList 和 excludeList
          data.resources.forEach(resource => {
            const index = excludeList.findIndex(r => r.key === resource.key)
            if (index !== -1) {
              includeList.push(excludeList[index])
              excludeList.splice(index, 1)
            }
          })
        }
      }

      return resourceGroups
    }

    return findCommonParts()
  }

  generateOceanEngineeringGroup() {
    return [
      {
        key: nanoid(),
        resourceGroupName: '海洋一号资源组',
        resourceGroupNote: '海洋工程卫星相关资源',
        resourceType: '海洋工程',
        includeResourceList: [
          { name: '海洋一号-地面站A', key: nanoid() },
          { name: '海洋一号-地面站B', key: nanoid() }
        ]
      }
    ]
  }

  generateDroneGroup() {
    return [
      {
        key: nanoid(),
        resourceGroupName: '无人机编队资源组',
        resourceGroupNote: '无人机编队相关资源',
        resourceType: '无人机',
        includeResourceList: [
          { name: '无人机A-控制站', key: nanoid() },
          { name: '无人机B-控制站', key: nanoid() }
        ]
      }
    ]
  }
}

export const resourceGroupGenerator = new ResourceGroupGenerator()