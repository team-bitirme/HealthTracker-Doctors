import { useMessagesStore } from '~/store/messagesStore';
import { useAuthStore } from '~/store/authStore';

interface UseMessageCheckerOptions {
  onNewMessage?: () => void;
}

export const useMessageChecker = (options: UseMessageCheckerOptions = {}) => {
  const { onNewMessage } = options;

  const { user } = useAuthStore();
  const { checkForNewMessages, lastMessageId } = useMessagesStore();

  const checkMessages = async () => {
    if (!user?.id) return false;
    
    // Eğer henüz lastMessageId yoksa, kontrol etme (yeni kullanıcı/sayfa)
    if (!lastMessageId) {
      console.log('🔍 [MessageChecker] lastMessageId yok, kontrol atlanıyor');
      return false;
    }
    
    try {
      const hasNewMessages = await checkForNewMessages(user.id);
      if (hasNewMessages && onNewMessage) {
        onNewMessage();
      }
      return hasNewMessages;
    } catch (error) {
      console.error('Mesaj kontrolü sırasında hata:', error);
      return false;
    }
  };

  return { checkMessages };
};