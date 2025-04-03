import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import content from '../views/ContentView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: HomeView,
      name:'home'
    },
    {
      path: '/:id',
      component: content
    }


  ]
})

export default router
