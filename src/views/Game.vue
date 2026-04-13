<template>
  <div class="min-h-[100svh] bg-gradient-to-b from-sky-50 via-white to-pink-50 text-slate-900 flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden">
    <div class="absolute -top-24 -left-24 w-80 h-80 bg-bili-blue/15 rounded-full blur-3xl pointer-events-none"></div>
    <div class="absolute -top-32 right-10 w-96 h-96 bg-bili-pink/15 rounded-full blur-3xl pointer-events-none"></div>
    <div class="absolute bottom-[-140px] left-1/3 w-[520px] h-[520px] bg-sky-200/35 rounded-full blur-3xl pointer-events-none"></div>

    <div v-if="!music || !sentences.length" class="text-center relative z-10 w-full max-w-md bg-white/80 border border-slate-200 rounded-3xl p-8 backdrop-blur-md shadow-bili">
      <p class="text-lg font-semibold text-slate-700">歌曲加载中，或暂无可用句子</p>
      <button type="button" @click="router.push('/')" class="mt-6 px-8 py-3 rounded-full bg-bili-pink hover:bg-bili-pink/90 text-white font-semibold shadow-bili transition-colors">返回首页</button>
    </div>

    <div v-else-if="showStartOverlay" class="absolute inset-0 bg-white/70 z-50 flex flex-col items-center justify-center backdrop-blur-md animate-fade-in p-6">
      <h2 class="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-bili-blue to-bili-pink mb-4 text-center">
        {{ music.title }}
      </h2>

      <div v-if="audioLoadError" class="text-center mb-8 max-w-md bg-white/90 border border-rose-200 rounded-2xl p-6 shadow-bili">
        <p class="font-semibold text-rose-700 mb-2">音频加载失败</p>
        <p class="text-sm text-slate-600">可能是网络或跨域限制导致无法播放，请换一首歌或稍后重试。</p>
        <button type="button" @click="router.push('/')" class="mt-5 px-8 py-3 rounded-full bg-rose-500 hover:bg-rose-500/90 text-white font-semibold shadow-bili transition-colors">返回首页</button>
      </div>

      <div v-else-if="!isAudioLoaded" class="flex flex-col items-center w-full max-w-sm px-4">
        <div class="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
          <div class="h-full bg-gradient-to-r from-bili-blue to-bili-pink transition-all duration-200 ease-out" :style="{ width: loadingPhase === 'decoding' ? '100%' : `${loadingProgress}%` }"></div>
        </div>
        <p class="mt-3 text-sm font-semibold text-slate-600">
          {{ loadingPhase === 'decoding' ? '正在解码音频…' : `正在下载音频 (${loadingProgress}%)…` }}
        </p>
      </div>

      <button type="button" v-else @click="handleStartGame" class="mt-6 px-12 py-4 rounded-full bg-bili-pink hover:bg-bili-pink/90 text-white font-black text-lg shadow-bili transition-colors active:scale-[0.99]">
        开始游戏
      </button>
    </div>

    <div v-else-if="gameState === 'victory'" class="text-center animate-fade-in relative z-10 w-full max-w-lg bg-white/80 border border-slate-200 rounded-3xl p-10 backdrop-blur-md shadow-bili">
      <h1 class="text-4xl sm:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-bili-blue to-bili-pink">
        通关成功！
      </h1>
      <p class="mt-3 text-slate-600 font-semibold">
        你已完成：<span class="text-slate-900">{{ music.title }}</span>
      </p>
      <button type="button" @click="router.push('/')" class="mt-8 px-10 py-4 rounded-full bg-bili-blue hover:bg-bili-blue/90 text-white font-black shadow-bili transition-colors">
        返回选歌
      </button>
    </div>

    <div v-else class="w-full max-w-5xl flex flex-col flex-1 min-h-0 py-4 sm:py-6 relative z-10">
        <div class="flex justify-between items-center mb-6 bg-white/80 border border-slate-200 rounded-2xl px-3 sm:px-4 py-3 backdrop-blur-md shadow-bili">
          <button type="button" @click="router.push('/')" class="p-2 -ml-1 text-slate-500 hover:text-bili-pink transition-colors rounded-full hover:bg-slate-100" title="返回">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <div class="text-center flex-1 mx-4">
            <h2 class="text-sm sm:text-base font-black text-slate-900 truncate">{{ music.title }}</h2>
            <div class="flex items-center justify-center gap-2 mt-2">
              <div class="h-2 w-32 bg-slate-200 rounded-full overflow-hidden">
                <div class="h-full bg-gradient-to-r from-bili-blue to-bili-pink transition-all duration-300" :style="{ width: `${(currentIndex / sentences.length) * 100}%` }"></div>
              </div>
              <p class="text-[10px] text-slate-600 font-bold">{{ currentIndex + 1 }}/{{ sentences.length }}</p>
            </div>
          </div>
          <button
            @click="isSettingsOpen = true"
            class="p-2 -mr-1 text-slate-500 hover:text-bili-blue transition-colors rounded-full hover:bg-slate-100"
            title="设置"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>

        <div class="flex justify-center mb-6">
          <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 border border-slate-200 backdrop-blur-md shadow-bili">
            <span class="text-xs font-bold" :class="isPlaying ? 'text-bili-pink' : 'text-slate-500'">
              {{ isPlaying ? '播放中' : '待播放' }}
            </span>
            <div class="w-2 h-2 rounded-full" :class="isPlaying ? 'bg-bili-pink animate-pulse' : 'bg-slate-300'"></div>
          </div>
        </div>

        <div v-if="gameState === 'memorize'" class="w-full flex flex-col items-center animate-fade-in flex-1 min-h-0">
          <div class="w-full bg-white/85 border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-bili backdrop-blur-md">
            <div class="flex items-center justify-between gap-3">
              <div class="text-xs font-bold text-slate-500">记忆这句话</div>
              <div class="px-3 py-1 rounded-full text-xs font-black"
                   :class="countdown <= 3 ? 'bg-bili-pink text-white animate-pulse' : 'bg-bili-blue/10 text-bili-blue'">
                {{ countdown }}s
              </div>
            </div>

            <div class="mt-4 text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 leading-relaxed text-center">
              {{ currentSentence?.text }}
            </div>
            <div class="mt-3 text-sm sm:text-base text-slate-600 text-center">
              {{ currentSentence?.translation }}
            </div>
          </div>
        </div>

        <!-- Build Phase -->
        <div v-if="gameState === 'build' || gameState === 'success'" class="flex-1 min-h-0 flex flex-col animate-fade-in relative z-10">
          <!-- Instruction / Countdown -->
          <div class="flex justify-between items-center mb-6">
            <div class="text-xs font-bold text-slate-600 flex flex-col">
              <span>把句子拼回来</span>
              <span class="text-slate-500 text-[11px]">{{ currentSentence?.translation }}</span>
            </div>
            
            <!-- Countdown Display -->
            <div v-if="buildCountdown > 0 && gameState === 'build' && !isTimeoutHandling" class="text-slate-600 font-bold flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              00:{{ buildCountdown.toString().padStart(2, '0') }}
            </div>
            <div v-else-if="isTimeoutHandling" class="text-bili-pink font-black flex items-center gap-2 animate-pulse">
              超时啦
            </div>
          </div>

          <!-- Selected Words Area -->
          <TransitionGroup name="word" tag="div"
               class="min-h-[140px] bg-white/85 backdrop-blur-md p-5 sm:p-6 mb-6 flex flex-wrap content-start gap-3 transition-all duration-300 rounded-3xl border shadow-bili"
               :class="{
                   'border-bili-pink animate-[shake_0.5s_ease-in-out]': isWrong,
                   'border-emerald-400': isSuccess,
                   'border-slate-200': !isWrong && !isSuccess
                 }">
              <button type="button" v-for="(word, index) in selectedWords" :key="word.id"
                      @click="removeWord(index)"
                      class="group relative px-5 py-2.5 bg-bili-pink text-white font-black rounded-full hover:bg-bili-pink/90 transition-all active:scale-95 touch-manipulation shadow-bili"
                      :class="{ 'animate-[pop-shake_0.4s_ease-out]': word.isAnimating }"
                      :disabled="gameState === 'success' || isTimeoutHandling">
                <span class="block">{{ word.text }}</span>
            </button>
          </TransitionGroup>

          <!-- Word Pool Area -->
          <TransitionGroup name="word" tag="div" class="flex-1 min-h-0 overflow-auto flex flex-wrap content-start justify-center gap-3 sm:gap-4 relative pr-1">
            <button type="button" v-for="(word, index) in wordPool" :key="word.id"
                    @click="selectWord(index)"
                    class="relative px-5 py-2.5 bg-white/85 text-slate-800 font-black rounded-full transition-all border border-slate-200 hover:border-bili-blue/50 hover:bg-white active:scale-95 touch-manipulation shadow-bili"
                    :class="{
                      'opacity-0 scale-50 pointer-events-none': word.used,
                      'hover:shadow-biliHover': !word.used && gameState !== 'success' && !isTimeoutHandling
                    }"
                    :disabled="word.used || gameState === 'success' || isTimeoutHandling">
              <span class="block">{{ word.text }}</span>
            </button>
          </TransitionGroup>

          <!-- Replay Audio Button -->
          <div class="mt-auto flex justify-center pb-2 pt-4">
            <button type="button" @click="playAudioSegment" :disabled="isTimeoutHandling" 
                    class="group relative flex items-center gap-2 px-8 py-3 bg-bili-blue text-white font-black rounded-full hover:bg-bili-blue/90 transition-colors shadow-bili active:scale-95 touch-manipulation disabled:opacity-50 disabled:pointer-events-none">
              <div class="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                再听一遍
              </div>
            </button>
          </div>
        </div>
      </div>

    <SettingsModal :is-open="isSettingsOpen" @close="isSettingsOpen = false" />
    
    <!-- Live2D Character (Desktop Only) -->
    <Live2DCharacter
      v-if="settingsStore.enableLive2D && !showStartOverlay && !audioLoadError && music"
      :game-state="gameState"
      :is-playing="isPlaying"
      :is-wrong="isWrong"
      :is-timeout="isTimeoutHandling"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Howl } from 'howler'
