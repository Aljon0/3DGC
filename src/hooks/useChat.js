import { useCallback, useEffect, useRef, useState, startTransition } from 'react';
import toast from 'react-hot-toast';
import chatService from '@/services/chat.service';

export function useChat({ role = 'customer', pollInterval = 5000 } = {}) {
  const [conversations,        setConversations]        = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [messages,             setMessages]             = useState([]);
  const [search,               setSearch]               = useState('');
  const [isLoadingConvs,       setIsLoadingConvs]       = useState(false);
  const [isLoadingMsgs,        setIsLoadingMsgs]        = useState(false);
  const [isSending,            setIsSending]            = useState(false);
  const [unreadCount,          setUnreadCount]          = useState(0);

  const activeConvRef    = useRef(activeConversationId);
  const searchTimerRef   = useRef(null);
  const isFirstSearchRef = useRef(true);

  useEffect(() => {
    activeConvRef.current = activeConversationId;
  }, [activeConversationId]);

  // ──────────────────────────────────────────────────────────
  // 1. Load conversations (Admin)
  // ──────────────────────────────────────────────────────────
  const fetchConversations = useCallback(async (searchTerm = '') => {
    if (role !== 'admin') return;
    setIsLoadingConvs(true);
    try {
      const { conversations } = await chatService.getConversations(searchTerm);
      startTransition(() => {
        setConversations(conversations);
      });
    } catch (err) {
      toast.error(err?.message ?? 'Could not load conversations.');
    } finally {
      setIsLoadingConvs(false);
    }
  }, [role]);

  // ──────────────────────────────────────────────────────────
  // 2. Load customer's own conversation
  // ──────────────────────────────────────────────────────────
  const fetchMyConversation = useCallback(async () => {
    if (role !== 'customer') return null;
    try {
      const { conversation } = await chatService.getMyConversation();
      if (conversation?.id) {
        setActiveConversationId(conversation.id);
        return conversation;
      }
      return null;
    } catch (err) {
      toast.error(err?.message ?? 'Could not load your conversation.');
      return null;
    }
  }, [role]);

  // ──────────────────────────────────────────────────────────
  // 3. Load messages + mark as read
  // ──────────────────────────────────────────────────────────
  const fetchMessages = useCallback(async (conversationId) => {
    if (!conversationId) return;
    setIsLoadingMsgs(true);
    try {
      const { messages } = await chatService.getHistory(conversationId);
      setMessages(messages);
      await chatService.markRead(conversationId);
      setConversations(prev =>
        prev.map(c =>
          c.id === conversationId ? { ...c, unreadCount: 0 } : c
        )
      );
    } catch (err) {
      toast.error(err?.message ?? 'Could not load messages.');
    } finally {
      setIsLoadingMsgs(false);
    }
  }, []);

  // ──────────────────────────────────────────────────────────
  // 4. Select a conversation (Admin)
  // ──────────────────────────────────────────────────────────
  const selectConversation = useCallback(async (conversationId) => {
    setActiveConversationId(conversationId);
    setMessages([]);
    await fetchMessages(conversationId);
  }, [fetchMessages]);

  // ──────────────────────────────────────────────────────────
  // 5. Send text message
  // ──────────────────────────────────────────────────────────
  const sendMessage = useCallback(async (text) => {
    if (!text.trim()) return;

    if (!activeConvRef.current) {
      toast.error('No active conversation. Please refresh.');
      return;
    }

    const convId = activeConvRef.current;

    const optimistic = {
      id:         `temp_${Date.now()}`,
      sender_id:  'current_user',
      text:       text.trim(),
      image_url:  null,
      created_at: new Date().toISOString(),
      read:       false,
      pending:    true,
    };
    setMessages(prev => [...prev, optimistic]);
    setIsSending(true);

    try {
      const { message } = await chatService.sendMessage(convId, text.trim());
      setMessages(prev =>
        prev.map(m => m.id === optimistic.id ? { ...message, pending: false } : m)
      );
      if (role === 'admin') {
        setConversations(prev =>
          prev.map(c =>
            c.id === convId
              ? { ...c, lastMessage: text.trim(), lastAt: message.created_at }
              : c
          )
        );
      }
    } catch (err) {
      setMessages(prev =>
        prev.map(m => m.id === optimistic.id ? { ...m, failed: true, pending: false } : m)
      );
      toast.error(err?.message ?? 'Message failed to send.');
    } finally {
      setIsSending(false);
    }
  }, [role]);

  // ──────────────────────────────────────────────────────────
  // 6. Send image + optional caption
  // ──────────────────────────────────────────────────────────
  const sendImage = useCallback(async (file, text = '') => {
    if (!file) return;

    if (!activeConvRef.current) {
      toast.error('No active conversation.');
      return;
    }

    const convId = activeConvRef.current;

    const optimisticUrl = URL.createObjectURL(file);
    const optimistic = {
      id:         `temp_img_${Date.now()}`,
      sender_id:  'current_user',
      text,
      image_url:  optimisticUrl,
      created_at: new Date().toISOString(),
      read:       false,
      pending:    true,
    };
    setMessages(prev => [...prev, optimistic]);
    setIsSending(true);

    try {
      const { message } = await chatService.sendImage(convId, file, text);
      setMessages(prev =>
        prev.map(m => m.id === optimistic.id ? { ...message, pending: false } : m)
      );
      if (role === 'admin') {
        setConversations(prev =>
          prev.map(c =>
            c.id === convId
              ? { ...c, lastMessage: text || 'Image', lastAt: message.created_at }
              : c
          )
        );
      }
    } catch {
      setMessages(prev =>
        prev.map(m => m.id === optimistic.id ? { ...m, failed: true, pending: false } : m)
      );
      toast.error('Image failed to send.');
    } finally {
      setIsSending(false);
      URL.revokeObjectURL(optimisticUrl);
    }
  }, [role]);

  // ──────────────────────────────────────────────────────────
  // 7. Unread badge polling (Admin only)
  // ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (role !== 'admin') return;

    const pollUnread = async () => {
      try {
        const { total } = await chatService.getUnreadCount();
        setUnreadCount(total);
      } catch {
        // Silently ignore
      }
    };

    pollUnread();
    const interval = setInterval(pollUnread, pollInterval);
    return () => clearInterval(interval);
  }, [role, pollInterval]);

  // ──────────────────────────────────────────────────────────
  // 8. Message polling inside an open thread
  // ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!activeConversationId) return;

    let timeoutId = null;
    let isMounted = true;

    const pollMessages = async () => {
      try {
        const { messages: fresh } = await chatService.getHistory(activeConvRef.current);
        if (isMounted) setMessages(fresh);
      } catch {
        // Silent fail
      } finally {
        if (isMounted) {
          timeoutId = setTimeout(pollMessages, pollInterval);
        }
      }
    };

    // Delay first poll — fetchMessages already loaded on open
    timeoutId = setTimeout(pollMessages, pollInterval);

    return () => {
      isMounted = false;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [activeConversationId, pollInterval]);

  // ──────────────────────────────────────────────────────────
  // 9. Initial load
  // ──────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    const init = async () => {
      if (role === 'admin') {
        await fetchConversations(search);
      } else {
        const conv = await fetchMyConversation();
        if (conv && !cancelled) await fetchMessages(conv.id);
      }
    };
    init();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ──────────────────────────────────────────────────────────
  // 10. Search effect — debounced, skip first render
  // ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (isFirstSearchRef.current) {
      isFirstSearchRef.current = false;
      return;
    }
    if (role !== 'admin') return;

    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      fetchConversations(search);
    }, 300);

    return () => {
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    };
  }, [search, role, fetchConversations]);

  return {
    conversations,
    activeConversationId,
    messages,
    search,
    isLoadingConvs,
    isLoadingMsgs,
    isSending,
    unreadCount,
    totalUnread: unreadCount,
    setSearch,
    selectConversation,
    sendMessage,
    sendImage,
    fetchConversations: (s = search) => fetchConversations(s),
    fetchMyConversation,
    fetchMessages,
  };
}