<!-- src/components/common/GlobalModal.vue -->
<script setup lang="ts">
import BaseModal from '@/components/common/BaseModal.vue'
import { useModalStore } from '@/stores/modal.store'

const modal = useModalStore()

const handleClose = () => {
  modal.close()
}

const handleConfirm = () => {
  modal.accept()
}
</script>

<template>
  <BaseModal
    :open="modal.open"
    :title="modal.title"
    :message="modal.message"
    :type="modal.type"
    :variant="modal.variant"
    @close="handleClose"
    @confirm="handleConfirm"
  />
</template>