import confetti from 'canvas-confetti'
import { useMusicStore } from '../stores/music'
import { useSentenceStore } from '../stores/sentence'
import { playCorrectSound, playWrongSound, playVictorySound } from '../utils/sound'
import { useSettingsStore } from '../stores/settings'
import { useProgressStore } from '../stores/progress'
import SettingsModal from '../components/SettingsModal.vue'
import Live2DCharacter from '../components/Live2DCharacter.vue'

let fadeOutTimer: number | null = null;

const route = useRoute()
const router = useRouter()
const musicStore = useMusicStore()
const sentenceStore = useSentenceStore()
const settingsStore = useSettingsStore()
const progressStore = useProgressStore()

const musicId = route.params.musicId as string
const music = computed(() => musicStore.getMusicById(musicId))
const sentences = computed(() => sentenceStore.getSentencesByMusicId(musicId))

const currentIndex = ref(0)
const currentSentence = computed(() => sentences.value[currentIndex.value])

type GameState = 'memorize' | 'build' | 'success' | 'victory'
const gameState = ref<GameState>('memorize')

const isPlaying = ref(false)
const countdown = ref(5)
let countdownTimer: number | null = null
const buildCountdown = ref(0)
let buildTimer: number | null = null
const isTimeoutHandling = ref(false)
let sound: Howl | null = null
const isAudioLoaded = ref(false)
  const audioLoadError = ref(false)
  const loadingProgress = ref(0)
  const loadingPhase = ref<'downloading' | 'decoding' | 'ready'>('downloading')
  const showStartOverlay = ref(true)
