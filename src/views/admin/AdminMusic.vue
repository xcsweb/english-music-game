<script setup lang="ts">
import { ref } from 'vue'
import { useMusicStore } from '../../stores/music'
import { useSentenceStore } from '../../stores/sentence'
import { useRouter } from 'vue-router'
import ConfirmModal from '../../components/ConfirmModal.vue'

const musicStore = useMusicStore()
const sentenceStore = useSentenceStore()
const router = useRouter()

const form = ref({
  id: '',
  title: '',
  artist: '',
  coverUrl: '',
  audioUrl: '',
  difficulty: 'easy' as 'easy' | 'medium' | 'hard'
})

const isEditing = ref(false)

const resetForm = () => {
  form.value = {
    id: '',
    title: '',
    artist: '',
    coverUrl: '',
    audioUrl: '',
    difficulty: 'easy'
  }
  isEditing.value = false
}

const editMusic = (music: any) => {
  form.value = { ...music }
  isEditing.value = true
}

const saveMusic = () => {
  if (isEditing.value) {
    musicStore.updateMusic(form.value.id, form.value)
  } else {
    musicStore.addMusic({
      ...form.value,
      id: Date.now().toString()
    })
  }
  resetForm()
}

// Modal State Management
const confirmModal = ref({
  isOpen: false,
  title: '',
  message: '',
  isDanger: false,
  confirmText: '确定',
  showCancel: true,
  onConfirm: () => {}
})

const openModal = (options: { title: string; message: string; isDanger?: boolean; confirmText?: string; showCancel?: boolean; onConfirm: () => void }) => {
  confirmModal.value = {
    isOpen: true,
    title: options.title,
    message: options.message,
    isDanger: options.isDanger || false,
    confirmText: options.confirmText || '确定',
    showCancel: options.showCancel !== false,
    onConfirm: () => {
      options.onConfirm()
      confirmModal.value.isOpen = false
    }
  }
}

const deleteMusic = (id: string) => {
  openModal({
    title: '删除音乐',
    message: '确定要删除这首音乐吗？相关的句子数据也将被删除。',
    isDanger: true,
    confirmText: '删除',
    onConfirm: () => {
      musicStore.deleteMusic(id)
      sentenceStore.deleteSentencesByMusicId(id)
    }
  })
}

const goToSentences = (id: string) => {
  router.push(`/admin/sentences/${id}`)
}

const handleResetDefaults = () => {
  openModal({
    title: '恢复默认数据',
    message: '警告：这将会用默认的测试数据覆盖你当前所有的音乐和句子！确定继续吗？',
    isDanger: false,
    confirmText: '恢复',
    onConfirm: () => {
      musicStore.resetToDefaults()
      sentenceStore.resetToDefaults()
      setTimeout(() => {
        openModal({
          title: '成功',
          message: '已成功恢复默认数据！',
          confirmText: '好的',
          showCancel: false,
          onConfirm: () => {}
        })
      }, 300)
    }
  })
}

const handleClearAll = () => {
  openModal({
    title: '清空所有数据',
    message: '危险：这将会永久删除所有的音乐和句子数据！你绝对确定吗？',
    isDanger: true,
    confirmText: '清空',
    onConfirm: () => {
      musicStore.clearAll()
      sentenceStore.clearAll()
      setTimeout(() => {
        openModal({
          title: '成功',
          message: '所有数据已清空。',
          confirmText: '好的',
          showCancel: false,
          onConfirm: () => {}
        })
      }, 300)
    }
  })
}
</script>

