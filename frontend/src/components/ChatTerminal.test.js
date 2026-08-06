// @vitest-environment jsdom

import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import ChatTerminal from './ChatTerminal.vue'
import { ChatError, streamChat } from '../lib/chatClient.js'

vi.mock('../lib/chatClient.js', async (importOriginal) => {
  const original = await importOriginal()
  return { ...original, streamChat: vi.fn() }
})

function deferredStream(onStart) {
  return ({ signal, onDelta }) =>
    new Promise((resolve, reject) => {
      onStart?.({ signal, onDelta, resolve, reject })
      signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')))
    })
}

function mountTerminal() {
  return mount(ChatTerminal, { props: { open: true } })
}

describe('ChatTerminal', () => {
  beforeEach(() => {
    streamChat.mockReset()
    Element.prototype.scrollTo = vi.fn()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('submits free-form history and appends deltas to one assistant message', async () => {
    streamChat.mockImplementation(async ({ messages, onDelta }) => {
      expect(messages.at(-1)).toEqual({ role: 'user', content: '介绍 GMTool' })
      onDelta('GM')
      onDelta(' 工具')
    })
    const wrapper = mountTerminal()

    await wrapper.get('#chat-question').setValue('介绍 GMTool')
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    const messages = wrapper.findAll('.chat-message p').map((node) => node.text())
    expect(messages).toContain('介绍 GMTool')
    expect(messages).toContain('GM 工具')
    expect(streamChat).toHaveBeenCalledOnce()
  })

  it('disables suggestions while streaming and stop aborts without an error', async () => {
    let signal
    streamChat.mockImplementation(
      deferredStream((context) => {
        signal = context.signal
        context.onDelta('partial')
      }),
    )
    const wrapper = mountTerminal()

    await wrapper.get('.chat-suggestions button').trigger('click')
    await flushPromises()
    expect(wrapper.get('.chat-suggestions button').attributes('disabled')).toBeDefined()
    expect(wrapper.get('#chat-question').attributes('disabled')).toBeDefined()

    await wrapper.get('[aria-label="停止生成"]').trigger('click')
    await flushPromises()

    expect(signal.aborted).toBe(true)
    expect(wrapper.text()).toContain('partial')
    expect(wrapper.text()).not.toContain('请求失败')
  })

  it('close aborts and emits close', async () => {
    let signal
    streamChat.mockImplementation(deferredStream((context) => { signal = context.signal }))
    const wrapper = mountTerminal()

    await wrapper.get('.chat-suggestions button').trigger('click')
    await flushPromises()
    await wrapper.get('[aria-label="关闭对话"]').trigger('click')

    expect(signal.aborted).toBe(true)
    expect(wrapper.emitted('close')).toHaveLength(1)
  })

  it('unmount aborts the active stream', async () => {
    let signal
    streamChat.mockImplementation(deferredStream((context) => { signal = context.signal }))
    const wrapper = mountTerminal()

    await wrapper.get('.chat-suggestions button').trigger('click')
    await flushPromises()
    wrapper.unmount()

    expect(signal.aborted).toBe(true)
  })

  it('renders a public transport error as assistant text', async () => {
    streamChat.mockRejectedValue(new ChatError('rate_limited', '请求过于频繁，请稍后再试。'))
    const wrapper = mountTerminal()

    await wrapper.get('.chat-suggestions button').trigger('click')
    await flushPromises()

    expect(wrapper.text()).toContain('请求过于频繁，请稍后再试。')
  })
})