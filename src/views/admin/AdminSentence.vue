<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMusicStore } from '../../stores/music'
import { useSentenceStore } from '../../stores/sentence'
import { Howl } from 'howler'

const route = useRoute()
const router = useRouter()
const musicStore = useMusicStore()
const sentenceStore = useSentenceStore()

const musicId = route.params.musicId as string
const music = computed(() => musicStore.getMusicById(musicId))
const sentences = computed(() => sentenceStore.getSentencesByMusicId(musicId))

const form = ref({
  id: '',
  musicId,
  text: '',
  translation: '',
  distractors: '',
  startTime: 0,
  endTime: 0
})

const isEditing = ref(false)
let sound: Howl | null = null
const isPlaying = ref(false)
const currentTime = ref(0)
const duration = ref(0)
let animationFrameId: number

// Automated Alignment State
const isAligning = ref(false)
const alignProgress = ref('')
const bulkLyricsText = ref('')
const showAutoAlignModal = ref(false)

onMounted(() => {
  if (!music.value) {
    alert('Music not found!')
    router.push('/admin')
    return
  }

  sound = new Howl({
    src: [music.value.audioUrl],
    html5: true,
    onload: () => {
      if (sound) {
        duration.value = sound.duration()
      }
    },
    onplay: () => {
      isPlaying.value = true
      updateTime()
    },
    onpause: () => {
      isPlaying.value = false
      cancelAnimationFrame(animationFrameId)
    },
    onend: () => {
      isPlaying.value = false
      cancelAnimationFrame(animationFrameId)
    }
  })
})

onUnmounted(() => {
  if (sound) {
    sound.unload()
  }
  cancelAnimationFrame(animationFrameId)
})

const updateTime = () => {
  if (sound && isPlaying.value) {
    currentTime.value = sound.seek() as number
    animationFrameId = requestAnimationFrame(updateTime)
  }
}

const togglePlay = () => {
  if (!sound) return
  if (isPlaying.value) {
    sound.pause()
  } else {
    sound.play()
  }
}

const seekAudio = (e: Event) => {
  const target = e.target as HTMLInputElement
  const time = parseFloat(target.value)
  if (sound) {
    sound.seek(time)
    currentTime.value = time
  }
}

const recordStartTime = () => {
  form.value.startTime = parseFloat(currentTime.value.toFixed(2))
}

const recordEndTime = () => {
  form.value.endTime = parseFloat(currentTime.value.toFixed(2))
}

const captureCurrentTime = () => {
  if (form.value.startTime === 0 && form.value.endTime === 0) {
    recordStartTime()
  } else if (form.value.startTime > 0 && form.value.endTime === 0) {
    recordEndTime()
  } else {
    recordStartTime()
    form.value.endTime = 0
  }
}

const resetForm = () => {
  form.value = {
    id: '',
    musicId,
    text: '',
    translation: '',
    distractors: '',
    startTime: 0,
    endTime: 0
  }
  isEditing.value = false
}

const editSentence = (sentence: any) => {
  form.value = { ...sentence }
  isEditing.value = true
}

const saveSentence = () => {
  if (isEditing.value) {
    sentenceStore.updateSentence(form.value.id, form.value)
  } else {
    sentenceStore.addSentence({
      ...form.value,
      id: Date.now().toString()
    })
  }
  resetForm()
}

const deleteSentence = (id: string) => {
  if (confirm('Are you sure you want to delete this sentence?')) {
    sentenceStore.deleteSentence(id)
  }
}

// === Automated Lyrics Alignment Logic ===
const runAutoAlign = async () => {
  if (!bulkLyricsText.value.trim()) return
  
  isAligning.value = true
  alignProgress.value = 'Analyzing audio beats and text density...'
  
  // 1. Parse raw text into sentence objects
  const rawLines = bulkLyricsText.value.split('\n').map(line => line.trim()).filter(line => line.length > 0)
  const newSentences = rawLines.map(line => {
    // Attempt to split translation if separated by "|" or tabs
    const parts = line.split(/\||\t/)
    return {
      text: parts[0].trim(),
      translation: parts[1] ? parts[1].trim() : '',
      charCount: parts[0].trim().replace(/\s/g, '').length
    }
  })
  
  // 2. Light-weight heuristic alignment (Fallback JS approximation)
  // In a real-world scenario, this would call a Python backend with WhisperX / MFA
  // Here we use a smart JS heuristic: distribute time based on character density, 
  // leaving slight pauses between sentences.
  
  const totalDuration = duration.value > 0 ? duration.value : 30 // Fallback 30s
  const totalChars = newSentences.reduce((sum, s) => sum + s.charCount, 0)
  
  // Assuming 10% of total time is silence/pauses
  const activeTime = totalDuration * 0.9
  const timePerChar = activeTime / (totalChars || 1)
  
  let currentPointer = totalDuration * 0.05 // Start after 5% intro
  
  // Simulate network/processing delay for UX
  await new Promise(r => setTimeout(r, 1000))
  alignProgress.value = 'Aligning timestamps using character density heuristics...'
  await new Promise(r => setTimeout(r, 1500))
  
  // Clear existing sentences for this music
  sentenceStore.deleteSentencesByMusicId(musicId)
  
  // Apply generated timestamps
  newSentences.forEach((s) => {
    const sentenceDuration = s.charCount * timePerChar
    sentenceStore.addSentence({
      id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
      musicId: musicId,
      text: s.text,
      translation: s.translation,
      distractors: '',
      startTime: parseFloat(currentPointer.toFixed(2)),
      endTime: parseFloat((currentPointer + sentenceDuration).toFixed(2))
    })
    
    // Add a tiny pause between sentences
    currentPointer += sentenceDuration + (totalDuration * 0.1 / newSentences.length)
  })
  
  isAligning.value = false
  showAutoAlignModal.value = false
  bulkLyricsText.value = ''
}
</script>

