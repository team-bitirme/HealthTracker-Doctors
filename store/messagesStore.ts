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
  patientInfo: { patient_user_id: string; patient_name: string } | null;
    // Actions
  loadMessages: (userId: string, otherUserId: string, autoMarkAsRead?: boolean) => Promise<void>;
  sendMessage: (content: string, senderUserId: string, receiverUserId: string, messageTypeId?: number, onMessageSent?: () => void) => Promise<void>;
  loadMessageTypes: () => Promise<void>;
  loadDoctorInfo: (userId: string) => Promise<void>;
  loadPatientInfo: (patientUserId: string) => Promise<void>;
  checkForNewMessages: (userId: string) => Promise<boolean>;
  markChatAsRead: (doctorUserId: string, patientUserId: string) => Promise<void>;
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
  patientInfo: null,

  // Actions
  loadMessages: async (userId: string, otherUserId: string, autoMarkAsRead: boolean = false) => {
    try {
      set({ isLoading: true, error: null });

      const response = await messagesService.getMessages({
        user_id: userId,
        other_user_id: otherUserId,
        limit: 100
      });

      const messageBubbles = await messagesService.convertToMessageBubbles(
        response.messages, 
        userId,
        get().doctorInfo?.doctor_name || get().patientInfo?.patient_name
      );

      const lastMessage = response.messages[response.messages.length - 1];

      set({ 
        messages: messageBubbles,
        lastMessageId: lastMessage?.id || null,
        isLoading: false 
      });

      // Eğer autoMarkAsRead true ise, chat mesajlarını okundu işaretle
      if (autoMarkAsRead) {
        try {
          await messagesService.markChatMessagesAsRead(userId, otherUserId);
        } catch (markError) {
          console.error('Mesajları okundu işaretlerken hata:', markError);
        }
      }
    } catch (error) {
      console.error('Mesajlar yüklenirken hata:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Mesajlar yüklenemedi',
        isLoading: false 
      });
    }
  },
  sendMessage: async (content: string, senderUserId: string, receiverUserId: string, messageTypeId = 1, onMessageSent?: () => void) => {
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
        type: 'doctor',
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
      const realMessageBubbles = await messagesService.convertToMessageBubbles(
        [sentMessage], 
        senderUserId, 
        get().doctorInfo?.doctor_name || get().patientInfo?.patient_name
      );
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

      // Mesaj gönderildikten sonra callback'i çağır
      if (onMessageSent) {
        console.log('✅ [MessagesStore] Mesaj gönderildi, yeni mesaj kontrolü yapılıyor...');
        onMessageSent();
      }

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

  loadPatientInfo: async (patientUserId: string) => {
    try {
      const patient = await messagesService.getPatientByUserId(patientUserId);
      if (patient) {
        set({
          patientInfo: {
            patient_user_id: patient.user_id || '',
            patient_name: `${patient.name || ''} ${patient.surname || ''}`.trim()
          }
        });
      }
    } catch (error) {
      console.error('Hasta bilgisi yüklenirken hata:', error);
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

  markChatAsRead: async (doctorUserId: string, patientUserId: string) => {
    try {
      await messagesService.markChatMessagesAsRead(doctorUserId, patientUserId);
    } catch (error) {
      console.error('Chat mesajlarını okundu işaretlerken hata:', error);
    }
  },

  clearMessages: () => {
    set({ 
      messages: [], 
      lastMessageId: null, 
      error: null,
      doctorInfo: null,
      patientInfo: null
    });
  },

  setError: (error: string | null) => {
    set({ error });
  },
})); 