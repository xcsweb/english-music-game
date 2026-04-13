/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

import * as PIXI from 'pixi.js'
import { InternalModel } from 'pixi-live2d-display'

declare global {
  interface Window {
    PIXI: typeof PIXI
  }
}

declare module 'pixi-live2d-display' {
  interface Live2DModel<IM extends InternalModel = InternalModel> {
    removeFromParent(): void
  }
}
