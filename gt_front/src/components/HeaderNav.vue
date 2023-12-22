<template>
  <nav class="navbar is-fixed-top is-light" role="navigation" aria-label="main navigation">
    <div class="navbar-brand">
      <div class="navbar-item" v-if="!isDiaryPage">
        <router-link class="navbar-item" :to="'/user_relations/' + correspondingRelationId">
          {{navbarMessage}}
        </router-link>
      </div>
      <!-- MYMEMO: どうやってrelation_id を指定するか？ -->
      <div class="navbar-item" v-if="!isDiaryPage">
        <router-link to="/diaries/1" class="icon icon-button">
          <i class="fa-solid fa-book"></i>
        </router-link>
      </div>
      <!-- MYMEMO: どうやってrelation_id を指定するか？ -->
      <div class="navbar-item" v-if="isDiaryPage">
        <router-link to="/user_relations/1" class="icon icon-button">
          <i class="fa-solid fa-gift"></i>
        </router-link>
      </div>
      <a
        role="button"
        class="navbar-burger"
        :class="{'is-active': navbarVisible}"
        aria-label="menu"
        aria-expanded="false"
        data-target="navbarBasicExample"
        @click="toggleNavbarMenu"
      >
        <span aria-hidden="true"></span>
        <span aria-hidden="true"></span>
        <span aria-hidden="true"></span>
      </a>
    </div>
    <div class="navbar-menu u-tab-flex-column-end" :class="{'is-flex': navbarVisible}">
      <div class="navbar-start">
      </div>
      <div class="navbar-end">
        <div class="navbar-item has-dropdown is-hoverable" v-if="!isDiaryPage">
          <a class="navbar-link">ほかの相手</a>
          <div class="navbar-dropdown">
            <router-link
              v-for="(otherReceivingRelation, index) in otherReceivingRelations"
              :key=index
              class="navbar-item"
              :to="'/user_relations/' + otherReceivingRelation.id"
            >
              {{ otherReceivingRelation.related_user_nickname }}
            </router-link>
          </div>
        </div>
        <div class="navbar-item" v-if="!isDiaryPage">
          <button class="button is-ghost" @click="activateSearchModal">日付で検索</button>
        </div>
        <div class="navbar-item">
          <router-link class="button is-ghost" to="/release">更新履歴</router-link>
        </div>
        <div class="navbar-item">
          <button @click="logout" class="button is-ghost">ログアウト</button>
        </div>
      </div>
    </div>
  </nav>
</template>

<script>
import axios from 'axios'
import utils from '../utils'

export default {
  props: [
    'isGivingRelation',
    'otherReceivingRelations',
    'correspondingRelationId',
    'isDiaryPage'
  ],
  data: function () {
    return {
      navbarMessage: '',
      navbarVisible: false
    }
  },
  mounted: function () {
    this.updateMessage()
  },
  beforeUpdate: function () {
    this.updateMessage()
  },
  methods: {
    toggleNavbarMenu () {
      this.navbarVisible = !this.navbarVisible
    },
    updateMessage () {
      this.navbarMessage =
          (this.isGivingRelation ? 'もらったチケットへ' : 'チケットをあげる')
    },
    logout () {
      axios.get('/user/logout').then(() => {
        this.$router.push('/login')
      })
    },
    activateSearchModal () {
      // MYMEMO: refactor this
      utils.addIsHidden('#logo-fixed')
      utils.preventScroll()
      this.$store.dispatch('setSearchModalActive', true)
    }
  }
}
</script>

<style scoped>
@media screen and (max-width: 1023px) {
    .u-tab-flex-column-end {
        flex-direction: column;
        align-items: flex-end;
    }
}
.icon-button {
  color: rgba(0,0,0,.7);
  height: 40px;
  width: 40px;
  cursor: pointer;
  margin-left: auto;
}
.icon-button:hover {
  background-color: rgba(0,0,0,.05);
}
</style>
