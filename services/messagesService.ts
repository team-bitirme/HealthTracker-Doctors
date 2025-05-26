import { supabase } from '~/lib/supabase';
import { 
  Message, 
  MessageWithDetails, 
  MessageType, 
  SendMessageRequest, 
  GetMessagesRequest, 
  MessagesResponse,
  MessageBubbleData 
} from '~/lib/types/messages';

class MessagesService {
  
  /**
   * Mesaj tiplerini getir
   */
  async getMessageTypes(): Promise<MessageType[]> {
    try {
      const { data, error } = await supabase
        .from('message_types')
        .select('*')
        .order('id');

      if (error) {
        console.error('Mesaj tipleri alınırken hata:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Mesaj tipleri alınırken hata:', error);
      throw error;
    }
  }

  /**
   * İki kullanıcı arasındaki mesajları getir
   */
  async getMessages(request: GetMessagesRequest): Promise<MessagesResponse> {
    try {
      const { user_id, other_user_id, limit = 50, offset = 0 } = request;
      
      let query = supabase
        .from('messages')
        .select(`
          *,
          message_types!inner(name),
          sender:users!messages_sender_user_id_fkey(email),
          receiver:users!messages_receiver_user_id_fkey(email)
        `)
        .eq('is_deleted', false)
        .order('created_at', { ascending: true })
        .range(offset, offset + limit - 1);

      // Eğer other_user_id belirtilmişse, sadece o kullanıcıyla olan mesajları getir
      if (other_user_id) {
        query = query.or(`and(sender_user_id.eq.${user_id},receiver_user_id.eq.${other_user_id}),and(sender_user_id.eq.${other_user_id},receiver_user_id.eq.${user_id})`);
      } else {
        // Kullanıcının tüm mesajlarını getir
        query = query.or(`sender_user_id.eq.${user_id},receiver_user_id.eq.${user_id}`);
      }

      const { data, error, count } = await query;

      if (error) {
        console.error('Mesajlar alınırken hata:', error);
        throw error;
      }

      const messages: MessageWithDetails[] = (data || []).map(msg => ({
        ...msg,
        message_type_name: msg.message_types?.name,
        sender_email: msg.sender?.email,
        receiver_email: msg.receiver?.email,
      }));

      return {
        messages,
        total_count: count || 0,
        has_more: (offset + limit) < (count || 0)
      };
    } catch (error) {
      console.error('Mesajlar alınırken hata:', error);
      throw error;
    }
  }

  /**
   * Yeni mesaj gönder
   */
  async sendMessage(request: SendMessageRequest, sender_user_id: string): Promise<MessageWithDetails> {
    try {
      const { receiver_user_id, message_type_id, content } = request;

      const { data, error } = await supabase
        .from('messages')
        .insert({
          sender_user_id,
          receiver_user_id,
          message_type_id,
          content,
        })
        .select(`
          *,
          message_types!inner(name),
          sender:users!messages_sender_user_id_fkey(email),
          receiver:users!messages_receiver_user_id_fkey(email)
        `)
        .single();

      if (error) {
        console.error('Mesaj gönderilirken hata:', error);
        throw error;
      }

      return {
        ...data,
        message_type_name: data.message_types?.name,
        sender_email: data.sender?.email,
        receiver_email: data.receiver?.email,
      };
    } catch (error) {
      console.error('Mesaj gönderilirken hata:', error);
      throw error;
    }
  }

  /**
   * User ID'ye göre hasta bilgilerini getir
   */
  async getPatientByUserId(userId: string): Promise<{ 
    id: string; 
    name: string | null; 
    surname: string | null;
    user_id: string | null;
  } | null> {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('id, name, surname, user_id')
        .eq('user_id', userId)
        .eq('is_deleted', false)
        .single();

      if (error || !data) {
        console.log('Hasta bilgisi bulunamadı:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Hasta bilgisi alınırken hata:', error);
      return null;
    }
  }

  /**
   * Kullanıcının doktorunu getir
   */
  async getUserDoctor(user_id: string): Promise<{ doctor_user_id: string; doctor_name: string } | null> {
    try {
      const { data, error } = await supabase
        .from('doctor_patients')
        .select(`
          doctors!inner(
            user_id,
            name,
            surname
          ),
          patients!inner(
            user_id
          )
        `)
        .eq('patients.user_id', user_id)
        .eq('is_deleted', false)
        .single();

      if (error || !data) {
        console.log('Doktor bilgisi bulunamadı:', error);
        return null;
      }

      return {
        doctor_user_id: data.doctors.user_id || '',
        doctor_name: `${data.doctors.name || ''} ${data.doctors.surname || ''}`.trim()
      };
    } catch (error) {
      console.error('Doktor bilgisi alınırken hata:', error);
      return null;
    }
  }

  /**
   * Doktor ismini user_id'den al
   */
  async getDoctorNameByUserId(user_id: string): Promise<string> {
    try {
      const { data, error } = await supabase
        .from('doctors')
        .select('name, surname')
        .eq('user_id', user_id)
        .single();

      if (error || !data) {
        return 'Dr. Doktor';
      }

      return `Dr. ${data.name || ''} ${data.surname || ''}`.trim();
    } catch (error) {
      return 'Dr. Doktor';
    }
  }

  /**
   * Mesajları UI için uygun formata çevir
   */
  async convertToMessageBubbles(messages: MessageWithDetails[], currentUserId: string, doctorName?: string): Promise<MessageBubbleData[]> {
    return messages.map(msg => {
      const isOwn = msg.sender_user_id === currentUserId;
      const timestamp = msg.created_at 
        ? new Date(msg.created_at).toLocaleTimeString('tr-TR', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })
        : '';

      let type: 'user' | 'doctor' | 'ai' | 'system' = 'user';
      let senderName = '';

      if (!isOwn) {
        // Mesaj tipine göre type belirle
        switch (msg.message_type_name?.toLowerCase()) {
          case 'genel':
            type = 'user';
            senderName = 'Hasta';
            break;
          case 'genel değerlendirme':
            type = 'ai';
            senderName = 'AI Asistan';
            break;
          case 'geri bildirim':
            type = 'system';
            senderName = 'Sistem';
            break;
          default:
            type = 'user';
            senderName = 'Hasta';
        }
      } else {
        type = 'doctor';
        senderName = 'Dr. ' + doctorName || 'Dr. Doktor';
      }

      return {
        id: msg.id,
        content: msg.content || '',
        timestamp,
        isOwn,
        type,
        senderName,
        status: 'read' as const, // Şimdilik tüm mesajlar okunmuş olarak işaretleniyor
      };
    });
  }  /**
   * İki kullanıcı arasında yeni mesajlar var mı kontrol et
   */
  async checkForNewMessagesInChat(userId: string, otherUserId: string, lastMessageId?: string): Promise<boolean> {
    try {
      console.log('🔍 [MessagesService] Chat için yeni mesaj kontrolü yapılıyor...', { 
        userId, 
        otherUserId, 
        lastMessageId 
      });

      if (!lastMessageId) {
        // İlk kontrol, iki kullanıcı arasında mesaj var mı kontrol et
        const { count, error } = await supabase
          .from('messages')
          .select('id', { count: 'exact' })
          .or(`and(sender_user_id.eq.${userId},receiver_user_id.eq.${otherUserId}),and(sender_user_id.eq.${otherUserId},receiver_user_id.eq.${userId})`)
          .eq('is_deleted', false);

        if (error) {
          console.error('💥 [MessagesService] Chat mesaj kontrolü hatası:', error);
          return false;
        }

        return (count || 0) > 0;
      }

      // Son mesajın timestamp'ini al
      const { data: lastMessage, error: lastMessageError } = await supabase
        .from('messages')
        .select('created_at')
        .eq('id', lastMessageId)
        .single();

      if (lastMessageError || !lastMessage) {
        console.log('ℹ️ [MessagesService] Son mesaj bulunamadı, tüm mesajları kontrol ediliyor');
        // lastMessageId geçersizse, tüm mesajları kontrol et
        const { count, error } = await supabase
          .from('messages')
          .select('id', { count: 'exact' })
          .or(`and(sender_user_id.eq.${userId},receiver_user_id.eq.${otherUserId}),and(sender_user_id.eq.${otherUserId},receiver_user_id.eq.${userId})`)
          .eq('is_deleted', false);

        return (count || 0) > 0;
      }

      // Son mesajdan sonraki mesajları kontrol et
      const { count, error } = await supabase
        .from('messages')
        .select('id', { count: 'exact' })
        .or(`and(sender_user_id.eq.${userId},receiver_user_id.eq.${otherUserId}),and(sender_user_id.eq.${otherUserId},receiver_user_id.eq.${userId})`)
        .eq('is_deleted', false)
        .gt('created_at', lastMessage.created_at);

      if (error) {
        console.error('💥 [MessagesService] Chat yeni mesaj kontrolü hatası:', error);
        return false;
      }

      const hasNewMessages = (count || 0) > 0;
      console.log('🔍 [MessagesService] Chat yeni mesaj kontrol sonucu:', { 
        hasNewMessages, 
        messageCount: count 
      });

      return hasNewMessages;
    } catch (error) {
      console.error('💥 [MessagesService] Chat yeni mesaj kontrolü yapılırken hata:', error);
      return false;
    }
  }

