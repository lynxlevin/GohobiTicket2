<template>
  <div class="pt-6" id="tickettop">
    <div>
    <!-- MYMEMO: <div style="backgrount-color: {background_color}> -->
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
// import HeaderNav from "./HeaderNav";
// import TicketForm from "./TicketForm";
// import Tickets from "./Tickets";
// import Modal from './modals/Modal';
// import Datepicker from 'vuejs-datepicker';
// import _ from "lodash";
// import utils from "../packs/utils";

export default {
  //   // components: {
  //   //   HeaderNav,
  //   //   TicketForm,
  //   //   Tickets,
  //   //   Modal,
  //   //   Datepicker,
  //   // },
  name: 'MainPage'
//   props: [
//     'available_tickets',
//     'used_tickets',
//     'other_receiving_relations',
//     'is_giving_relation',
//     // この中で使うもの
//     'ticketImage',
//     'availableTicketCount',
//     'allTicketCount',
//     'relatedUserNickname',
//     // 渡すだけのもの
//     'correspondingRelationId',
//     'csrfToken',
//     'userRelationId'
//   ],
//   data: function () {
//     return {
//       scrollPosition: 0,
//       isGivingRelation: false,
//       searchGiftDate: '',
//       searchErrorMessage: '',
//       toUsedTicketsVisible: true,
//       otherReceivingRelations: [],
//       isLogoFixed: false,
//       isSearchModalActive: false
//     }
//   },
//   created: function () {
//     this.isGivingRelation = this.is_giving_relation === 'true'
//     this.titleMessage = this.isGivingRelation ? 'あげる' : 'もらった'
//     this.otherReceivingRelations = JSON.parse(this.other_receiving_relations)
//   },
//   // mounted: function () {
//   //   this.$store.state.availableTicketCount = this.availableTickets.length;
//   //   this.$store.state.allTicketCount =
//   //     this.$store.state.availableTicketCount +
//   //     this.usedTickets.length;
//   //   window.addEventListener("scroll", _.debounce(this.updateScrollPosition, 100));
//   // },
//   computed: {
//     availableTickets () {
//       return JSON.parse(this.available_tickets)
//     },
//     usedTickets () {
//       return JSON.parse(this.used_tickets)
//     }
//   },
//   methods: {
//     updateScrollPosition () {
//       this.scrollPosition = window.scrollY
//       this.isLogoFixed = this.scrollPosition > 320
//     },
//     // 以下はsearch_modal用の関数
//     activateSearchModal () {
//       // TODO: refactor this
//       utils.addIsHidden('#logo')
//       utils.preventScroll()
//       this.isSearchModalActive = true
//     },
//     deactivateSearchModal () {
//       utils.removeIsHidden('#logo')
//       utils.allowScroll()
//       this.isSearchModalActive = false
//     },
//     scrollToTicket (id) {
//       window.location.hash = 'ticket0' // to reset url
//       const target = `ticket${id}`
//       window.location.hash = target
//     },
//     scrollToPageTop () {
//       this.scrollToTicket('top')
//       this.deactivateSearchModal()
//     },
//     scrollToUsedTickets () {
//       this.scrollToTicket(this.usedTickets[0].id)
//       this.deactivateSearchModal()
//     },
//     formatDate (date) {
//       const yyyy = date.getFullYear()
//       const mm = ('00' + (date.getMonth() + 1)).slice(-2)
//       const dd = ('00' + (date.getDate())).slice(-2)
//       return `${yyyy}-${mm}-${dd}`
//     },
//     searchTicketByGiftDate (target) {
//       let targetTicket = this.availableTickets.filter((ticket) => {
//         return ticket.gift_date === target
//       })
//       if (targetTicket[0] === undefined) {
//         targetTicket = this.usedTickets.filter((ticket) => {
//           return ticket.gift_date === target
//         })
//       }
//       const isTicketFound = targetTicket[0] !== undefined
//       return isTicketFound ? targetTicket[0].id : null
//     },
//     findAndScrollByGiftDate () {
//       const date = this.formatDate(new Date(this.searchGiftDate))
//       const targetId = this.searchTicketByGiftDate(date)
//       if (targetId) {
//         this.searchErrorMessage = ''
//         this.scrollToTicket(targetId)
//         this.deactivateSearchModal()
//       } else {
//         this.searchErrorMessage = '見つかりませんでした。'
//       }
//     }
//   }
}
</script>
