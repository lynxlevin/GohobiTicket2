<template>
    <div
        :id="'diary' + diary.id"
        class="columns box is-relative diary-wrapper"
        style="margin-bottom: 25px"
    >
        <div style="width: 100%">
          <div class="is-flex w-170">
              <div class="column is-narrow has-text-weight-bold">
                  {{ diary.date }} {{ dayOfWeekDate }}
              </div>
              <button @click="openEdit" class="button is-white edit-button">
                <i class="fa-solid fa-pen-to-square" />
              </button>
          </div>
          <div class="column has-text-justified" ref="textBlock">
              <p v-for="(line, index) in entryLines" :key='index'>
                  {{ line }}
              </p>
          </div>
        </div>
        <!-- 編集モーダル -->
        <Modal
            v-if="isEditModalActive"
            :modalMounted="isEditModalActive"
            :onClose="cancelEdit"
            :hideBoxDiv="true"
            :placeTop="true"
        >
          <div class="section block">
            <div class="field">
              <label class="label has-text-white">日付</label>
              <div class="control is-flex is-justify-content-center">
                <Datepicker
                  v-model="editedDate"
                  :format="datePickerFormat"
                  calendar-class='formDatePicker'
                  input-class="formDatePickerInput"
                ></Datepicker>
              </div>
            </div>

            <div class="field">
                <div class="control">
                    <textarea v-model="editedEntry" class="textarea" rows="10" />
                </div>
            </div>

            <div class="field">
                <div class="control">
                    <button @click="editDiary();" class="button is-link">
                        修正する
                    </button>
                    <button @click="cancelEdit();" class="button">
                        キャンセル
                    </button>
                </div>
            </div>
          </div>
        </Modal>
    </div>
</template>

<script>
import Modal from './modals/Modal'
import Datepicker from 'vuejs-datepicker'
import utils from '../utils'
import axios from 'axios'

export default {
  components: {
    Modal,
    Datepicker
  },
  name: 'Diary',
  props: [
    'diary',
    'index',
    'refreshDiaryList'
  ],
  data: function () {
    return {
      datePickerFormat: 'yyyy-MM-dd D',
      isEditModalActive: false,
      editedEntry: '',
      editedDate: ''
    }
  },
  computed: {
    dayOfWeekDate () {
      return utils.getDayOfWeek(this.diary.date)
    },
    entryLines () {
      return this.diary.entry.split('\n')
    }
  },
  methods: {
    openEdit () {
      this.editedEntry = this.diary.entry
      this.editedDate = new Date(this.diary.date)
      this.isEditModalActive = true
    },
    async editDiary () {
      const paddedMonth = (this.editedDate.getMonth() + 1).toString().padStart(2, '0')
      const paddedDate = this.editedDate.getDate().toString().padStart(2, '0')
      const formattedDate = `${this.editedDate.getFullYear()}-${paddedMonth}-${paddedDate}`
      const data = {entry: this.editedEntry, date: formattedDate}
      axios
        .put(`/api/diaries/${this.diary.id}/`, data, utils.getCsrfHeader())
        .then(() => {
          this.refreshDiaryList()
        })
        .finally(() => {
          utils.allowScroll()
          this.isEditModalActive = false
        })
    },
    cancelEdit () {
      utils.allowScroll()
      this.isEditModalActive = false
    }
  }
}
</script>

<style scoped>
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

.edit-button {
  position: absolute;
  top: 24px;
  right: 20px;
}

.diary-wrapper {
    box-sizing: border-box;
    transition: 0.6s;
}

.w-170 {
    width: 170px;
}
</style>
