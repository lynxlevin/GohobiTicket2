import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const store = new Vuex.Store({
  state: {
    availableTicketCount: 0,
    allTicketCount: 0,
    toUsedTicketsVisible: false
  },
  mutations: {
    addToAvailableTicketCount (state, num) {
      state.availableTicketCount += num
    },
    addToAllTicketCount (state, num) {
      state.allTicketCount += num
    },
    updateTicketCountDisplay (state) {
      document.getElementById('ticket-count').innerText = `手持ち${state.availableTicketCount}枚 / 合計${state.allTicketCount}枚`
    },
    setToUsedTicketsVisible (state, bool) {
      state.toUsedTicketsVisible = bool
    }
  },
  actions: {
    addTicket (context) {
      context.commit('addToAvailableTicketCount', 1)
      context.commit('addToAllTicketCount', 1)
      context.commit('updateTicketCountDisplay')
    },
    deleteTicket (context) {
      context.commit('addToAvailableTicketCount', -1)
      context.commit('addToAllTicketCount', -1)
      context.commit('updateTicketCountDisplay')
    },
    useTicket (context) {
      context.commit('addToAvailableTicketCount', -1)
      context.commit('updateTicketCountDisplay')
    },
    setToUsedTicketsVisible (context, bool) {
      context.commit('setToUsedTicketsVisible', bool)
    }
  }
})

export default store
