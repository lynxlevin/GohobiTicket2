import Vue from 'vue'
import Router from 'vue-router'
import MainPage from '@/components/MainPage'
import Release from '@/components/Release'
import Login from '@/components/Login'

Vue.use(Router)

const routes = [
  {path: '/', component: Login},
  {path: '/user_relations/:relationId', component: MainPage},
  {path: '/release', component: Release},
  {path: '/login', component: Login}
]

export default new Router({
  mode: 'history',
  routes
})
