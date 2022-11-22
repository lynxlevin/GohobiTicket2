import Vue from 'vue'
import Router from 'vue-router'
import MainPage from '@/components/MainPage'
import Release from '@/components/Release'

Vue.use(Router)

const routes = [
  {path: '/', component: MainPage},
  {path: '/user_relations/:relationId', component: MainPage},
  {path: '/release', component: Release}
]

export default new Router({
  mode: 'history',
  routes
})
