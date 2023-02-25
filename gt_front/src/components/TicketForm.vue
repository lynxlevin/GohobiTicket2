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
            @input="checkSpecialTicketAvailability"
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
        <label class="label" :class="{'disabled': !isSpecialTicketAvailable}">
          <input type="checkbox" v-model="toBeSpecial" :disabled="!isSpecialTicketAvailable" />
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
            v-if="isModalActive"
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
import utils from '../utils'

export default {
  props: ['userRelationId'],
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
      isModalActive: false,
      isSpecialTicketAvailable: true
    }
  },
  mounted: function () {
    this.gift_date = new Date()
    this.checkSpecialTicketAvailability()
  },
  methods: {
    submit () {
      this.toBeSpecial ? this.activateModal() : this.createTicket()
    },
    createTicket () {
      this.postData('/api/tickets/', this.prepareData())
    },
    saveDraft () {
      const isDraft = true
      this.postData('/api/tickets/', this.prepareData(isDraft))
    },
    checkSpecialTicketAvailability () {
      const year = this.gift_date.getFullYear()
      const month = this.gift_date.getMonth() + 1
      const url = `/api/user_relations/${this.userRelationId}/special_ticket_availability/?year=${year}&month=${month}`
      axios
        .get(url)
        .then((response) => {
          this.isSpecialTicketAvailable = response.data
        })
        .catch((error) => {
          this.errorCode = error.response.status
          this.errorMessage = error.response.data
        })
    },
    submitSpecialTicket () {
      axios.post('/api/tickets/', this.prepareData(), utils.getCsrfHeader())
        .then(response => {
          const data = response.data
          axios.put(`/api/tickets/${data.ticket.id}/mark_special/`, {}, utils.getCsrfHeader())
            .then(_ => {
              data.ticket.is_special = true
              this.addTicketComponent(data)
              this.$store.dispatch('addTicket')
              this.resetForm()
            })
            .catch(error => {
              this.errorCode = error.response.status
              this.errorMessage = error.response.data
            })
        })
        .catch(error => {
          this.errorCode = error.response.status
          this.errorMessage = error.response.data
        })
        .finally(() => {
          this.deactivateModal()
        })
    },
    prepareData (isDraft = false) {
      const data = {
        ticket: {
          gift_date: this.gift_date.toISOString().slice(0, 10),
          description: this.description,
          user_relation_id: this.userRelationId
        }
      }
      if (isDraft) {
        data.ticket.status = 'draft'
      }
      return data
    },
    postData (url, data) {
      axios
        .post(url, data, utils.getCsrfHeader())
        .then((response) => {
          this.addTicketComponent(response.data)
          this.$store.dispatch('addTicket') // MYMEMO: draft の時は発火したくない
          this.resetForm()
        })
        .catch((error) => {
          this.errorCode = error.response.status
          this.errorMessage = error.response.data
        })
    },
    resetForm () {
      this.gift_date = new Date()
      this.description = ''
      this.errorCode = ''
      this.errorMessage = ''
      this.toBeSpecial = false
    },
    addTicketComponent (data) {
      const ComponentClass = Vue.extend(Ticket)
      const instance = new ComponentClass({
        propsData: {
          ticket: data.ticket,
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

<style>
.absolute-right {
  position: absolute;
  top: 0;
  right: 0;
}
.formDatePicker {
  top: 100%;
  left: 50%;
  transform: translate(-50%, 0%);
}
.formDatePickerInput {
  border-radius: 4px;
  color: #363636;
  border: 1px solid #dbdbdb;
  font-size: 1rem;
  height: 2.5em;
  line-height: 1.5;
  padding-bottom: calc(0.5em - 1px);
  padding-left: calc(0.75em - 1px);
  padding-right: calc(0.75em - 1px);
  padding-top: calc(0.5em - 1px);
  vertical-align: top;
  box-shadow: inset 0 0.0625em 0.125em rgba(10, 10, 10, 0.05);
}
.disabled {
  color: #dbdbdb;
}
</style>