const isSettingsOpen = ref(false)

interface WordItem {
  id: number
  text: string
  used: boolean
  isAnimating?: boolean
}

const wordPool = ref<WordItem[]>([])
const selectedWords = ref<WordItem[]>([])
const isWrong = ref(false)
const isSuccess = ref(false)

// Initialize Audio
onMounted(async () => {
    if (!music.value || !sentences.value.length) return

    const progress = progressStore.getProgress(musicId)
    if (progress && progress.currentIndex < sentences.value.length) {
      currentIndex.value = progress.currentIndex
    }

    // Removed ?cb suffix as we use local files now
    let audioUrl = music.value.audioUrl
    if (audioUrl.startsWith('/')) {
      audioUrl = import.meta.env.BASE_URL + audioUrl.slice(1)
    }

    const sprites: Record<string, [number, number]> = {}
    sentences.value.forEach((s, index) => {
      sprites[`segment_${index}`] = [s.startTime * 1000, (s.endTime - s.startTime) * 1000]
    })

    try {
      loadingPhase.value = 'downloading'
      loadingProgress.value = 0

      const blobUrl = await new Promise<string>((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        xhr.open('GET', audioUrl, true)
        xhr.responseType = 'blob'
        
        xhr.onprogress = (event) => {
          if (event.lengthComputable) {
            loadingProgress.value = Math.floor((event.loaded / event.total) * 100)
          }
        }
        
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            loadingPhase.value = 'decoding'
            resolve(URL.createObjectURL(xhr.response))
          } else {
            reject(new Error(`Failed to load audio: ${xhr.status}`))
          }
        }
        
        xhr.onerror = () => reject(new Error('Network error'))
        xhr.send()
      })

      sound = new Howl({
        src: [blobUrl],
        html5: false, // Using Web Audio API for precise sprite seeking
        format: ['m4a', 'aac', 'mp3'],
        sprite: sprites,
        onload: () => {
          loadingPhase.value = 'ready'
          isAudioLoaded.value = true
        },
        onloaderror: (_id, err) => {
          console.error('Audio load error:', err)
          audioLoadError.value = true
        }
      })

      // If already loaded from cache
      if (sound.state() === 'loaded') {
        loadingPhase.value = 'ready'
        isAudioLoaded.value = true
      }
    } catch (err) {
      console.error('Audio fetch error:', err)
      audioLoadError.value = true
    }
  })

