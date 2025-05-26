export interface MessageType {
  id: number;
  code: string;
  name: string;
}

export interface Message {
  id: string;
  sender_user_id: string | null;
  receiver_user_id: string | null;
  message_type_id: number | null;
  content: string | null;
  created_at: string | null;
  updated_at: string | null;
  is_deleted: boolean | null;
}

export interface MessageWithDetails extends Message {
  message_type_name?: string;
  sender_email?: string;
  receiver_email?: string;
  sender_name?: string;
  receiver_name?: string;
}

export interface MessageBubbleData {
  id: string;
  content: string;
  timestamp: string;
  isOwn: boolean;
  type: 'user' | 'doctor' | 'ai' | 'system';
  senderName?: string;
  status: 'sending' | 'sent' | 'delivered' | 'read';
}

export interface SendMessageRequest {
  receiver_user_id: string;
  message_type_id: number;
  content: string;
}

export interface GetMessagesRequest {
  user_id: string;
  other_user_id?: string;
  limit?: number;
  offset?: number;
}

export interface MessagesResponse {
  messages: MessageWithDetails[];
  total_count: number;
  has_more: boolean;
} 