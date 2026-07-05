import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface NotificationMessage {
  text: string
  color?: string
}

export const useNotificationStore = defineStore('notification', () => {
  const messages = ref<NotificationMessage[]>([])

  function notify(text: string, color = 'success') {
    messages.value.push({ text, color })
  }

  return { messages, notify }
})
