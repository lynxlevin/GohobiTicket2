<template>
  <div class="pt-6" id="tickettop" v-bind:style="{backgroundColor: backgroundColor}">
    <div v-if="apiAccessed">
      <header-nav
        :relatedUserNickname = "relatedUserNickname"
        :isGivingRelation = "isGivingRelation"
        :otherReceivingRelations = "otherReceivingRelations"
        :correspondingRelationId = "correspondingRelationId"
      ></header-nav>
      <div
        class="container is-max-desktop has-text-centered"
      >
        <h1 class="title is-2 section">
          <span class="subtitle is-4">
            {{relatedUserNickname}}に{{titleMessage}}
          </span><br />
          ごほうびチケット
        </h1>
        <div class="block logo-block">
          <img
            :src="ticketImage"
            alt="ticket image"
            :class="{
              'logo': !isLogoFixed,
              'logo-fixed': isLogoFixed,
            }"
            id="logo"
            @click="activateSearchModal"
          >
        </div>
        <h4 class="subtitle is-3" id="ticket-count">
          手持ち{{ availableTicketCount }}枚 / 合計{{ allTicketCount }}枚
        </h4>
        <div class="field">
          <label class="label">
            <input type="checkbox" v-model="visibleSpecialOnly" />
            特別チケットのみ表示
          </label>
        </div>
        <div class="field">
          <label class="label">
            <input type="checkbox" v-model="visibleUsedOnly" />
            使用済みチケットのみ表示
          </label>
        </div>
        <div class="tickets">
          <ticket-form
            :userRelationId = "userRelationId"
            v-if="isGivingRelation"
          />
          <tickets
            :availableTickets="availableTickets"
            :usedTickets="usedTickets"
            :isGivingRelation="isGivingRelation"
            :scrollPosition="scrollPosition"
            :visibleSpecialOnly="visibleSpecialOnly"
            :visibleUsedOnly="visibleUsedOnly"
          />
        </div>
        <transition name="fade">
          <div
            class="to-used-tickets"
            v-if="$store.state.isUsedTicketsOnScreen"
            @click="scrollToUsedTickets"
          >
            <span class="icon">
              <i class="fas fa-angle-double-down"></i>
            </span>
          </div>
        </transition>
        <!-- MYMEMO: 独自コンポーネントにする -->
        <!-- MYMEMO: スペシャルチケット検索もつけたい -->
        <!-- MYMEMO: used 混ぜこぜで日付順のソートもつけたい -->
        <modal
          v-if="isSearchModalActive"
          :modalMounted="isSearchModalActive"
          :onClose="deactivateSearchModal"
        >
          <div class="field">
            <button type="button" @click="scrollToPageTop">ページトップへ移動</button>
          </div>
          <div class="field">
            <button type="button" @click="scrollToUsedTickets">使用済みチケットのトップへ移動</button>
          </div>
          <div class="field">
            <label class="label">日付で検索</label>
            <p>{{searchErrorMessage}}</p>
            <Datepicker
              v-model="searchGiftDate"
              :inline=true
              calendar-class='searchDatePicker'
              @input="findAndScrollByGiftDate"
            ></Datepicker>
          </div>
        </modal>
      </div>
    </div>
  </div>
</template>

<script>
import HeaderNav from './HeaderNav'
import TicketForm from './TicketForm'
import Tickets from './Tickets'
import Modal from './modals/Modal'
import Datepicker from 'vuejs-datepicker'
import _ from 'lodash'
import utils from '../utils'
import axios from 'axios'