  /**
   * Doktor için yeni hasta mesajları var mı kontrol et
   */
  async checkForNewPatientMessages(doctorId: string, lastCheckTime?: string): Promise<boolean> {
    try {
      console.log('🔍 [MessagesService] Doktor için yeni hasta mesajları kontrol ediliyor...', { 
        doctorId, 
        lastCheckTime 
      });

      // Önce doktorun hastalarını getir
      const { data: patientsData, error: patientsError } = await supabase
        .from('doctor_patients')
        .select('patients!inner(user_id)')
        .eq('doctor_id', doctorId)
        .eq('is_deleted', false)
        .eq('patients.is_deleted', false);

      if (patientsError || !patientsData || patientsData.length === 0) {
        console.log('ℹ️ [MessagesService] Doktor için hasta bulunamadı');
        return false;
      }

      const patientUserIds = patientsData
        .map((item: any) => item.patients?.user_id)
        .filter(Boolean);

      if (patientUserIds.length === 0) {
        console.log('ℹ️ [MessagesService] Hasta user_id\'leri bulunamadı');
        return false;
      }

      let query = supabase
        .from('messages')
        .select('id', { count: 'exact' })
        .in('sender_user_id', patientUserIds) // Sadece hastalardan gelen mesajlar
        .eq('is_deleted', false);

      // Eğer son kontrol zamanı varsa, o zamandan sonraki mesajları kontrol et
      if (lastCheckTime) {
        query = query.gt('created_at', lastCheckTime);
      }

      const { count, error } = await query;

      if (error) {
        console.error('💥 [MessagesService] Yeni hasta mesajı kontrolü hatası:', error);
        return false;
      }

      const hasNewMessages = (count || 0) > 0;
      console.log('🔍 [MessagesService] Yeni hasta mesajı kontrol sonucu:', { 
        hasNewMessages, 
        messageCount: count 
      });

      return hasNewMessages;
    } catch (error) {
      console.error('💥 [MessagesService] Yeni hasta mesajı kontrolü yapılırken hata:', error);
      return false;
    }
  }

