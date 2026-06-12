// import { useLogicalConstraintsListStore } from '@/stores/useLogicalConstraintsListStore.js'

import { defineStore } from "pinia";
import { ref } from "vue";
import { nanoid } from "nanoid";

export const useLogicalConstraintsListStore = defineStore("logicalConstraintsList", () => {
  // 定义一个数组来存储 logicalConstraints 对象
  // const logicalConstraintsList = ref([
  //   {
  //     key:'1',
  //     task_group_name: '任务组1',
  //     task_group_note: 'store测试1',
  //     task_relationship: '互斥',
  //     task_group_includeTaskList: [
  //       { key: '1',
  //         name: '任务1'
  //       },
  //       { key: '2',
  //         name: '任务2'
  //       }
  //     ],
  //     task_group_excludeTaskList: [
  //       { key: '3',
  //         name: '任务3'
  //       },
  //       { key: '4',
  //         name: '任务4'
  //       }
  //     ]
  //   },
  //   {
  //     key:'2',
  //     task_group_name: '任务组2',
  //     task_group_note: 'store测试2',
  //     task_relationship: '互斥',
  //     task_group_includeTaskList: [
  //       { key: '1',
  //         name: '任务1'
  //       },
  //       { key: '2',
  //         name: '任务2'
  //       }
  //     ],
  //     task_group_excludeTaskList: [
  //       { key: '3',
  //         name: '任务3'
  //       },
  //       { key: '4',
  //         name: '任务4'
  //       }
  //     ]
  //   }
  // ])
  const logicalConstraintsList = ref([])

  // 定义logicalConstraints对象的属性
  const createLogicalConstraints = (task_group_name='', task_group_note='', task_relationship='', task_group_includeTaskList=[], task_group_excludeTaskList=[]) => {
    return {
      key: nanoid(),
      task_group_name: task_group_name,
      task_group_note: task_group_note,
      task_relationship: task_relationship,
      task_group_includeTaskList: task_group_includeTaskList,
      task_group_excludeTaskList: task_group_excludeTaskList
    }
  }

  // 添加logicalConstraints对象
  const addLogicalConstraints = (newLogicalConstraints) => {
    logicalConstraintsList.value.push(createLogicalConstraints(
      newLogicalConstraints.task_group_name, 
      newLogicalConstraints.task_group_note,
      newLogicalConstraints.task_relationship,
      newLogicalConstraints.task_group_includeTaskList, 
      newLogicalConstraints.task_group_excludeTaskList
      ))
  }

  // 更新logicalConstraints对象
  const updateLogicalConstraints = (index, newLogicalConstraints) => {
    if(newLogicalConstraints){
      Object.assign(logicalConstraintsList[index], newLogicalConstraints)
    }
    // const index = logicalConstraintsList.findIndex((logicalConstraints) => logicalConstraints.key === key)
    // if (index !== -1) {
    //   Object.assign(logicalConstraintsList[index], newLogicalConstraints)
    // }
  }

  // 删除logicalConstraints对象
  
  const deleteLogicalConstraints = (index) => {
      logicalConstraintsList.value.splice(index, 1)
    // const index = logicalConstraintsList.findIndex((logicalConstraints) => logicalConstraints.key === key)
    // if (index !== -1) {
    //   logicalConstraintsList.splice(index, 1)
    // }
  }

  return {
    logicalConstraintsList,
    addLogicalConstraints,
    updateLogicalConstraints,
    deleteLogicalConstraints
  }
},
{
  // 定义一个持久化的策略，将数据存储在 sessionStorage 中
  persist: {
  enabled: true,
  key: 'logicalConstraintsList',
  storage: sessionStorage
  }
 }
)