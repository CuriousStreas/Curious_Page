<script setup>
import { ref } from 'vue'
import { ArrowUpRight } from '@lucide/vue'
import { projects } from '../data/resumeData.js'

const activeProject = ref(projects[0])
</script>

<template>
  <div class="project-showcase">
    <div class="project-tabs" role="tablist" aria-label="项目列表">
      <button
        v-for="project in projects"
        :key="project.id"
        type="button"
        role="tab"
        :aria-selected="activeProject.id === project.id"
        :class="{ active: activeProject.id === project.id }"
        @click="activeProject = project"
      >
        <span>{{ project.code }}</span>
        {{ project.title }}
      </button>
    </div>

    <article class="project-record">
      <div class="project-visual" aria-label="项目概览">
        <span class="project-visual__grid"></span>
        <strong>{{ activeProject.glyph }}</strong>
        <span>{{ activeProject.type }}</span>
      </div>
      <div class="project-copy">
        <p class="system-label">{{ activeProject.type }}</p>
        <h3>{{ activeProject.title }}</h3>
        <p class="project-statement">{{ activeProject.statement }}</p>
        <dl class="evidence-list">
          <div><dt>ROLE</dt><dd>{{ activeProject.role }}</dd></div>
          <div><dt>MECHANISM</dt><dd>{{ activeProject.mechanism }}</dd></div>
          <div><dt>OUTCOME</dt><dd>{{ activeProject.result }}</dd></div>
        </dl>
        <div class="tag-row">
          <span v-for="item in activeProject.stack" :key="item">{{ item }}</span>
        </div>
        <span class="project-corner"><ArrowUpRight :size="18" /> EVIDENCE RECORD</span>
      </div>
    </article>
  </div>
</template>