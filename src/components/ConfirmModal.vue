<script setup lang="ts">
defineProps<{
  isOpen: boolean
  title?: string
  message: string
  confirmText?: string
  cancelText?: string
  isDanger?: boolean
  showCancel?: boolean
}>()

const emit = defineEmits<{
  (e: 'confirm'): void
  (e: 'cancel'): void
}>()
</script>

<template>
  <Transition name="fade">
    <div v-if="isOpen" class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm" @click="emit('cancel')">
      <div 
        class="relative w-full max-w-sm bg-white rounded-2xl shadow-bili overflow-hidden transform transition-all"
        @click.stop
      >
        <div class="px-6 py-5">
          <h3 class="text-lg font-bold text-slate-800 mb-2">{{ title || '提示' }}</h3>
          <p class="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">{{ message }}</p>
        </div>
        
        <div class="px-6 py-4 bg-slate-50 flex justify-end gap-3 border-t border-slate-100">
          <button 
            v-if="showCancel !== false"
            @click="emit('cancel')"
            class="px-4 py-2 rounded-full text-sm font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 hover:text-slate-800 transition-colors shadow-sm"
          >
            {{ cancelText || '取消' }}
          </button>
          <button 
            @click="emit('confirm')"
            class="px-4 py-2 rounded-full text-sm font-medium text-white transition-colors shadow-sm"
            :class="isDanger ? 'bg-rose-500 hover:bg-rose-600' : 'bg-bili-blue hover:bg-bili-blue/90'"
          >
            {{ confirmText || '确定' }}
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
  0% { transform: scale(0.9); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}
</style>