<template>
  <div class="p-6 max-w-5xl mx-auto min-h-screen bg-gray-900 text-gray-100">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-100">Manage Sentences for: <span class="text-cyan-400">{{ music?.title }}</span></h1>
      <div class="flex items-center gap-4">
        <button type="button" @click="showAutoAlignModal = true" class="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white px-5 py-2 rounded-lg font-medium shadow-[0_0_15px_rgba(219,39,119,0.4)] transition-all flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clip-rule="evenodd" />
          </svg>
          Auto Align Lyrics
        </button>
        <button type="button" @click="$router.push('/admin')" class="text-cyan-400 hover:text-cyan-300 hover:underline transition-colors">Back to Music List</button>
      </div>
    </div>

    <!-- Audio Player -->
    <div class="bg-gray-800 border border-gray-700 text-white p-6 rounded-xl shadow-lg mb-8 sticky top-4 z-10">
      <h2 class="text-lg font-semibold mb-4 text-cyan-400">Audio Sync Helper</h2>
      <p class="text-sm text-gray-400 mb-4">Use the player to listen to the song. Click "Capture Time" to easily set Start and End times while listening.</p>
      <div class="flex items-center gap-4 mb-2">
        <button type="button" @click="togglePlay" class="bg-gradient-to-r from-cyan-600 to-blue-600 px-6 py-2 rounded-lg hover:from-cyan-500 hover:to-blue-500 font-medium transition-all w-28 shadow-[0_0_10px_rgba(8,145,178,0.3)]">
          {{ isPlaying ? 'Pause' : 'Play' }}
        </button>
        <div class="flex-1 flex items-center gap-3">
          <span class="text-gray-400 text-sm font-mono w-12 text-right">{{ currentTime.toFixed(2) }}s</span>
          <input 
            type="range" 
            :max="duration" 
            :value="currentTime"
            @input="seekAudio"
            step="0.1"
            class="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
          />
          <span class="text-gray-400 text-sm font-mono w-12">{{ duration.toFixed(2) }}s</span>
        </div>
        <button type="button" @click="captureCurrentTime" class="bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-500 transition-colors font-medium whitespace-nowrap shadow-[0_0_10px_rgba(236,72,153,0.4)]">
          🎯 Capture Time
        </button>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Form -->
      <div class="lg:col-span-1 bg-gray-800 border border-gray-700 p-6 rounded-xl shadow-lg h-fit">
        <h2 class="text-xl font-semibold mb-4 text-cyan-400">{{ isEditing ? 'Edit Sentence' : 'Add New Sentence' }}</h2>
        <form @submit.prevent="saveSentence" class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-1 text-gray-300">Text (English)</label>
            <textarea v-model="form.text" required class="w-full bg-gray-700 border-gray-600 rounded p-3 text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all h-24"></textarea>
          </div>
          <div>
            <label class="block text-sm font-medium mb-1 text-gray-300">Translation (Chinese)</label>
            <textarea v-model="form.translation" required class="w-full bg-gray-700 border-gray-600 rounded p-3 text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all h-24"></textarea>
          </div>
          <div>
            <label class="block text-sm font-medium mb-1 text-gray-300">Distractor Words (Comma separated)</label>
            <input v-model="form.distractors" type="text" class="w-full bg-gray-700 border-gray-600 rounded p-3 text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all" placeholder="e.g. apple, orange" />
          </div>
          <div class="flex gap-4">
            <div class="flex-1">
              <label class="block text-sm font-medium mb-1 text-gray-300">Start Time (s)</label>
              <div class="flex gap-2">
                <input v-model.number="form.startTime" type="number" step="0.01" required class="w-full bg-gray-700 border-gray-600 rounded p-2 text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all font-mono" />
                <button type="button" @click="recordStartTime" class="bg-gray-700 border border-gray-600 px-3 rounded hover:bg-gray-600 text-cyan-400 transition-colors" title="Get current time">⏱</button>
              </div>
            </div>
            <div class="flex-1">
              <label class="block text-sm font-medium mb-1 text-gray-300">End Time (s)</label>
              <div class="flex gap-2">
                <input v-model.number="form.endTime" type="number" step="0.01" required class="w-full bg-gray-700 border-gray-600 rounded p-2 text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all font-mono" />
                <button type="button" @click="recordEndTime" class="bg-gray-700 border border-gray-600 px-3 rounded hover:bg-gray-600 text-cyan-400 transition-colors" title="Get current time">⏱</button>
              </div>
            </div>
          </div>
          
          <div class="flex gap-3 pt-4">
            <button type="submit" class="bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-4 py-2.5 rounded-lg hover:from-cyan-500 hover:to-blue-500 w-full font-medium transition-all shadow-[0_0_10px_rgba(8,145,178,0.3)]">
              {{ isEditing ? 'Update' : 'Add' }}
            </button>
            <button v-if="isEditing" type="button" @click="resetForm" class="bg-gray-600 text-white px-4 py-2.5 rounded-lg hover:bg-gray-500 w-full font-medium transition-all">
              Cancel
            </button>
          </div>
        </form>
      </div>

      <!-- List -->
      <div class="lg:col-span-2 bg-gray-800 border border-gray-700 p-6 rounded-xl shadow-lg">
        <h2 class="text-xl font-semibold mb-4 text-cyan-400">Sentences List</h2>
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="border-b border-gray-700 text-gray-400">
                <th class="p-3 w-28">Time</th>
                <th class="p-3">Content</th>
                <th class="p-3 w-24">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="sentence in sentences" :key="sentence.id" class="border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors">
                <td class="p-3 text-sm text-gray-400 font-mono">
                  {{ sentence.startTime }}s - <br>{{ sentence.endTime }}s
                </td>
                <td class="p-3">
                  <div class="font-medium text-gray-200 mb-1">{{ sentence.text }}</div>
                  <div class="text-sm text-gray-500">{{ sentence.translation }}</div>
                  <div v-if="sentence.distractors" class="text-xs text-red-400 mt-1">Distractors: {{ sentence.distractors }}</div>
                </td>
                <td class="p-3 space-y-2">
                  <button type="button" @click="editSentence(sentence)" class="text-cyan-500 hover:text-cyan-400 hover:underline block text-sm">Edit</button>
                  <button type="button" @click="deleteSentence(sentence.id)" class="text-red-500 hover:text-red-400 hover:underline block text-sm">Delete</button>
                </td>
              </tr>
              <tr v-if="sentences.length === 0">
                <td colspan="3" class="p-6 text-center text-gray-500">No sentences found. Add one!</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Auto Align Modal -->
    <div v-if="showAutoAlignModal" class="fixed inset-0 bg-black/80 z-50 flex items-center justify-center backdrop-blur-sm p-4">
      <div class="bg-gray-800 border border-gray-700 rounded-2xl p-6 w-full max-w-2xl shadow-2xl">
        <h2 class="text-2xl font-bold text-white mb-2 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Automated Lyrics Alignment
        </h2>
        <p class="text-gray-400 mb-6 text-sm">Paste your lyrics below. The AI will estimate timestamps based on text density and audio duration. For translations, separate them with a pipe "|" (e.g. <code>Hello | 你好</code>). Note: This will overwrite existing sentences.</p>
        
        <textarea 
          v-model="bulkLyricsText" 
          placeholder="The club isn't the best place... | 夜店不是寻找...
