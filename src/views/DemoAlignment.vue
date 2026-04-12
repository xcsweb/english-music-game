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
  <div class="min-h-screen bg-gray-900 text-white p-8 flex flex-col items-center">
    <div class="w-full max-w-4xl flex justify-between items-center mb-8">
      <h1 class="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-fuchsia-500 bg-clip-text text-transparent">Word-Level Alignment Demo</h1>
      <button type="button" @click="router.push('/')" class="px-6 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-300 transition-colors">Back to Home</button>
    </div>

    <!-- Mode Selector -->
    <div class="flex gap-4 mb-12 bg-gray-800 p-2 rounded-2xl">
      <button type="button" @click="activeMode = 1" :class="activeMode === 1 ? 'bg-cyan-600 text-white' : 'text-gray-400 hover:text-white'" class="px-6 py-3 rounded-xl font-medium transition-all">Scheme 1: Heuristic (Math)</button>
      <button type="button" @click="activeMode = 2" :class="activeMode === 2 ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'" class="px-6 py-3 rounded-xl font-medium transition-all">Scheme 2: AI (Mock JSON)</button>
      <button type="button" @click="activeMode = 3" :class="activeMode === 3 ? 'bg-pink-600 text-white' : 'text-gray-400 hover:text-white'" class="px-6 py-3 rounded-xl font-medium transition-all">Scheme 3: Manual Tap</button>
    </div>

    <!-- Description -->
    <div class="max-w-2xl text-center mb-12 h-24">
      <p v-if="activeMode === 1" class="text-gray-400"><strong>Heuristic Proportional Splitting:</strong> Dynamically calculates word durations based on character length. No backend changes needed. Fast but might be slightly inaccurate for long pauses.</p>
      <p v-if="activeMode === 2" class="text-gray-400"><strong>AI Forced Alignment:</strong> Uses precise millisecond timestamps generated by an AI model (like Whisper/Wav2Vec2). Extremely accurate. Requires running Python scripts on audio files.</p>
      <p v-if="activeMode === 3" class="text-gray-400"><strong>Manual Tap-to-Sync:</strong> Play the audio and press <strong>SPACEBAR</strong> exactly when you hear each word to set its timestamp. Complete control, but labor-intensive.</p>
    </div>

    <!-- Lyrics Display -->
    <div class="text-4xl font-extrabold text-center leading-relaxed mb-16 flex flex-wrap justify-center gap-3">
      <span v-for="(word, index) in words" :key="index"
            class="transition-colors duration-200"
            :class="{
              'text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.8)] scale-110 transform': activeWordIndex === index && !isRecording,
              'text-pink-500 scale-110 transform': isRecording && tapIndex === index,
              'text-gray-600': isRecording && index > tapIndex,
              'text-white': !isRecording && activeWordIndex !== index
            }">
        {{ word }}
      </span>
    </div>
    
    <div class="text-xl text-gray-500 mb-12">{{ sentence.translation }}</div>

    <!-- Controls -->
    <div class="flex flex-col items-center gap-6">
      <div class="text-cyan-500 font-mono text-xl">{{ currentAudioTime.toFixed(2) }}s</div>
      
      <div v-if="activeMode === 3" class="flex gap-4">
        <button type="button" v-if="!isRecording" @click="startRecording" class="px-8 py-4 bg-pink-600 hover:bg-pink-500 text-white rounded-full font-bold shadow-lg shadow-pink-500/30 transition-all flex items-center gap-2">
          🔴 START TAPPING (Press Space)
        </button>
        <button type="button" v-else @click="stopRecording" class="px-8 py-4 bg-gray-700 hover:bg-gray-600 text-white rounded-full font-bold transition-all">
          ⏹ STOP
        </button>
        
        <button type="button" v-if="manualTimestamps.length > 0 && !isRecording" @click="togglePlay" class="px-8 py-4 bg-cyan-600 hover:bg-cyan-500 text-white rounded-full font-bold transition-all">
          {{ isPlaying ? '⏸ PAUSE PLAYBACK' : '▶️ TEST MY TAPS' }}
        </button>
      </div>

      <button type="button" v-else @click="togglePlay" class="px-12 py-5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-full font-bold text-xl shadow-[0_0_30px_rgba(8,145,178,0.4)] transition-all transform active:scale-95">
        {{ isPlaying ? 'PAUSE' : 'PLAY AUDIO' }}
      </button>
    </div>
  </div>
</template>
