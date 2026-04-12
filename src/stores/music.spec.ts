import { setActivePinia, createPinia } from 'pinia'
import { describe, it, expect, beforeEach } from 'vitest'
import { useMusicStore } from './music'
import { defaultMusics } from '../data/defaultData'

describe('Music Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
  })

  it('initializes with default data when localStorage is empty', () => {
    const store = useMusicStore()
    expect(store.musics.length).toBe(defaultMusics.length)
    expect(store.musics.length).toBe(100)
    expect(store.musics[0].id).toBe('m1')
  })

  it('loads from localStorage if data exists and length > 1', () => {
    const mockData = [
      { id: 'm1', title: 'Test 1', artist: 'A', coverUrl: '', audioUrl: '', difficulty: 'easy' as const },
      { id: 'm2', title: 'Test 2', artist: 'B', coverUrl: '', audioUrl: '', difficulty: 'medium' as const }
    ]
    localStorage.setItem('musics', JSON.stringify(mockData))
    
    const store = useMusicStore()
    expect(store.musics.length).toBe(2)
    expect(store.musics[0].title).toBe('Test 1')
  })

  it('adds a new music', () => {
    const store = useMusicStore()
    const initialLength = store.musics.length
    
    store.addMusic({
      id: 'm101',
      title: 'New Song',
      artist: 'New Artist',
      coverUrl: 'test.jpg',
      audioUrl: 'test.mp3',
      difficulty: 'hard'
    })
    
    expect(store.musics.length).toBe(initialLength + 1)
    expect(store.getMusicById('m101')?.title).toBe('New Song')
  })

  it('updates an existing music', () => {
    const store = useMusicStore()
    store.updateMusic('m1', { title: 'Updated Title' })
    expect(store.getMusicById('m1')?.title).toBe('Updated Title')
  })

  it('deletes a music', () => {
    const store = useMusicStore()
    const initialLength = store.musics.length
    store.deleteMusic('m1')
    
    expect(store.musics.length).toBe(initialLength - 1)
    expect(store.getMusicById('m1')).toBeUndefined()
  })

  it('clears all musics', () => {
    const store = useMusicStore()
    store.clearAll()
    expect(store.musics.length).toBe(0)
  })

  it('resets to default data', () => {
    const store = useMusicStore()
    store.clearAll()
    expect(store.musics.length).toBe(0)
    
    store.resetToDefaults()
    expect(store.musics.length).toBe(defaultMusics.length)
    expect(store.musics.length).toBe(100)
  })
})