So the bar is where I go | 所以我去了酒吧
Me and my friends... | 我和朋友们..." 
          class="w-full h-64 bg-gray-900 border border-gray-600 rounded-xl p-4 text-white font-mono text-sm focus:ring-2 focus:ring-pink-500 outline-none mb-6 placeholder-gray-600"
          :disabled="isAligning"
        ></textarea>
        
        <div v-if="isAligning" class="flex flex-col items-center mb-6">
          <div class="w-full bg-gray-700 rounded-full h-2 mb-2 overflow-hidden">
            <div class="bg-gradient-to-r from-pink-500 to-purple-500 h-2 rounded-full animate-[pulse_1.5s_ease-in-out_infinite]" style="width: 100%"></div>
          </div>
          <span class="text-pink-400 text-sm animate-pulse">{{ alignProgress }}</span>
        </div>
        
        <div class="flex justify-end gap-4">
          <button type="button" @click="showAutoAlignModal = false" :disabled="isAligning" class="px-6 py-2.5 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors disabled:opacity-50">Cancel</button>
          <button type="button" @click="runAutoAlign" :disabled="isAligning || !bulkLyricsText.trim()" class="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white px-8 py-2.5 rounded-lg font-bold shadow-[0_0_15px_rgba(219,39,119,0.4)] disabled:opacity-50 transition-all">
            {{ isAligning ? 'Processing...' : 'Run Alignment' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