  /**
   * Yeni mesaj var mı kontrol et
   */
  async checkForNewMessages(user_id: string, lastMessageId?: string): Promise<boolean> {
    try {
      if (!lastMessageId) {
        // İlk kontrol, sadece mesaj var mı yok mu kontrol et
        const { count, error } = await supabase
          .from('messages')
          .select('id', { count: 'exact' })
          .or(`sender_user_id.eq.${user_id},receiver_user_id.eq.${user_id}`)
          .eq('is_deleted', false);

        if (error) {
          console.error('Yeni mesaj kontrolü yapılırken hata:', error);
          return false;
        }

        return (count || 0) > 0;
      }

      // Son mesajın timestamp'ini al
      const { data: lastMessage, error: lastMessageError } = await supabase
        .from('messages')
        .select('created_at')
        .eq('id', lastMessageId)
        .single();

      if (lastMessageError || !lastMessage) {
        console.error('Son mesaj bulunamadı:', lastMessageError);
        return false;
      }

      // Son mesajdan sonraki mesajları kontrol et
      const { count, error } = await supabase
        .from('messages')
        .select('id', { count: 'exact' })
        .or(`sender_user_id.eq.${user_id},receiver_user_id.eq.${user_id}`)
        .eq('is_deleted', false)
        .gt('created_at', lastMessage.created_at);

      if (error) {
        console.error('Yeni mesaj kontrolü yapılırken hata:', error);
        return false;
      }

      return (count || 0) > 0;
    } catch (error) {
      console.error('Yeni mesaj kontrolü yapılırken hata:', error);
      return false;
    }
  }

