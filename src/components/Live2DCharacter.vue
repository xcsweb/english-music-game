<template>
  <div class="live2d-container pointer-events-none">
    <canvas ref="canvasRef" class="w-full h-full"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, onBeforeUnmount } from 'vue'
import * as PIXI from 'pixi.js-legacy'
window.PIXI = PIXI
// Note: We use Cubism 4 since the Hiyori model requires it
import { Live2DModel } from 'pixi-live2d-display/cubism4'

const props = defineProps<{
  gameState: 'memorize' | 'build' | 'success' | 'victory'
  isPlaying: boolean
  isWrong: boolean
  isTimeout: boolean
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
let app: PIXI.Application | null = null
let model: Live2DModel | null = null

// Use official Haru model from jsDelivr
const modelUrl = 'https://cdn.jsdelivr.net/gh/guansss/pixi-live2d-display/test/assets/haru/haru_greeter_t03.model3.json'

onMounted(async () => {
  if (!canvasRef.value) return

  // 1. Init Pixi Application with webgl auto-detect enabled explicitly
  app = new PIXI.Application({
    view: canvasRef.value,
    backgroundAlpha: 0, // Transparent background
    width: 400,
    height: 600,
    autoStart: true,
  })

  try {
    // 2. Load the Live2D model
    model = await Live2DModel.from(modelUrl)
    
    // 3. Set scale and position to fit the right corner
    model.scale.set(0.12) // Scale down further to fit the screen properly
    model.x = 200 // Move to the right
    model.y = 200 // Move down slightly

    // Add model to stage
    app.stage.addChild(model as any)

    // Initial idle motion
    model.motion('Idle')
  } catch (error) {
    console.error('Failed to load Live2D model:', error)
  }
})

// Handle state changes and trigger respective motions
// Available motions in typical Cubism4 models: Idle, TapBody, TapHead, etc.
// We trigger expressions or motions to make her react to the user
watch(() => props.gameState, (newState) => {
  if (!model) return
  if (newState === 'victory') {
    // Success reaction (happy expression)
    model.expression('f04')
    model.motion('Tap')
  } else {
    // Reset to idle
    model.expression('f00')
    model.motion('Idle')
  }
})

watch(() => props.isWrong, (isWrong) => {
  if (!model) return
  if (isWrong) {
    // Sad/Wrong reaction
    model.expression('f03')
    model.motion('Tap')
  } else {
    model.expression('f00')
  }
})

watch(() => props.gameState, (state) => {
  if (state === 'success' && model) {
    model.expression('f05') // Happy
    model.motion('TapBody') // React joyfully
  }
})

watch(() => props.isTimeout, (timeout) => {
  if (timeout && model) {
    model.expression('f06') // Angry or worried
  }
})

watch(() => props.isPlaying, (playing) => {
  if (!model) return
  if (playing) {
    // When audio plays, simulate singing/speaking by randomizing mouth open
    // A proper lip-sync requires audio context, but this simple trick works visually
    model.expression('f05')
  } else {
    model.expression('f01')
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
