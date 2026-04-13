import { defineStore } from 'pinia'

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    buildTimeout: 30,
    autoFillOnTimeout: true,
    autoProceedOnTimeout: true,
    enableLive2D: true,
    live2dModel: 'haru',
  }),
  persist: true,
})
