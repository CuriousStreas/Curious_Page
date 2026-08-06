import { afterEach, describe, expect, it, vi } from 'vitest'

import { ChatError, createSseParser, streamChat } from './chatClient.js'

function streamResponse(chunks, init = {}) {
  const encoder = new TextEncoder()
  const body = new ReadableStream({
    start(controller) {
      for (const chunk of chunks) controller.enqueue(encoder.encode(chunk))
      controller.close()
    },
  })
  return new Response(body, {
    status: init.status || 200,
    headers: { 'Content-Type': init.contentType || 'text/event-stream' },
  })
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('createSseParser', () => {
  it('parses one event split across arbitrary chunks', () => {
    const events = []
    const parser = createSseParser((event) => events.push(event))

    parser.push('event: del')
    parser.push('ta\ndata: {"content":"GM"}\n\n')

    expect(events).toEqual([{ type: 'delta', data: { content: 'GM' } }])
  })

  it('parses multiple events and flushes a final unseparated event', () => {
    const events = []
    const parser = createSseParser((event) => events.push(event))

    parser.push('event: delta\ndata: {"content":"A"}\n\nevent: delta\ndata: {"content":"B"}\n\n')
    parser.push('event: done\ndata: {}')
    parser.finish()

    expect(events).toEqual([
      { type: 'delta', data: { content: 'A' } },
      { type: 'delta', data: { content: 'B' } },
      { type: 'done', data: {} },
    ])
  })
})

describe('streamChat', () => {
  it('streams deltas and propagates the abort signal', async () => {
    const signal = new AbortController().signal
    const fetchMock = vi.fn().mockResolvedValue(
      streamResponse([
        'event: delta\ndata: {"content":"GM"}\n\n',
        'event: delta\ndata: {"content":" 工具"}\n\nevent: done\ndata: {}\n\n',
      ]),
    )
    vi.stubGlobal('fetch', fetchMock)
    const deltas = []

    await streamChat({
      messages: [{ role: 'user', content: '项目' }],
      signal,
      onDelta: (text) => deltas.push(text),
    })

    expect(deltas).toEqual(['GM', ' 工具'])
    expect(fetchMock).toHaveBeenCalledWith('/api/chat/stream', expect.objectContaining({ signal }))
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({
      messages: [{ role: 'user', content: '项目' }],
    })
  })

  it('rejects normalized SSE error events', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        streamResponse([
          'event: error\ndata: {"code":"stream_interrupted","message":"回答生成中断"}\n\n',
        ]),
      ),
    )

    await expect(streamChat({ messages: [], onDelta: vi.fn() })).rejects.toMatchObject({
      name: 'ChatError',
      code: 'stream_interrupted',
      message: '回答生成中断',
    })
  })

  it('uses normalized HTTP JSON errors', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({ error: { code: 'rate_limited', message: '请求过于频繁' } }),
          { status: 429, headers: { 'Content-Type': 'application/json' } },
        ),
      ),
    )

    await expect(streamChat({ messages: [], onDelta: vi.fn() })).rejects.toEqual(
      new ChatError('rate_limited', '请求过于频繁'),
    )
  })

  it('requires a done event for successful completion', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        streamResponse(['event: delta\ndata: {"content":"partial"}\n\n']),
      ),
    )

    await expect(streamChat({ messages: [], onDelta: vi.fn() })).rejects.toMatchObject({
      code: 'stream_interrupted',
    })
  })
})