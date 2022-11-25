<template>
  <Modal
    :modalMounted="modalMounted"
    :onClose="onClose"
  >
    <div>
      <div class="has-text-weight-bold">
        {{ ticket.gift_date }} {{ dayOfWeekGiftDate }}
      </div>
      <div class="field">
        {{ ticket.description }}
      </div>
      <form
        :action="'/tickets/' + ticket.id + '/use'"
        accept-charset="UTF-8"
        method="post"
        v-if="!used"
      >
        <input type="hidden" name="authenticity_token" />
        <div class="field">
          <label class="label">このチケットを使って、なにをしてほしい？</label>
          <div class="control">
            <textarea
              v-model="use_description"
              name="ticket[use_description]"
              class="textarea"
            ></textarea>
          </div>
        </div>

        <div class="field has-text-centered">
          <div class="control">
            <button
              v-on:click.stop.prevent="submitForm"
              type="submit"
              class="button is-primary"
            >
              チケットを使う
            </button>
          </div>
        </div>
      </form>
      <div
        class="notification"
        v-if="used"
      >
        <div class="field">
          {{ ticket.use_date }} {{ dayOfWeekGiftDate }}
        </div>
        <div class="field">
          {{ ticket.use_description }}
        </div>
      </div>
    </div>
  </Modal>
</template>

<script>
import Modal from './Modal'
import axios from 'axios'
import utils from '../../utils'

export default {
  name: 'UseDescriptionModal',
  components: { Modal },
  props: ['modalMounted', 'onClose', 'ticket', 'csrfToken'],
  data: function () {
    return {
      used: false,
      use_description: ''
    }
  },
  computed: {
    dayOfWeekGiftDate () {
      return utils.getDayOfWeek(this.ticket.gift_date)
    }
  },
  mounted () {
    this.used = this.ticket.use_date !== null
    this.use_description = this.ticket.use_description
  },
  methods: {
    submitForm () {
      const formData = new FormData()
      formData.append('ticket[use_description]', this.use_description)
      formData.append('authenticity_token', this.csrfToken)
      axios
        .post(`/api/tickets/${this.ticket.id}/use/`, formData)
        .then(() => {
          this.$store.dispatch('useTicket')
          this.$set(this.ticket, 'use_date', Date())
          this.$set(this.ticket, 'use_description', this.use_description)
          this.used = true
          utils.removeIsHidden('#logo')
        })
        .catch((error) => {
          console.log(error)
        })
    }
  }
}
</script>
