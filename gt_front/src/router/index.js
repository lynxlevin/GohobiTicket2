import Vue from 'vue'
import Router from 'vue-router'
import MainPage from '@/components/MainPage'
import Release from '@/components/Release'
import Login from '@/components/Login'
import DiaryPage from '@/components/DiaryPage'
import DiaryTagPage from '@/components/DiaryTagPage'

Vue.use(Router)

const routes = [
  {path: '/', component: Login},
  {path: '/user_relations/:relationId', component: MainPage},
  {path: '/release', component: Release},
  {path: '/login', component: Login},
  {path: '/diaries/:relationId', component: DiaryPage},
  {path: '/diary_tags/:relationId', component: DiaryTagPage}
]

export default new Router({
  mode: 'history',
  routes
})
