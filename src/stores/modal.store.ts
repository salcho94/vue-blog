// src/stores/modal.store.ts
import { defineStore } from 'pinia'

export type ModalType = 'error' | 'info' | 'success'
export type ModalVariant = 'alert' | 'confirm'

interface ModalState {
  open: boolean
  title: string
  message: string
  type: ModalType
  variant: ModalVariant
  onConfirm: (() => void) | null
}

export const useModalStore = defineStore('modal', {
  state: (): ModalState => ({
    open: false,
    title: '',
    message: '',
    type: 'info',
    variant: 'alert',
    onConfirm: null,
  }),

  actions: {
    alert(payload: { title?: string; message: string; type?: ModalType }) {
      this.open = true
      this.title = payload.title ?? '알림'
      this.message = payload.message
      this.type = payload.type ?? 'info'
      this.variant = 'alert'
      this.onConfirm = null
    },

    confirm(payload: {
      title?: string
      message: string
      type?: ModalType
      onConfirm?: () => void
    }) {
      this.open = true
      this.title = payload.title ?? '확인'
      this.message = payload.message
      this.type = payload.type ?? 'error'
      this.variant = 'confirm'
      this.onConfirm = payload.onConfirm ?? null
    },

    close() {
      this.open = false
      this.title = ''
      this.message = ''
      this.onConfirm = null
    },

    accept() {
      const cb = this.onConfirm
      this.close()
      cb && cb()
    },
  },
})
