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
  <Transition name="fade">
    <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm" @click="emit('close')">
      <div 
        class="relative w-full max-w-md bg-white rounded-3xl shadow-bili overflow-hidden transform transition-all"
        @click.stop
      >
        <!-- Header -->
        <div class="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h2 class="text-xl font-black bg-gradient-to-r from-bili-blue to-bili-pink bg-clip-text text-transparent">
            全局设置
          </h2>
          <button 
            @click="emit('close')"
            class="text-slate-400 hover:text-bili-pink transition-colors p-1.5 rounded-full hover:bg-slate-100"
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
              <label class="text-slate-700 font-bold text-sm flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-bili-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                拼句超时时间
              </label>
              <span class="text-bili-blue font-mono font-bold bg-sky-50 px-2.5 py-1 rounded-md border border-sky-100">
                {{ settingsStore.buildTimeout }}s
              </span>
            </div>
            <div class="relative flex items-center py-2">
              <input 
                type="range" 
                v-model.number="settingsStore.buildTimeout" 
                min="10" 
                max="60" 
                class="w-full h-2 bg-slate-100 rounded-full appearance-none cursor-pointer accent-bili-blue hover:accent-sky-400 transition-all"
              />
            </div>
            <div class="flex justify-between text-xs text-slate-400 font-mono font-bold px-1">
              <span>10s</span>
              <span>60s</span>
            </div>
          </div>

          <div class="h-px w-full bg-slate-100"></div>

          <!-- Auto-fill on Timeout Toggle -->
          <div class="flex items-center justify-between group">
            <label class="text-slate-700 font-bold text-sm flex items-center gap-2 cursor-pointer" @click="settingsStore.autoFillOnTimeout = !settingsStore.autoFillOnTimeout">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-bili-pink" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              超时自动填充答案
            </label>
            <button 
              @click="settingsStore.autoFillOnTimeout = !settingsStore.autoFillOnTimeout"
              class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-bili-pink/30 focus:ring-offset-2"
              :class="settingsStore.autoFillOnTimeout ? 'bg-bili-pink' : 'bg-slate-200'"
            >
              <span 
                class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm"
                :class="settingsStore.autoFillOnTimeout ? 'translate-x-6' : 'translate-x-1'"
              />
            </button>
          </div>

          <!-- Auto-proceed on Timeout Toggle -->
          <div class="flex items-center justify-between group">
            <label class="text-slate-700 font-bold text-sm flex items-center gap-2 cursor-pointer" @click="settingsStore.autoProceedOnTimeout = !settingsStore.autoProceedOnTimeout">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              超时自动进入下一句
            </label>
            <button 
              @click="settingsStore.autoProceedOnTimeout = !settingsStore.autoProceedOnTimeout"
              class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:ring-offset-2"
              :class="settingsStore.autoProceedOnTimeout ? 'bg-purple-500' : 'bg-slate-200'"
            >
              <span 
                class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm"
                :class="settingsStore.autoProceedOnTimeout ? 'translate-x-6' : 'translate-x-1'"
              />
            </button>
          </div>

          <div class="h-px w-full bg-slate-100"></div>

          <!-- Enable Live2D Character Toggle -->
          <div class="flex items-center justify-between group">
            <label class="text-slate-700 font-bold text-sm flex items-center gap-2 cursor-pointer" @click="settingsStore.enableLive2D = !settingsStore.enableLive2D">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              显示动态二次元歌姬
            </label>
            <button 
              @click="settingsStore.enableLive2D = !settingsStore.enableLive2D"
              class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:ring-offset-2"
              :class="settingsStore.enableLive2D ? 'bg-emerald-500' : 'bg-slate-200'"
            >
              <span 
                class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm"
                :class="settingsStore.enableLive2D ? 'translate-x-6' : 'translate-x-1'"
              />
            </button>
          </div>
        </div>

        <!-- Footer -->
        <div class="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button 
            @click="emit('close')"
            class="px-6 py-2.5 rounded-full bg-white border border-slate-200 text-slate-600 hover:text-bili-blue hover:border-sky-200 hover:bg-sky-50 transition-all text-sm font-bold shadow-sm"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.fade-enter-active > div {
  animation: bounce-in 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes bounce-in {
  0% { transform: scale(0.95); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}

/* Custom range slider styling for cross-browser consistency with clean feel */
input[type=range]::-webkit-slider-thumb {
  -webkit-appearance: none;
  height: 20px;
  width: 20px;
  border-radius: 50%;
  background: #00A1D6; /* bili-blue */
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  border: 3px solid #fff;
}

input[type=range]::-moz-range-thumb {
  height: 20px;
  width: 20px;
  border-radius: 50%;
  background: #00A1D6;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  border: 3px solid #fff;
}
</style>
