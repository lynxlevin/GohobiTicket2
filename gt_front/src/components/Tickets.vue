<template>
    <div class="section block">
        <div id="tickets">
            <template
                v-for="(available_ticket, index) in availableTickets"
            >
                <!-- MYMEMO: isGivingRelation に応じて GivingTicket ReceivedTicket に分割したら動作速くなりそう -->
                <Ticket
                    :ticket="available_ticket"
                    :isGivingRelation="isGivingRelation"
                    :scrollPosition="scrollPosition"
                    :isShowingOnlySpecialTickets="isShowingOnlySpecialTickets"
                    v-if="!isShowingOnlySpecialTickets || available_ticket.is_special"
                    :index="index + 1"
                    :key="available_ticket.id"
                ></Ticket>
            </template>
            <div ref="usedTickets"></div>
            <template v-for="(used_ticket, index) in usedTickets">
                <UsedTicket
                    :ticket="used_ticket"
                    v-if="!isShowingOnlySpecialTickets || used_ticket.is_special"
                    :index="index + 1"
                    :key="used_ticket.id"
                ></UsedTicket>
            </template>
        </div>
    </div>
</template>

<script>
import Ticket from './Ticket'
import UsedTicket from './UsedTicket'

export default {
  components: {
    Ticket,
    UsedTicket
  },
  name: 'Tickets',
  props: [
    'availableTickets',
    'usedTickets',
    'isGivingRelation',
    'scrollPosition',
    'isShowingOnlySpecialTickets'
  ],
  watch: {
    scrollPosition () {
      const toUsedTicketsVisible = this.scrollPosition < this.$refs.usedTickets.offsetTop - window.innerHeight / 2
      this.$store.dispatch('setToUsedTicketsVisible', toUsedTicketsVisible)
    }
  }
}
</script>
