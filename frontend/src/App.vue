<script setup>
import { computed, ref } from 'vue'
import { ArrowLeft, ArrowRight, Bot, Check, Copy, Download, GraduationCap, Mail, MapPin, Phone } from '@lucide/vue'
import ChatTerminal from './components/ChatTerminal.vue'
import PixelCat from './components/PixelCat.vue'
import ProjectShowcase from './components/ProjectShowcase.vue'
import SectionShell from './components/SectionShell.vue'
import { useSectionNavigation } from './composables/useSectionNavigation.js'
import { capabilities, experienceDossiers, sections } from './data/resumeData.js'
import leihuoPoster from '../../pic/wuxianda.png'
import zhejiangLabPoster from '../../pic/zhijiang_icon.png'
import huacePoster from '../../pic/huace.png'

const chatOpen = ref(false)
const activeDossier = ref(0)
const copiedContact = ref('')
let copyResetTimer
const sectionIds = sections.map((section) => section.id)
const { activeIndex, isDesktop, goTo, moveBy } = useSectionNavigation(sectionIds, computed(() => chatOpen.value))
const trackStyle = computed(() => isDesktop.value ? { transform: `translate3d(-${activeIndex.value * 100}vw, 0, 0)` } : {})
const posterImages = [leihuoPoster, zhejiangLabPoster, huacePoster]
const posterNames = ['网易雷火', '之江实验室', '华策影视']
const internshipPosters = experienceDossiers.map((dossier, index) => ({
  ...dossier,
  image: posterImages[index],
  focalClass: `internship-poster--${index + 1}`,
}))

function openDossier(index) {
  activeDossier.value = index
  goTo(2)
}

async function copyContact(value, fallbackHref) {
  try {
    await navigator.clipboard.writeText(value)
    copiedContact.value = value
    window.clearTimeout(copyResetTimer)
    copyResetTimer = window.setTimeout(() => {
      copiedContact.value = ''
    }, 1800)
  } catch {
    window.location.href = fallbackHref
  }
}
</script>

