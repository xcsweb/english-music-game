import { defineStore } from 'pinia'

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    buildTimeout: 30,
    autoFillOnTimeout: true,
    autoProceedOnTimeout: true,
  }),
  persist: true,
})
