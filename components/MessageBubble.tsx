import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';

export interface MessageBubbleProps {
  id: string;
  content: string;
  timestamp: string;
  isOwn: boolean;
  type: 'doctor' | 'ai' | 'system' | 'user';
  senderName?: string;
  status?: 'sending' | 'sent' | 'delivered' | 'read';
}

export function MessageBubble({ 
  content, 
  timestamp, 
  isOwn, 
  type, 
  senderName,
  status = 'sent'
}: MessageBubbleProps) {
  const getBubbleStyle = () => {
    if (isOwn) {
      return [styles.bubble, styles.ownBubble];
    }
    
    switch (type) {
      case 'doctor':
        return [styles.bubble, styles.doctorBubble];
      case 'ai':
        return [styles.bubble, styles.aiBubble];
      case 'system':
        return [styles.bubble, styles.systemBubble];
      default:
        return [styles.bubble, styles.otherBubble];
    }
  };

  const getTextStyle = () => {
    if (isOwn) {
      return styles.ownText;
    }
    
    switch (type) {
      case 'system':
        return styles.systemText;
      default:
        return styles.otherText;
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'doctor':
        return <FontAwesome name="user-md" size={12} color="#28a745" />;
      case 'ai':
        return <FontAwesome name="android" size={12} color="#6f42c1" />;
      case 'system':
        return <FontAwesome name="info-circle" size={12} color="#6c757d" />;
      default:
        return null;
    }
  };

  const getStatusIcon = () => {
    if (!isOwn) return null;
    
    switch (status) {
      case 'sending':
        return <FontAwesome name="clock-o" size={12} color="#6c757d" />;
      case 'sent':
      case 'delivered':
      case 'read':
        return <FontAwesome name="check" size={12} color="#6c757d" />;
      default:
        return null;
    }
  };

  return (
    <View style={[styles.container, isOwn ? styles.ownContainer : styles.otherContainer]}>
      {!isOwn && senderName && (
        <View style={styles.senderContainer}>
          {getIcon()}
          <Text style={styles.senderName}>{senderName}</Text>
        </View>
      )}
      
      <View style={getBubbleStyle()}>
        <Text style={getTextStyle()}>{content}</Text>
      </View>
      
      <View style={styles.timestampContainer}>
        <Text style={styles.timestamp}>{timestamp}</Text>
        {getStatusIcon()}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    paddingHorizontal: 16,
  },
  ownContainer: {
    alignItems: 'flex-end',
  },
  otherContainer: {
    alignItems: 'flex-start',
  },
  senderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    paddingHorizontal: 4,
  },
  senderName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6c757d',
    marginLeft: 4,
  },
  bubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 18,
    marginBottom: 4,
  },
  ownBubble: {
    backgroundColor: '#007bff',
    borderBottomRightRadius: 4,
  },
  doctorBubble: {
    backgroundColor: '#e8f5e8',
    borderBottomLeftRadius: 4,
    borderLeftWidth: 3,
    borderLeftColor: '#28a745',
  },
  aiBubble: {
    backgroundColor: '#f3e8ff',
    borderBottomLeftRadius: 4,
    borderLeftWidth: 3,
    borderLeftColor: '#6f42c1',
  },
  systemBubble: {
    backgroundColor: '#f8f9fa',
    borderBottomLeftRadius: 4,
    borderLeftWidth: 3,
    borderLeftColor: '#6c757d',
    alignSelf: 'center',
    maxWidth: '90%',
  },
  otherBubble: {
    backgroundColor: '#f1f3f5',
    borderBottomLeftRadius: 4,
  },
  ownText: {
    color: '#fff',
    fontSize: 16,
    lineHeight: 22,
  },
  otherText: {
    color: '#212529',
    fontSize: 16,
    lineHeight: 22,
  },
  systemText: {
    color: '#6c757d',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  timestampContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  timestamp: {
    fontSize: 11,
    color: '#6c757d',
    marginRight: 4,
  },
}); 