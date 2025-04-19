import React, { useState, useLayoutEffect, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import {
  Text,
  Surface,
  TextInput,
  IconButton,
  Avatar,
  useTheme,
  Portal,
  Dialog,
  Button,
} from 'react-native-paper';
import { CommonImages } from './assets/images';
import { useAuth } from './store/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 只保留自己的消息
const initialMessages = [
  {
    id: 1,
    sender: {
      id: 'currentUser',
      name: '我',
      avatar: null,
    },
    content: '我来洗碗',
    timestamp: '10:02',
    isOwn: true,
  },
];

const GroupChat = ({ navigation }) => {
  const { userInfo } = useAuth();
  const [message, setMessage] = useState('');
  const [showMembers, setShowMembers] = useState(false);
  const [showAddMemberDialog, setShowAddMemberDialog] = useState(false);
  const [newMemberId, setNewMemberId] = useState('');
  const [newMemberName, setNewMemberName] = useState('');
  const theme = useTheme();
  const [messages, setMessages] = useState([]);
  const [members, setMembers] = useState([]);
  
  // Load messages and members from AsyncStorage on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const savedMessages = await AsyncStorage.getItem('chatMessages');
        const savedMembers = await AsyncStorage.getItem('chatMembers');

        if (savedMessages) {
          setMessages(JSON.parse(savedMessages));
        } else {
          setMessages(initialMessages);
          await AsyncStorage.setItem('chatMessages', JSON.stringify(initialMessages));
        }

        if (savedMembers) {
          setMembers(JSON.parse(savedMembers));
        } else {
          const defaultMembers = [
            {
              id: 'currentUser',
              name: '我',
              avatar: null,
              role: '管理员',
            }
          ];
          setMembers(defaultMembers);
          await AsyncStorage.setItem('chatMembers', JSON.stringify(defaultMembers));
        }
      } catch (error) {
        console.error('Error loading chat data:', error);
      }
    };

    loadData();
  }, []);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={{ flexDirection: 'row' }}>
          <IconButton
            icon="clipboard-list"
            size={24}
            onPress={handleNavigateToTaskDetail}
          />
          <IconButton
            icon="account-group"
            size={24}
            onPress={() => setShowMembers(!showMembers)}
          />
        </View>
      ),
    });
  }, [navigation, showMembers]);

  const handleAddMember = async () => {
    if (!newMemberId.trim() || !newMemberName.trim()) {
      Alert.alert('提示', '请输入成员ID和姓名');
      return;
    }

    if (members.some(member => member.id === newMemberId)) {
      Alert.alert('提示', '该成员ID已存在');
      return;
    }

    const newMember = {
      id: newMemberId,
      name: newMemberName,
      avatar: null,
      role: '成员',
    };

    const updatedMembers = [...members, newMember];
    setMembers(updatedMembers);
    setNewMemberId('');
    setNewMemberName('');
    setShowAddMemberDialog(false);

    try {
      await AsyncStorage.setItem('chatMembers', JSON.stringify(updatedMembers));
      Alert.alert('成功', '成员添加成功');
    } catch (error) {
      console.error('Error saving members:', error);
      Alert.alert('错误', '保存成员信息失败');
    }
  };

  const handleSend = async () => {
    if (!message.trim()) return;

    const newMessage = {
      id: messages.length + 1,
      sender: {
        id: 'currentUser',
        name: '我',
        avatar: null,
      },
      content: message,
      timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      isOwn: true,
    };

    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    setMessage('');

    try {
      await AsyncStorage.setItem('chatMessages', JSON.stringify(updatedMessages));
    } catch (error) {
      console.error('Error saving messages:', error);
    }
  };

  const handleNavigateToTaskDetail = () => {
    navigation.navigate('FamilyTaskDetail');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      {showMembers && (
        <Surface style={styles.membersList}>
          {members.map((member, index) => (
            <View key={member.id}>
              <View style={styles.memberItem}>
                <Avatar.Image
                  size={40}
                  source={member.avatar || CommonImages.avatar}
                />
                <View style={styles.memberInfo}>
                  <Text style={styles.memberName}>{member.name}</Text>
                  <Text style={styles.memberRole}>{member.role}</Text>
                </View>
              </View>
             
              {index === 0 && (
                <IconButton
                  icon="plus-circle"
                  size={30}
                  color={theme.colors.primary}
                  style={styles.addButton}
                  onPress={() => setShowAddMemberDialog(true)}
                />
              )}
            </View>
          ))}
        </Surface>
      )}

      {/* 添加成员对话框 */}
      <Portal>
        <Dialog
          visible={showAddMemberDialog}
          onDismiss={() => {
            setShowAddMemberDialog(false);
            setNewMemberId('');
            setNewMemberName('');
          }}
        >
          <Dialog.Title>添加家庭成员</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="成员ID"
              value={newMemberId}
              onChangeText={setNewMemberId}
              mode="outlined"
              style={styles.dialogInput}
            />
            <TextInput
              label="成员姓名"
              value={newMemberName}
              onChangeText={setNewMemberName}
              mode="outlined"
              style={styles.dialogInput}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => {
              setShowAddMemberDialog(false);
              setNewMemberId('');
              setNewMemberName('');
            }}>取消</Button>
            <Button onPress={handleAddMember}>确认</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <ScrollView style={styles.messagesContainer}>
        {messages.map(msg => (
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
  
  membersList: {
    padding: 16,
    elevation: 2,
    marginHorizontal: 8,
    marginTop: 8,
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
  iconButton: {
    margin: 0,
    width: 60,
    height: 55,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButton: {
    alignSelf: 'center',
    marginTop: -8,
    marginBottom: 12,
  },
  dialogInput: {
    marginBottom: 12,
  },
});

export default GroupChat;
