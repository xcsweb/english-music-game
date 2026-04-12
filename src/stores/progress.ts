import { defineStore } from 'pinia'

interface ProgressState {
  progressMap: Record<string, { currentIndex: number; total: number; lastPlayed: number }>
}

export const useProgressStore = defineStore('progress', {
  state: (): ProgressState => ({
    progressMap: {},
  }),
  actions: {
    saveProgress(musicId: string, currentIndex: number, total: number) {
      this.progressMap[musicId] = {
        currentIndex,
        total,
        lastPlayed: Date.now(),
      }
    },
    getProgress(musicId: string) {
      return this.progressMap[musicId] || null
    },
    clearProgress(musicId: string) {
      delete this.progressMap[musicId]
    },
  },
  persist: true,
})
