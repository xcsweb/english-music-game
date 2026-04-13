<script setup lang="ts">
</script>

<template>
  <div class="min-h-screen bg-black text-gray-100 flex justify-center selection:bg-cyan-500/30">
    <div class="w-full max-w-lg md:max-w-3xl lg:max-w-5xl xl:max-w-7xl min-h-screen bg-gray-900 relative overflow-x-hidden shadow-[0_0_40px_rgba(0,0,0,0.5)]">
      <router-view />
    </div>
  </div>
</template>
