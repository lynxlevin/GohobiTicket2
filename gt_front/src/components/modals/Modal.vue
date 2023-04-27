<template>
    <div class="modal is-active" :class="{'place-top': placeTop}">
        <div class="modal-background" @click="onClose" />
        <div class="modal-content">
            <div :class="{'box': !hideBoxDiv}">
                <slot />
            </div>
            <button
                class="modal-close is-large"
                aria-label="close"
                @click="onClose"
            ></button>
        </div>
    </div>
</template>

<script>

export default {
  name: 'Modal',
  props: {
    modalMounted: Boolean,
    onClose: Function, // sample: deactivateModal.bind(this, 'modalTrigger')
    hideBoxDiv: {type: Boolean, default: false},
    placeTop: {type: Boolean, default: false}
  }
}
</script>

<style scoped>
.modal.is-active.place-top {
    justify-content: initial;
}
</style>