export default {
  components: {
    HeaderNav,
    TicketForm,
    Tickets,
    Modal,
    Datepicker
  },
  name: 'MainPage',
  data: function () {
    return {
      headerHight: 56,
      scrollPosition: 0,
      searchGiftDate: '',
      searchErrorMessage: '',
      isLogoFixed: false,
      isSearchModalActive: false,
      userRelationId: 0,
      apiAccessed: false,
      userRelationInfo: {},
      otherReceivingRelations: [],
      availableTickets: [],
      usedTickets: [],
      allTicketCount: 0,
      availableTicketCount: 0,
      isGivingRelation: false,
      titleMessage: '',
      ticketImage: '',
      backgroundColor: '#FFFFFF',
      relatedUserNickname: '',
      correspondingRelationId: '',
      visibleSpecialOnly: false,
      visibleUsedOnly: false
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
  mounted: function () {
    window.addEventListener('scroll', _.debounce(this.updateScrollPosition, 100))
  },
  methods: {
    getInitialData () {
      axios.get(`/api/user_relations/${this.userRelationId}/`).then(res => {
        this.userRelationInfo = res.data.user_relation_info
        this.otherReceivingRelations = res.data.other_receiving_relations
        this.availableTickets = res.data.available_tickets
        this.usedTickets = res.data.used_tickets
        this.allTicketCount = res.data.all_ticket_count
        this.availableTicketCount = res.data.available_ticket_count
        this.$store.state.allTicketCount = this.allTicketCount
        this.$store.state.availableTicketCount = this.availableTicketCount
        this.apiAccessed = true

        this.isGivingRelation = res.data.user_relation_info.is_giving_relation
        this.titleMessage = this.isGivingRelation ? 'あげる' : 'もらった'
        this.ticketImage = '/static/images/' + res.data.user_relation_info.ticket_image
        this.backgroundColor = res.data.user_relation_info.background_color
        this.relatedUserNickname = res.data.user_relation_info.related_user_nickname
        this.correspondingRelationId = res.data.user_relation_info.corresponding_relation_id
      }).catch(err => {
        if (err.response.status === 403) {
          this.$router.push('/login')
        }
      })
    },
    updateScrollPosition () {
      this.scrollPosition = window.scrollY
      this.isLogoFixed = this.scrollPosition > 320
    },
    // 以下はsearch_modal用の関数
    activateSearchModal () {
      // MYMEMO: refactor this
      utils.addIsHidden('#logo')
      utils.preventScroll()
      this.isSearchModalActive = true
    },
    deactivateSearchModal () {
      utils.removeIsHidden('#logo')
      utils.allowScroll()
      this.isSearchModalActive = false
    },
    scrollToTicket (id) {
      const target = document.getElementById(`ticket${id}`)
      const targetOffsetTop = target.offsetTop
      window.scroll({top: targetOffsetTop - this.headerHight - 30, behavior: 'smooth'})
    },
    scrollToPageTop () {
      window.scroll({top: 0, behavior: 'smooth'})
      this.deactivateSearchModal()
    },
    scrollToUsedTickets () {
      this.scrollToTicket(this.usedTickets[0].id)
      this.deactivateSearchModal()
    },
    formatDate (date) {
      const yyyy = date.getFullYear()
      const mm = ('00' + (date.getMonth() + 1)).slice(-2)
      const dd = ('00' + (date.getDate())).slice(-2)
      return `${yyyy}-${mm}-${dd}`
    },
    searchTicketByGiftDate (target) {
      let targetTicket = this.availableTickets.filter((ticket) => {
        return ticket.gift_date === target
      })
      if (targetTicket[0] === undefined) {
        targetTicket = this.usedTickets.filter((ticket) => {
          return ticket.gift_date === target
        })
      }
      const isTicketFound = targetTicket[0] !== undefined
      return isTicketFound ? targetTicket[0].id : null
    },
    findAndScrollByGiftDate () {
      const date = this.formatDate(new Date(this.searchGiftDate))
      const targetId = this.searchTicketByGiftDate(date)
      if (targetId) {
        this.searchErrorMessage = ''
        this.scrollToTicket(targetId)
        this.deactivateSearchModal()
      } else {
        this.searchErrorMessage = '見つかりませんでした。'
      }
    }
  }
}
</script>

<style>
.logo-block {
    height: 170px;
}
@media screen and (min-width: 769px) {
    .logo-block {
        height: 350px;
    }
}
.logo {
    height: inherit;
}
.logo-fixed {
    position: fixed;
    bottom: 8px;
    right: 8px;
    margin: 0 5px 5px 0;
    height: 50px;
    display: flex;
    z-index: 1000;
    transition: margin 0.5s;
    box-shadow: 2px 2px 7px rgba(18, 47, 61, 0.5),
      -5px -5px 15px rgba(248, 253, 255, 0.9), inset 5px 5px 15px transparent,
      inset -5px -5px 15px transparent;
}
.logo-fixed:hover {
    opacity: 0.95;
    filter: brightness(105%);
}
@media screen and (min-width: 769px) {
    .logo-fixed {
        position: fixed;
        bottom: 0;
        right: 0;
        margin: 0 10px 10px 0;
        height: 100px;
        display: flex;
        z-index: 1000;
        transition: margin 0.5s;
        box-shadow: 5px 5px 14px rgba(18, 47, 61, 0.5),
            -10px -10px 30px rgba(248, 253, 255, 0.9),
            inset 10px 10px 30px transparent, inset -10px -10px 30px transparent;
    }
}

.tickets {
    max-width: 760px;
    margin: 0 auto;
}

.to-used-tickets {
    font-size: 30px;
    background: white;
    border-radius: 999px;
    position: fixed;
    left: 16px;
    bottom: 20px;
    border: 2px solid #ddd;
    width: 40px;
    height: 40px;
    display: flex;
    justify-content: center;
    align-items: center;
    color: #555;
    z-index: 2;
}

.searchDatePicker {
    margin: 0 auto;
    transform: translate(0, 0);
    height: 320px;
}
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
    opacity: 0;
}
</style>
