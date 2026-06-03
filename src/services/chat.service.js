import api from './api'

// Maps snake_case DB fields to camelCase for the frontend
const mapConversation = (c) => ({
  ...c,
  customerName: c.customer_name ?? c.customerName ?? 'Customer',
  customerId:   c.customer_id   ?? c.customerId,
  lastMessage:  c.last_message  ?? c.lastMessage ?? '',
  lastAt:       c.last_at       ?? c.lastAt,
  unreadCount:  c.unread_count  ?? c.unreadCount ?? 0,
})

const chatService = {

  async getConversations(search = '') {
    const res = await api.get('/chat/conversations', { params: { search } })
    const data = res.data
    return {
      ...data,
      conversations: (data.conversations ?? []).map(mapConversation),
    }
  },

  async getMyConversation() {
    const res = await api.get('/chat/conversations')
    const data = res.data
    return {
      ...data,
      conversation: data.conversation ? mapConversation(data.conversation) : null,
    }
  },

  async getHistory(conversationId) {
    const res = await api.get(`/chat/conversations/${conversationId}/messages`)
    return res.data
  },

  async sendMessage(conversationId, text) {
    const form = new FormData()
    form.append('text', text)
    if (conversationId) form.append('conversationId', conversationId)
    const res = await api.post('/chat/send', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return res.data
  },

  async sendImage(conversationId, file, text = '') {
    const form = new FormData()
    form.append('image', file)
    if (text) form.append('text', text)
    if (conversationId) form.append('conversationId', conversationId)
    const res = await api.post('/chat/send', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return res.data
  },

  async markRead(conversationId) {
    const res = await api.patch(`/chat/conversations/${conversationId}/read`)
    return res.data
  },

  async getUnreadCount() {
    const res = await api.get('/chat/unread')
    return res.data
  },
}

export default chatService