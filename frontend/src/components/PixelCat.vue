<script setup>
import { computed } from 'vue'

const props = defineProps({
  size: {
    type: [Number, String],
    default: 34,
  },
})

const resolvedSize = computed(() => typeof props.size === 'number' ? `${props.size}px` : props.size)
</script>

<template>
  <span class="cat-icon" :style="{ fontSize: resolvedSize }" aria-hidden="true"></span>
</template>

<style scoped>
.cat-icon {
  display: inline-block;
  flex: 0 0 auto;
  width: 1em;
  height: 1em;

  --svg: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='black' d='M6 21V6l2-2l2 2h4l2-2l2 2v15h-1.8V6.8l-.9-.9l-1.2 1.2a1 1 0 0 1-.7.3H9.6a1 1 0 0 1-.7-.3L7.7 5.9l-.9.9V21zm4-9a.9.9 0 1 1 0 1.8a.9.9 0 0 1 0-1.8m4 0a.9.9 0 1 1 0 1.8a.9.9 0 0 1 0-1.8'/%3E%3C/svg%3E");

  background: currentColor;
  -webkit-mask: var(--svg) center/100% 100% no-repeat;
  mask: var(--svg) center/100% 100% no-repeat;
}
</style>