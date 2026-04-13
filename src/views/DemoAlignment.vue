<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue'
import { Howl } from 'howler'
import { useRouter } from 'vue-router'

const router = useRouter()

const sentence = {
  id: "s1",
  text: "This is the song called Choosin' Texas",
  translation: "这是首叫做 Choosin' Texas 的歌",
  startTime: 1.5,
  endTime: 6.22
}

const words = sentence.text.split(' ')

const activeMode = ref(1) // 1: Heuristic, 2: AI, 3: Manual
const isPlaying = ref(false)
const currentAudioTime = ref(0)
let sound: Howl | null = null
let animationFrameId: number | null = null

// Scheme 1: Heuristic (Proportional)
const heuristicTimestamps = computed(() => {
  const totalChars = words.reduce((sum, word) => sum + word.length, 0)
  const duration = sentence.endTime - sentence.startTime
  const timePerChar = duration / totalChars

  let currentTime = sentence.startTime
  return words.map(word => {
    const wordDuration = word.length * timePerChar
    const start = currentTime
    const end = currentTime + wordDuration
    currentTime = end
    return { word, start, end }
  })
})

// Scheme 2: Simulated AI Forced Alignment (Mock JSON)
const aiTimestamps = [
  { word: "This", start: 1.50, end: 1.80 },
  { word: "is", start: 1.80, end: 2.00 },
  { word: "the", start: 2.00, end: 2.15 },
  { word: "song", start: 2.15, end: 2.80 },
  { word: "called", start: 2.80, end: 3.30 },
  { word: "Choosin'", start: 3.30, end: 4.10 },
  { word: "Texas", start: 4.10, end: 5.50 }
]

// Scheme 3: Manual Tap
const manualTimestamps = ref<{word: string, start: number, end: number}[]>([])
const tapIndex = ref(0)
const isRecording = ref(false)

const currentTimestamps = computed(() => {
  if (activeMode.value === 1) return heuristicTimestamps.value
  if (activeMode.value === 2) return aiTimestamps
  return manualTimestamps.value
})

const activeWordIndex = computed(() => {
  if (!isPlaying.value && !isRecording.value) return -1
  const timestamps = currentTimestamps.value
  if (!timestamps || timestamps.length === 0) return -1

  for (let i = 0; i < timestamps.length; i++) {
    const t = timestamps[i]
    if (currentAudioTime.value >= t.start && currentAudioTime.value <= t.end) {
      return i
    }
  }
  return -1
})

const updateTime = () => {
  if (sound && isPlaying.value) {
    currentAudioTime.value = sound.seek() as number
    animationFrameId = requestAnimationFrame(updateTime)
  }
}

const togglePlay = () => {
  if (!sound) {
    sound = new Howl({
      src: ['/audio/m1.m4a'],
      html5: false,
      onend: () => {
        isPlaying.value = false
        if (animationFrameId) cancelAnimationFrame(animationFrameId)
        if (isRecording.value) stopRecording()
      }
    })
  }

  if (isPlaying.value) {
    sound.pause()
    isPlaying.value = false
    if (animationFrameId) cancelAnimationFrame(animationFrameId)
  } else {
    // Start slightly before sentence for context
    if (sound.seek() === 0 || sound.seek() >= sentence.endTime) {
      sound.seek(Math.max(0, sentence.startTime - 0.5))
    }
    sound.play()
    isPlaying.value = true
    updateTime()
  }
}

const startRecording = () => {
  manualTimestamps.value = words.map(w => ({ word: w, start: 0, end: 0 }))
  tapIndex.value = 0
  isRecording.value = true
  
  if (sound) sound.stop()
  sound = new Howl({
    src: ['/audio/m1.m4a'],
    html5: false,
    onend: () => stopRecording()
  })
  sound.seek(Math.max(0, sentence.startTime - 0.5))
  sound.play()
  isPlaying.value = true
  updateTime()

  window.addEventListener('keydown', handleKeydown)
}

const stopRecording = () => {
  isRecording.value = false
  isPlaying.value = false
  if (sound) sound.pause()
  if (animationFrameId) cancelAnimationFrame(animationFrameId)
  window.removeEventListener('keydown', handleKeydown)

  // Clean up remaining words if not tapped
  if (tapIndex.value > 0) {
    const lastTap = manualTimestamps.value[tapIndex.value - 1]
    lastTap.end = sentence.endTime
    // Auto-fill untappped words just for demo sake
    for (let i = tapIndex.value; i < words.length; i++) {
      manualTimestamps.value[i].start = sentence.endTime
      manualTimestamps.value[i].end = sentence.endTime
    }
  }
}

const handleKeydown = (e: KeyboardEvent) => {
  if (e.code === 'Space' && isRecording.value) {
    e.preventDefault() // Prevent scrolling
    if (tapIndex.value < words.length) {
      const time = sound?.seek() as number
      manualTimestamps.value[tapIndex.value].start = time
      
      if (tapIndex.value > 0) {
        manualTimestamps.value[tapIndex.value - 1].end = time
      }
      
      tapIndex.value++
      
      if (tapIndex.value === words.length) {
        // Stop recording shortly after the last word
        setTimeout(() => stopRecording(), 1000)
      }
    }
  }
}

