import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { clampSectionIndex, sectionHash, sectionIndexFromHash } from '../lib/navigation.js'

export function useSectionNavigation(sectionIds, interactionLocked) {
  const isDesktop = ref(false)
  const activeIndex = ref(0)
  const isMoving = ref(false)
  let moveTimer
  let mediaQuery

  const activeHash = computed(() => sectionHash(activeIndex.value, sectionIds))

  function syncViewport() {
    isDesktop.value = mediaQuery.matches
  }

  function goTo(index, behavior = 'smooth') {
    const nextIndex = clampSectionIndex(index, sectionIds.length)
    activeIndex.value = nextIndex

    if (!isDesktop.value) {
      document.getElementById(sectionIds[nextIndex])?.scrollIntoView({ behavior })
    }
  }

  function moveBy(delta) {
    if (isMoving.value || interactionLocked.value) return
    const nextIndex = clampSectionIndex(activeIndex.value + delta, sectionIds.length)
    if (nextIndex === activeIndex.value) return
    isMoving.value = true
    activeIndex.value = nextIndex
    window.clearTimeout(moveTimer)
    moveTimer = window.setTimeout(() => {
      isMoving.value = false
    }, 560)
  }

  function onWheel(event) {
    if (!isDesktop.value || Math.abs(event.deltaY) < 24) return
    event.preventDefault()
    moveBy(event.deltaY > 0 ? 1 : -1)
  }

  function onKeydown(event) {
    if (!isDesktop.value || interactionLocked.value) return
    const tagName = event.target?.tagName
    if (['INPUT', 'TEXTAREA', 'BUTTON', 'A'].includes(tagName)) return
    if (['ArrowRight', 'ArrowDown', 'PageDown'].includes(event.key)) {
      event.preventDefault()
      moveBy(1)
    }
    if (['ArrowLeft', 'ArrowUp', 'PageUp'].includes(event.key)) {
      event.preventDefault()
      moveBy(-1)
    }
  }

  function onHashChange() {
    activeIndex.value = sectionIndexFromHash(window.location.hash, sectionIds)
  }

  watch(activeHash, (hash) => {
    if (window.location.hash !== hash) history.replaceState(null, '', hash)
  })

  onMounted(() => {
    mediaQuery = window.matchMedia('(min-width: 901px)')
    syncViewport()
    activeIndex.value = sectionIndexFromHash(window.location.hash, sectionIds)
    mediaQuery.addEventListener('change', syncViewport)
    window.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('keydown', onKeydown)
    window.addEventListener('hashchange', onHashChange)
  })

  onBeforeUnmount(() => {
    window.clearTimeout(moveTimer)
    mediaQuery?.removeEventListener('change', syncViewport)
    window.removeEventListener('wheel', onWheel)
    window.removeEventListener('keydown', onKeydown)
    window.removeEventListener('hashchange', onHashChange)
  })

  return { activeIndex, isDesktop, goTo, moveBy }
}