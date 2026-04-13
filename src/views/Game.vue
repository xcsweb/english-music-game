<template>
  <div class="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden font-sans">
    <!-- Background glow & Grid -->
    <div class="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none opacity-50"></div>
    <div class="absolute top-[-10%] left-[-10%] w-96 h-96 bg-cyan-500/20 rounded-full blur-[120px] pointer-events-none"></div>
    <div class="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-pink-500/20 rounded-full blur-[120px] pointer-events-none"></div>

    <div v-if="!music || !sentences.length" class="text-center relative z-10">
      <p class="text-xl mb-4 text-cyan-300">Loading or No Sentences Found...</p>
      <button type="button" @click="router.push('/')" class="px-8 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-2xl font-bold shadow-[0_0_20px_rgba(8,145,178,0.4)] transition-all active:scale-95">Back to Home</button>
    </div>

    <!-- Start Overlay to handle browser autoplay policies -->
    <div v-else-if="showStartOverlay" class="absolute inset-0 bg-black/90 z-50 flex flex-col items-center justify-center backdrop-blur-md animate-fade-in p-6">
      <div class="text-xs font-mono text-cyan-400 tracking-widest mb-2 select-none">TRACK.INITIALIZE //</div>
      <h2 class="text-3xl md:text-5xl font-black italic text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-pink-500 mb-8 text-center [text-shadow:0_0_15px_rgba(34,211,238,0.4)]">
        {{ music.title }}
      </h2>

      <div v-if="audioLoadError" class="text-red-400 text-center mb-8 max-w-md">
        <p class="font-black text-xl mb-2 italic">ERROR // AUDIO_LOAD_FAILED</p>
        <p class="text-sm font-mono text-red-300">The audio cannot be played due to network issues. Please try another track.</p>
        <button type="button" @click="router.push('/')" class="mt-6 px-8 py-3 bg-red-950 border border-red-500 text-red-400 font-bold italic skew-x-[-15deg] hover:bg-red-900 transition-colors">
          <span class="block skew-x-[15deg]">GO BACK</span>
        </button>
      </div>

      <div v-else-if="!isAudioLoaded" class="flex flex-col items-center w-full max-w-sm px-4">
        <div class="w-full bg-slate-900 h-2 mb-4 overflow-hidden border border-slate-800 skew-x-[-15deg]">
          <div class="bg-gradient-to-r from-cyan-500 to-pink-500 h-full transition-all duration-200 ease-out relative"
               :style="{ width: loadingPhase === 'decoding' ? '100%' : `${loadingProgress}%` }">
            <div class="absolute top-0 right-0 w-2 h-full bg-white/70"></div>
          </div>
        </div>
        <p class="text-cyan-400 font-bold mb-2 text-sm sm:text-base italic font-mono">
          {{ loadingPhase === 'decoding' ? 'DECODING...' : `DOWNLOADING (${loadingProgress}%)...` }}
        </p>
      </div>

      <button type="button" v-else @click="handleStartGame"
              class="group relative px-12 py-4 bg-pink-600 text-white font-black italic skew-x-[-15deg] hover:bg-pink-500 transition-all duration-300 [box-shadow:0_0_20px_rgba(236,72,153,0.5)] overflow-hidden mt-4">
        <div class="transform skew-x-[15deg] flex items-center gap-3 text-2xl tracking-widest relative z-10">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd" />
          </svg>
          START_LINK //
        </div>
        <div class="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-300 ease-out z-0"></div>
      </button>
    </div>

    <div v-else-if="gameState === 'victory'" class="text-center animate-fade-in relative z-10">
      <div class="text-xs font-mono text-cyan-400 tracking-widest mb-2">MISSION.ACCOMPLISHED //</div>
      <h1 class="text-6xl sm:text-7xl font-black italic bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-6 [text-shadow:0_0_20px_rgba(34,211,238,0.6)]">FULL COMBO!</h1>
      <p class="text-xl mb-10 text-gray-300">Track <span class="text-pink-400 font-bold">"{{ music.title }}"</span> cleared.</p>
      <button type="button" @click="router.push('/')" class="px-10 py-4 bg-cyan-600 text-white font-black italic skew-x-[-15deg] hover:bg-cyan-500 [box-shadow:0_0_20px_rgba(34,211,238,0.4)] transition-all">
        <span class="block skew-x-[15deg]">RETURN TO MENU</span>
      </button>
    </div>

    <div v-else class="w-full max-w-2xl flex flex-col flex-1 max-h-screen py-4 sm:py-6 relative z-10">
        <!-- Header -->
        <div class="flex justify-between items-center mb-6">
          <button type="button" @click="router.push('/')" class="p-2 -ml-2 text-cyan-500/50 hover:text-pink-500 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <div class="text-center flex-1 mx-4">
            <h2 class="text-lg sm:text-xl font-black italic text-white tracking-widest truncate [text-shadow:0_0_10px_rgba(255,255,255,0.3)]">{{ music.title }}</h2>
            <div class="flex items-center justify-center gap-2 mt-2">
              <div class="h-1.5 w-32 bg-slate-800 skew-x-[-15deg] overflow-hidden">
                <div class="h-full bg-gradient-to-r from-cyan-500 to-pink-500 transition-all duration-300 relative" :style="{ width: `${(currentIndex / sentences.length) * 100}%` }">
                  <div class="absolute top-0 right-0 w-1 h-full bg-white/70"></div>
                </div>
              </div>
              <p class="text-[10px] text-cyan-400 font-mono font-bold tracking-widest">{{ currentIndex + 1 }}/{{ sentences.length }}</p>
            </div>
          </div>
          <button
            @click="isSettingsOpen = true"
            class="p-2 -mr-2 text-cyan-500/50 hover:text-cyan-400 transition-colors"
            title="Settings"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>

        <!-- Playback indicator -->
        <div class="flex justify-center mb-6">
          <div class="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center transition-all duration-500 [clip-path:polygon(20%_0,100%_0,80%_100%,0_100%)] border border-cyan-500/30"
               :class="isPlaying ? 'bg-pink-500/20 shadow-[0_0_30px_rgba(236,72,153,0.4)] scale-110 border-pink-500' : 'bg-slate-900/50 backdrop-blur-md'">
            <div class="transform skew-x-[15deg]">
              <svg v-if="isPlaying" xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 sm:h-10 sm:w-10 text-pink-400 animate-pulse drop-shadow-[0_0_10px_rgba(236,72,153,0.8)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 sm:h-10 sm:w-10 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              </svg>
            </div>
          </div>
        </div>

      <!-- Memorize Phase -->
        <div v-if="gameState === 'memorize'" class="flex flex-col items-center animate-fade-in relative">
          <div class="absolute -right-4 top-0 text-[80px] font-black text-slate-800/20 italic select-none pointer-events-none z-0">
            MEMORIZE
          </div>
          <p class="text-2xl sm:text-3xl lg:text-4xl font-black italic text-center mb-6 leading-relaxed relative z-10 px-4 [text-shadow:0_0_10px_rgba(255,255,255,0.2)]">
            {{ currentSentence?.text }}
          </p>
          <p class="text-sm sm:text-base text-cyan-400/80 mb-8 font-medium tracking-wide">
            {{ currentSentence?.translation }}
          </p>
          
          <!-- Countdown Display -->
          <div class="mt-4 flex items-center gap-3">
            <div class="text-xs font-mono text-cyan-500/50">TIME_LEFT //</div>
            <div class="text-2xl font-black italic" :class="countdown <= 3 ? 'text-pink-500 animate-pulse drop-shadow-[0_0_8px_rgba(236,72,153,0.8)]' : 'text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]'">
              00:0{{ countdown }}
            </div>
          </div>
        </div>

        <!-- Build Phase -->
        <div v-if="gameState === 'build' || gameState === 'success'" class="flex-1 flex flex-col animate-fade-in relative z-10">
          <!-- Instruction / Countdown -->
          <div class="flex justify-between items-center mb-6">
            <div class="text-xs font-mono tracking-widest text-cyan-400/70 flex flex-col">
              <span>REBUILD_SEQUENCE //</span>
              <span class="text-slate-400 text-[10px]">{{ currentSentence?.translation }}</span>
            </div>
            
            <!-- Countdown Display -->
            <div v-if="buildCountdown > 0 && gameState === 'build' && !isTimeoutHandling" class="text-cyan-400 font-bold flex items-center gap-2 italic">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              00:{{ buildCountdown.toString().padStart(2, '0') }}
            </div>
            <div v-else-if="isTimeoutHandling" class="text-pink-500 font-black italic flex items-center gap-2 animate-pulse">
              TIME_OUT //
            </div>
          </div>

          <!-- Selected Words Area -->
          <TransitionGroup name="word" tag="div"
               class="min-h-[140px] bg-slate-900/80 backdrop-blur-md p-5 sm:p-6 mb-6 flex flex-wrap content-start gap-3 transition-all duration-300 [clip-path:polygon(0_0,calc(100%-20px)_0,100%_20px,100%_100%,20px_100%,0_calc(100%-20px))] border-l-4"
               :class="{
                   'border-pink-500 animate-[shake_0.5s_ease-in-out] shadow-[inset_0_0_30px_rgba(236,72,153,0.2)]': isWrong,
                   'border-cyan-400 shadow-[inset_0_0_30px_rgba(34,211,238,0.2)]': isSuccess,
                   'border-slate-700': !isWrong && !isSuccess
                 }">
              <button type="button" v-for="(word, index) in selectedWords" :key="word.id"
                      @click="removeWord(index)"
                      class="group relative px-6 py-3 bg-cyan-600 text-white font-black italic skew-x-[-15deg] hover:bg-pink-500 transition-all hover:scale-105 active:scale-95 touch-manipulation [box-shadow:0_0_15px_rgba(34,211,238,0.3)] hover:[box-shadow:0_0_20px_rgba(236,72,153,0.5)]"
                      :class="{ 'animate-[pop-shake_0.4s_ease-out]': word.isAnimating }"
                      :disabled="gameState === 'success' || isTimeoutHandling">
                <span class="block skew-x-[15deg]">{{ word.text }}</span>
            </button>
          </TransitionGroup>

          <!-- Word Pool Area -->
          <TransitionGroup name="word" tag="div" class="flex-1 flex flex-wrap content-start justify-center gap-3 sm:gap-4 relative">
            <button type="button" v-for="(word, index) in wordPool" :key="word.id"
                    @click="selectWord(index)"
                    class="relative px-6 py-3 bg-black text-slate-300 font-black italic skew-x-[-15deg] transition-all border border-slate-700 hover:border-cyan-500 active:scale-95 touch-manipulation"
                    :class="{
                      'opacity-0 scale-50 pointer-events-none': word.used,
                      'hover:bg-cyan-500 hover:text-black hover:[box-shadow:0_0_20px_rgba(34,211,238,0.4)]': !word.used && gameState !== 'success' && !isTimeoutHandling
                    }"
                    :disabled="word.used || gameState === 'success' || isTimeoutHandling">
              <span class="block skew-x-[15deg]">{{ word.text }}</span>
            </button>
          </TransitionGroup>

          <!-- Replay Audio Button -->
          <div class="mt-auto flex justify-center pb-2 pt-4">
            <button type="button" @click="playAudioSegment" :disabled="isTimeoutHandling" 
                    class="group relative flex items-center gap-2 px-8 py-3 bg-slate-900 text-cyan-500/70 font-black italic skew-x-[-15deg] hover:text-cyan-400 hover:bg-slate-800 transition-all border border-cyan-900/50 hover:border-cyan-400/50 active:scale-95 touch-manipulation disabled:opacity-50 disabled:pointer-events-none">
              <div class="transform skew-x-[15deg] flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                REPLAY_AUDIO
              </div>
            </button>
          </div>
        </div>
      </div>

    <SettingsModal :is-open="isSettingsOpen" @close="isSettingsOpen = false" />
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