onUnmounted(() => {
  if (sound) sound.unload()
  if (animationFrameId) cancelAnimationFrame(animationFrameId)
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <div class="min-h-screen bg-slate-50 text-slate-800 p-8 flex flex-col items-center">
    <div class="w-full max-w-4xl flex justify-between items-center mb-8">
      <h1 class="text-3xl font-black bg-gradient-to-r from-bili-blue to-bili-pink bg-clip-text text-transparent">Word-Level Alignment Demo</h1>
      <button type="button" @click="router.push('/')" class="px-6 py-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-full text-slate-600 font-bold transition-colors shadow-sm">Back to Home</button>
    </div>

    <!-- Mode Selector -->
    <div class="flex flex-wrap gap-3 mb-12 bg-white p-2 rounded-full border border-slate-200 shadow-sm justify-center">
      <button type="button" @click="activeMode = 1" :class="activeMode === 1 ? 'bg-bili-pink text-white shadow-md shadow-pink-200/50' : 'text-slate-500 hover:text-bili-pink hover:bg-pink-50'" class="px-6 py-2.5 rounded-full font-bold transition-all text-sm sm:text-base">Scheme 1: Heuristic (Math)</button>
      <button type="button" @click="activeMode = 2" :class="activeMode === 2 ? 'bg-bili-blue text-white shadow-md shadow-sky-200/50' : 'text-slate-500 hover:text-bili-blue hover:bg-sky-50'" class="px-6 py-2.5 rounded-full font-bold transition-all text-sm sm:text-base">Scheme 2: AI (Mock JSON)</button>
      <button type="button" @click="activeMode = 3" :class="activeMode === 3 ? 'bg-emerald-500 text-white shadow-md shadow-emerald-200/50' : 'text-slate-500 hover:text-emerald-500 hover:bg-emerald-50'" class="px-6 py-2.5 rounded-full font-bold transition-all text-sm sm:text-base">Scheme 3: Manual Tap</button>
    </div>

    <!-- Description -->
    <div class="max-w-2xl text-center mb-12 min-h-[6rem] flex items-center justify-center">
      <p v-if="activeMode === 1" class="text-slate-500 text-sm leading-relaxed"><strong>Heuristic Proportional Splitting:</strong> Dynamically calculates word durations based on character length. No backend changes needed. Fast but might be slightly inaccurate for long pauses.</p>
      <p v-if="activeMode === 2" class="text-slate-500 text-sm leading-relaxed"><strong>AI Forced Alignment:</strong> Uses precise millisecond timestamps generated by an AI model (like Whisper/Wav2Vec2). Extremely accurate. Requires running Python scripts on audio files.</p>
      <p v-if="activeMode === 3" class="text-slate-500 text-sm leading-relaxed"><strong>Manual Tap-to-Sync:</strong> Play the audio and press <strong>SPACEBAR</strong> exactly when you hear each word to set its timestamp. Complete control, but labor-intensive.</p>
    </div>

    <!-- Lyrics Display -->
    <div class="text-3xl sm:text-4xl font-black text-center leading-relaxed mb-8 flex flex-wrap justify-center gap-3">
      <span v-for="(word, index) in words" :key="index"
            class="transition-all duration-200"
            :class="{
              'text-bili-blue scale-110 transform': activeWordIndex === index && !isRecording,
              'text-bili-pink scale-110 transform': isRecording && tapIndex === index,
              'text-slate-300': isRecording && index > tapIndex,
              'text-slate-800': !isRecording && activeWordIndex !== index
            }">
        {{ word }}
      </span>
    </div>
    
    <div class="text-lg font-medium text-slate-400 mb-12">{{ sentence.translation }}</div>

    <!-- Controls -->
    <div class="flex flex-col items-center gap-6 w-full max-w-md">
      <div class="text-bili-blue font-mono font-bold text-xl">{{ currentAudioTime.toFixed(2) }}s</div>
      
      <div v-if="activeMode === 3" class="flex flex-col gap-4 w-full items-center">
        <button type="button" v-if="!isRecording" @click="startRecording" class="w-full max-w-xs py-4 bg-emerald-500 hover:bg-emerald-400 text-white rounded-full font-black shadow-md shadow-emerald-500/20 transition-all flex justify-center items-center gap-2">
          🔴 START TAPPING (Space)
        </button>
        <button type="button" v-else @click="stopRecording" class="w-full max-w-xs py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-full font-black shadow-md transition-all">
          ⏹ STOP TAPPING
        </button>
        <div class="text-sm font-mono text-slate-400 mt-4 break-words text-center">
          <p v-for="t in manualTimestamps" :key="t.word" class="inline-block mx-2">
            {{ t.word }}: {{ t.start.toFixed(2) }}-{{ t.end.toFixed(2) }}
          </p>
        </div>
      </div>

      <button type="button" v-else @click="togglePlay" 
              class="w-full max-w-xs py-4 bg-bili-pink hover:bg-bili-pink/90 text-white rounded-full font-black text-lg shadow-md shadow-pink-500/30 transition-all transform active:scale-95">
        {{ isPlaying ? 'PAUSE' : 'PLAY AUDIO' }}
      </button>
    </div>
  </div>
</template>
