<script setup lang="ts">
import { ref, computed } from 'vue'
import { useMusicStore } from '../stores/music'
import { useProgressStore } from '../stores/progress'
import { useRouter } from 'vue-router'
import SettingsModal from '../components/SettingsModal.vue'

const musicStore = useMusicStore()
const progressStore = useProgressStore()
const router = useRouter()

const handleImageError = (e: Event) => {
  const target = e.target as HTMLImageElement
  // If the image fails to load, simply hide it. The background color and icon from v-else will NOT magically show up,
  // but hiding the broken image is better than showing a broken icon. A better approach is to change its src to a transparent pixel
  // or a local fallback image, but for now we just hide the broken <img> element to reveal the dark background.
  target.style.display = 'none'
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
  // Meting API often redirects to NetEase with a size parameter like ?param=300y300
  // By appending our own parameter, we can sometimes override it, or at least try to request a larger size
  // If it's a direct NetEase URL, we can replace the param.
  // Since it's a 302 redirect from injahow.cn, we can't easily manipulate the final URL here without fetching it first.
  // However, we can try appending &pic_size=800 (if the API supports it) or just use it as is if we can't change it.
  // Another trick: some APIs support &size=800
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
  <div class="min-h-screen bg-gray-900 text-gray-100 p-4 sm:p-6 flex flex-col">
    <div class="w-full mx-auto">
      <header class="mb-8 flex justify-between items-center relative">
          <div class="absolute -top-10 -left-10 w-32 h-32 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none"></div>
          <div class="absolute top-0 right-0 w-32 h-32 bg-fuchsia-500/20 rounded-full blur-3xl pointer-events-none"></div>
          <div class="relative z-10">
            <h1 class="text-3xl font-extrabold bg-gradient-to-r from-cyan-400 to-fuchsia-500 bg-clip-text text-transparent mb-1 drop-shadow-[0_0_15px_rgba(34,211,238,0.3)]">
              Neon English
            </h1>
            <p class="text-gray-400 text-xs sm:text-sm">Tap a song to start the challenge</p>
          </div>
          
          <div class="flex items-center gap-3 relative z-10">
            <router-link
              to="/demo-alignment"
              class="p-2 rounded-xl bg-gradient-to-r from-purple-600/80 to-pink-600/80 border border-pink-500/50 hover:from-purple-500 hover:to-pink-500 transition-all text-sm shadow-[0_0_10px_rgba(236,72,153,0.5)] backdrop-blur-sm group flex items-center gap-2"
              title="Test Alignment Demo"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
              <span class="text-white font-medium hidden sm:inline">Demo</span>
            </router-link>

            <router-link
              to="/admin"
              class="p-2 rounded-xl bg-gray-800/80 border border-gray-700/50 hover:bg-gray-700 hover:border-cyan-500/50 transition-all text-sm shadow-[0_0_10px_rgba(0,0,0,0.5)] backdrop-blur-sm group"
              title="Admin"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400 group-hover:text-cyan-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h-8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </router-link>

            <button
              @click="isSettingsOpen = true"
              class="p-2 rounded-xl bg-gray-800/80 border border-gray-700/50 hover:bg-gray-700 hover:border-cyan-500/50 transition-all text-sm shadow-[0_0_10px_rgba(0,0,0,0.5)] backdrop-blur-sm group"
              title="Settings"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400 group-hover:text-cyan-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
        </header>

      <div v-if="musicStore.musics.length === 0" class="text-center py-20 bg-gray-800/40 rounded-3xl border border-gray-700/50 backdrop-blur-md relative overflow-hidden">
        <div class="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-fuchsia-500/5 pointer-events-none"></div>
        <div class="text-gray-400 mb-6 text-lg relative z-10">暂无音乐数据</div>
        <router-link 
          to="/admin" 
          class="relative z-10 inline-block px-8 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium transition-all shadow-[0_0_20px_rgba(8,145,178,0.4)] hover:shadow-[0_0_30px_rgba(8,145,178,0.6)]"
        >
          前往管理后台添加
        </router-link>
      </div>

      <div v-else class="flex flex-col gap-6">
        <div class="flex flex-col sm:flex-row gap-4 justify-between items-center z-10 relative">
          <!-- Difficulty Filter -->
          <div class="flex items-center gap-2 bg-gray-800/80 p-1.5 rounded-xl border border-gray-700/50 backdrop-blur-sm shadow-[0_0_10px_rgba(0,0,0,0.5)]">
            <button
              @click="difficultyFilter = 'all'"
              class="px-3 py-1.5 text-xs sm:text-sm rounded-lg font-medium transition-all"
              :class="difficultyFilter === 'all' ? 'bg-gray-700 text-white shadow-md' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700/50'"
            >
              全部
            </button>
            <button
              @click="difficultyFilter = 'easy'"
              class="px-3 py-1.5 text-xs sm:text-sm rounded-lg font-medium transition-all"
              :class="difficultyFilter === 'easy' ? 'bg-green-500/20 text-green-400 shadow-md border border-green-500/30' : 'text-gray-400 hover:text-green-400 hover:bg-green-500/10'"
            >
              简单
            </button>
            <button
              @click="difficultyFilter = 'medium'"
              class="px-3 py-1.5 text-xs sm:text-sm rounded-lg font-medium transition-all"
              :class="difficultyFilter === 'medium' ? 'bg-yellow-500/20 text-yellow-400 shadow-md border border-yellow-500/30' : 'text-gray-400 hover:text-yellow-400 hover:bg-yellow-500/10'"
            >
              中等
            </button>
            <button
              @click="difficultyFilter = 'hard'"
              class="px-3 py-1.5 text-xs sm:text-sm rounded-lg font-medium transition-all"
              :class="difficultyFilter === 'hard' ? 'bg-red-500/20 text-red-400 shadow-md border border-red-500/30' : 'text-gray-400 hover:text-red-400 hover:bg-red-500/10'"
            >
              困难
            </button>
          </div>

          <!-- Sort Dropdown -->
          <div class="relative w-full sm:w-auto">
            <select
              v-model="sortOption"
              class="w-full sm:w-48 appearance-none bg-gray-800/80 border border-gray-700/50 text-gray-200 text-sm rounded-xl px-4 py-2.5 pr-8 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 backdrop-blur-sm shadow-[0_0_10px_rgba(0,0,0,0.5)] cursor-pointer"
            >
              <option value="recently_played">最近学习</option>
              <option value="title_az">歌名 (A-Z)</option>
              <option value="difficulty">难度系数</option>
            </select>
            <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
              <svg class="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
              </svg>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 relative z-10">
          <div
            v-for="music in displayedMusics"
            :key="music.id"
            @click="playMusic(music.id)"
            class="group cursor-pointer relative rounded-[2rem] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.25)] hover:-translate-y-2 transition-all duration-500 bg-gray-900"
          >
            <div class="aspect-[4/5] sm:aspect-square relative w-full h-full">
              <img
                  v-if="music.coverUrl"
                  :src="getHighResCoverUrl(music.coverUrl)"
                  :alt="music.title"
                  @error="handleImageError"
                  class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              <div v-else class="w-full h-full flex items-center justify-center text-gray-500 bg-gray-800">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
              </div>
              
              <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div class="absolute bottom-0 left-0 right-0 p-4 sm:p-6 flex flex-col justify-end z-10 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                <div class="flex items-center gap-2 mb-2 flex-wrap">
                  <span 
                    class="px-2 py-0.5 rounded-full text-[10px] font-semibold backdrop-blur-md border uppercase tracking-wider"
                    :class="{
                      'bg-green-500/20 text-green-300 border-green-500/30': music.difficulty === 'easy',
                      'bg-yellow-500/20 text-yellow-300 border-yellow-500/30': music.difficulty === 'medium',
                      'bg-red-500/20 text-red-300 border-red-500/30': music.difficulty === 'hard'
                    }"
                  >
                    {{ getDifficultyLabel(music.difficulty) }}
                  </span>
                  <span v-if="progressStore.getProgress(music.id)" class="text-[10px] text-white/90 font-medium bg-black/40 px-2 py-0.5 rounded-full backdrop-blur-md border border-white/10">
                    {{ progressStore.getProgress(music.id)?.currentIndex }} / {{ progressStore.getProgress(music.id)?.total }}
                  </span>
                </div>

                <h3 class="text-base sm:text-xl font-bold text-white tracking-tight leading-tight mb-0.5 line-clamp-2 drop-shadow-md">
                  {{ music.title }}
                </h3>
                <p class="text-xs sm:text-sm text-gray-300 truncate drop-shadow-md">
                  {{ music.artist }}
                </p>
              </div>

              <div class="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 backdrop-blur-md border border-white/20 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all duration-300 scale-90 group-hover:scale-100 shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-0.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <SettingsModal :is-open="isSettingsOpen" @close="isSettingsOpen = false" />
  </div>
</template>