const handleStartGame = () => {
  showStartOverlay.value = false
  // Howler needs a user interaction to unlock audio context in some browsers
  if (sound && isAudioLoaded.value) {
    // A quick mute/unmute play trick to unlock AudioContext on iOS/Safari/Chrome
    sound.volume(0)
    // Pass the first sprite id to ensure it plays something valid without crashing
    const spriteId = sound.play(`segment_0`)
    sound.stop(spriteId as number)
    sound.volume(1)
    
    startSentence()
  }
}

onUnmounted(() => {
  if (sound) {
    sound.unload()
  }
  clearTimer()
  clearBuildTimer()
})

const clearTimer = () => {
  if (countdownTimer) {
    clearInterval(countdownTimer)
    countdownTimer = null
  }
}

const clearBuildTimer = () => {
  if (buildTimer) {
    clearInterval(buildTimer)
    buildTimer = null
  }
}

const startSentence = () => {
    gameState.value = 'memorize'
    selectedWords.value = []
    isWrong.value = false
    isSuccess.value = false
    isTimeoutHandling.value = false
    
    // Calculate audio duration in seconds (ceiling) and bound between 5 and 15 seconds
    if (currentSentence.value) {
      const audioDuration = Math.ceil(currentSentence.value.endTime - currentSentence.value.startTime)
      countdown.value = Math.min(Math.max(audioDuration, 5), 15)
    } else {
      countdown.value = 5
    }

    progressStore.saveProgress(musicId, currentIndex.value, sentences.value.length)

    playAudioSegment()

    clearTimer()
    clearBuildTimer()
    countdownTimer = window.setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) {
        clearTimer()
        startBuildPhase()
      }
    }, 1000)
  }

const playAudioSegment = (): Promise<void> => {
  return new Promise((resolve) => {
    if (!sound || !currentSentence.value) {
      console.log('playAudioSegment: no sound or currentSentence')
      resolve()
      return
    }

    sound.stop()
    if (fadeOutTimer) {
      clearTimeout(fadeOutTimer)
      fadeOutTimer = null
    }

    const spriteId = `segment_${currentIndex.value}`
    isPlaying.value = true
    console.log(`playAudioSegment: playing sprite ${spriteId} from ${currentSentence.value.startTime} to ${currentSentence.value.endTime}`)
    
    // 计算当前片段的总时长 (毫秒)
    const duration = (currentSentence.value.endTime - currentSentence.value.startTime) * 1000
    // 定义淡入和淡出的持续时间
    const fadeDuration = 300 
    
    const id = sound.play(spriteId)

    // 淡入逻辑：如果片段足够长，则执行淡入
    if (duration > fadeDuration) {
      sound.fade(0, 1, fadeDuration, id)
    } else {
      sound.volume(1, id) // 片段太短直接满音量
    }

    // 淡出逻辑：计算接近结束的时间触发淡出
    if (duration > fadeDuration * 2) {
      const timeToFadeOut = duration - fadeDuration
      fadeOutTimer = window.setTimeout(() => {
        if (isPlaying.value) {
          sound?.fade(1, 0, fadeDuration, id)
        }
      }, timeToFadeOut)
    }

    sound.once('end', () => {
      console.log(`playAudioSegment: ended ${spriteId}`)
      isPlaying.value = false
      if (fadeOutTimer) {
        clearTimeout(fadeOutTimer)
        fadeOutTimer = null
      }
      resolve()
    }, id)

    sound.once('stop', () => {
      console.log(`playAudioSegment: stopped ${spriteId}`)
      isPlaying.value = false
      if (fadeOutTimer) {
        clearTimeout(fadeOutTimer)
        fadeOutTimer = null
      }
      resolve()
    }, id)
  })
}

