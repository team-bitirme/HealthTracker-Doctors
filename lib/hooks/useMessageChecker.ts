import { useEffect, useRef } from 'react';
import { useMessagesStore } from '~/store/messagesStore';
import { useAuthStore } from '~/store/authStore';

interface UseMessageCheckerOptions {
  enabled?: boolean;
  interval?: number; // milliseconds
  onNewMessage?: () => void;
}

export const useMessageChecker = (options: UseMessageCheckerOptions = {}) => {
  const { 
    enabled = true, 
    interval = 30000, // 30 saniye
    onNewMessage 
  } = options;

  const { user } = useAuthStore();
  const { checkForNewMessages } = useMessagesStore();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!enabled || !user?.id) {
      return;
    }

    const checkMessages = async () => {
      try {
        const hasNewMessages = await checkForNewMessages(user.id);
        if (hasNewMessages && onNewMessage) {
          onNewMessage();
        }
      } catch (error) {
        console.error('Mesaj kontrolü sırasında hata:', error);
      }
    };

    // İlk kontrol
    checkMessages();

    // Periyodik kontrol
    intervalRef.current = setInterval(checkMessages, interval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [enabled, user?.id, interval, checkForNewMessages, onNewMessage]);

  const forceCheck = async () => {
    if (!user?.id) return false;
    
    try {
      return await checkForNewMessages(user.id);
    } catch (error) {
      console.error('Manuel mesaj kontrolü sırasında hata:', error);
      return false;
    }
  };

  return { forceCheck };
}; 