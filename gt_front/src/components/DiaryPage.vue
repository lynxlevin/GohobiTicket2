<template>
  <div class="pt-6" id="tickettop" v-bind:style="{backgroundColor: backgroundColor}">
    <div v-if="apiAccessed">
      <header-nav
        :isGivingRelation = "isGivingRelation"
        :otherReceivingRelations = "otherReceivingRelations"
        :correspondingRelationId = "correspondingRelationId"
        :isDiaryPage = true
      ></header-nav>
      <div
        class="container is-max-desktop has-text-centered"
      >
        <h1 class="title is-2 section pt-4 pb-4">
          <span class="subtitle is-4">
            {{relatedUserNickname}}との日記
          </span>
        </h1>
        <div class="diaries">
          <!-- <ticket-form
            :userRelationId = "userRelationId"
            v-if="isGivingRelation"
            @addAvailableTicket="addAvailableTicket"
          /> -->
          <diaries
            :diaries="diaries"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import HeaderNav from './HeaderNav'
import Diaries from './Diaries'
import axios from 'axios'

export default {
  components: {
    HeaderNav,
    Diaries
  },
  name: 'DiaryPage',
  data: function () {
    return {
      userRelationId: 0,
      apiAccessed: false,
      otherReceivingRelations: [],
      isGivingRelation: false,
      backgroundColor: '#FFFFFF',
      relatedUserNickname: '',
      correspondingRelationId: '',
      diaries: []
    }
  },
  created: function () {
    this.$watch(
      () => this.$route.params,
      (toParams, _prev) => {
        this.userRelationId = toParams.relationId
        this.getInitialData()
        window.scroll({top: 0})
      },
      { immediate: true }
    )
  },
  methods: {
    getInitialData () {
      axios.get(`/api/user_relations/${this.userRelationId}/`).then(res => {
        this.otherReceivingRelations = res.data.other_receiving_relations
        this.apiAccessed = true

        this.isGivingRelation = res.data.user_relation_info.is_giving_relation
        this.backgroundColor = res.data.user_relation_info.background_color
        this.relatedUserNickname = res.data.user_relation_info.related_user_nickname
        this.correspondingRelationId = res.data.user_relation_info.corresponding_relation_id
      }).catch(err => {
        if (err.response.status === 403) {
          this.$router.push('/login')
        }
      })
      axios.get(`/api/diaries/?user_relation_id=${this.userRelationId}`).then(res => {
        console.log(res.data)
        this.diaries = res.data.diaries
      }).catch(err => {
        if (err.response.status === 403) this.$router.push('/login')
      })
    }
    // formatDate (date) {
    //   const yyyy = date.getFullYear()
    //   const mm = ('00' + (date.getMonth() + 1)).slice(-2)
    //   const dd = ('00' + (date.getDate())).slice(-2)
    //   return `${yyyy}-${mm}-${dd}`
    // },
  }
}
</script>

<style>
.diaries {
    max-width: 760px;
    margin: 0 auto;
}
</style>
