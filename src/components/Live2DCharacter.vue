<template>
  <div class="live2d-container pointer-events-none">
    <canvas ref="canvasRef" class="w-full h-full"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, onBeforeUnmount } from 'vue'
import * as PIXI from 'pixi.js'
import { Live2DModel } from 'pixi-live2d-display'
import { useSettingsStore } from '../stores/settings'

const props = defineProps<{
  gameState: 'memorize' | 'build' | 'success' | 'victory'
  isPlaying: boolean
  isWrong: boolean
  isTimeout: boolean
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
let app: PIXI.Application | null = null
let model: Live2DModel | null = null
const settingsStore = useSettingsStore()

const modelsInfo: Record<string, { url: string, scale: number, x: number, y: number, exp: Record<string, string | number>, mot: Record<string, string> }> = {
  haru: {
    url: 'https://cdn.jsdelivr.net/gh/guansss/pixi-live2d-display/test/assets/haru/haru_greeter_t03.model3.json',
    scale: 0.12,
    x: 200,
    y: 200,
    exp: { idle: 'f00', talk: 'f05', happy: 'f04', sad: 'f03', angry: 'f06' },
    mot: { idle: 'Idle', tap: 'Tap', tapBody: 'TapBody' }
  },
  shizuku: {
    url: 'https://cdn.jsdelivr.net/gh/guansss/pixi-live2d-display/test/assets/shizuku/shizuku.model.json',
    scale: 0.2,
    x: 100,
    y: 100,
    exp: { idle: 1, talk: 3, happy: 2, sad: 4, angry: 5 }, // Cubism 2 uses index or different strings, usually index for expressions
    mot: { idle: 'idle', tap: 'tap_body', tapBody: 'tap_body' }
  }
}

const loadModel = async () => {
  if (!app) return
  
  const currentKey = settingsStore.live2dModel || 'haru'
  const info = modelsInfo[currentKey]

  // Cleanup old model
  if (model) {
    app.stage.removeChild(model as any)
    model.destroy()
    model = null
  }

  try {
    model = await Live2DModel.from(info.url)
    
    ;(model as any).scale.set(info.scale)
    ;(model as any).x = info.x
    ;(model as any).y = info.y

    app.stage.addChild(model as any)
    model.motion(info.mot.idle)
  } catch (error) {
    console.error('Failed to load Live2D model:', error)
  }
}

onMounted(async () => {
  if (!canvasRef.value) return

  app = new PIXI.Application({
    view: canvasRef.value,
    backgroundAlpha: 0,
    width: 400,
    height: 600,
    autoStart: true,
  })

  await loadModel()
})

watch(() => settingsStore.live2dModel, () => {
  loadModel()
})

const getExp = (key: 'idle' | 'talk' | 'happy' | 'sad' | 'angry') => {
  const currentKey = settingsStore.live2dModel || 'haru'
  return modelsInfo[currentKey]?.exp[key]
}

const getMot = (key: 'idle' | 'tap' | 'tapBody') => {
  const currentKey = settingsStore.live2dModel || 'haru'
  return modelsInfo[currentKey]?.mot[key]
}

// Handle state changes and trigger respective motions
watch(() => props.gameState, (newState) => {
  if (!model) return
  if (newState === 'victory') {
    model.expression(getExp('happy') as any)
    model.motion(getMot('tap'))
  } else {
    model.expression(getExp('idle') as any)
    model.motion(getMot('idle'))
  }
})

watch(() => props.isWrong, (isWrong) => {
  if (!model) return
  if (isWrong) {
    model.expression(getExp('sad') as any)
    model.motion(getMot('tap'))
  } else {
    model.expression(getExp('idle') as any)
  }
})

watch(() => props.gameState, (state) => {
  if (state === 'success' && model) {
    model.expression(getExp('happy') as any)
    model.motion(getMot('tapBody'))
  }
})

watch(() => props.isTimeout, (timeout) => {
  if (timeout && model) {
    model.expression(getExp('angry') as any)
  }
})

watch(() => props.isPlaying, (playing) => {
  if (!model) return
  if (playing) {
    model.expression(getExp('talk') as any)
  } else {
    model.expression(getExp('idle') as any)
  }
})

onBeforeUnmount(() => {
  if (model) {
    model.destroy()
    model = null
  }
  if (app) {
    app.destroy(false, true)
    app = null
  }
})
</script>

<style scoped>
.live2d-container {
  position: fixed;
  bottom: -50px;
  right: -50px;
  width: 400px;
  height: 600px;
  z-index: 20;
  /* Hide on small screens, show on md and above */
  display: none;
}

@media (min-width: 768px) {
  .live2d-container {
    display: block;
  }
}
</style>
