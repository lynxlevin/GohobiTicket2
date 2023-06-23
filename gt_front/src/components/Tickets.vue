<template>
    <div class="section block pt-4">
        <div id="tickets">
          <div  v-if="!visibleUsedOnly">
            <template
                v-for="(available_ticket, index) in availableTickets"
            >
                <!-- MYMEMO: isGivingRelation に応じて GivingTicket ReceivedTicket に分割したら動作速くなりそう -->
                <Ticket
                    :ticket="available_ticket"
                    :isGivingRelation="isGivingRelation"
                    :scrollPosition="scrollPosition"
                    v-if="!visibleSpecialOnly || available_ticket.is_special"
                    :index="index + 1"
                    :key="available_ticket.id"
                ></Ticket>
            </template>
          </div>
          <div ref="usedTickets">
            <template v-for="(used_ticket, index) in usedTickets">
                <UsedTicket
                    :ticket="used_ticket"
                    v-if="!visibleSpecialOnly || used_ticket.is_special"
                    :index="index + 1"
                    :key="used_ticket.id"
                ></UsedTicket>
            </template>
          </div>
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
    'visibleSpecialOnly',
    'visibleUsedOnly'
  ],
  watch: {
    scrollPosition () {
      const isUsedTicketsOnScreen = this.scrollPosition < this.$refs.usedTickets.offsetTop - window.innerHeight / 2
      this.$store.dispatch('setisUsedTicketsOnScreen', isUsedTicketsOnScreen)
    }
  }
}
</script>
