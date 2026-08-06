<script setup>
defineProps({
  id: { type: String, required: true },
  index: { type: Number, required: true },
  label: { type: String, required: true },
  title: { type: String, required: true },
  dark: { type: Boolean, default: false },
})
</script>

<template>
  <section :id="id" class="chapter" :class="{ 'chapter--dark': dark }">
    <div class="chapter__rail" aria-hidden="true">
      <span>{{ String(index).padStart(2, '0') }}</span>
      <span class="chapter__rail-line"></span>
      <span>05</span>
    </div>
    <header class="chapter__header">
      <div>
        <p class="system-label">FILE://{{ label }}</p>
        <h2>{{ title }}</h2>
      </div>
      <p class="chapter__stamp">CURIOUS PERSONNEL ARCHIVE<br />ACCESS / PUBLIC</p>
    </header>
    <div class="chapter__body">
      <slot />
    </div>
  </section>
</template>