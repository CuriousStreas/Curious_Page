import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const appSource = readFileSync(fileURLToPath(new URL('../App.vue', import.meta.url)), 'utf8')
const documentSource = readFileSync(fileURLToPath(new URL('../../index.html', import.meta.url)), 'utf8')
const stylesSource = readFileSync(fileURLToPath(new URL('../styles.css', import.meta.url)), 'utf8')
const pixelCatSource = readFileSync(fileURLToPath(new URL('../components/PixelCat.vue', import.meta.url)), 'utf8')

describe('option A homepage contract', () => {
  it('uses a role-neutral Curious identity', () => {
    expect(appSource).toContain('Curious')
    expect(appSource).toContain('ENGINEER / BUILDER / PLAYER')
    expect(appSource).not.toContain('AI 测试开发<br />游戏测试开发')
    expect(documentSource).toContain('<title>Curious // Personal Archive</title>')
    expect(documentSource).not.toContain('AI 测试开发')
  })

  it('offers resume and AI as peer actions', () => {
    expect(appSource).toContain('class="hero-actions"')
    expect(appSource).toContain('查看实习记录')
    expect(appSource).toContain('和 AI 版的我聊聊')
  })

  it('offers copyable email and phone contacts with accessible feedback', () => {
    expect(appSource).toContain('CuriousStreas@outlook.com')
    expect(appSource).toContain('135-8720-9317')
    expect(appSource).toContain('navigator.clipboard.writeText(value)')
    expect(appSource).toContain('class="desktop-contact"')
    expect(appSource).toContain('aria-live="polite"')
  })

  it('uses the left chapter drawer and pixel cat AI entry', () => {
    expect(appSource).toContain('class="section-drawer"')
    expect(appSource).toContain('<PixelCat')
    expect(appSource).toContain('aria-label="打开 AI 简历助手"')
  })

  it('makes the desktop chapter drawer fill the viewport height', () => {
    expect(stylesSource).toMatch(/\.section-drawer\s*\{[^}]*top:\s*0;/s)
    expect(stylesSource).toMatch(/\.section-drawer\s*\{[^}]*height:\s*100dvh;/s)
    expect(stylesSource).not.toMatch(/\.section-drawer\s*\{[^}]*translateY\(-50%\)/s)
  })

  it('gives the chapter index generous type and spacing', () => {
    expect(stylesSource).toMatch(/\.section-drawer:hover[^}]*width:\s*340px;/s)
    expect(stylesSource).toMatch(/\.section-drawer button\s*\{[^}]*min-height:\s*88px;/s)
    expect(stylesSource).toMatch(/\.section-drawer button strong\s*\{[^}]*font-size:\s*18px;/s)
    expect(stylesSource).toMatch(/\.section-drawer button small\s*\{[^}]*font-size:\s*10px;/s)
  })

  it('balances a desktop identity panel with three internship posters', () => {
    expect(appSource).toContain("import leihuoPoster from '../../pic/wuxianda.png'")
    expect(appSource).toContain("import zhejiangLabPoster from '../../pic/zhijiang_icon.png'")
    expect(appSource).toContain("import huacePoster from '../../pic/huace.png'")
    expect(appSource).toContain('v-if="isDesktop" class="desktop-index-layout"')
    expect(appSource).toContain('class="desktop-identity"')
    expect(appSource).toContain('class="desktop-poster-stage"')
    expect(appSource).toContain('v-for="poster in internshipPosters"')
    expect(appSource).toContain('class="internship-poster"')
    expect(appSource).not.toContain('class="curtain-identity"')
    expect(appSource).toContain('v-else class="mobile-hero"')
  })

  it('fills a sub-half right column with a gapless poster wall', () => {
    expect(stylesSource).toMatch(/\.desktop-index-layout\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*0\.58fr\)\s+minmax\(0,\s*0\.42fr\);[^}]*gap:\s*0;/s)
    expect(stylesSource).toMatch(/\.desktop-index-layout\s*\{[^}]*height:\s*calc\(100%\s*\+\s*var\(--chapter-bottom-space\)\);/s)
    expect(stylesSource).toMatch(/\.desktop-identity\s*\{[^}]*height:\s*calc\(100%\s*-\s*var\(--chapter-bottom-space\)\);/s)
    expect(stylesSource).toMatch(/\.desktop-poster-stage\s*\{[^}]*height:\s*100%;[^}]*padding:\s*0;/s)
    expect(stylesSource).toMatch(/\.desktop-poster-stage\s*\{[^}]*overflow:\s*visible;[^}]*background:\s*transparent;/s)
    expect(stylesSource).toMatch(/\.desktop-internship-curtain\s*\{[^}]*height:\s*100%;/s)
    expect(stylesSource).toMatch(/\.desktop-internship-curtain\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\)\s+minmax\(0,\s*1fr\)\s+minmax\(0,\s*1fr\);/s)
    expect(stylesSource).toMatch(/\.desktop-internship-curtain:has\(\.internship-poster:nth-child\(1\):is\(:hover,\s*:focus-visible\)\)[^}]*grid-template-columns:\s*minmax\(0,\s*1\.36fr\)\s+minmax\(0,\s*1fr\)\s+minmax\(0,\s*1fr\);/s)
    expect(stylesSource).toMatch(/\.desktop-internship-curtain:has\(\.internship-poster:nth-child\(2\):is\(:hover,\s*:focus-visible\)\)[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\)\s+minmax\(0,\s*1\.36fr\)\s+minmax\(0,\s*1fr\);/s)
    expect(stylesSource).toMatch(/\.desktop-internship-curtain:has\(\.internship-poster:nth-child\(3\):is\(:hover,\s*:focus-visible\)\)[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\)\s+minmax\(0,\s*1fr\)\s+minmax\(0,\s*1\.36fr\);/s)
    expect(stylesSource).toMatch(/\.internship-poster\s*\{[^}]*margin-right:\s*-32px;[^}]*clip-path:\s*polygon\(12%\s+0,\s*100%\s+0,\s*88%\s+100%,\s*0\s+100%\);/s)
    expect(stylesSource).not.toMatch(/\.internship-poster:(?:first|last)-child\s*\{[^}]*clip-path:/s)
    expect(stylesSource).toMatch(/\.internship-poster__image\s*\{[^}]*object-fit:\s*cover;/s)
    expect(stylesSource).toMatch(/@media\s*\(max-width:\s*900px\)[\s\S]*\.desktop-index-layout\s*\{[^}]*display:\s*none;/s)
    expect(stylesSource).toMatch(/@media\s*\(max-width:\s*900px\)[\s\S]*\.mobile-hero\s*\{[^}]*display:\s*grid;/s)
  })

  it('uses one restrained motion rhythm for poster expansion', () => {
    expect(stylesSource).toMatch(/--poster-motion-duration:\s*440ms;/)
    expect(stylesSource).toMatch(/--poster-motion-easing:\s*cubic-bezier\(0\.22,\s*1,\s*0\.36,\s*1\);/)
    expect(stylesSource).toMatch(/\.desktop-internship-curtain\s*\{[^}]*transition:\s*grid-template-columns\s+var\(--poster-motion-duration\)\s+var\(--poster-motion-easing\);/s)
    expect(stylesSource).toMatch(/\.internship-poster__details\s*\{[^}]*margin-top:\s*0;/s)
    expect(stylesSource).toMatch(/\.internship-poster__details\s*\{[^}]*transition:[^}]*margin-top\s+var\(--poster-motion-duration\)\s+var\(--poster-motion-easing\)/s)
    expect(stylesSource).toMatch(/\.internship-poster__shade::after\s*\{[^}]*opacity:\s*0;[^}]*transition:\s*opacity\s+var\(--poster-motion-duration\)\s+var\(--poster-motion-easing\);/s)
    expect(stylesSource).toMatch(/@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*--poster-motion-duration:\s*140ms;/s)
  })

  it('uses the persistent pure silhouette cat icon', () => {
    expect(pixelCatSource).toContain('class="cat-icon"')
    expect(pixelCatSource).toContain("viewBox='0 0 24 24'")
    expect(pixelCatSource).toContain("d='M6 21V6l2-2l2 2h4l2-2l2 2v15")
    expect(pixelCatSource).toMatch(/\.cat-icon\s*\{[^}]*width:\s*1em;[^}]*height:\s*1em;/s)
    expect(pixelCatSource).toMatch(/\.cat-icon\s*\{[^}]*background:\s*currentColor;/s)
    expect(pixelCatSource).toContain('-webkit-mask: var(--svg) center/100% 100% no-repeat;')
    expect(pixelCatSource).toContain('mask: var(--svg) center/100% 100% no-repeat;')
    expect(pixelCatSource).not.toContain('pixel-cat__body')
    expect(pixelCatSource).not.toContain('@keyframes')
  })

  it('replays a right-facing background cat whenever desktop INDEX becomes active', () => {
    expect(appSource).toContain('v-if="activeIndex === 0" class="desktop-background-cat"')
    expect(appSource).toContain('<PixelCat size="var(--desktop-cat-size)" />')
    expect(pixelCatSource).toContain("type: [Number, String]")
    expect(stylesSource).toMatch(/\.desktop-background-cat\s*\{[^}]*--desktop-cat-size:\s*clamp\(845px,\s*min\(68vw,\s*109vh\),\s*1180px\);/s)
    expect(stylesSource).toMatch(/\.desktop-background-cat\s*\{[^}]*left:\s*calc\(var\(--desktop-cat-size\)\s*\*\s*-0\.11\);[^}]*bottom:\s*calc\(var\(--desktop-cat-size\)\s*\*\s*-0\.3475\);/s)
    expect(stylesSource).toMatch(/\.desktop-background-cat\s*\{[^}]*width:\s*var\(--desktop-cat-size\);[^}]*height:\s*var\(--desktop-cat-size\);/s)
    expect(stylesSource).toMatch(/\.desktop-background-cat\s*\{[^}]*opacity:\s*0\.038;[^}]*transform:\s*rotate\(9deg\)\s+scaleX\(-1\);/s)
    expect(stylesSource).toMatch(/\.desktop-background-cat\s*\{[^}]*animation:\s*background-cat-arrive\s+1000ms\s+cubic-bezier\(0\.22,\s*1,\s*0\.36,\s*1\)\s+both;/s)
    expect(stylesSource).toMatch(/@keyframes\s+background-cat-arrive\s*\{[\s\S]*translate3d\(-70px,\s*170px,\s*0\)/s)
    expect(stylesSource).toMatch(/@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*\.desktop-background-cat\s*\{[^}]*animation:\s*none\s*!important;/s)
    expect(stylesSource).not.toMatch(/\.desktop-identity::after\s*\{[^}]*content:\s*'01';/s)
  })

  it('leads with the real name and keeps Curious as a smaller desktop brand', () => {
    expect(appSource).toContain('<h1>沈皓褀<span class="desktop-identity__alias">Curious</span><small>ENGINEER / BUILDER / PLAYER</small></h1>')
    expect(stylesSource).toMatch(/\.desktop-identity__alias\s*\{[^}]*font-size:\s*0\.35em;/s)
    expect(appSource).toContain('<div v-else class="mobile-hero">')
    expect(appSource).toMatch(/<div v-else class="mobile-hero">[\s\S]*?<h1>Curious<small>ENGINEER \/ BUILDER \/ PLAYER<\/small><\/h1>/s)
  })
})