import { setActivePinia, createPinia } from 'pinia'
import { describe, it, expect, beforeEach } from 'vitest'
import { useSentenceStore } from './sentence'
import { defaultSentences } from '../data/defaultData'

describe('Sentence Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
  })

  it('initializes with default data when localStorage is empty', () => {
    const store = useSentenceStore()
    expect(store.sentences.length).toBe(defaultSentences.length)
    expect(store.sentences.length).toBeGreaterThan(10)
  })

  it('loads from localStorage if data exists and length >= 10', () => {
    const mockData = Array.from({ length: 15 }).map((_, i) => ({
      id: `s${i}`,
      musicId: 'm1',
      text: `Text ${i}`,
      translation: `Trans ${i}`,
      startTime: i,
      endTime: i + 1
    }))
    localStorage.setItem('sentences', JSON.stringify(mockData))
    
    const store = useSentenceStore()
    expect(store.sentences.length).toBe(15)
    expect(store.sentences[0].text).toBe('Text 0')
  })

  it('gets sentences by musicId and sorts by startTime', () => {
    const store = useSentenceStore()
    store.clearAll()
    store.addSentence({ id: 's1', musicId: 'm1', text: 'A', translation: 'A', startTime: 2, endTime: 3 })
    store.addSentence({ id: 's2', musicId: 'm1', text: 'B', translation: 'B', startTime: 1, endTime: 2 })
    store.addSentence({ id: 's3', musicId: 'm2', text: 'C', translation: 'C', startTime: 0, endTime: 1 })
    
    const m1Sentences = store.getSentencesByMusicId('m1')
    expect(m1Sentences.length).toBe(2)
    expect(m1Sentences[0].id).toBe('s2') // sorted by startTime
    expect(m1Sentences[1].id).toBe('s1')
  })

  it('adds a new sentence', () => {
    const store = useSentenceStore()
    const initialLength = store.sentences.length
    
    store.addSentence({
      id: 's_new',
      musicId: 'm1',
      text: 'New',
      translation: 'New',
      startTime: 0,
      endTime: 1
    })
    
    expect(store.sentences.length).toBe(initialLength + 1)
    expect(store.sentences.find(s => s.id === 's_new')?.text).toBe('New')
  })

  it('updates an existing sentence', () => {
    const store = useSentenceStore()
    const firstSentence = store.sentences[0]
    store.updateSentence(firstSentence.id, { text: 'Updated Text' })
    
    expect(store.sentences.find(s => s.id === firstSentence.id)?.text).toBe('Updated Text')
  })

  it('deletes a sentence', () => {
    const store = useSentenceStore()
    const firstSentenceId = store.sentences[0].id
    const initialLength = store.sentences.length
    
    store.deleteSentence(firstSentenceId)
    
    expect(store.sentences.length).toBe(initialLength - 1)
    expect(store.sentences.find(s => s.id === firstSentenceId)).toBeUndefined()
  })

  it('deletes all sentences by musicId', () => {
    const store = useSentenceStore()
    store.clearAll()
    store.addSentence({ id: 's1', musicId: 'm1', text: 'A', translation: 'A', startTime: 2, endTime: 3 })
    store.addSentence({ id: 's2', musicId: 'm1', text: 'B', translation: 'B', startTime: 1, endTime: 2 })
    store.addSentence({ id: 's3', musicId: 'm2', text: 'C', translation: 'C', startTime: 0, endTime: 1 })
    
    store.deleteSentencesByMusicId('m1')
    
    expect(store.sentences.length).toBe(1)
    expect(store.sentences[0].musicId).toBe('m2')
  })

  it('resets to default data', () => {
    const store = useSentenceStore()
    store.clearAll()
    expect(store.sentences.length).toBe(0)
    
    store.resetToDefaults()
    expect(store.sentences.length).toBe(defaultSentences.length)
  })
})
