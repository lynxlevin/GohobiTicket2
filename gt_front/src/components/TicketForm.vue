<template>
  <div class="section block">
    <form action="/tickets" accept-charset="UTF-8" method="post">
      <input type="hidden" name="authenticity_token" />
      <div class="field">
        <label class="label">Acquisition date</label>
        <div class="control is-flex is-justify-content-center">
          <Datepicker
            v-model="gift_date"
            :format="datePickerFormat"
            calendar-class='formDatePicker'
            input-class="formDatePickerInput"
            name="ticket[gift_date]"
          ></Datepicker>
        </div>
      </div>

      <div class="field">
        <label class="label">Description</label>
        <div class="control">
          <textarea
            v-model="description"
            name="ticket[description]"
            class="textarea"
          ></textarea>
        </div>
      </div>

      <div class="field">
        <label class="label">
          <input type="checkbox" v-model="toBeSpecial" />
          特別チケットにする
        </label>
      </div>

      <div class="box has-text-danger" v-if="errorMessage !== ''">{{ errorCode }}<br>{{ errorMessage }}</div>

      <div class="is-relative">
        <div class="field">
          <div class="control">
            <button
              v-on:click.stop.prevent="submit"
              type="submit"
              class="button is-link"
            >
              {{toBeSpecial ? '特別' : ''}}チケット付与
            </button>
          </div>
        </div>

        <div class="absolute-right">
          <button
            @click="saveDraft"
            type="button"
            class="button is-small"
            :disabled="toBeSpecial"
          >
            下書き保存
          </button>
        </div>
      </div>

    </form>
    <!-- 特別チケット使用時モーダル -->
        <SpecialTicketNoticeModal
            :modalMounted="isModalActive"
            :onClose="deactivateModal.bind(this)"
            :submitSpecialTicket="submitSpecialTicket"
        />
  </div>
</template>

<script>
import Vue from 'vue'
import axios from 'axios'
import Datepicker from 'vuejs-datepicker'
import Ticket from './Ticket'
import SpecialTicketNoticeModal from './modals/SpecialTicketNoticeModal'
import utils from '../packs/utils'

export default {
  props: ['csrfToken', 'userRelationId'],
  components: {
    Datepicker,
    SpecialTicketNoticeModal
  },
  data: function () {
    return {
      datePickerFormat: 'yyyy-MM-dd D',
      gift_date: '',
      description: '',
      errorCode: '',
      errorMessage: '',
      toBeSpecial: false,
      isModalActive: false
    }
  },
  mounted: function () {
    this.gift_date = Date()
  },
  methods: {
    submit () {
      this.toBeSpecial ? this.activateModal() : this.submitForm()
    },
    submitForm () {
      const formData = this.prepareFormData()
      this.postData('/tickets', formData)
    },
    submitSpecialTicket () {
      // FIXME: 特別チケット枠がない場合に普通のチケットができてしまう
      const formData = this.prepareFormData()
      axios.post('/tickets', formData).then(response => {
        const data = response.data
        const formData2 = new FormData()
        formData2.append('_method', 'put')
        formData2.append('authenticity_token', this.csrfToken)
        axios.post(`/tickets/${data.ticket.id}/mark_special`, formData2).then(response => {
          data.ticket.is_special = true
          this.addTicketComponent(data)
          this.gift_date = Date()
          this.description = ''
          this.toBeSpecial = false
          this.$store.dispatch('addTicket')
          this.errorCode = ''
          this.errorMessage = ''
        }).catch(error => {
          this.errorCode = error.response.data.status
          this.errorMessage = error.response.data.error
        })
      }).catch(error => {
        this.errorCode = error.response.data.status
        this.errorMessage = error.response.data.error
      }).finally(() => {
        this.deactivateModal()
      })
    },
    saveDraft () {
      const formData = this.prepareFormData()
      this.postData('/tickets/draft', formData)
    },
    prepareFormData () {
      const formData = new FormData()
      formData.append('ticket[gift_date]', this.gift_date)
      formData.append('ticket[description]', this.description)
      formData.append('ticket[user_relation_id]', this.userRelationId)
      formData.append('authenticity_token', this.csrfToken)
      return formData
    },
    postData (url, formData) {
      axios
        .post(url, formData)
        .then((response) => {
          this.addTicketComponent(response.data)
          this.gift_date = Date()
          this.description = ''
          this.$store.dispatch('addTicket')
          this.errorCode = ''
          this.errorMessage = ''
        })
        .catch((error) => {
          this.errorCode = error.response.data.status
          this.errorMessage = error.response.data.error
        })
    },
    addTicketComponent (data) {
      const ComponentClass = Vue.extend(Ticket)
      const instance = new ComponentClass({
        propsData: {
          ticket: data.ticket,
          csrfToken: data.csrfToken,
          index: data.ticket.id,
          isGivingRelation: true
        }
      })
      const div = document.getElementById('tickets')
      instance.$mount()
      div.prepend(instance.$el)
    },
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
