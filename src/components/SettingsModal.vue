<script setup lang="ts">
import { useSettingsStore } from '../stores/settings'

defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const settingsStore = useSettingsStore()
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/80 backdrop-blur-sm">
    <div 
      class="relative w-full max-w-md bg-gray-900 border border-cyan-500/30 rounded-2xl shadow-[0_0_30px_rgba(34,211,238,0.15)] overflow-hidden"
      @click.stop
    >
      <!-- Header -->
      <div class="px-6 py-4 border-b border-gray-800 flex justify-between items-center bg-gray-800/50">
        <h2 class="text-xl font-bold bg-gradient-to-r from-cyan-400 to-fuchsia-500 bg-clip-text text-transparent drop-shadow-[0_0_10px_rgba(34,211,238,0.3)]">
          Settings
        </h2>
        <button 
          @click="emit('close')"
          class="text-gray-400 hover:text-cyan-400 transition-colors p-1 rounded-lg hover:bg-gray-800"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Content -->
      <div class="p-6 space-y-6">
        <!-- Build Timeout Slider -->
        <div class="space-y-3">
          <div class="flex justify-between items-center">
            <label class="text-gray-200 font-medium text-sm flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Build Timeout
            </label>
            <span class="text-cyan-400 font-mono bg-cyan-950/50 px-2 py-0.5 rounded border border-cyan-500/20 shadow-[0_0_10px_rgba(34,211,238,0.1)]">
              {{ settingsStore.buildTimeout }}s
            </span>
          </div>
          <div class="relative flex items-center">
            <input 
              type="range" 
              v-model.number="settingsStore.buildTimeout" 
              min="10" 
              max="60" 
              class="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-cyan-500 hover:accent-cyan-400 transition-all shadow-[0_0_10px_rgba(34,211,238,0.2)]"
            />
          </div>
          <div class="flex justify-between text-xs text-gray-500 font-mono">
            <span>10s</span>
            <span>60s</span>
          </div>
        </div>

        <div class="h-px w-full bg-gradient-to-r from-transparent via-gray-700 to-transparent"></div>

        <!-- Auto-fill on Timeout Toggle -->
        <div class="flex items-center justify-between group">
          <label class="text-gray-200 font-medium text-sm flex items-center gap-2 cursor-pointer" @click="settingsStore.autoFillOnTimeout = !settingsStore.autoFillOnTimeout">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-fuchsia-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Auto-fill words on timeout
          </label>
          <button 
            @click="settingsStore.autoFillOnTimeout = !settingsStore.autoFillOnTimeout"
            class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-fuchsia-500 focus:ring-offset-2 focus:ring-offset-gray-900 shadow-[0_0_10px_rgba(217,70,239,0.2)]"
            :class="settingsStore.autoFillOnTimeout ? 'bg-fuchsia-500' : 'bg-gray-700'"
          >
            <span 
              class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
              :class="settingsStore.autoFillOnTimeout ? 'translate-x-6' : 'translate-x-1'"
            />
          </button>
        </div>

        <!-- Auto-proceed on Timeout Toggle -->
        <div class="flex items-center justify-between group">
          <label class="text-gray-200 font-medium text-sm flex items-center gap-2 cursor-pointer" @click="settingsStore.autoProceedOnTimeout = !settingsStore.autoProceedOnTimeout">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Auto-proceed to next sentence
          </label>
          <button 
            @click="settingsStore.autoProceedOnTimeout = !settingsStore.autoProceedOnTimeout"
            class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900 shadow-[0_0_10px_rgba(168,85,247,0.2)]"
            :class="settingsStore.autoProceedOnTimeout ? 'bg-purple-500' : 'bg-gray-700'"
          >
            <span 
              class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
              :class="settingsStore.autoProceedOnTimeout ? 'translate-x-6' : 'translate-x-1'"
            />
          </button>
        </div>
      </div>

      <!-- Footer -->
      <div class="px-6 py-4 border-t border-gray-800 bg-gray-800/30 flex justify-end">
        <button 
          @click="emit('close')"
          class="px-5 py-2 rounded-lg bg-gray-800 border border-gray-600 text-gray-300 hover:text-cyan-400 hover:border-cyan-500 hover:bg-gray-800/80 transition-all text-sm font-medium shadow-[0_0_10px_rgba(0,0,0,0.5)] hover:shadow-[0_0_15px_rgba(34,211,238,0.2)]"
        >
          Close
        </button>
      </div>
      
      <!-- Decorative elements -->
      <div class="absolute -top-10 -left-10 w-20 h-20 bg-cyan-500/20 rounded-full blur-2xl pointer-events-none"></div>
      <div class="absolute -bottom-10 -right-10 w-20 h-20 bg-fuchsia-500/20 rounded-full blur-2xl pointer-events-none"></div>
    </div>
  </div>
</template>

<style scoped>
/* Custom range slider styling for cross-browser consistency with cyberpunk feel */
input[type=range]::-webkit-slider-thumb {
  -webkit-appearance: none;
  height: 16px;
  width: 16px;
  border-radius: 50%;
  background: #22d3ee;
  cursor: pointer;
  box-shadow: 0 0 10px #22d3ee;
  border: 2px solid #083344;
}

input[type=range]::-moz-range-thumb {
  height: 16px;
  width: 16px;
  border-radius: 50%;
  background: #22d3ee;
  cursor: pointer;
  box-shadow: 0 0 10px #22d3ee;
  border: 2px solid #083344;
}
</style>
