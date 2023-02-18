<template>
  <div
    :id="'ticket' + ticket.id"
    class="columns box is-relative ticket-wrapper"
    :class="{
      'special-ticket': ticket.is_special,
    }"
    style="margin-bottom: 25px"
  >
    <div class="tag is-info tag-used">
      使用済み
    </div>
    <div class="is-flex">
      <div class="column is-narrow has-text-weight-bold">
        {{ ticket.gift_date }} {{ dayOfWeekGiftDate }}
      </div>
    </div>
    <div class="column" ref="textBlock">
      {{ ticket.description }}
    </div>
    <div class="column is-narrow">
      <div
        class="has-text-weight-bold button is-light u-w-100"
        @click="activateModal"
      >
        内容を見る
      </div>
    </div>
    <UseDescriptionModal
      v-if="isModalActive"
      :ticket="ticket"
      :key="ticket.id"
      :modalMounted="isModalActive"
      :onClose="deactivateModal.bind(this)"
    ></UseDescriptionModal>
  </div>
</template>

<script>
import UseDescriptionModal from './modals/UseDescriptionModal'
import utils from '../utils'

export default {
  name: 'UsedTicket',
  components: {
    UseDescriptionModal
  },
  props: [
    // TicketForm.vueのsubmitFormも同じようにする
    'ticket',
    'index'
  ],
  data: function () {
    return {
      isModalActive: false
    }
  },
  computed: {
    dayOfWeekGiftDate () {
      return utils.getDayOfWeek(this.ticket.gift_date)
    },
    dayOfWeekUseDate () {
      return utils.getDayOfWeek(this.ticket.use_date)
    }
  },
  methods: {
    activateModal () {
      utils.addIsHidden('#logo')
      utils.preventScroll()
      this.isModalActive = true
    },
    deactivateModal () {
      utils.removeIsHidden('#logo')
      utils.allowScroll()
      this.isModalActive = false
    }
  }
}
</script>

<style scoped>
.ticket-wrapper {
    box-sizing: border-box;
    transition: 0.6s;
}
.ticket-wrapper.ticket-wrapper--unread {
    border: solid 3px rgba(72, 199, 116, 0.43);
}

.ticket-wrapper--transparent-border {
    border: solid 3px rgba(72, 199, 116, 0.18);
}

.ticket-wrapper.special-ticket {
    background: linear-gradient(46deg, #b67b03 0%, #daaf08 45%, #fee9a0 80%, #daaf08 90%, #b67b03 100%);
    color: #2a2a2a;
    box-shadow: 5px 5px 5px rgba(0, 0, 0, 0.4);
    border: none;
}
.ticket-wrapper.special-ticket .button.is-light {
    background: rgba(255, 255, 255, 0.5);
}
.ticket-wrapper.special-ticket .button.is-white {
    background: rgba(255, 255, 255, 0.5);
}

.tag-used {
    position: absolute;
    top: -5px;
    right: 9px;
    z-index: 1;
}
.u-w-100 {
    width: 100%;
}
</style>
