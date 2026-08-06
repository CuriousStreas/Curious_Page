import { describe, expect, it } from 'vitest'
import {
  clampSectionIndex,
  sectionHash,
  sectionIndexFromHash,
} from './navigation.js'

const sections = ['index', 'profile', 'experience', 'projects', 'ask']

describe('section navigation', () => {
  it('clamps section indices to the available range', () => {
    expect(clampSectionIndex(-1, sections.length)).toBe(0)
    expect(clampSectionIndex(2, sections.length)).toBe(2)
    expect(clampSectionIndex(9, sections.length)).toBe(4)
  })

  it('resolves valid hashes and falls back for unknown hashes', () => {
    expect(sectionIndexFromHash('#experience', sections)).toBe(2)
    expect(sectionIndexFromHash('projects', sections)).toBe(3)
    expect(sectionIndexFromHash('#missing', sections)).toBe(0)
  })

  it('returns a stable hash for a section index', () => {
    expect(sectionHash(1, sections)).toBe('#profile')
    expect(sectionHash(99, sections)).toBe('#ask')
  })
})
