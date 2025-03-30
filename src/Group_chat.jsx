import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  Text,
  Surface,
  TextInput,
  IconButton,
  Avatar,
  useTheme,
} from 'react-native-paper';
import { CommonImages } from './assets/images';

const mockMessages = [
  {
    id: 1,
    sender: {
      id: 'user1',
      name: '妈妈',
      avatar: null,
    },
    content: '今天谁负责打扫客厅？',
    timestamp: '10:00',
    isOwn: false,
  },
  {
    id: 2,
    sender: {
      id: 'user2',
      name: '爸爸',
      avatar: null,
    },
    content: '我来打扫吧，你负责准备晚餐',
    timestamp: '10:01',
    isOwn: false,
  },
  {
    id: 3,
    sender: {
      id: 'currentUser',
      name: '我',
      avatar: null,
    },
    content: '好的，那我来洗碗',
    timestamp: '10:02',
    isOwn: true,
  },
];

const mockMembers = [
  {
    id: 'user1',
    name: '妈妈',
    avatar: null,
    role: '管理员',
  },
  {
    id: 'user2',
    name: '爸爸',
    avatar: null,
    role: '成员',
  },
  {
    id: 'user3',
    name: '我',
    avatar: null,
    role: '成员',
  },
];

const GroupChat = ({ navigation }) => {
  const [message, setMessage] = useState('');
  const [showMembers, setShowMembers] = useState(false);
  const theme = useTheme();

  const handleSend = () => {
    if (!message.trim()) return;

    const newMessage = {
      id: mockMessages.length + 1,
      sender: {
        id: 'currentUser',
        name: '我',
        avatar: null,
      },
      content: message,
      timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      isOwn: true,
    };

    // TODO: 实现发送消息逻辑
    setMessage('');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <Surface style={styles.header}>
        <View style={styles.headerContent}>
          <IconButton
            icon="arrow-left"
            size={24}
            onPress={() => navigation.goBack()}
          />
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>家庭群聊</Text>
            <Text style={styles.headerSubtitle}>3 位成员</Text>
          </View>
          <IconButton
            icon="clipboard-list"
            size={24}
            onPress={() => navigation.navigate('FamilyTaskDetail')}
            style={styles.taskIcon}
          />
          <IconButton
            icon="account-group"
            size={24}
            onPress={() => setShowMembers(!showMembers)}
          />
        </View>
      </Surface>

      {showMembers && (
        <Surface style={styles.membersList}>
          {mockMembers.map(member => (
            <View key={member.id} style={styles.memberItem}>
              <Avatar.Image
                size={40}
                source={member.avatar || CommonImages.avatar}
              />
              <View style={styles.memberInfo}>
                <Text style={styles.memberName}>{member.name}</Text>
                <Text style={styles.memberRole}>{member.role}</Text>
              </View>
            </View>
          ))}
        </Surface>
      )}

      <ScrollView style={styles.messagesContainer}>
        {mockMessages.map(msg => (
          <View
            key={msg.id}
            style={[
              styles.messageContainer,
              msg.isOwn ? styles.ownMessage : styles.otherMessage,
            ]}
          >
            {!msg.isOwn && (
              <Avatar.Image
                size={32}
                source={msg.sender.avatar || CommonImages.avatar}
                style={styles.messageAvatar}
              />
            )}
            <Surface style={[
              styles.messageBubble,
              msg.isOwn ? styles.ownBubble : styles.otherBubble,
            ]}>
              {!msg.isOwn && (
                <Text style={styles.senderName}>{msg.sender.name}</Text>
              )}
              <Text style={[
                styles.messageText,
                msg.isOwn ? styles.ownMessageText : styles.otherMessageText,
              ]}>
                {msg.content}
              </Text>
              <Text style={styles.timestamp}>{msg.timestamp}</Text>
            </Surface>
          </View>
        ))}
      </ScrollView>

      <Surface style={styles.inputContainer}>
        <IconButton
          icon="image"
          size={24}
          onPress={() => {}}
        />
        <TextInput
          value={message}
          onChangeText={setMessage}
          placeholder="输入消息..."
          mode="outlined"
          style={styles.input}
          multiline
        />
        <IconButton
          icon="send"
          size={24}
          onPress={handleSend}
          disabled={!message.trim()}
        />
      </Surface>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 8,
    elevation: 4,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    flex: 1,
    marginLeft: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  membersList: {
    padding: 16,
    elevation: 2,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  memberInfo: {
    marginLeft: 12,
  },
  memberName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  memberRole: {
    fontSize: 12,
    color: '#666',
  },
  messagesContainer: {
    flex: 1,
    padding: 16,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  ownMessage: {
    justifyContent: 'flex-end',
  },
  otherMessage: {
    justifyContent: 'flex-start',
  },
  messageAvatar: {
    marginRight: 8,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    elevation: 2,
  },
  ownBubble: {
    backgroundColor: '#6200ee',
  },
  otherBubble: {
    backgroundColor: '#fff',
  },
  senderName: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  messageText: {
    fontSize: 16,
  },
  ownMessageText: {
    color: '#fff',
  },
  otherMessageText: {
    color: '#000',
  },
  timestamp: {
    fontSize: 12,
    color: '#rgba(255, 255, 255, 0.7)',
    marginTop: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    elevation: 4,
  },
  input: {
    flex: 1,
    marginHorizontal: 8,
    backgroundColor: '#fff',
  },
  taskIcon: {
    marginLeft: 8,
  },
});

export default GroupChat;