<template>
  <div class="p-6 max-w-4xl mx-auto min-h-[100svh] bg-sky-50 text-slate-800 font-sans">
    <div class="flex justify-between items-center mb-6 bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
      <h1 class="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-bili-blue to-bili-pink">音乐管理</h1>
      <button type="button" @click="$router.push('/')" class="text-slate-500 hover:text-bili-blue font-bold transition-colors">返回首页</button>
    </div>

    <!-- Data Management Tools -->
    <div class="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
      <div>
        <h2 class="text-xl font-bold text-slate-800">数据管理</h2>
        <p class="text-sm text-slate-500 mt-1">安全地管理本地缓存数据</p>
      </div>
      <div class="flex gap-3 w-full md:w-auto">
        <button type="button" @click="handleResetDefaults" class="flex-1 md:flex-none px-6 py-2.5 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-full text-sky-600 font-bold transition-all">
          🔄 恢复默认
        </button>
        <button type="button" @click="handleClearAll" class="flex-1 md:flex-none px-6 py-2.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-full text-rose-500 font-bold transition-all">
          🗑️ 清空数据
        </button>
      </div>
    </div>

    <!-- Form -->
    <div class="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm mb-6">
      <h2 class="text-xl font-bold mb-5 text-slate-800">{{ isEditing ? '编辑音乐' : '添加新音乐' }}</h2>
      <form @submit.prevent="saveMusic" class="space-y-5">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label class="block text-sm font-bold mb-1.5 text-slate-600">标题</label>
            <input v-model="form.title" type="text" required class="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 focus:ring-2 focus:ring-bili-blue/20 focus:border-bili-blue outline-none transition-all" />
          </div>
          <div>
            <label class="block text-sm font-bold mb-1.5 text-slate-600">歌手</label>
            <input v-model="form.artist" type="text" required class="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 focus:ring-2 focus:ring-bili-blue/20 focus:border-bili-blue outline-none transition-all" />
          </div>
          <div>
            <label class="block text-sm font-bold mb-1.5 text-slate-600">封面 URL</label>
            <input v-model="form.coverUrl" type="url" required class="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 focus:ring-2 focus:ring-bili-blue/20 focus:border-bili-blue outline-none transition-all" />
          </div>
          <div>
            <label class="block text-sm font-bold mb-1.5 text-slate-600">音频 URL</label>
            <input v-model="form.audioUrl" type="url" required class="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 focus:ring-2 focus:ring-bili-blue/20 focus:border-bili-blue outline-none transition-all" />
          </div>
          <div>
            <label class="block text-sm font-bold mb-1.5 text-slate-600">难度</label>
            <select v-model="form.difficulty" class="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 focus:ring-2 focus:ring-bili-blue/20 focus:border-bili-blue outline-none transition-all">
              <option value="easy">简单</option>
              <option value="medium">中等</option>
              <option value="hard">困难</option>
            </select>
          </div>
        </div>
        <div class="flex gap-3 pt-2">
          <button type="submit" class="bg-bili-blue text-white px-8 py-2.5 rounded-full hover:bg-bili-blue/90 font-bold transition-all shadow-sm">
            {{ isEditing ? '更新' : '添加' }}
          </button>
          <button v-if="isEditing" type="button" @click="resetForm" class="bg-slate-100 text-slate-600 border border-slate-200 px-8 py-2.5 rounded-full hover:bg-slate-200 font-bold transition-all">
            取消
          </button>
        </div>
      </form>
    </div>

    <!-- List -->
    <div class="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
      <h2 class="text-xl font-bold mb-5 text-slate-800">音乐列表</h2>
      <div class="overflow-x-auto rounded-xl border border-slate-100">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold text-sm">
              <th class="p-4">标题</th>
              <th class="p-4">歌手</th>
              <th class="p-4">难度</th>
              <th class="p-4">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="music in musicStore.musics" :key="music.id" class="border-b border-slate-100 hover:bg-sky-50/50 transition-colors">
              <td class="p-4 font-bold text-slate-800">{{ music.title }}</td>
              <td class="p-4 text-slate-500 text-sm">{{ music.artist }}</td>
              <td class="p-4">
                <span class="px-2.5 py-1 text-[10px] font-black rounded-sm border"
                      :class="{
                        'bg-emerald-50 text-emerald-600 border-emerald-200': music.difficulty === 'easy',
                        'bg-amber-50 text-amber-600 border-amber-200': music.difficulty === 'medium',
                        'bg-rose-50 text-rose-600 border-rose-200': music.difficulty === 'hard'
                      }">
                  {{ music.difficulty === 'easy' ? '简单' : music.difficulty === 'medium' ? '中等' : '困难' }}
                </span>
              </td>
              <td class="p-4 space-x-4 text-sm font-bold">
                <button type="button" @click="editMusic(music)" class="text-bili-blue hover:text-sky-600">编辑</button>
                <button type="button" @click="goToSentences(music.id)" class="text-emerald-500 hover:text-emerald-600">句子</button>
                <button type="button" @click="deleteMusic(music.id)" class="text-rose-500 hover:text-rose-600">删除</button>
              </td>
            </tr>
            <tr v-if="musicStore.musics.length === 0">
              <td colspan="4" class="p-8 text-center text-slate-400 font-medium">没有找到音乐。请在上方添加！</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Confirm Modal -->
    <ConfirmModal 
      :is-open="confirmModal.isOpen"
      :title="confirmModal.title"
      :message="confirmModal.message"
      :is-danger="confirmModal.isDanger"
      :confirm-text="confirmModal.confirmText"
      :show-cancel="confirmModal.showCancel"
      @confirm="confirmModal.onConfirm"
      @cancel="confirmModal.isOpen = false"
    />
  </div>
</template>
