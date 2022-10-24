<template>
  <nav class="navbar is-fixed-top is-light" role="navigation" aria-label="main navigation">
    <div class="navbar-brand">
      <a class="navbar-item" :href="'/relations/' + correspondingRelationId">
        {{navbarMessage}}
      </a>
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
            <a
              v-for="(otherReceivingRelation, index) in otherReceivingRelations"
              :key=index
              class="navbar-item"
              :href="'/relations/' + otherReceivingRelation.id"
            >
              {{ otherReceivingRelation.giving_user_nickname }}
            </a>
          </div>
        </div>
        <a href="/release" class="navbar-item">
          更新履歴
        </a>
        <div class="navbar-item">
          <div class="buttons">
            <a href="/users/sign_out" rel="nofollow" data-method="DELETE" class="button is-light">ログアウト</a>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<script>
export default {
  props: [
    'relatedUserNickname',
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
  created: function () {
    this.navbarMessage =
        this.relatedUserNickname +
        'に' +
        (this.isGivingRelation ? 'もらったチケットを見る' : 'チケットをあげる')
  },
  methods: {
    toggleNavbarMenu () {
      this.navbarVisible = !this.navbarVisible
    }
  }
}
</script>
