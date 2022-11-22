<template>
    <div
        :id="'ticket' + ticket.id"
        class="columns box is-relative ticket-wrapper"
        :class="{
            'ticket-wrapper--unread': !isGivingRelation && ticket.status !== 'read' && !markedRead,
            'ticket-wrapper--transparent-border': markedRead,
            'has-background-light': ticket.status === 'draft',
            'special-ticket': ticket.is_special,
        }"
        style="margin-bottom: 25px"
    >
        <div class="has-text-danger" v-if="errorMessage !== ''">{{ errorCode }} {{ errorMessage }}</div>
        <div class="tag is-info tag-used" v-if="ticket.use_date !== null">
            使用済み
        </div>
        <div
            class="tag is-success"
            v-if="['unread', 'edited'].includes(ticket.status) && !isGivingRelation"
            :class="{
                'tag--transparent': markedRead,
                'tag-new': ticket.status === 'unread',
                'tag-edited is-light': ticket.status === 'edited',
            }"
        >
            {{ tagName }}
        </div>
        <div
            class="tag-draft"
            v-if="ticket.status === 'draft' && isGivingRelation"
        >
            Draft
        </div>
        <div class="is-flex w-170">
            <div class="column is-narrow has-text-weight-bold">
                {{ ticket.gift_date }} {{ dayOfWeekGiftDate }}
            </div>
            <div class="gifter-dropdown">
                <div
                    class="dropdown"
                    :class="{ 'is-active': dropdownOpen }"
                    v-if="isGivingRelation && ticket.use_date === null"
                >
                    <button
                        class="button"
                        :class="{ 'is-light': ticket.status === 'draft', 'is-white': ticket.status !== 'draft', }"
                        @click="openMenu"
                    >
                        <i class="fas fa-bars"></i>
                    </button>
                    <div
                        class="dropdown-membrane"
                        @click="closeMenu"
                        v-if="dropdownOpen"
                    ></div>
                    <div class="dropdown-menu" role="menu">
                        <div class="dropdown-content" style="width: 80px">
                            <div @click="activateModal('isEditModalActive'); closeMenu()" class="dropdown-item">編集</div>
                            <hr class="dropdown-divider" />
                            <div @click="activateModal('isDeleteModalActive'); closeMenu()" class="dropdown-item">削除</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="column has-text-justified" ref="textBlock">
            <p v-for="(line, index) in descriptionLines" :key='index'>
                {{ line }}
            </p>
        </div>
        <div class="column is-narrow">
            <div
                class="has-text-weight-bold button is-light u-w-100"
                @click="activateModal('isModalActive')"
                v-if="!this.isGivingRelation && this.ticket.use_date === null"
            >
                このチケットを使う
            </div>
            <div
                class="has-text-weight-bold button is-light u-w-100"
                @click="activateModal('isModalActive')"
                v-if="ticket.use_date !== null"
            >
                内容を見る
            </div>
        </div>
        <!-- 編集モーダル -->
        <Modal
            :modalMounted="isEditModalActive"
            :onClose="cancelEdit"
            :hideBoxDiv="true"
        >
            <div class="section block">
                <div class="field">
                    <div class="control">
                        <textarea v-model="description" name="ticket[description]" class="textarea" />
                    </div>
                </div>

                <div class="field" v-if="ticket.status === 'draft'">
                    <label class="label has-text-white">
                        <input type="checkbox" v-model="toBeSpecial" />
                        特別チケットにする
                    </label>
                </div>

                <div class="field" v-if="ticket.status === 'draft'">
                    <div class="control">
                        <button @click="submitDraft();" class="button is-small is-link">
                            {{toBeSpecial ? '特別' : ''}}チケット付与
                        </button>
                        <button @click="updateDraftTicket();" class="button is-small" :disabled="toBeSpecial">
                            下書き保存
                        </button>
                        <button @click="cancelEdit();" class="button is-small">
                            キャンセル
                        </button>
                    </div>
                </div>
                <div class="field" v-if="ticket.status !== 'draft'">
                    <div class="control">
                        <button @click="editTicket();" class="button is-link">
                            修正する
                        </button>
                        <button @click="cancelEdit();" class="button">
                            キャンセル
                        </button>
                    </div>
                </div>
            </div>
        </Modal>
        <!-- 削除モーダル -->
        <Modal
            :modalMounted="isDeleteModalActive"
            :onClose="deactivateModal.bind(this, 'isDeleteModalActive')"
            :hideBoxDiv="true"
        >
            <button
                @click="
                    deleteTicket();
                    deactivateModal('isDeleteModalActive');
                "
                class="delete-btn"
            >
                本当に削除する
            </button>
        </Modal>
        <UseDescriptionModal
            :ticket="ticket"
            :csrfToken="csrfToken"
            :key="ticket.id"
            :modalMounted="isModalActive"
            :onClose="deactivateModal.bind(this, 'isModalActive')"
        />
        <SpecialTicketNoticeModal
            :modalMounted="isSpecialModalActive"
            :onClose="deactivateModal.bind(this, 'isSpecialModalActive')"
            :submitSpecialTicket="submitSpecialTicket"
        />
    </div>
