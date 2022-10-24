<template>
  <Modal
    :modalMounted="modalMounted"
    :onClose="onClose"
  >
        <div class="field">
            <p>特別チケットは月に1回しか付与できません。</p>
            <p>付与しますか？</p>
        </div>
        <button class="button is-link" @click="submitSpecialTicket">付与する</button>
        <button class="button" @click="onClose">キャンセル</button>
  </Modal>
</template>

<script>
import Modal from './Modal'

export default {
  name: 'SpecialTicketNoticeModal',
  components: { Modal },
  props: ['modalMounted', 'onClose', 'submitSpecialTicket']
}
</script>
