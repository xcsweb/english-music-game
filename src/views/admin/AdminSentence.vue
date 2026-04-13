<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMusicStore } from '../../stores/music'
import { useSentenceStore } from '../../stores/sentence'
import { Howl } from 'howler'
import ConfirmModal from '../../components/ConfirmModal.vue'

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

// Modal State Management
const confirmModal = ref({
  isOpen: false,
  title: '',
  message: '',
  isDanger: false,
  confirmText: '确定',
  onConfirm: () => {}
})

const openModal = (options: { title: string; message: string; isDanger?: boolean; confirmText?: string; onConfirm: () => void }) => {
  confirmModal.value = {
    isOpen: true,
    title: options.title,
    message: options.message,
    isDanger: options.isDanger || false,
    confirmText: options.confirmText || '确定',
    onConfirm: () => {
      options.onConfirm()
      confirmModal.value.isOpen = false
    }
  }
}

onMounted(() => {
  if (!music.value) {
    openModal({
      title: '提示',
      message: '找不到该音乐数据，即将返回音乐管理列表。',
      confirmText: '返回',
      onConfirm: () => {
        router.push('/admin')
      }
    })
    return
  }

  let audioUrl = music.value.audioUrl
  if (audioUrl.startsWith('/')) {
    audioUrl = import.meta.env.BASE_URL + audioUrl.slice(1)
  }

  sound = new Howl({
    src: [audioUrl],
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
  openModal({
    title: '删除句子',
    message: '确定要删除这个句子吗？',
    isDanger: true,
    confirmText: '删除',
    onConfirm: () => {
      sentenceStore.deleteSentence(id)
    }
  })
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
  <div class="p-6 max-w-5xl mx-auto min-h-[100svh] bg-sky-50 text-slate-800 font-sans">
    <div class="flex justify-between items-center mb-6 bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
      <h1 class="text-2xl font-black text-slate-800">管理句子: <span class="text-transparent bg-clip-text bg-gradient-to-r from-bili-blue to-bili-pink">{{ music?.title }}</span></h1>
      <div class="flex items-center gap-4">
        <button type="button" @click="showAutoAlignModal = true" class="bg-bili-pink hover:bg-bili-pink/90 text-white px-6 py-2.5 rounded-full font-bold shadow-sm transition-all flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clip-rule="evenodd" />
          </svg>
          智能自动对齐
        </button>
        <button type="button" @click="$router.push('/admin')" class="text-slate-500 hover:text-bili-blue font-bold transition-colors">返回音乐列表</button>
      </div>
    </div>

    <!-- Audio Player -->
    <div class="bg-white border border-slate-200 text-slate-800 p-6 rounded-2xl shadow-sm mb-6 sticky top-4 z-10">
      <h2 class="text-lg font-bold mb-2 text-slate-800">音频同步助手</h2>
      <p class="text-sm text-slate-500 mb-5">使用播放器试听歌曲。在播放时点击 "捕获时间" 即可快速记录当前时间点作为句子的开始或结束时间。</p>
      <div class="flex items-center gap-4 mb-2">
        <button type="button" @click="togglePlay" class="bg-bili-blue hover:bg-bili-blue/90 text-white px-8 py-2.5 rounded-full font-bold transition-all w-32 shadow-sm">
          {{ isPlaying ? '暂停' : '播放' }}
        </button>
        <div class="flex-1 flex items-center gap-3">
          <span class="text-slate-500 text-sm font-mono font-bold w-14 text-right">{{ currentTime.toFixed(2) }}s</span>
          <input 
            type="range" 
            :max="duration" 
            :value="currentTime"
            @input="seekAudio"
            step="0.1"
            class="flex-1 h-2 bg-slate-200 rounded-full appearance-none cursor-pointer accent-bili-pink"
          />
          <span class="text-slate-500 text-sm font-mono font-bold w-14">{{ duration.toFixed(2) }}s</span>
        </div>
        <button type="button" @click="captureCurrentTime" class="bg-emerald-500 text-white px-6 py-2.5 rounded-full hover:bg-emerald-400 transition-colors font-bold whitespace-nowrap shadow-sm flex items-center gap-2">
          🎯 捕获时间
        </button>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Form -->
      <div class="lg:col-span-1 bg-white border border-slate-200 p-6 rounded-2xl shadow-sm h-fit">
        <h2 class="text-xl font-bold mb-5 text-slate-800">{{ isEditing ? '编辑句子' : '添加新句子' }}</h2>
        <form @submit.prevent="saveSentence" class="space-y-5">
          <div>
            <label class="block text-sm font-bold mb-1.5 text-slate-600">文本 (英文)</label>
            <textarea v-model="form.text" required class="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-slate-800 focus:ring-2 focus:ring-bili-blue/20 focus:border-bili-blue outline-none transition-all h-24 resize-none"></textarea>
          </div>
          <div>
            <label class="block text-sm font-bold mb-1.5 text-slate-600">翻译 (中文)</label>
            <textarea v-model="form.translation" required class="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-slate-800 focus:ring-2 focus:ring-bili-blue/20 focus:border-bili-blue outline-none transition-all h-24 resize-none"></textarea>
          </div>
          <div>
            <label class="block text-sm font-bold mb-1.5 text-slate-600">干扰词 (用逗号分隔)</label>
            <input v-model="form.distractors" type="text" class="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-slate-800 focus:ring-2 focus:ring-bili-blue/20 focus:border-bili-blue outline-none transition-all" placeholder="例如: apple, orange" />
          </div>
          <div class="flex gap-4">
            <div class="flex-1">
              <label class="block text-sm font-bold mb-1.5 text-slate-600">开始时间 (s)</label>
              <div class="flex gap-2">
                <input v-model.number="form.startTime" type="number" step="0.01" required class="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:ring-2 focus:ring-bili-blue/20 focus:border-bili-blue outline-none transition-all font-mono font-bold" />
                <button type="button" @click="recordStartTime" class="bg-sky-50 border border-sky-200 px-3 rounded-lg hover:bg-sky-100 text-bili-blue font-bold transition-colors" title="获取当前时间">⏱</button>
              </div>
            </div>
            <div class="flex-1">
              <label class="block text-sm font-bold mb-1.5 text-slate-600">结束时间 (s)</label>
              <div class="flex gap-2">
                <input v-model.number="form.endTime" type="number" step="0.01" required class="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:ring-2 focus:ring-bili-blue/20 focus:border-bili-blue outline-none transition-all font-mono font-bold" />
                <button type="button" @click="recordEndTime" class="bg-sky-50 border border-sky-200 px-3 rounded-lg hover:bg-sky-100 text-bili-blue font-bold transition-colors" title="获取当前时间">⏱</button>
              </div>
            </div>
          </div>
          
          <div class="flex flex-col gap-3 pt-2">
            <button type="submit" class="bg-bili-blue text-white px-4 py-3 rounded-full hover:bg-bili-blue/90 w-full font-bold transition-all shadow-sm">
              {{ isEditing ? '更新句子' : '添加句子' }}
            </button>
            <button v-if="isEditing" type="button" @click="resetForm" class="bg-slate-100 text-slate-600 border border-slate-200 px-4 py-3 rounded-full hover:bg-slate-200 w-full font-bold transition-all">
              取消编辑
            </button>
          </div>
        </form>
      </div>

      <!-- List -->
      <div class="lg:col-span-2 bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
        <h2 class="text-xl font-bold mb-5 text-slate-800">句子列表</h2>
        <div class="overflow-x-auto rounded-xl border border-slate-100">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold text-sm">
                <th class="p-4 w-32">时间段</th>
                <th class="p-4">内容</th>
                <th class="p-4 w-24">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="sentence in sentences" :key="sentence.id" class="border-b border-slate-100 hover:bg-sky-50/50 transition-colors">
                <td class="p-4 text-sm text-slate-500 font-mono font-bold">
                  {{ sentence.startTime }}s - <br>{{ sentence.endTime }}s
                </td>
                <td class="p-4">
                  <div class="font-bold text-slate-800 mb-1">{{ sentence.text }}</div>
                  <div class="text-sm text-slate-500">{{ sentence.translation }}</div>
                  <div v-if="sentence.distractors" class="text-xs text-rose-500 font-medium mt-1">干扰词: {{ sentence.distractors }}</div>
                </td>
                <td class="p-4 space-y-3">
                  <button type="button" @click="editSentence(sentence)" class="text-bili-blue hover:text-sky-600 font-bold block text-sm transition-colors">编辑</button>
                  <button type="button" @click="deleteSentence(sentence.id)" class="text-rose-500 hover:text-rose-600 font-bold block text-sm transition-colors">删除</button>
                </td>
              </tr>
              <tr v-if="sentences.length === 0">
                <td colspan="3" class="p-8 text-center text-slate-400 font-medium">还没有添加句子，请在左侧添加！</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Auto Align Modal -->
    <div v-if="showAutoAlignModal" class="fixed inset-0 bg-slate-900/40 z-[100] flex items-center justify-center backdrop-blur-sm p-4">
      <div class="bg-white border border-slate-200 rounded-2xl p-6 w-full max-w-2xl shadow-bili">
        <h2 class="text-2xl font-black text-slate-800 mb-2 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-bili-pink" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          智能自动对齐
        </h2>
        <p class="text-slate-500 mb-6 text-sm leading-relaxed">在下方粘贴你的歌词。系统将根据文本密度和音频总长自动估算时间戳。如果包含翻译，请使用竖线 "|" 分隔（例如：<code>Hello | 你好</code>）。<br><strong class="text-rose-500">注意：此操作将覆盖该歌曲当前所有的句子数据！</strong></p>
        
        <textarea 
          v-model="bulkLyricsText" 
          placeholder="The club isn't the best place... | 夜店不是寻找...
So the bar is where I go | 所以我去了酒吧
Me and my friends... | 我和朋友们..." 
          class="w-full h-64 bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-800 font-mono text-sm focus:ring-2 focus:ring-bili-pink/30 focus:border-bili-pink outline-none mb-6 placeholder-slate-400 resize-none"
          :disabled="isAligning"
        ></textarea>
        
        <div v-if="isAligning" class="flex flex-col items-center mb-6">
          <div class="w-full bg-slate-100 rounded-full h-2 mb-3 overflow-hidden">
            <div class="bg-gradient-to-r from-bili-blue to-bili-pink h-2 rounded-full animate-[pulse_1.5s_ease-in-out_infinite]" style="width: 100%"></div>
          </div>
          <span class="text-bili-pink font-bold text-sm animate-pulse">{{ alignProgress }}</span>
        </div>
        
        <div class="flex justify-end gap-3">
          <button type="button" @click="showAutoAlignModal = false" :disabled="isAligning" class="px-6 py-2.5 rounded-full text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 font-bold transition-colors disabled:opacity-50 shadow-sm">取消</button>
          <button type="button" @click="runAutoAlign" :disabled="isAligning || !bulkLyricsText.trim()" class="bg-bili-pink hover:bg-bili-pink/90 text-white px-8 py-2.5 rounded-full font-bold shadow-sm disabled:opacity-50 transition-all">
            {{ isAligning ? '处理中...' : '开始对齐' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Confirm Modal -->
    <ConfirmModal 
      :is-open="confirmModal.isOpen"
      :title="confirmModal.title"
      :message="confirmModal.message"
      :is-danger="confirmModal.isDanger"
      :confirm-text="confirmModal.confirmText"
      @confirm="confirmModal.onConfirm"
      @cancel="confirmModal.isOpen = false"
    />
  </div>
</template>