</template>

<script>
import UseDescriptionModal from './modals/UseDescriptionModal'
import SpecialTicketNoticeModal from './modals/SpecialTicketNoticeModal'
import Modal from './modals/Modal'
import axios from 'axios'
import utils from '../utils'

export default {
  components: {
    UseDescriptionModal,
    SpecialTicketNoticeModal,
    Modal
  },
  name: 'Ticket',
  props: [
    // TicketForm.vueのsubmitFormも同じようにする
    'ticket',
    'csrfToken',
    'index',
    'isGivingRelation',
    'scrollPosition'
  ],
  data: function () {
    return {
      isModalActive: false,
      isEditModalActive: false,
      isDeleteModalActive: false,
      isSpecialModalActive: false,
      dropdownOpen: false,
      markedRead: false,
      timer: '',
      errorCode: '',
      errorMessage: '',
      description: '',
      toBeSpecial: false
    }
  },
  mounted () {
    this.description = this.ticket.description
  },
  updated () {
    this.description = this.ticket.description
  },
  computed: {
    dayOfWeekGiftDate () {
      return utils.getDayOfWeek(this.ticket.gift_date)
    },
    descriptionLines () {
      return this.description.split('\n')
    },
    tagName () {
      if (this.ticket.status === 'unread') {
        return 'New!!'
      } else if (this.ticket.status === 'edited') {
        return 'Edited!!'
      } else {
        return ''
      }
    }
  },
  watch: {
    scrollPosition () {
      if (this.isGivingRelation) return
      if (this.ticket.status === 'read') return
      clearTimeout(this.timer)
      if (this.isOnDisplay(this.$refs.textBlock)) {
        this.timer = this.startTimer(3000)
      }
    }
  },
  methods: {
    deleteTicket () {
      const formData = new FormData()
      formData.append('_method', 'delete')
      formData.append('authenticity_token', this.csrfToken)
      axios
        .post(`/tickets/${this.ticket.id}`, formData)
        .then(() => {
          this.$el.style = 'display: none;' // 応急処置
          // 付与⇨削除すると、正規のコンポーネントではないので、以下の３行が動かない。
          this.$store.dispatch('deleteTicket')
          this.$el.parentNode.removeChild(this.$el)
          this.$destroy()
        })
        .catch((error) => {
          console.log(error)
        })
    },
    async updateDraftTicket () {
      const formData = new FormData()
      formData.append('_method', 'put')
      formData.append('authenticity_token', this.csrfToken)
      formData.append('ticket[description]', this.description)
      await axios
        .post(`/tickets/draft/${this.ticket.id}`, formData)
        .then(() => {
          this.$set(this.ticket, 'description', this.description)
        })
        .catch((error) => {
          this.errorCode = error.response.data.status
          this.errorMessage = error.response.data.error
        })
      this.deactivateModal('isEditModalActive')
    },
    submitDraft () {
      this.toBeSpecial ? this.activateModal('isSpecialModalActive') : this.postTicket()
    },
    async postTicket () {
      const formData = new FormData()
      formData.append('_method', 'put')
      formData.append('authenticity_token', this.csrfToken)
      formData.append('ticket[description]', this.description)
      await axios
        .post(`/tickets/draft/${this.ticket.id}/post`, formData)
        .then(() => {
          this.$set(this.ticket, 'description', this.description)
          this.$set(this.ticket, 'status', 'unread')
        })
        .catch((error) => {
          this.errorCode = error.response.data.status
          this.errorMessage = error.response.data.error
        })
      this.deactivateModal('isEditModalActive')
    },
    async submitSpecialTicket () {
      const formData2 = new FormData()
      formData2.append('_method', 'put')
      formData2.append('authenticity_token', this.csrfToken)
      await axios.post(`/tickets/${this.ticket.id}/mark_special`, formData2)
        .then(async _response => {
          const formData = new FormData()
          formData.append('_method', 'put')
          formData.append('authenticity_token', this.csrfToken)
          formData.append('ticket[description]', this.description)
          await axios.post(`/tickets/draft/${this.ticket.id}/post`, formData)
            .then(() => {
              this.$set(this.ticket, 'description', this.description)
              this.$set(this.ticket, 'status', 'unread')
              this.$set(this.ticket, 'is_special', true)
            }).catch(error => {
              this.errorCode = error.response.data.status
              this.errorMessage = error.response.data.error
            })
        })
        .catch((error) => {
          this.updateDraftTicket()
          this.errorCode = error.response.data.status
          this.errorMessage = error.response.data.error
        })
        .finally(() => {
          this.deactivateModal('isSpecialModalActive')
          this.deactivateModal('isEditModalActive')
        })
    },
    async editTicket () {
      const formData = new FormData()
      formData.append('_method', 'put')
      formData.append('authenticity_token', this.csrfToken)
      formData.append('ticket[description]', this.description)
      formData.append(
        'ticket[status]',
        this.ticket.status === 'unread' ? 'unread' : 'edited'
      )
      await axios
        .post(`/tickets/${this.ticket.id}`, formData)
        .then(() => {
          this.$set(this.ticket, 'description', this.description)
        })
        .catch((error) => {
          this.errorCode = error.response.data.status
          this.errorMessage = error.response.data.error
        })
      this.deactivateModal('isEditModalActive')
    },
    cancelEdit () {
      this.description = this.ticket.description
      this.deactivateModal('isEditModalActive')
    },
    readTicket () {
      const formData = new FormData()
      formData.append('_method', 'put')
      formData.append('authenticity_token', this.csrfToken)
      formData.append('ticket[status]', 'read')
      axios
        .post(`/tickets/${this.ticket.id}`, formData)
        .then((response) => {
          if (response.data.ticket.status === 'read') {
            this.markedRead = true
          }
        })
        .catch((error) => {
          console.log(error)
        })
    },
    activateModal (modal) {
      utils.addIsHidden('#logo')
      utils.preventScroll()
      this[modal] = true
    },
    deactivateModal (modal) {
      // FIXME: 二重モーダルの片方を閉じたときにこれが動いてしまう
      utils.removeIsHidden('#logo')
      // FIXME: 二重モーダルの片方を閉じたときにこれが動いてしまう
      utils.allowScroll()
      this[modal] = false
    },
    openMenu () {
      this.dropdownOpen = true
    },
    closeMenu () {
      this.dropdownOpen = false
    },
    isOnDisplay (el) {
      const bottom = el.getBoundingClientRect().bottom
      const header = document.getElementsByClassName('navbar')[0]
      const topDisplayThreshold = header.getBoundingClientRect().bottom + 150
      const bottomDisplayThreshold = window.innerHeight - 110
      const isBottomOnDisplay = bottom > topDisplayThreshold && bottom < bottomDisplayThreshold
      return isBottomOnDisplay
    },
    startTimer (ms) {
      return setTimeout(() => {
        this.readTicket()
      }, ms)
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
    /* MYMEMO: implement this */
    /* &.ticket-wrapper--unread {
        border: none;
    } */
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

.tag--transparent {
    opacity: 0.45;
    transition: 0.5s;
}

.tag-new {
    position: absolute;
    top: -5px;
    right: 9px;
}

.tag-edited {
    position: absolute;
    top: -5px;
    right: 9px;
}

.tag-draft {
    position: absolute;
    top: 5px;
    right: 10px;
    font-size: 0.75rem;
    z-index: 1;
}

.gifter-dropdown {
    position: absolute;
    top: 24px;
    right: 20px;
}

@media screen and (min-width: 769px) {
    .gifter-dropdown {
        top: 8px;
        right: 9px;
    }
}

.dropdown-membrane {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
}

.delete-btn {
    font-size: 24px;
    padding: 10px 30px;
    border-radius: 100px;
    background: white;
    border: 1px solid gray;
}

.w-170 {
    width: 170px;
}
.u-w-100 {
    width: 100%;
}
</style>
