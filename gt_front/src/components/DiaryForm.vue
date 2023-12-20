<template>
  <div class="section block pt-4 pb-4">
    <form>
      <div class="field">
        <label class="label">日付</label>
        <div class="control is-flex is-justify-content-center">
          <Datepicker
            v-model="date"
            :format="datePickerFormat"
            calendar-class='formDatePicker'
            input-class="formDatePickerInput"
          ></Datepicker>
        </div>
      </div>

      <div class="field">
        <label class="label">内容</label>
        <div class="control">
          <textarea
            v-model="entry"
            class="textarea"
          ></textarea>
        </div>
      </div>

      <div class="box has-text-danger" v-if="errorMessage !== ''">{{ errorCode }}<br>{{ errorMessage }}</div>

      <div class="is-relative">
        <div class="field">
          <div class="control">
            <button
              v-on:click.stop.prevent="submit"
              class="button is-link"
            >
              保存
            </button>
          </div>
        </div>
      </div>

    </form>
  </div>
</template>

<script>
import axios from 'axios'
import Datepicker from 'vuejs-datepicker'
import utils from '../utils'

export default {
  props: ['userRelationId', 'refreshDiaryList'],
  components: {
    Datepicker
  },
  data: function () {
    return {
      datePickerFormat: 'yyyy-MM-dd D',
      date: '',
      entry: '',
      errorCode: '',
      errorMessage: ''
    }
  },
  mounted: function () {
    this.date = new Date()
  },
  methods: {
    submit () {
      const paddedMonth = (this.date.getMonth() + 1).toString().padStart(2, '0')
      const paddedDate = this.date.getDate().toString().padStart(2, '0')
      const formattedDate = `${this.date.getFullYear()}-${paddedMonth}-${paddedDate}`
      const data = {
        date: formattedDate,
        entry: this.entry,
        user_relation_id: this.userRelationId
      }
      axios
        .post('/api/diaries/', data, utils.getCsrfHeader())
        .then((_) => {
          this.resetForm()
          this.refreshDiaryList()
        })
        .catch((error) => {
          this.errorCode = error.response.status
          this.errorMessage = error.response.data
        })
    },
    resetForm () {
      this.date = new Date()
      this.entry = ''
      this.errorCode = ''
      this.errorMessage = ''
    }
  }
}
</script>

<style>
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
</style>
