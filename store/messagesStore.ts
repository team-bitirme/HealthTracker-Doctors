import { create } from 'zustand';
import { MessageBubbleData, MessageWithDetails, MessageType } from '~/lib/types/messages';
import { messagesService } from '~/services/messagesService';

interface MessagesState {
  // State
  messages: MessageBubbleData[];
  messageTypes: MessageType[];
  isLoading: boolean;
  isSending: boolean;
  error: string | null;
  lastMessageId: string | null;
  doctorInfo: { doctor_user_id: string; doctor_name: string } | null;
  
  // Actions
  loadMessages: (userId: string, doctorUserId?: string) => Promise<void>;
  sendMessage: (content: string, senderUserId: string, receiverUserId: string, messageTypeId?: number) => Promise<void>;
  loadMessageTypes: () => Promise<void>;
  loadDoctorInfo: (userId: string) => Promise<void>;
  checkForNewMessages: (userId: string) => Promise<boolean>;
  clearMessages: () => void;
  setError: (error: string | null) => void;
}

export const useMessagesStore = create<MessagesState>((set, get) => ({
  // Initial state
  messages: [],
  messageTypes: [],
  isLoading: false,
  isSending: false,
  error: null,
  lastMessageId: null,
  doctorInfo: null,

  // Actions
  loadMessages: async (userId: string, doctorUserId?: string) => {
    try {
      set({ isLoading: true, error: null });

      const response = await messagesService.getMessages({
        user_id: userId,
        other_user_id: doctorUserId,
        limit: 100
      });

      const messageBubbles = await messagesService.convertToMessageBubbles(
        response.messages, 
        userId,
        get().doctorInfo?.doctor_name
      );

      const lastMessage = response.messages[response.messages.length - 1];

      set({ 
        messages: messageBubbles,
        lastMessageId: lastMessage?.id || null,
        isLoading: false 
      });
    } catch (error) {
      console.error('Mesajlar yüklenirken hata:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Mesajlar yüklenemedi',
        isLoading: false 
      });
    }
  },

  sendMessage: async (content: string, senderUserId: string, receiverUserId: string, messageTypeId = 1) => {
    try {
      set({ isSending: true, error: null });

      // Optimistic update - mesajı hemen UI'a ekle
      const tempMessage: MessageBubbleData = {
        id: `temp-${Date.now()}`,
        content,
        timestamp: new Date().toLocaleTimeString('tr-TR', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        isOwn: true,
        type: 'user',
        status: 'sending',
      };

      set(state => ({ 
        messages: [...state.messages, tempMessage] 
      }));

      // Gerçek mesajı gönder
      const sentMessage = await messagesService.sendMessage({
        receiver_user_id: receiverUserId,
        message_type_id: messageTypeId,
        content
      }, senderUserId);

      // Temp mesajı gerçek mesajla değiştir
      const realMessageBubbles = await messagesService.convertToMessageBubbles([sentMessage], senderUserId, get().doctorInfo?.doctor_name);
      const realMessageBubble = realMessageBubbles[0];
      
      set(state => ({
        messages: state.messages.map(msg => 
          msg.id === tempMessage.id 
            ? { ...realMessageBubble, status: 'sent' as const }
            : msg
        ),
        lastMessageId: sentMessage.id,
        isSending: false
      }));

    } catch (error) {
      console.error('Mesaj gönderilirken hata:', error);
      
      // Hata durumunda temp mesajı kaldır
      set(state => ({
        messages: state.messages.filter(msg => !msg.id.startsWith('temp-')),
        error: error instanceof Error ? error.message : 'Mesaj gönderilemedi',
        isSending: false
      }));
    }
  },

  loadMessageTypes: async () => {
    try {
      const types = await messagesService.getMessageTypes();
      set({ messageTypes: types });
    } catch (error) {
      console.error('Mesaj tipleri yüklenirken hata:', error);
      set({ error: error instanceof Error ? error.message : 'Mesaj tipleri yüklenemedi' });
    }
  },

  loadDoctorInfo: async (userId: string) => {
    try {
      const doctorInfo = await messagesService.getUserDoctor(userId);
      set({ doctorInfo });
    } catch (error) {
      console.error('Doktor bilgisi yüklenirken hata:', error);
    }
  },

  checkForNewMessages: async (userId: string) => {
    try {
      const { lastMessageId } = get();
      const hasNewMessages = await messagesService.checkForNewMessages(userId, lastMessageId || undefined);
      return hasNewMessages;
    } catch (error) {
      console.error('Yeni mesaj kontrolü yapılırken hata:', error);
      return false;
    }
  },

  clearMessages: () => {
    set({ 
      messages: [], 
      lastMessageId: null, 
      error: null,
      doctorInfo: null 
    });
  },

  setError: (error: string | null) => {
    set({ error });
  },
})); 