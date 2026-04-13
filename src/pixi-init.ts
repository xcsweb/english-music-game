import * as PIXI from 'pixi.js-legacy'

// Force Vite to not tree-shake the renderers by explicitly registering them
if (PIXI.extensions && PIXI.Renderer) {
  PIXI.extensions.add(PIXI.Renderer)
}

window.PIXI = PIXI
