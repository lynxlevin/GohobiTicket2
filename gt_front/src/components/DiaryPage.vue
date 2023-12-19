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
          <tickets
            :availableTickets="availableTickets"
            :usedTickets="usedTickets"
            :isGivingRelation="isGivingRelation"
            :scrollPosition="scrollPosition"
            :visibleSpecialOnly="visibleSpecialOnly"
            :visibleUsedOnly="visibleUsedOnly"
            :deleteTicketFromMain="deleteTicketFromMain"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import HeaderNav from './HeaderNav'
import Tickets from './Tickets'
import axios from 'axios'

export default {
  components: {
    HeaderNav,
    Tickets
  },
  name: 'DiaryPage',
  data: function () {
    return {
      scrollPosition: 0,
      userRelationId: 0,
      apiAccessed: false,
      otherReceivingRelations: [],
      availableTickets: [],
      usedTickets: [],
      isGivingRelation: false,
      backgroundColor: '#FFFFFF',
      relatedUserNickname: '',
      correspondingRelationId: ''
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
        this.availableTickets = res.data.available_tickets
        this.usedTickets = res.data.used_tickets
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
    },
    // formatDate (date) {
    //   const yyyy = date.getFullYear()
    //   const mm = ('00' + (date.getMonth() + 1)).slice(-2)
    //   const dd = ('00' + (date.getDate())).slice(-2)
    //   return `${yyyy}-${mm}-${dd}`
    // },
    addAvailableTicket (createdTicket) {
      this.availableTickets.unshift(createdTicket)
    },
    deleteTicketFromMain (ticketId) {
      const ticket = this.availableTickets.find(ticket => ticket.id === ticketId)
      const index = this.availableTickets.indexOf(ticket)
      this.availableTickets.splice(index, 1)
    }
  }
}
</script>

<style>
.diaries {
    max-width: 760px;
    margin: 0 auto;
}
</style>