  /**
   * Doktorun hastalarını son mesajlarıyla birlikte getir
   */
  async getDoctorPatientsWithLastMessages(doctorId: string): Promise<{
    id: string;
    name: string | null;
    surname: string | null;
    gender_name: string | null;
    user_id: string | null;
    lastMessage?: {
      content: string;
      created_at: string;
    } | null;
  }[]> {
    try {
      console.log('📋 [MessagesService] Doktor hastaları ve son mesajları getiriliyor...', { doctorId });

      // Önce doktorun hastalarını getir
      const { data: patientsData, error: patientsError } = await supabase
        .from('doctor_patients')
        .select(`
          patients!inner(
            id,
            name,
            surname,
            user_id,
            genders(name)
          )
        `)
        .eq('doctor_id', doctorId)
        .eq('is_deleted', false)
        .eq('patients.is_deleted', false);

      if (patientsError) {
        console.error('💥 [MessagesService] Hasta listesi getirme hatası:', patientsError);
        throw new Error('Hasta listesi getirilemedi');
      }

      if (!patientsData || patientsData.length === 0) {
        console.log('ℹ️ [MessagesService] Doktor için hasta bulunamadı');
        return [];
      }

      // Her hasta için son mesajı getir
      const patientsWithMessages = await Promise.all(
        patientsData.map(async (item: any) => {
          const patient = item.patients;
          let lastMessage = null;

          if (patient.user_id) {
            // Hastanın son mesajını getir
            const { data: messageData, error: messageError } = await supabase
              .from('messages')
              .select('content, created_at')
              .or(`sender_user_id.eq.${patient.user_id},receiver_user_id.eq.${patient.user_id}`)
              .eq('is_deleted', false)
              .order('created_at', { ascending: false })
              .limit(1)
              .single();

            if (!messageError && messageData) {
              lastMessage = {
                content: messageData.content || '',
                created_at: messageData.created_at || '',
              };
            }
          }

          return {
            id: patient.id,
            name: patient.name,
            surname: patient.surname,
            gender_name: patient.genders?.name || null,
            user_id: patient.user_id,
            lastMessage,
          };
        })
      );

      console.log('✅ [MessagesService] Hastalar ve son mesajları başarıyla getirildi:', {
        doctorId,
        patientCount: patientsWithMessages.length,
        patientsWithMessages: patientsWithMessages.map(p => ({
          name: `${p.name} ${p.surname}`,
          hasMessage: !!p.lastMessage
        }))
      });

      return patientsWithMessages;

    } catch (error) {
      console.error('💥 [MessagesService] Hastalar ve son mesajları getirme hatası:', error);
      throw error instanceof Error ? error : new Error('Hastalar ve mesajlar getirilemedi');
    }
  }
}

export const messagesService = new MessagesService();