<template>
  <div class="site-shell" :class="{ 'chat-is-open': chatOpen }">
    <a class="skip-link" href="#main-content">跳到主要内容</a>

    <header class="topbar">
      <a href="#index" class="wordmark" @click.prevent="goTo(0)">
        <span>CT</span>
        <strong>CURIOUS<br />TREA</strong>
      </a>
      <p class="topbar__path">HTTPS://CURIOUSTREA.FUN/<span>{{ sections[activeIndex].id.toUpperCase() }}</span></p>
      <button type="button" class="ask-button" aria-label="打开 AI 简历助手" @click="chatOpen = true">
        <PixelCat :size="28" />
        <span>ASK CURIOUS<small>AI ONLINE</small></span>
      </button>
    </header>

    <main id="main-content" class="chapter-track" :style="trackStyle">
      <SectionShell id="index" :index="0" label="INDEX" title="身份索引">
        <div v-if="isDesktop" class="desktop-index-layout">
          <div class="desktop-identity">
            <div v-if="activeIndex === 0" class="desktop-background-cat" aria-hidden="true">
              <PixelCat size="var(--desktop-cat-size)" />
            </div>
            <p class="hero-kicker"><span></span> 27 届计算机硕士 / AVAILABLE 2027</p>
            <h1>沈皓褀<span class="desktop-identity__alias">Curious</span><small>ENGINEER / BUILDER / PLAYER</small></h1>
            <p class="desktop-identity__statement">让好奇心每天上线，<br />让想法真正跑起来。</p>
            <div class="hero-meta">
              <span><GraduationCap :size="17" /> 浙江工业大学</span>
              <span><MapPin :size="17" /> HANGZHOU / CN</span>
            </div>
            <div class="desktop-contacts" aria-label="联系方式">
              <button
                type="button"
                class="desktop-contact"
                aria-label="复制邮箱 CuriousStreas@outlook.com"
                @click="copyContact('CuriousStreas@outlook.com', 'mailto:CuriousStreas@outlook.com')"
              >
                <Mail :size="20" />
                <span><small>EMAIL</small>CuriousStreas@outlook.com</span>
                <Check v-if="copiedContact === 'CuriousStreas@outlook.com'" :size="18" />
                <Copy v-else :size="18" />
              </button>
              <button
                type="button"
                class="desktop-contact"
                aria-label="复制手机号码 135-8720-9317"
                @click="copyContact('135-8720-9317', 'tel:13587209317')"
              >
                <Phone :size="20" />
                <span><small>MOBILE</small>135-8720-9317</span>
                <Check v-if="copiedContact === '135-8720-9317'" :size="18" />
                <Copy v-else :size="18" />
              </button>
              <span class="sr-only" aria-live="polite">{{ copiedContact ? `${copiedContact} 已复制` : '' }}</span>
            </div>
            <div class="hero-actions">
              <button type="button" class="primary-action primary-action--dark" @click="openDossier(0)">查看实习记录 <ArrowRight :size="19" /></button>
              <button type="button" class="primary-action hero-chat-action" @click="chatOpen = true"><PixelCat :size="24" /> 和 AI 版的我聊聊</button>
            </div>
          </div>

          <div class="desktop-poster-stage">
            <div class="desktop-internship-curtain">
              <button
                v-for="(poster, index) in internshipPosters"
                :key="poster.code"
                type="button"
                class="internship-poster"
                :class="poster.focalClass"
                :aria-label="`查看 ${poster.shortCompany} 实习经历`"
                @click="openDossier(index)"
              >
                <img class="internship-poster__image" :src="poster.image" :alt="`${poster.shortCompany}相关海报`" />
                <span class="internship-poster__shade"></span>
                <span class="internship-poster__topline">
                  <time>{{ poster.date }}</time>
                  <span>{{ poster.code }}</span>
                </span>
                <span class="internship-poster__content">
                  <span class="internship-poster__role">{{ poster.role }}</span>
                  <strong>{{ poster.shortCompany }}</strong>
                  <span class="internship-poster__details">
                    <span>{{ poster.summary }}</span>
                  </span>
                </span>
              </button>
            </div>
          </div>
        </div>

        <div v-else class="mobile-hero">
          <div class="hero-layout">
            <div class="hero-copy">
              <p class="hero-kicker"><span></span> 27 届计算机硕士 / AVAILABLE 2027</p>
              <h1>Curious<small>ENGINEER / BUILDER / PLAYER</small></h1>
              <p class="hero-role">让好奇心每天上线，<br />让想法真正跑起来。</p>
              <div class="hero-meta">
                <span><GraduationCap :size="17" /> 浙江工业大学</span>
                <span><MapPin :size="17" /> HANGZHOU / CN</span>
              </div>
              <div class="hero-actions">
                <button type="button" class="primary-action primary-action--dark" @click="openDossier(0)">查看实习记录 <ArrowRight :size="19" /></button>
                <button type="button" class="primary-action hero-chat-action" @click="chatOpen = true"><PixelCat :size="24" /> 和 AI 版的我聊聊</button>
              </div>
            </div>
            <div class="hero-evidence">
              <div class="hero-evidence__code">BUILD<br /><span>?</span></div>
              <div class="hero-evidence__scan"></div>
              <p>从模型、工具到游戏，<br />持续把问题变成可运行的答案。</p>
              <dl>
                <div><dt>03</dt><dd>TECH INTERNSHIPS</dd></div>
                <div><dt>AI</dt><dd>REAL WORKFLOWS</dd></div>
                <div><dt>∞</dt><dd>CURIOSITY ONLINE</dd></div>
              </dl>
            </div>
          </div>
        </div>
      </SectionShell>

      <SectionShell id="profile" :index="1" label="PROFILE" title="能力档案" dark>
        <div class="profile-layout">
          <div class="profile-statement">
            <p class="system-label">WORKING THESIS</p>
            <blockquote>不只调用模型。<br />让 AI 在可控、可验证的<br /><em>真实业务流程</em>中工作。</blockquote>
            <div class="education-record">
              <span>2024 — 2027</span>
              <strong>浙江工业大学</strong>
              <p>计算机科学与技术 / 硕士<br />在校成绩专业前十</p>
            </div>
          </div>
          <div class="capability-matrix">
            <div v-for="(item, index) in capabilities" :key="item.label" class="capability-row">
              <span>{{ String(index + 1).padStart(2, '0') }}</span>
              <strong>{{ item.label }}</strong>
              <p>{{ item.value }}</p>
            </div>
          </div>
        </div>
      </SectionShell>

      <SectionShell id="experience" :index="2" label="EXPERIENCE" title="实习记录">
        <div class="experience-dossier">
          <article class="dossier-document">
            <header class="dossier-document__header">
              <span class="dossier-stamp">{{ experienceDossiers[activeDossier].code }}</span>
              <time>{{ experienceDossiers[activeDossier].date }}</time>
            </header>
            <p class="system-label">{{ experienceDossiers[activeDossier].role }}</p>
            <h3>{{ experienceDossiers[activeDossier].company }}</h3>
            <p class="dossier-summary">{{ experienceDossiers[activeDossier].summary }}</p>

            <div class="dossier-projects">
              <div v-for="project in experienceDossiers[activeDossier].projects" :key="project.name" class="dossier-project-card">
                <h4>{{ project.name }}</h4>
                <p class="dossier-project__desc">{{ project.desc }}</p>
                <ul><li v-for="detail in project.details" :key="detail">{{ detail }}</li></ul>
                <footer class="dossier-project__tech">{{ project.tech }}</footer>
              </div>
            </div>

            <div class="dossier-highlights">
              <h4>TECHNICAL HIGHLIGHTS</h4>
              <dl>
                <div v-for="hl in experienceDossiers[activeDossier].highlights" :key="hl.label">
                  <dt>{{ hl.label }}</dt>
                  <dd>{{ hl.detail }}</dd>
                </div>
              </dl>
            </div>

            <footer class="dossier-meta">{{ experienceDossiers[activeDossier].stack }}</footer>
          </article>

          <div class="dossier-folder" aria-label="档案袋">
            <button
              v-for="(dossier, index) in experienceDossiers"
              :key="dossier.code"
              type="button"
              class="dossier-tab"
              :class="{ active: activeDossier === index }"
              :aria-current="activeDossier === index ? 'page' : undefined"
              @click="activeDossier = index"
            >
              <span class="dossier-tab__code">{{ dossier.code }}</span>
              <strong>{{ dossier.shortCompany }}</strong>
              <small>{{ dossier.role }}</small>
            </button>
          </div>
        </div>
      </SectionShell>

      <SectionShell id="projects" :index="3" label="PROJECTS" title="工程证据" dark>
        <ProjectShowcase />
      </SectionShell>

      <SectionShell id="ask" :index="4" label="GAME / ASK" title="继续了解">
        <div class="ask-layout">
          <div class="game-record">
            <p class="system-label">SIDE QUEST://GAMEJAM</p>
            <h3>工程能力之外，<br />也有产品思维。</h3>
            <p>两次 GameJam 经历：吉比特《周公解梦事务所》（类银河恶魔城）和开拓芯 GameJam（对话冒险 RPG），使用 Unity + C# 负责核心玩法与战斗系统开发。</p>
            <div class="game-placeholder"><span>UNITY://FRAME</span><strong>GAMEJAM<br />X2</strong></div>
          </div>
          <div class="contact-record">
            <p class="system-label">ASK://CURIOUS</p>
            <h3>简历只负责摘要。<br />问题可以继续追。</h3>
            <p>右下角 AI 助手基于简历知识库回答关于实习、项目、技能的具体问题。点击下方按钮或右上角 ASK CURIOUS 开始对话。</p>
            <button type="button" class="primary-action primary-action--dark" @click="chatOpen = true"><Bot :size="19" /> 打开 AI 档案助手</button>
            <div class="contact-links">
              <a href="mailto:CuriousStreas@outlook.com"><Download :size="18" /> CuriousStreas@outlook.com</a>
            </div>
          </div>
        </div>
      </SectionShell>
    </main>

    <nav class="section-drawer" aria-label="章节导航">
      <div class="section-drawer__rail" aria-hidden="true">
        <span>{{ String(activeIndex).padStart(2, '0') }}</span>
        <strong>INDEX</strong>
      </div>
      <div class="section-drawer__panel">
        <p>CHAPTER INDEX</p>
        <button
          v-for="(section, index) in sections"
          :key="section.id"
          type="button"
          :class="{ active: activeIndex === index }"
          :aria-current="activeIndex === index ? 'page' : undefined"
          @click="goTo(index)"
        >
          <span>{{ String(index).padStart(2, '0') }}</span>
          <strong>{{ section.title }}</strong>
          <small>{{ section.label }}</small>
        </button>
      </div>
    </nav>

    <div class="chapter-controls">
      <button type="button" class="icon-button" aria-label="上一章节" :disabled="activeIndex === 0" @click="moveBy(-1)"><ArrowLeft :size="19" /></button>
      <p><strong>{{ String(activeIndex).padStart(2, '0') }}</strong> // {{ sections[activeIndex].label }}</p>
      <button type="button" class="icon-button" aria-label="下一章节" :disabled="activeIndex === sections.length - 1" @click="moveBy(1)"><ArrowRight :size="19" /></button>
    </div>

    <ChatTerminal :open="chatOpen" @close="chatOpen = false" />
  </div>
</template>