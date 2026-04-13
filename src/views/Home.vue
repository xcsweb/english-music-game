<script setup lang="ts">
import { ref, computed } from 'vue'
import { useMusicStore } from '../stores/music'
import { useProgressStore } from '../stores/progress'
import { useRouter } from 'vue-router'
import SettingsModal from '../components/SettingsModal.vue'

const musicStore = useMusicStore()
const progressStore = useProgressStore()
const router = useRouter()

const fallbackCover = `data:image/svg+xml,${encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="675" viewBox="0 0 1200 675">
    <defs>
      <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
        <stop offset="0" stop-color="#E0F2FE"/>
        <stop offset="0.55" stop-color="#FFFFFF"/>
        <stop offset="1" stop-color="#FCE7F3"/>
      </linearGradient>
    </defs>
    <rect width="1200" height="675" rx="48" fill="url(#g)"/>
    <circle cx="250" cy="160" r="120" fill="#FB7299" fill-opacity="0.12"/>
    <circle cx="980" cy="520" r="160" fill="#00AEEC" fill-opacity="0.12"/>
    <path d="M540 245v230c0 44-36 80-80 80s-80-36-80-80 36-80 80-80c15 0 29 4 40 11V271l320-76v210c0 44-36 80-80 80s-80-36-80-80 36-80 80-80c15 0 29 4 40 11V244z" fill="#0B1220" fill-opacity="0.35"/>
  </svg>
`)}`

const handleImageError = (e: Event) => {
  const target = e.target as HTMLImageElement
  if (target.dataset.fallbackApplied === '1') return
  target.dataset.fallbackApplied = '1'
  target.src = fallbackCover
}

const isSettingsOpen = ref(false)
const difficultyFilter = ref('all') // 'all', 'easy', 'medium', 'hard'
const sortOption = ref('recently_played') // 'recently_played', 'title_az', 'difficulty'

const displayedMusics = computed(() => {
  let result = [...musicStore.musics]

  // Filter
  if (difficultyFilter.value !== 'all') {
    result = result.filter(m => m.difficulty === difficultyFilter.value)
  }

  // Sort
  result.sort((a, b) => {
    if (sortOption.value === 'recently_played') {
      const pA = progressStore.getProgress(a.id)?.lastPlayed || 0
      const pB = progressStore.getProgress(b.id)?.lastPlayed || 0
      return pB - pA // Descending
    } else if (sortOption.value === 'title_az') {
      return a.title.localeCompare(b.title)
    } else if (sortOption.value === 'difficulty') {
      const diffOrder: Record<string, number> = { 'easy': 1, 'medium': 2, 'hard': 3 }
      const diffA = diffOrder[a.difficulty] || 99
      const diffB = diffOrder[b.difficulty] || 99
      return diffA - diffB
    }
    return 0
  })

  return result
})

const getHighResCoverUrl = (url: string) => {
  if (!url) return url
  if (url.includes('api.injahow.cn/meting')) {
    return url + '&size=800'
  }
  if (url.includes('?param=')) {
    return url.replace(/\?param=\d+[yx]\d+/, '?param=800y800')
  }
  return url
}
const getDifficultyLabel = (difficulty: string) => {
  switch (difficulty) {
    case 'easy': return '简单'
    case 'medium': return '中等'
    case 'hard': return '困难'
    default: return difficulty
  }
}

const playMusic = (id: string) => {
  router.push(`/game/${id}`)
}
</script>

<template>
  <div class="min-h-screen text-slate-900 px-4 sm:px-6 lg:px-10 py-6 lg:py-10">
    <div class="relative">
      <div class="absolute -top-10 -left-10 w-56 h-56 bg-bili-blue/15 rounded-full blur-3xl pointer-events-none"></div>
      <div class="absolute -top-16 right-10 w-64 h-64 bg-bili-pink/15 rounded-full blur-3xl pointer-events-none"></div>

      <header class="mb-8 flex justify-between items-start gap-4 relative">
          <div class="relative z-10">
            <h1 class="text-3xl sm:text-4xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-bili-blue to-bili-pink">
              Neon English
            </h1>
            <p class="text-slate-500 text-xs sm:text-sm mt-1">点一首歌开始闯关 · 记忆 → 重排 → 过关</p>
          </div>
          
          <div class="flex items-center gap-3 relative z-10">
            <router-link
              to="/demo-alignment"
              class="px-3 py-2 rounded-full bg-white/80 border border-slate-200 hover:border-bili-blue/40 hover:bg-white transition-all text-sm shadow-bili backdrop-blur-sm group flex items-center gap-2"
              title="Test Alignment Demo"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-bili-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
              <span class="text-slate-700 font-semibold hidden sm:inline">Demo</span>
            </router-link>

            <router-link
              to="/admin"
              class="p-2 rounded-full bg-white/80 border border-slate-200 hover:border-bili-pink/40 hover:bg-white transition-all text-sm shadow-bili backdrop-blur-sm group"
              title="Admin"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-slate-500 group-hover:text-bili-pink transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h-8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </router-link>

            <button
              @click="isSettingsOpen = true"
              class="p-2 rounded-full bg-white/80 border border-slate-200 hover:border-bili-blue/40 hover:bg-white transition-all text-sm shadow-bili backdrop-blur-sm group"
              title="Settings"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-slate-500 group-hover:text-bili-blue transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
        </header>

      <div v-if="musicStore.musics.length === 0" class="text-center py-20 bg-white/80 rounded-3xl border border-slate-200 backdrop-blur-md relative overflow-hidden shadow-bili">
        <div class="absolute inset-0 bg-gradient-to-br from-bili-blue/10 to-bili-pink/10 pointer-events-none"></div>
        <div class="text-slate-600 mb-6 text-lg relative z-10 font-semibold">暂无音乐数据</div>
        <router-link 
          to="/admin" 
          class="relative z-10 inline-flex items-center justify-center px-8 py-3 rounded-full bg-bili-pink hover:bg-bili-pink/90 text-white font-semibold transition-all shadow-bili"
        >
          前往管理后台添加
        </router-link>
      </div>

      <div v-else class="flex flex-col gap-6">
        <div class="flex flex-col sm:flex-row gap-4 justify-between items-center z-10 relative">
          <div class="flex items-center gap-2 bg-white/80 p-1.5 rounded-full border border-slate-200 backdrop-blur-sm shadow-bili">
            <button
              @click="difficultyFilter = 'all'"
              class="px-3 py-1.5 text-xs sm:text-sm rounded-full font-semibold transition-all"
              :class="difficultyFilter === 'all' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'"
            >
              全部
            </button>
            <button
              @click="difficultyFilter = 'easy'"
              class="px-3 py-1.5 text-xs sm:text-sm rounded-full font-semibold transition-all"
              :class="difficultyFilter === 'easy' ? 'bg-emerald-500/15 text-emerald-700 border border-emerald-500/20' : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-500/10'"
            >
              简单
            </button>
            <button
              @click="difficultyFilter = 'medium'"
              class="px-3 py-1.5 text-xs sm:text-sm rounded-full font-semibold transition-all"
              :class="difficultyFilter === 'medium' ? 'bg-amber-500/15 text-amber-800 border border-amber-500/20' : 'text-slate-600 hover:text-amber-800 hover:bg-amber-500/10'"
            >
              中等
            </button>
            <button
              @click="difficultyFilter = 'hard'"
              class="px-3 py-1.5 text-xs sm:text-sm rounded-full font-semibold transition-all"
              :class="difficultyFilter === 'hard' ? 'bg-rose-500/15 text-rose-700 border border-rose-500/20' : 'text-slate-600 hover:text-rose-700 hover:bg-rose-500/10'"
            >
              困难
            </button>
          </div>

          <div class="relative w-full sm:w-auto">
            <select
              v-model="sortOption"
              class="w-full sm:w-56 appearance-none bg-white/80 border border-slate-200 text-slate-700 text-sm rounded-full px-4 py-2.5 pr-9 focus:outline-none focus:border-bili-pink/40 focus:ring-2 focus:ring-bili-pink/20 backdrop-blur-sm shadow-bili cursor-pointer"
            >
              <option value="recently_played">最近学习</option>
              <option value="title_az">歌名 (A-Z)</option>
              <option value="difficulty">难度系数</option>
            </select>
            <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400">
              <svg class="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
              </svg>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-2 sm:[grid-template-columns:repeat(auto-fit,minmax(220px,1fr))] gap-4 sm:gap-6 relative z-10">
          <div
            v-for="music in displayedMusics"
            :key="music.id"
            @click="playMusic(music.id)"
            class="group cursor-pointer relative rounded-2xl overflow-hidden bg-white/85 backdrop-blur-md border border-slate-200 shadow-bili hover:shadow-biliHover hover:-translate-y-1 transition-all duration-300"
          >
            <!-- Image & Overlay Container -->
            <div class="aspect-square relative w-full h-full bg-gradient-to-br from-sky-100 to-pink-100">
              <img
                  v-if="music.coverUrl"
                  :src="getHighResCoverUrl(music.coverUrl)"
                  :alt="music.title"
                  @error="handleImageError"
                  class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
              <div v-else class="w-full h-full flex items-center justify-center text-slate-400">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
              </div>

              <!-- Dark Gradient Overlay for Text Readability -->
              <div class="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent pointer-events-none"></div>

              <!-- Overlay Content: Badges and Title -->
              <div class="absolute bottom-0 left-0 w-full p-3 sm:p-4 flex flex-col gap-1.5 pointer-events-none">
                <!-- Badges Row -->
                <div class="flex flex-wrap items-center gap-1.5 mb-0.5">
                  <span
                    class="px-2 py-0.5 rounded-sm text-[10px] sm:text-xs font-black tracking-wide"
                    :class="{
                      'bg-emerald-500 text-white': music.difficulty === 'easy',
                      'bg-amber-500 text-white': music.difficulty === 'medium',
                      'bg-rose-500 text-white': music.difficulty === 'hard'
                    }"
                  >
                    {{ getDifficultyLabel(music.difficulty) }}
                  </span>
                  <span
                    v-if="progressStore.getProgress(music.id)"
                    class="px-2 py-0.5 rounded-sm text-[10px] sm:text-xs font-black bg-white/20 backdrop-blur-md text-white border border-white/20"
                  >
                    {{ progressStore.getProgress(music.id)?.currentIndex }} / {{ progressStore.getProgress(music.id)?.total }}
                  </span>
                </div>

                <!-- Title & Artist (Truncated to prevent layout break) -->
                <div class="min-w-0">
                  <h3 class="text-sm sm:text-base font-black text-white leading-tight truncate drop-shadow-md">
                    {{ music.title }}
                  </h3>
                  <p class="text-[10px] sm:text-xs text-slate-300 truncate mt-0.5 drop-shadow-md">
                    {{ music.artist }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <SettingsModal :is-open="isSettingsOpen" @close="isSettingsOpen = false" />
  </div>
</template>
