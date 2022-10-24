<template>
  <div
    :id="'ticket' + ticket.id"
    class="columns box is-relative ticket-wrapper"
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
      :ticket="ticket"
      :key="ticket.id"
      :modalMounted="isModalActive"
      :onClose="deactivateModal.bind(this)"
    ></UseDescriptionModal>
  </div>
</template>

<script>
import UseDescriptionModal from './modals/UseDescriptionModal'
import utils from '../packs/utils'

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
