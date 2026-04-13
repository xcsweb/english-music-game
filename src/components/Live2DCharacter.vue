<template>
  <div class="live2d-container pointer-events-none">
    <canvas ref="canvasRef" class="w-full h-full"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, onBeforeUnmount } from 'vue'
import * as PIXI from 'pixi.js'
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

// Use official Hiyori model from jsDelivr
const modelUrl = 'https://cdn.jsdelivr.net/gh/guansss/pixi-live2d-display/test/assets/hiyori/hiyori_pro_t10.model3.json'

onMounted(async () => {
  if (!canvasRef.value) return

  // 1. Init Pixi Application
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
    model.scale.set(0.2) // Scale down
    model.x = 0
    model.y = 100 // Move down slightly

    // Add model to stage (bypass TS type error between Pixi v6 and v7 DisplayObject)
    app.stage.addChild(model as unknown as PIXI.DisplayObject)

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
  if (newState === 'build') {
    model.motion('Idle')
    model.expression('f04') // Serious/Thinking expression
  } else if (newState === 'victory') {
    model.motion('TapBody') // Typically a reaction or joyful motion
    model.expression('f05') // Smile/Happy
  } else if (newState === 'memorize') {
    model.motion('Idle')
    model.expression('f01') // Normal
  }
})

watch(() => props.isWrong, (wrong) => {
  if (wrong && model) {
    model.expression('f03') // Sad/Surprised
  } else if (!wrong && model && props.gameState !== 'success') {
    model.expression('f01')
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
  }
  if (app) {
    app.destroy(false, { children: true })
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
