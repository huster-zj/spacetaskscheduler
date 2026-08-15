import { createRouter, createWebHistory } from 'vue-router'
import WorkSpace from '../views/WorkSpace.vue'
// 动态路由
import ResourceGroup from '@/views/resource/ResourceGroup.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'workSpace',
      component: WorkSpace
    },
    {
      path: '/attributes',
      name: 'attributes',
      component: () => import('../views/Attributes.vue')
    },
    {
      path: '/main_view',
      name: 'main_view',
      component: () => import('../views/MainView.vue')
    },
    {
      path: '/resource',
      name: 'resource',
      component: () => import('../views/resource/Resource.vue')
    },
    {
      path: '/resource_group',
      name: 'resource_group',
      // component: () => import('../views/resource/ResourceGroup.vue')
      component: ResourceGroup
    },
    {
      path: '/task',
      name: 'task',
      component: () => import('../views/task/Task.vue')
    },
    {
      path: '/temporal_constraint',
      name: 'temporal_constraint',
      component: () => import('../views/task/taskTem/TemporalConstraint.vue')
    },
    {
      path: '/logical_constraint',
      name: 'logical_constraint',
      component: () => import('../views/task/taskGroup/LogicalConstraint.vue')
    },
    {
      path: '/operating',
      name: 'operating',
      component: () => import('../views/Operating.vue')
    },
    {
      path: '/result',
      name: 'result',
      component: () => import('../views/Result.vue')
    },
    {
      path: '/report',
      name: 'report',
      component: () => import('../views/Report.vue')
    },
    {
      path: '/help',
      name: 'help',
      component: () => import('../views/Help.vue')
    },
    {
      path: '/license',
      name: 'license',
      component: () => import('../views/License.vue')
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/About.vue')
    },

    // 资源相关界面
    // 2. 资源详情界面
    {
      path: '/resource_detail/:key',
      name: 'resource_detail_custom',
      component: () => import('../views/resource/ResourceDetail.vue'),
      props: (route) => {
        console.log('index.js文件的资源详情页传入子组件参数', route.params.key)
        return {
          // 子组件可以接收到的数据
          resourceKey: route.params.key
        }
        // props: true
      }
    },
    {
      path: '/resource_detail',
      name: 'resource_detail',
      component: () => import('../views/resource/ResourceDetail.vue')
    },
    // 3. 测控资源列表界面
    {
      path: '/cekong_resource',
      name: 'cekong_resource',
      component: () => import('../views/resource/resourceList/CekongResource.vue')
    },
    // 3.1 测控资源详情界面
    {
      path: '/cekong_resource_detail/:cekong_resource_key/:cekong_resource_name',
      name: 'cekong_resource_detail',
      component: () => import('../views/resource/resourceList/CekongResourceDetail.vue'),
      props: (route) => ({
        cekong_resource_key: route.params.cekong_resource_key,
        cekong_resource_name: route.params.cekong_resource_name
      })
    },
    // 4. 资源组定义界面
    {
      path: '/new_resource_group',
      name: 'new_resource_group',
      component: () => import('../views/resource/NewResourceGroup.vue')
    },
    // 5. 资源组详情界面
    {
      // path: '/resource_group_detail',
      path: '/resource_group_detail/:name',
      name: 'ResourceGroupDetail',
      component: () => import('../views/resource/ResourceGroupDetail.vue'),
      props: (route) => {
        console.log('dcabcsbcebfc index.js文件', route.params.name)
        return {
          // 子组件可以接收到的数据
          name: route.params.name
        }
        // props: true
      }
    },

    // 任务相关界面
    // 2. 任务详情界面
    {
      path: '/task_detail/:key',
      name: 'task_detail_custom',
      component: () => import('../views/task/TaskDetail.vue'),
      props: (route) => {
        console.log('index.js文件任务详情页传入子组件参数', route.params.key)
        return {
          // 子组件可以接收到的数据
          taskKey: route.params.key
        }
        // props: true
      }
    },
    {
      path: '/task_detail',
      name: 'task_detail',
      component: () => import('../views/task/TaskDetail.vue')
    },
    // 3. 时态--时态约束定义界面
    {
      path: '/custom_tem_constraint',
      name: 'custom_tem_constraint',
      component: () => import('../views/task/taskTem/CustomTemConstraints.vue')
    },
    // 4. 逻辑约束（任务组）定义界面
    {
      path: '/custom_logical_constraint',
      name: 'custom_logical_constraint',
      component: () => import('../views/task/taskGroup/CustomLogicalContraint.vue')
    },
    // 5. 时态-时态约束详情界面
    {
      path: '/tem_constraint_detail/:task1-:task2',
      name: 'TemConstraintDetail',
      component: () => import('@/views/task/taskTem/TemConstraintDetail.vue'),
      props: (route) => {
        // console.log('dcabcsbcebfc index.js文件', route.params.task1, route.params.task2)
        return {
          // 子组件可以接收到的数据
          task1: route.params.task1,
          task2: route.params.task2
        }
      }
    },
    // 6. 逻辑约束详情界面
    {
      path: '/logical_constraint_detail/:name',
      name: 'LogicalConstraintDetail',
      component: () => import('@/views/task/taskGroup/LogicalContraintDetail.vue'),
      props: (route) => {
        console.log('dcabcsbcebfc index.js文件', route.params.name)
        return {
          // 子组件可以接收到的数据
          name: route.params.name
        }
      }
    },

    // 报告界面
    {
      path: '/report_content/:type',
      name: 'report_content',
      component: () => import('@/views/ReportContent.vue')
    }
  ]
})

export default router
