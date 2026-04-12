import { setActivePinia, createPinia } from 'pinia'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useProgressStore } from './progress'

describe('Progress Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.useFakeTimers()
  })

  it('should save progress correctly', () => {
    const store = useProgressStore()
    const now = 1620000000000
    vi.setSystemTime(now)

    store.saveProgress('music1', 5, 10)

    expect(store.progressMap['music1']).toEqual({
      currentIndex: 5,
      total: 10,
      lastPlayed: now,
    })

    expect(store.getProgress('music1')).toEqual({
      currentIndex: 5,
      total: 10,
      lastPlayed: now,
    })
  })

  it('should clear progress correctly', () => {
    const store = useProgressStore()
    
    store.saveProgress('music2', 2, 8)
    expect(store.getProgress('music2')).not.toBeNull()

    store.clearProgress('music2')
    expect(store.getProgress('music2')).toBeNull()
    expect(store.progressMap['music2']).toBeUndefined()
  })

  it('should return null for non-existent progress', () => {
    const store = useProgressStore()
    expect(store.getProgress('non-existent')).toBeNull()
  })
})
