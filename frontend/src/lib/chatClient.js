export class ChatError extends Error {
  constructor(code, message) {
    super(message)
    this.name = 'ChatError'
    this.code = code
  }
}

function parseEvent(block) {
  let type = 'message'
  const dataLines = []
  for (const line of block.split('\n')) {
    if (line.startsWith('event:')) type = line.slice(6).trim()
    if (line.startsWith('data:')) dataLines.push(line.slice(5).trimStart())
  }
  if (!dataLines.length) return null
  try {
    return { type, data: JSON.parse(dataLines.join('\n')) }
  } catch {
    throw new ChatError('stream_interrupted', '服务器返回了无法解析的流数据。')
  }
}

export function createSseParser(onEvent) {
  let buffer = ''

  function dispatch(block) {
    const event = parseEvent(block.replace(/\r\n/g, '\n'))
    if (event) onEvent(event)
  }

  return {
    push(chunk) {
      buffer += chunk
      let boundary = buffer.search(/\r?\n\r?\n/)
      while (boundary !== -1) {
        const block = buffer.slice(0, boundary)
        const separator = buffer.slice(boundary).match(/^\r?\n\r?\n/)[0]
        buffer = buffer.slice(boundary + separator.length)
        if (block) dispatch(block)
        boundary = buffer.search(/\r?\n\r?\n/)
      }
    },
    finish() {
      if (buffer.trim()) dispatch(buffer)
      buffer = ''
    },
  }
}

function apiUrl() {
  const base = import.meta.env.VITE_API_BASE?.replace(/\/$/, '') || ''
  return `${base}/api/chat/stream`
}

async function httpError(response) {
  try {
    const payload = await response.json()
    if (payload?.error?.code && payload.error.message) {
      return new ChatError(payload.error.code, payload.error.message)
    }
  } catch {
    // Fall through to the normalized public error.
  }
  return new ChatError('upstream_unavailable', '对话服务暂时不可用，请稍后再试。')
}

export async function streamChat({ messages, signal, onDelta }) {
  const response = await fetch(apiUrl(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages }),
    signal,
  })
  if (!response.ok) throw await httpError(response)
  if (!response.body) {
    throw new ChatError('stream_interrupted', '浏览器无法读取流式回答。')
  }

  let completed = false
  let streamError = null
  const parser = createSseParser(({ type, data }) => {
    if (type === 'delta' && typeof data.content === 'string') onDelta(data.content)
    if (type === 'done') completed = true
    if (type === 'error') {
      streamError = new ChatError(
        data.code || 'stream_interrupted',
        data.message || '回答生成中断，请稍后重试。',
      )
    }
  })
  const reader = response.body.getReader()
  const decoder = new TextDecoder()

  while (true) {
    const { value, done } = await reader.read()
    if (done) break
    parser.push(decoder.decode(value, { stream: true }))
  }
  parser.push(decoder.decode())
  parser.finish()

  if (streamError) throw streamError
  if (!completed) {
    throw new ChatError('stream_interrupted', '回答生成中断，请稍后重试。')
  }
}