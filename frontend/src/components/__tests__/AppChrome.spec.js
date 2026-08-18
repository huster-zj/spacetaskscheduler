// @vitest-environment jsdom

import { flushPromises, mount } from '@vue/test-utils'
import * as Icons from '@ant-design/icons-vue'
import { createMemoryHistory, createRouter } from 'vue-router'
import { beforeEach, describe, expect, it } from 'vitest'

import AppHeader from '../AppHeader.vue'
import NavigationBar from '../NavigationBar.vue'
import Steps from '../Steps.vue'
import { AUTH_SESSION_KEY } from '../../services/auth'

const routes = [
  { path: '/', component: { template: '<div />' } },
  { path: '/attributes', component: { template: '<div />' } },
  { path: '/main_view', component: { template: '<div />' } },
  { path: '/resource', component: { template: '<div />' } },
  { path: '/resource_group', component: { template: '<div />' } },
  { path: '/task', component: { template: '<div />' } },
  { path: '/temporal_constraint', component: { template: '<div />' } },
  { path: '/logical_constraint', component: { template: '<div />' } },
  { path: '/operating', component: { template: '<div />' } },
  { path: '/result', component: { template: '<div />' } },
  { path: '/report', component: { template: '<div />' } },
  { path: '/report_detail', component: { template: '<div />' } },
  { path: '/help', component: { template: '<div />' } },
  { path: '/license', component: { template: '<div />' } },
  { path: '/about', component: { template: '<div />' } },
  { path: '/login', name: 'login', component: { template: '<div />' } }
]

const createTestRouter = async (path = '/') => {
  const router = createRouter({ history: createMemoryHistory(), routes })
  await router.push(path)
  await router.isReady()
  return router
}

describe('application chrome', () => {
  beforeEach(() => {
    sessionStorage.clear()
  })

  it('exposes the sample download as a named button', async () => {
    const router = await createTestRouter()
    const wrapper = mount(AppHeader, {
      slots: { default: '<nav data-test="primary-navigation" />' },
      global: {
        plugins: [router],
        components: Icons,
        stubs: {
          AButton: { template: '<button><slot /></button>' },
          ACheckbox: { template: '<label><input type="checkbox" /><slot /></label>' },
          APopover: { template: '<div><slot /></div>' }
        }
      }
    })

    const sampleButton = wrapper.get('button[aria-label="下载示例规划包"]')
    expect(sampleButton.attributes('aria-haspopup')).toBe('dialog')
    expect(sampleButton.attributes('aria-controls')).toBe('sample-selector')
    expect(sampleButton.attributes('aria-expanded')).toBe('false')
    expect(wrapper.get('.app-header__navigation nav').exists()).toBe(true)
    expect(wrapper.find('.brand__copy').exists()).toBe(false)
    expect(wrapper.find('.header-context').exists()).toBe(false)
  })

  it('keeps core destinations and marks the current route', async () => {
    const router = await createTestRouter('/task')
    const wrapper = mount(NavigationBar, {
      global: {
        plugins: [router],
        components: Icons,
        stubs: { AUpload: { template: '<div><slot /></div>' } }
      }
    })

    expect(wrapper.get('a[href="/resource"]').text()).toContain('资源')
    expect(wrapper.get('a[href="/task"]').attributes('aria-current')).toBe('page')
    expect(wrapper.get('a[href="/report"]').text()).toContain('报告')
    expect(wrapper.get('a[href="/help"]').text()).toContain('帮助中心')
    expect(wrapper.get('a[href="/license"]').text()).toContain('许可证')
    expect(wrapper.get('a[href="/about"]').text()).toContain('关于')
    expect(wrapper.get('.quick-tools').attributes('aria-label')).toBe('常用功能快捷入口')
    expect(wrapper.get('.quick-tool[aria-label="主视图"]').attributes('href')).toBe('/main_view')
    expect(wrapper.get('.quick-tool[aria-label="运行"]').attributes('href')).toBe('/operating')
    expect(wrapper.get('.quick-tool[aria-label="任务"]').classes()).toContain('is-active')
  })

  it('keeps a single active project command on the attributes route', async () => {
    const router = await createTestRouter('/attributes')
    const wrapper = mount(NavigationBar, {
      global: {
        plugins: [router],
        components: Icons,
        stubs: { AUpload: { template: '<div><slot /></div>' } }
      }
    })

    expect(wrapper.findAll('.command-item.is-active')).toHaveLength(1)
    expect(wrapper.get('a[href="/attributes"]').attributes('aria-current')).toBe('page')
  })

  it('clears the session and returns to login when signing out', async () => {
    sessionStorage.setItem(AUTH_SESSION_KEY, 'authenticated')
    const router = await createTestRouter('/task')
    const wrapper = mount(AppHeader, {
      global: {
        plugins: [router],
        components: Icons,
        stubs: {
          AButton: { template: '<button><slot /></button>' },
          ACheckbox: { template: '<label><input type="checkbox" /><slot /></label>' },
          APopover: { template: '<div><slot /></div>' }
        }
      }
    })

    await wrapper.get('button[aria-label="退出登录"]').trigger('click')
    await flushPromises()

    expect(sessionStorage.getItem(AUTH_SESSION_KEY)).toBeNull()
    expect(router.currentRoute.value.name).toBe('login')
  })

  it('keeps the planning step index and route mapping', async () => {
    const router = await createTestRouter('/resource')
    const wrapper = mount(Steps, {
      props: { current_page: 2 },
      global: {
        plugins: [router],
        stubs: {}
      }
    })

    expect(wrapper.attributes('data-current-step')).toBe('2')
    expect(wrapper.get('.workflow-strip__current').text()).toContain('定义资源')
    expect(wrapper.text()).toContain('定义资源')
    expect(wrapper.find('.workflow-strip__progress').exists()).toBe(false)
    expect(wrapper.text()).not.toContain('/ 10')
    expect(wrapper.findAll('.workflow-step--major')).toHaveLength(5)
    expect(wrapper.findAll('.workflow-step--group-end')).toHaveLength(4)
    expect(wrapper.findAll('.workflow-step--complete')).toHaveLength(2)
    expect(wrapper.get('button[aria-label="定义资源"]').attributes('aria-current')).toBe('step')
    expect(wrapper.findAll('.workflow-step__button')[5].attributes('disabled')).toBeDefined()
    await wrapper.get('button[aria-label="资源"]').trigger('click')
    expect(router.currentRoute.value.path).toBe('/resource')
  })
})
