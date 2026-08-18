// @vitest-environment jsdom

import { flushPromises, mount } from '@vue/test-utils'
import dayjs from 'dayjs'
import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import Attributes from '../Attributes.vue'
import { useConfigStore } from '@/stores/useConfigStore'

let pinia

const mountAttributes = () => mount(Attributes, {
  global: {
    plugins: [pinia],
    stubs: {
      Steps: { template: '<div />' },
      RouterLink: { template: '<a><slot /></a>' },
      ACol: { template: '<div><slot /></div>' },
      ARow: { template: '<div><slot /></div>' },
      AInput: {
        props: ['value'],
        emits: ['update:value'],
        template: '<input :value="value" @input="$emit(\'update:value\', $event.target.value)" />'
      },
      AInputNumber: {
        props: ['value'],
        emits: ['update:value'],
        template: '<input :value="value" @input="$emit(\'update:value\', Number($event.target.value))" />'
      },
      ARangePicker: {
        props: ['value'],
        emits: ['update:value'],
        template: '<button type="button" @click="$emit(\'update:value\', value)">时间范围</button>'
      },
      ARadioGroup: {
        props: ['value'],
        emits: ['update:value'],
        template: '<div><slot /></div>'
      },
      ARadio: { template: '<label><slot /></label>' },
      ATypographyTitle: { template: '<h3><slot /></h3>' }
    }
  }
})

describe('planning attributes auto-save', () => {
  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('does not render the old save button or save during initial hydration', () => {
    const store = useConfigStore()
    const updateConfig = vi.spyOn(store, 'updateConfig')
    const wrapper = mountAttributes()

    expect(wrapper.find('button.custom_btn').exists()).toBe(false)
    expect(wrapper.get('[role="status"]').text()).toContain('自动保存')
    expect(updateConfig).not.toHaveBeenCalled()
  })

  it('debounces consecutive field changes into one complete config update', async () => {
    const store = useConfigStore()
    const updateConfig = vi.spyOn(store, 'updateConfig')
    const wrapper = mountAttributes()

    wrapper.vm.localConfig.packageName = '星链规划'
    wrapper.vm.localConfig.packageDescription = '夜间窗口'
    await wrapper.vm.$nextTick()

    expect(wrapper.get('[role="status"]').text()).toContain('待保存')
    vi.advanceTimersByTime(399)
    expect(updateConfig).not.toHaveBeenCalled()

    vi.advanceTimersByTime(1)
    await flushPromises()

    expect(updateConfig).toHaveBeenCalledTimes(1)
    expect(updateConfig).toHaveBeenCalledWith(expect.objectContaining({
      packageName: '星链规划',
      packageDescription: '夜间窗口'
    }))
    expect(wrapper.get('[role="status"]').text()).toContain('已保存')
  })

  it('persists the edited time range as ISO strings', async () => {
    const store = useConfigStore()
    const updateConfig = vi.spyOn(store, 'updateConfig')
    const wrapper = mountAttributes()
    const start = dayjs('2026-08-18T08:00:00+08:00')
    const end = dayjs('2026-08-18T12:00:00+08:00')

    wrapper.vm.localTimeRange = [start, end]
    await wrapper.vm.$nextTick()
    vi.advanceTimersByTime(400)
    await flushPromises()

    expect(updateConfig).toHaveBeenCalledWith(expect.objectContaining({
      timeRange: [start.toISOString(), end.toISOString()]
    }))
  })

  it('flushes pending changes when the page is unmounted', async () => {
    const store = useConfigStore()
    const updateConfig = vi.spyOn(store, 'updateConfig')
    const wrapper = mountAttributes()

    wrapper.vm.localConfig.packageName = '离开前保存'
    await wrapper.vm.$nextTick()
    wrapper.unmount()

    expect(updateConfig).toHaveBeenCalledTimes(1)
    expect(updateConfig).toHaveBeenCalledWith(expect.objectContaining({ packageName: '离开前保存' }))
  })

  it('keeps the form value and exposes a retryable error state when saving fails', async () => {
    const store = useConfigStore()
    const updateConfig = vi.spyOn(store, 'updateConfig').mockImplementation(() => {
      throw new Error('存储不可用')
    })
    const wrapper = mountAttributes()

    wrapper.vm.localConfig.packageName = '第一次失败'
    await wrapper.vm.$nextTick()
    vi.advanceTimersByTime(400)
    await flushPromises()

    expect(wrapper.vm.localConfig.packageName).toBe('第一次失败')
    expect(wrapper.get('[role="status"]').text()).toContain('自动保存失败')

    updateConfig.mockImplementation((value) => {
      Object.assign(store.basicConfig, value)
    })
    wrapper.vm.localConfig.packageName = '重试成功'
    await wrapper.vm.$nextTick()
    vi.advanceTimersByTime(400)
    await flushPromises()

    expect(wrapper.get('[role="status"]').text()).toContain('已保存')
  })
})
