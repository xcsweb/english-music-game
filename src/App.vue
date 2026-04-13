<script setup lang="ts">
import { ref } from 'vue'

// Global state to track if user has interacted with the document
// This is crucial to bypass browser's Autoplay Policy on page refresh
const hasInteracted = ref(false)

const handleInteraction = () => {
  hasInteracted.value = true
}
</script>

<template>
  <div class="min-h-[100svh] bg-gradient-to-b from-sky-50 via-white to-pink-50 text-slate-900 relative">
    
    <!-- Global Tap to Start Overlay -->
    <Transition name="fade">
      <div 
        v-if="!hasInteracted" 
        class="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white/80 backdrop-blur-md cursor-pointer"
        @click="handleInteraction"
      >
        <div class="text-center p-8 rounded-3xl bg-white border border-slate-200 shadow-bili hover:shadow-biliHover transition-shadow duration-300">
          <h2 class="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-bili-blue to-bili-pink mb-4">
            Neon English
          </h2>
          <p class="text-slate-500 font-medium mb-8">点击屏幕任意位置进入学习</p>
          
          <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-bili-pink text-white shadow-bili animate-pulse">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </div>
    </Transition>

    <router-view v-if="hasInteracted" />
  </div>
</template>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.4s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
