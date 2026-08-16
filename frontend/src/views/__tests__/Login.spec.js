// @vitest-environment jsdom

import { flushPromises, mount } from '@vue/test-utils'
import * as Icons from '@ant-design/icons-vue'
import { createMemoryHistory, createRouter } from 'vue-router'
import { beforeEach, describe, expect, it } from 'vitest'

import Login from '../Login.vue'
import { isAuthenticated } from '@/services/auth'

const mountLogin = async (initialPath = '/login') => {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', name: 'workSpace', component: { template: '<div>workspace</div>' } },
      { path: '/task', name: 'task', component: { template: '<div>task</div>' } },
      { path: '/login', name: 'login', component: Login }
    ]
  })
  await router.push(initialPath)
  await router.isReady()

  const wrapper = mount(Login, {
    global: { plugins: [router], components: Icons }
  })

  return { wrapper, router }
}

describe('login page', () => {
  beforeEach(() => {
    sessionStorage.clear()
  })

  it('shows the default account hint without prefilling the password', async () => {
    const { wrapper } = await mountLogin()

    expect(wrapper.text()).toContain('admin')
    expect(wrapper.text()).toContain('123456')
    expect(wrapper.get('input[name="username"]').element.value).toBe('')
    expect(wrapper.get('input[name="password"]').element.value).toBe('')
    expect(wrapper.get('input[name="password"]').attributes('type')).toBe('password')

    await wrapper.get('button[aria-label="显示密码"]').trigger('click')
    expect(wrapper.get('input[name="password"]').attributes('type')).toBe('text')
  })

  it('reports invalid credentials without authenticating', async () => {
    const { wrapper } = await mountLogin()

    await wrapper.get('input[name="username"]').setValue('admin')
    await wrapper.get('input[name="password"]').setValue('wrong')
    await wrapper.get('form').trigger('submit')

    expect(wrapper.get('[role="alert"]').text()).toContain('账号或密码错误')
    expect(isAuthenticated()).toBe(false)
  })

  it('authenticates and returns to a safe requested route', async () => {
    const { wrapper, router } = await mountLogin('/login?redirect=/task')

    await wrapper.get('input[name="username"]').setValue('admin')
    await wrapper.get('input[name="password"]').setValue('123456')
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(isAuthenticated()).toBe(true)
    expect(router.currentRoute.value.path).toBe('/task')
  })

  it('submits the login form when Enter is pressed in the password field', async () => {
    const { wrapper, router } = await mountLogin('/login?redirect=/task')

    await wrapper.get('input[name="username"]').setValue('admin')
    await wrapper.get('input[name="password"]').setValue('123456')
    await wrapper.get('input[name="password"]').trigger('keydown.enter')
    await flushPromises()

    expect(isAuthenticated()).toBe(true)
    expect(router.currentRoute.value.path).toBe('/task')
  })
})
