import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// Read the repository name from GITHUB_REPOSITORY for GitHub Pages
const repoName = process.env.GITHUB_REPOSITORY ? `/${process.env.GITHUB_REPOSITORY.split('/')[1]}/` : '/'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  base: repoName,
})