const getDistractors = (count: number, targetWords: string[]) => {
  const distractors: string[] = []
  
  // First, use specifically configured distractors for this sentence
  if (currentSentence.value?.distractors) {
    const configuredDistractors = currentSentence.value.distractors
      .split(',')
      .map(w => w.trim())
      .filter(w => w.length > 0)
    
    for (const w of configuredDistractors) {
      if (distractors.length >= count) break
      if (!targetWords.includes(w) && !distractors.includes(w)) {
        distractors.push(w)
      }
    }
  }

  // Get words from other sentences if needed
  if (distractors.length < count) {
    const otherSentences = sentences.value.filter((_, i) => i !== currentIndex.value)
    let allOtherWords: string[] = []
    otherSentences.forEach(s => {
      allOtherWords.push(...s.text.split(/\s+/).filter(w => w.length > 0))
    })
    
    // Shuffle allOtherWords
    allOtherWords.sort(() => Math.random() - 0.5)
    
    for (const w of allOtherWords) {
      if (distractors.length >= count) break
      if (!targetWords.includes(w) && !distractors.includes(w)) {
        distractors.push(w)
      }
    }
  }
  
  // Fallback if not enough words
  const fallbackWords = ['the', 'is', 'at', 'which', 'on', 'beautiful', 'song', 'music', 'play', 'game']
  let fallbackIndex = 0
  while (distractors.length < count && fallbackIndex < fallbackWords.length) {
    const w = fallbackWords[fallbackIndex++]
    if (!targetWords.includes(w) && !distractors.includes(w)) {
      distractors.push(w)
    }
  }
  
  return distractors
}

const startBuildPhase = () => {
  gameState.value = 'build'
  isTimeoutHandling.value = false
  
  const rawWords = currentSentence.value?.text.trim().split(/\s+/) || []
  let distractorCount = 0
  if (music.value?.difficulty === 'medium') distractorCount = 2
  else if (music.value?.difficulty === 'hard') distractorCount = 4
  
  const distractors = getDistractors(distractorCount, rawWords)
  
  const allWords = [...rawWords, ...distractors].sort(() => Math.random() - 0.5)
  
  wordPool.value = allWords.map((text, index) => ({
    id: index,
    text,
    used: false
  }))

  startBuildCountdown()
}

const startBuildCountdown = () => {
  clearBuildTimer()
  if (settingsStore.buildTimeout > 0) {
    buildCountdown.value = settingsStore.buildTimeout
    buildTimer = window.setInterval(() => {
      buildCountdown.value--
      if (buildCountdown.value <= 0) {
        clearBuildTimer()
        handleBuildTimeout()
      }
    }, 1000)
  } else {
    buildCountdown.value = 0
  }
}

