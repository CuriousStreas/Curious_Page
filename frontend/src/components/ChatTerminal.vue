<script setup>
import { nextTick, onBeforeUnmount, ref } from 'vue'
import { Send, Square, X } from '@lucide/vue'
import { streamChat } from '../lib/chatClient.js'

const props = defineProps({ open: Boolean })
const emit = defineEmits(['close'])
const suggestions = ['他在雷火做了什么？', '介绍一下 GMTool', '他的 AI 工程经验？']
const input = ref('')
const messages = ref([
  { role: 'assistant', content: '公开简历档案已载入。你可以直接询问实习、项目或工程经历。' },
])
const isStreaming = ref(false)
const messageList = ref(null)
let activeController = null

async function scrollToLatest() {
  await nextTick()
  messageList.value?.scrollTo({ top: messageList.value.scrollHeight, behavior: 'smooth' })
}

function stopStream() {
  activeController?.abort()
  activeController = null
  isStreaming.value = false
}

async function streamReply() {
  const message = { role: 'assistant', content: '' }
  messages.value.push(message)
  isStreaming.value = true
  const controller = new AbortController()
  activeController = controller

  try {
    await streamChat({
      messages: messages.value.slice(0, -1).filter(m => m.content).slice(-10),
      signal: controller.signal,
      onDelta(text) {
        message.content += text
        scrollToLatest()
      },
    })
  } catch (error) {
    if (error?.name !== 'AbortError') {
      message.content = error?.message || '对话服务暂时不可用，请稍后再试。'
      scrollToLatest()
    }
  } finally {
    if (!message.content) {
      messages.value.pop()
    }
    if (activeController === controller) {
      activeController = null
      isStreaming.value = false
    }
  }
}

function submit(question = input.value.trim()) {
  if (!question || isStreaming.value) return
  messages.value.push({ role: 'user', content: question })
  input.value = ''
  scrollToLatest()
  streamReply()
}

function close() {
  stopStream()
  emit('close')
}

onBeforeUnmount(stopStream)
</script>

<template>
  <Transition name="terminal">
    <aside v-if="open" class="chat-terminal" aria-label="AI 简历问答" @keydown.esc="close">
      <header class="chat-terminal__header">
        <div>
          <p class="system-label">ASK://CURIOUS</p>
          <strong><span class="status-dot"></span> RESUME DATA ONLINE</strong>
        </div>
        <button type="button" class="icon-button" aria-label="关闭对话" @click="close"><X :size="20" /></button>
      </header>

      <div ref="messageList" class="chat-terminal__messages" aria-live="polite">
        <div v-for="(message, index) in messages" :key="index" class="chat-message" :class="`chat-message--${message.role}`">
          <span>{{ message.role === 'user' ? 'YOU' : 'CURI' }}</span>
          <p>{{ message.content }}<i v-if="isStreaming && index === messages.length - 1" class="cursor"></i></p>
        </div>
      </div>

      <div class="chat-suggestions" aria-label="建议问题">
        <button v-for="question in suggestions" :key="question" type="button" :disabled="isStreaming" @click="submit(question)">{{ question }}</button>
      </div>

      <form class="chat-input" @submit.prevent="submit()">
        <label class="sr-only" for="chat-question">向简历助手提问</label>
        <input id="chat-question" v-model="input" type="text" maxlength="4000" :disabled="isStreaming" placeholder="输入简历相关问题" autocomplete="off" />
        <button v-if="isStreaming" type="button" class="icon-button" aria-label="停止生成" @click="stopStream"><Square :size="17" /></button>
        <button v-else type="submit" class="icon-button" aria-label="发送问题"><Send :size="18" /></button>
      </form>
      <footer>DEEPSEEK / PUBLIC RESUME KNOWLEDGE</footer>
    </aside>
  </Transition>
</template>