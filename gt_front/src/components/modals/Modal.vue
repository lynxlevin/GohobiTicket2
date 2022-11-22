<template>
    <div class="modal is-active">
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
  props: [
    'modalMounted',
    'onClose', // sample: deactivateModal.bind(this, 'modalTrigger')
    'hideBoxDiv'
  ]
}
</script>