const handleBuildTimeout = async () => {
    isTimeoutHandling.value = true

    if (settingsStore.autoFillOnTimeout) {
      const targetWords = currentSentence.value?.text.trim().split(/\s+/) || []

      selectedWords.value.forEach(word => {
        const poolWord = wordPool.value.find(w => w.id === word.id)
        if (poolWord) poolWord.used = false
      })
      selectedWords.value = []

      // Calculate heuristic timings for animation sync
      const duration = (currentSentence.value?.endTime || 0) - (currentSentence.value?.startTime || 0)
      const totalChars = targetWords.reduce((sum, word) => sum + word.length, 0)
      const timePerChar = duration / (totalChars || 1)
      
      const wordTimestamps: { text: string, delay: number }[] = []
      let currentTime = 0
      targetWords.forEach(text => {
        wordTimestamps.push({ text, delay: currentTime * 1000 })
        currentTime += text.length * timePerChar
      })

      const audioPromise = playAudioSegment()

      const promises = wordTimestamps.map(t => {
        return new Promise<void>(resolve => {
          setTimeout(() => {
            if (!isTimeoutHandling.value) return resolve()
            const poolWord = wordPool.value.find(w => !w.used && w.text === t.text)
            if (poolWord) {
              poolWord.used = true
              poolWord.isAnimating = true
              selectedWords.value.push(poolWord)
              setTimeout(() => {
                poolWord.isAnimating = false
                resolve()
              }, 500)
            } else {
              resolve()
            }
          }, t.delay)
        })
      })

      await Promise.all([audioPromise, ...promises])
    } else {
      await playAudioSegment()
    }
  
  if (settingsStore.autoProceedOnTimeout) {
    setTimeout(() => {
      if (currentIndex.value < sentences.value.length - 1) {
        currentIndex.value++
        startSentence()
      } else {
        gameState.value = 'victory'
        progressStore.clearProgress(musicId)
        playVictorySound()
        setTimeout(() => {
          confetti({
            particleCount: 150,
            spread: 100,
            origin: { y: 0.6 },
            colors: ['#fbbf24', '#f59e0b', '#10b981', '#22d3ee', '#f472b6']
          })
        }, 300)
      }
    }, 500)
  } else {
    selectedWords.value.forEach(word => {
      const poolWord = wordPool.value.find(w => w.id === word.id)
      if (poolWord) poolWord.used = false
    })
    selectedWords.value = []
    isTimeoutHandling.value = false
    startBuildCountdown()
  }
}

const selectWord = (index: number) => {
  if (isTimeoutHandling.value) return
  const word = wordPool.value[index]
  if (word.used || gameState.value === 'success') return
  
  word.used = true
  selectedWords.value.push(word)
  
  checkAnswer()
}

const removeWord = (index: number) => {
  if (gameState.value === 'success' || isTimeoutHandling.value) return
  const word = selectedWords.value[index]
  const poolWord = wordPool.value.find(w => w.id === word.id)
  if (poolWord) poolWord.used = false
  
  selectedWords.value.splice(index, 1)
}

const checkAnswer = () => {
  const targetWords = currentSentence.value?.text.trim().split(/\s+/) || []
  if (selectedWords.value.length === targetWords.length) {
    const selectedText = selectedWords.value.map(w => w.text).join(' ')
    const targetText = targetWords.join(' ')
    
    if (selectedText === targetText) {
      handleSuccess()
    } else {
      handleWrong()
    }
  }
}

const handleSuccess = () => {
  isSuccess.value = true
  gameState.value = 'success'
  clearBuildTimer()
  
  playCorrectSound()
  confetti({
    particleCount: 50,
    spread: 60,
    origin: { y: 0.8 },
    colors: ['#22d3ee', '#10b981', '#f472b6']
  })
  
  // Wait a bit to show success state, then next sentence
  setTimeout(() => {
    if (currentIndex.value < sentences.value.length - 1) {
      currentIndex.value++
      startSentence()
    } else {
      gameState.value = 'victory'
      progressStore.clearProgress(musicId)
      playVictorySound()
      setTimeout(() => {
        confetti({
          particleCount: 150,
          spread: 100,
          origin: { y: 0.6 },
          colors: ['#fbbf24', '#f59e0b', '#10b981', '#22d3ee', '#f472b6']
        })
      }, 300)
    }
  }, 1500)
}

const handleWrong = () => {
  isWrong.value = true
  playWrongSound()
  
  setTimeout(() => {
    isWrong.value = false
    // Move all selected words back to pool
    selectedWords.value.forEach(word => {
      const poolWord = wordPool.value.find(w => w.id === word.id)
      if (poolWord) poolWord.used = false
    })
    selectedWords.value = []
    
    // Replay audio
    playAudioSegment()
  }, 800) // shake animation duration + a little delay
}

</script>

<style>
@keyframes pop-shake {
  0% { transform: scale(0.5) translateY(-20px); opacity: 0; }
  50% { transform: scale(1.1) translateY(5px); opacity: 1; }
  70% { transform: scale(0.9) translateY(-2px); }
  100% { transform: scale(1) translateY(0); }
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
  20%, 40%, 60%, 80% { transform: translateX(5px); }
}

@keyframes fade-in {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fade-in {
  animation: fade-in 0.8s ease-out forwards;
}

.word-move,
.word-enter-active,
.word-leave-active {
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.word-enter-from,
.word-leave-to {
  opacity: 0;
  transform: scale(0.5) translateY(20px);
}

.word-leave-active {
  position: absolute;
}
</style>
