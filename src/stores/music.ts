import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { defaultMusics } from '../data/defaultData'

export interface Music {
  id: string
  title: string
  artist: string
  coverUrl: string
  audioUrl: string
  difficulty: 'easy' | 'medium' | 'hard'
}

export const useMusicStore = defineStore('music', () => {
  let saved = JSON.parse(localStorage.getItem('musics') || '[]')
  // Force reload default data if there is only 1 song (old mock data)
  if (saved.length <= 1) {
    saved = JSON.parse(JSON.stringify(defaultMusics))
    localStorage.setItem('musics', JSON.stringify(saved))
  }
  const musics = ref<Music[]>(saved.length > 0 ? saved : JSON.parse(JSON.stringify(defaultMusics)))

  watch(musics, (newVal) => {
    localStorage.setItem('musics', JSON.stringify(newVal))
  }, { deep: true })

  const addMusic = (music: Music) => {
    musics.value.push(music)
  }

  const updateMusic = (id: string, updated: Partial<Music>) => {
    const index = musics.value.findIndex(m => m.id === id)
    if (index !== -1) {
      musics.value[index] = { ...musics.value[index], ...updated }
    }
  }

  const deleteMusic = (id: string) => {
    musics.value = musics.value.filter(m => m.id !== id)
  }

  const getMusicById = (id: string) => {
    return musics.value.find(m => m.id === id)
  }

  const resetToDefaults = () => {
    musics.value = JSON.parse(JSON.stringify(defaultMusics))
  }

  const clearAll = () => {
    musics.value = []
  }

  return { musics, addMusic, updateMusic, deleteMusic, getMusicById, resetToDefaults, clearAll }
})
