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
        <div class="tickets">
          <ticket-form
            :csrfToken="csrfToken"
            :userRelationId = "userRelationId"
            v-if="isGivingRelation"
          />
          <tickets
            :availableTickets="availableTickets"
            :usedTickets="usedTickets"
            :csrfToken="csrfToken"
            :isGivingRelation="isGivingRelation"
            :scrollPosition="scrollPosition"
          />
        </div>
        <transition name="fade">
          <div
            class="to-used-tickets"
            v-if="$store.state.toUsedTicketsVisible"
            @click="scrollToUsedTickets"
          >
            <span class="icon">
              <i class="fas fa-angle-double-down"></i>
            </span>
          </div>
        </transition>
        <!-- TODO: 独自コンポーネントにする -->
        <modal
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
      scrollPosition: 0,
      searchGiftDate: '',
      searchErrorMessage: '',
      toUsedTicketsVisible: true,
      isLogoFixed: false,
      isSearchModalActive: false,
      userRelationId: 1, // MYMEMO: get from url
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
      csrfToken: 'dummy' // MYMEMO: dummy csrfToken
    }
  },
  created: function () {
    // MYMEMO: ポート番号の問題を解決
    // MYMEMO: アドレスは仮
    axios.get(`http://127.0.0.1:8000/user_relations/${this.userRelationId}/`).then((res) => {
      this.userRelationInfo = res.data.user_relation_info
      this.otherReceivingRelations = res.data.other_receiving_relations
      this.availableTickets = res.data.available_tickets
      this.usedTickets = res.data.used_tickets
      this.allTicketCount = res.data.all_ticket_count
      this.availableTicketCount = res.data.available_ticket_count
      this.apiAccessed = true

      this.isGivingRelation = res.data.user_relation_info.is_giving_relation
      this.titleMessage = this.isGivingRelation ? 'あげる' : 'もらった'
      this.ticketImage = res.data.user_relation_info.ticket_image
      this.backgroundColor = res.data.user_relation_info.background_color
      this.relatedUserNickname = res.data.user_relation_info.related_user_nickname
      this.correspondingRelationId = res.data.user_relation_info.corresponding_relation_id
    })
  },
  mounted: function () {
    this.$store.state.availableTicketCount = this.availableTicketCount
    this.$store.state.allTicketCount = this.allTicketCount
    window.addEventListener('scroll', _.debounce(this.updateScrollPosition, 100))
  },
  methods: {
    updateScrollPosition () {
      this.scrollPosition = window.scrollY
      this.isLogoFixed = this.scrollPosition > 320
    },
    // 以下はsearch_modal用の関数
    activateSearchModal () {
      // TODO: refactor this
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
      window.location.hash = 'ticket0' // to reset url
      const target = `ticket${id}`
      window.location.hash = target
    },
    scrollToPageTop () {
      this.scrollToTicket('top')
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
