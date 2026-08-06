export function clampSectionIndex(index, sectionCount) {
  if (sectionCount <= 0) return 0
  return Math.min(Math.max(index, 0), sectionCount - 1)
}

export function sectionIndexFromHash(hash, sectionIds) {
  const normalizedHash = hash.replace(/^#/, '')
  const index = sectionIds.indexOf(normalizedHash)
  return index === -1 ? 0 : index
}

export function sectionHash(index, sectionIds) {
  const safeIndex = clampSectionIndex(index, sectionIds.length)
  return `#${sectionIds[safeIndex]}`
}