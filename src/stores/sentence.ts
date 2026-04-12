import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { defaultSentences } from '../data/defaultData'

export interface Sentence {
  id: string
  musicId: string
  text: string
  translation: string
  distractors?: string
  startTime: number
  endTime: number
}

export const useSentenceStore = defineStore('sentence', () => {
  let saved = JSON.parse(localStorage.getItem('sentences') || '[]')
  // Force reload default data if there are less than 10 sentences (old mock data)
  if (saved.length < 10) {
    saved = JSON.parse(JSON.stringify(defaultSentences))
    localStorage.setItem('sentences', JSON.stringify(saved))
  }
  const sentences = ref<Sentence[]>(saved.length > 0 ? saved : JSON.parse(JSON.stringify(defaultSentences)))

  watch(sentences, (newVal) => {
    localStorage.setItem('sentences', JSON.stringify(newVal))
  }, { deep: true })

  const getSentencesByMusicId = (musicId: string) => {
    return sentences.value.filter(s => s.musicId === musicId).sort((a, b) => a.startTime - b.startTime)
  }

  const addSentence = (sentence: Sentence) => {
    sentences.value.push(sentence)
  }

  const updateSentence = (id: string, updated: Partial<Sentence>) => {
    const index = sentences.value.findIndex(s => s.id === id)
    if (index !== -1) {
      sentences.value[index] = { ...sentences.value[index], ...updated }
    }
  }

  const deleteSentence = (id: string) => {
    sentences.value = sentences.value.filter(s => s.id !== id)
  }
  
  const deleteSentencesByMusicId = (musicId: string) => {
    sentences.value = sentences.value.filter(s => s.musicId !== musicId)
  }

  const resetToDefaults = () => {
    sentences.value = JSON.parse(JSON.stringify(defaultSentences))
  }

  const clearAll = () => {
    sentences.value = []
  }

  return { 
    sentences, 
    getSentencesByMusicId, 
    addSentence, 
    updateSentence, 
    deleteSentence, 
    deleteSentencesByMusicId,
    resetToDefaults,
    clearAll
  }
})
