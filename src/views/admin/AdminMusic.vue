<script setup lang="ts">
import { ref } from 'vue'
import { useMusicStore } from '../../stores/music'
import { useSentenceStore } from '../../stores/sentence'
import { useRouter } from 'vue-router'

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

const deleteMusic = (id: string) => {
  if (confirm('Are you sure you want to delete this music?')) {
    musicStore.deleteMusic(id)
    sentenceStore.deleteSentencesByMusicId(id)
  }
}

const goToSentences = (id: string) => {
  router.push(`/admin/sentences/${id}`)
}

const handleResetDefaults = () => {
  if (confirm('⚠️ WARNING: This will overwrite ALL your current music and sentences with the default test data. Proceed?')) {
    musicStore.resetToDefaults()
    sentenceStore.resetToDefaults()
    alert('✅ Success: Default data restored!')
  }
}

const handleClearAll = () => {
  if (confirm('🚨 DANGER: This will delete ALL music and sentences permanently. Are you absolutely sure?')) {
    musicStore.clearAll()
    sentenceStore.clearAll()
    alert('🗑️ Success: All data has been cleared.')
  }
}
</script>

<template>
  <div class="p-6 max-w-4xl mx-auto min-h-screen bg-gray-900 text-gray-100">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-100">Music Management</h1>
      <button type="button" @click="$router.push('/')" class="text-cyan-400 hover:text-cyan-300 hover:underline transition-colors">Back to Home</button>
    </div>

    <!-- Data Management Tools -->
    <div class="bg-gray-800 border border-gray-700 p-6 rounded-xl shadow-lg mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
      <div>
        <h2 class="text-xl font-semibold text-cyan-400">Data Management</h2>
        <p class="text-sm text-gray-400 mt-1">Manage your local storage cache safely</p>
      </div>
      <div class="flex gap-3 w-full md:w-auto">
        <button type="button" @click="handleResetDefaults" class="flex-1 md:flex-none px-5 py-2.5 bg-gray-700 hover:bg-gray-600 border border-cyan-500/50 rounded-lg text-cyan-300 font-medium transition-all shadow-[0_0_10px_rgba(8,145,178,0.2)]">
          🔄 Reset Defaults
        </button>
        <button type="button" @click="handleClearAll" class="flex-1 md:flex-none px-5 py-2.5 bg-red-900/40 hover:bg-red-800/60 border border-red-500/50 rounded-lg text-red-400 font-medium transition-all shadow-[0_0_10px_rgba(239,68,68,0.2)]">
          🗑️ Clear All
        </button>
      </div>
    </div>

    <!-- Form -->
    <div class="bg-gray-800 border border-gray-700 p-6 rounded-xl shadow-lg mb-8">
      <h2 class="text-xl font-semibold mb-4 text-cyan-400">{{ isEditing ? 'Edit Music' : 'Add New Music' }}</h2>
      <form @submit.prevent="saveMusic" class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium mb-1 text-gray-300">Title</label>
            <input v-model="form.title" type="text" required class="w-full bg-gray-700 border-gray-600 rounded p-2 text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all" />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1 text-gray-300">Artist</label>
            <input v-model="form.artist" type="text" required class="w-full bg-gray-700 border-gray-600 rounded p-2 text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all" />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1 text-gray-300">Cover URL</label>
            <input v-model="form.coverUrl" type="url" required class="w-full bg-gray-700 border-gray-600 rounded p-2 text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all" />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1 text-gray-300">Audio URL</label>
            <input v-model="form.audioUrl" type="url" required class="w-full bg-gray-700 border-gray-600 rounded p-2 text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all" />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1 text-gray-300">Difficulty</label>
            <select v-model="form.difficulty" class="w-full bg-gray-700 border-gray-600 rounded p-2 text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all">
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
        </div>
        <div class="flex gap-3 pt-4">
          <button type="submit" class="bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-6 py-2 rounded-lg hover:from-cyan-500 hover:to-blue-500 font-medium transition-all shadow-[0_0_10px_rgba(8,145,178,0.3)]">
            {{ isEditing ? 'Update' : 'Add' }}
          </button>
          <button v-if="isEditing" type="button" @click="resetForm" class="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-500 transition-all">
            Cancel
          </button>
        </div>
      </form>
    </div>

    <!-- List -->
    <div class="bg-gray-800 border border-gray-700 p-6 rounded-xl shadow-lg">
      <h2 class="text-xl font-semibold mb-4 text-cyan-400">Music List</h2>
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="border-b border-gray-700 text-gray-400">
              <th class="p-3">Title</th>
              <th class="p-3">Artist</th>
              <th class="p-3">Difficulty</th>
              <th class="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="music in musicStore.musics" :key="music.id" class="border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors">
              <td class="p-3 text-gray-200">{{ music.title }}</td>
              <td class="p-3 text-gray-400">{{ music.artist }}</td>
              <td class="p-3">
                <span class="px-2 py-1 text-xs rounded border border-gray-600 capitalize text-gray-300">
                  {{ music.difficulty }}
                </span>
              </td>
              <td class="p-3 space-x-3">
                <button type="button" @click="editMusic(music)" class="text-cyan-500 hover:text-cyan-400 hover:underline">Edit</button>
                <button type="button" @click="goToSentences(music.id)" class="text-emerald-500 hover:text-emerald-400 hover:underline">Sentences</button>
                <button type="button" @click="deleteMusic(music.id)" class="text-red-500 hover:text-red-400 hover:underline">Delete</button>
              </td>
            </tr>
            <tr v-if="musicStore.musics.length === 0">
              <td colspan="4" class="p-6 text-center text-gray-500">No music found. Add one above!</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
