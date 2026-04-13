import fs from 'fs'
import path from 'path'
import { chromium } from 'playwright'

const outDir = path.resolve('artifacts', 'ui')
fs.mkdirSync(outDir, { recursive: true })

const viewports = [
  { name: 'desktop-1440x900', width: 1440, height: 900 },
  { name: 'desktop-1920x1080', width: 1920, height: 1080 },
  { name: 'tablet-1024x768', width: 1024, height: 768 },
]

const url = process.env.UI_URL || 'http://127.0.0.1:5173/'

const browser = await chromium.launch()

for (const vp of viewports) {
  const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } })
  await page.goto(url, { waitUntil: 'networkidle' })
  await page.waitForTimeout(500)

  const metrics = await page.evaluate(() => {
    const app = document.querySelector('#app')
    const root = app?.firstElementChild
    const inner = root?.firstElementChild
    const rect = inner?.getBoundingClientRect()
    return {
      window: { w: window.innerWidth, h: window.innerHeight, dpr: window.devicePixelRatio },
      container: rect ? { w: Math.round(rect.width), h: Math.round(rect.height), x: Math.round(rect.x) } : null,
    }
  })

  console.log(vp.name, metrics)
  await page.screenshot({ path: path.join(outDir, `${vp.name}.png`), fullPage: true })
  await page.close()
}

await browser.close()
