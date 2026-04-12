<script setup lang="ts">
import { ref } from 'vue'

const count = ref(0)
</script>

<template>
  <div class="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
    <h1 class="text-4xl font-bold text-blue-600 mb-6">Music English Game</h1>
    <p class="text-lg text-gray-700 mb-4">Frontend initialized successfully!</p>
    <button type="button" 
      class="px-6 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 transition"
      @click="count++"
    >
      Count is {{ count }}
    </button>
  </div>
</template>
