<template>
  <nav class="navbar is-fixed-top is-light" role="navigation" aria-label="main navigation">
    <div class="navbar-brand">
      <router-link class="navbar-item" :to="'/user_relations/' + correspondingRelationId">
        {{navbarMessage}}
      </router-link>
      <div class="icon search-button" @click="activateSearchModal">
        <i class="fas fa-search"></i>
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
        <div class="navbar-item has-dropdown is-hoverable">
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
        <router-link to="/release" class="navbar-item">
          更新履歴
        </router-link>
        <div class="navbar-item">
          <div class="buttons">
            <button @click="logout" class="button is-light">ログアウト</button>
          </div>
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
    'correspondingRelationId'
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
      utils.addIsHidden('#logo')
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
.search-button {
  height: 52px;
  width: 52px;
  cursor: pointer;
  margin-left: auto;
}
.search-button:hover {
  background-color: rgba(0,0,0,.05);
}
</style>
