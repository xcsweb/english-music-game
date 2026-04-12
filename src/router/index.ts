import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import AdminMusic from '../views/admin/AdminMusic.vue'
import AdminSentence from '../views/admin/AdminSentence.vue'
import Game from '../views/Game.vue'
import DemoAlignment from '../views/DemoAlignment.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/demo-alignment',
      name: 'demo-alignment',
      component: DemoAlignment
    },
    {
      path: '/game/:musicId',
      name: 'game',
      component: Game
    },
    {
      path: '/admin',
      name: 'admin-music',
      component: AdminMusic
    },
    {
      path: '/admin/sentences/:musicId',
      name: 'admin-sentence',
      component: AdminSentence
    }
  ]
})

export default router
