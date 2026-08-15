// @vitest-environment jsdom

import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  routerPush: vi.fn(),
  preprocessTaskTimewindow: vi.fn(),
  executeAlgorithm: vi.fn(),
  clearOutput: vi.fn(),
  emit: vi.fn()
}))

vi.mock('@/router', () => ({ default: { push: mocks.routerPush } }))
vi.mock('@/services/Preprocess.js', () => ({
  default: { preprocessTaskTimewindow: mocks.preprocessTaskTimewindow }
}))
vi.mock('@/services/Algorithm.js', () => ({
  default: { executeAlgorithm: mocks.executeAlgorithm }
}))
vi.mock('@/stores/useAlgorithmOutput.js', () => ({
  useAlgorithmOutputStore: () => ({ clearOutput: mocks.clearOutput })
}))
vi.mock('@/utils/eventBus.js', () => ({ default: { emit: mocks.emit } }))

import Operating from '@/views/Operating.vue'

const outputText = '调度结果\n飞控事件ID|状态|开始时间|结束时间|弧段ID\n任务-A|是|1735689600|1735693200|ARC-A'

const mountOperating = () => mount(Operating, {
  global: {
    stubs: {
      Steps: { template: '<div />' },
      AAlert: { template: '<div />' },
      ARadioGroup: { template: '<div><slot /></div>' },
      ARadio: { template: '<label><input type="radio" /><slot /></label>' },
      AButton: {
        props: ['disabled', 'loading'],
        emits: ['click'],
        template: '<button :disabled="disabled" @click="$emit(\'click\')"><slot /></button>'
      }
    }
  }
})

describe('operating result navigation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.preprocessTaskTimewindow.mockResolvedValue({ success: true })
    mocks.executeAlgorithm.mockResolvedValue({
      success: true,
      data: { output_text: outputText }
    })
  })

  it('opens the result route after a valid algorithm output', async () => {
    const wrapper = mountOperating()

    await wrapper.get('button.btn').trigger('click')
    await flushPromises()

    expect(mocks.routerPush).toHaveBeenCalledWith({ name: 'result' })
    expect(mocks.routerPush).not.toHaveBeenCalledWith('/main_view')
  })

  it('stays on the operating page when algorithm output is empty', async () => {
    mocks.executeAlgorithm.mockResolvedValue({ success: true, data: { output_text: '' } })
    const wrapper = mountOperating()

    await wrapper.get('button.btn').trigger('click')
    await flushPromises()

    expect(mocks.routerPush).not.toHaveBeenCalled()
  })
})

