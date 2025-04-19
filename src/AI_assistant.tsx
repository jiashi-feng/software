import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  ScrollView,
  SafeAreaView,
  ToastAndroid,
} from 'react-native';
import {
  Text,
  Surface,
  IconButton,
  useTheme,
  ActivityIndicator,
  Avatar,
  Chip,
} from 'react-native-paper';
import {CommonImages} from './assets/images';
import api from './services/api';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

interface Task {
  id: string;
  title: string;
  completed: boolean;
  dueDate?: Date;
  priority: string;
}

interface Message {
  id: string;
  text: string;
  createdAt: Date;
  author: {
    id: string;
    firstName: string;
    imageUrl?: string;
  };
  type: 'text';
}

type RootStackParamList = {
  AIAssistant: { speechText?: string };
};

type AIAssistantProps = {
  route: RouteProp<RootStackParamList, 'AIAssistant'>;
  navigation: StackNavigationProp<RootStackParamList>;
};

const AIAssistant: React.FC<AIAssistantProps> = ({ route, navigation }) => {
  const theme = useTheme();
  
  
  const initialSpeechText = route?.params?.speechText || '';
  
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState(initialSpeechText);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  
  
  const scrollViewRef = useRef<ScrollView>(null);
  
  
  const USER_ID = 'user';
  const AI_ID = 'ai_assistant';
  
  
  useEffect(() => {
    
    const welcomeMessage: Message = {
      id: Date.now().toString(),
      text: '你好！我是你的家务助手，有什么可以帮助你的吗？',
      createdAt: new Date(),
      author: {
        id: AI_ID,
        firstName: '小助手',
        imageUrl: CommonImages.ai_chat,
      },
      type: 'text',
    };
    
    setMessages([welcomeMessage]);
    
    
    try {
      const localTasks = api.local.getAllTasks();
      setTasks(localTasks as Task[]);
    } catch (error) {
      
    }
    
    
    if (initialSpeechText) {
      handleSendMessage(initialSpeechText);
    }
  }, []);
  
  
  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);
  
  
  const startListening = async () => {
    if (isListening) return;
    
    try {
      setIsListening(true);
      
      
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      
      try {
        
        await api.audio.startRecording();
      } catch (recordingError) {
        
        
        setIsListening(false);
        
        
        if (Platform.OS === 'android') {
          ToastAndroid.show('语音输入功能暂时不可用，请稍后再试', ToastAndroid.LONG);
        }
        return;
      }
      
    } catch (error) {
      
      
      setIsListening(false);
    }
  };
  
  
  const stopListening = async () => {
    if (!isListening) return;
    
    try {
      
      
      
      try {
        
        const recognizedText = await api.audio.stopRecording();
        
        if (recognizedText) {
          setInputText(recognizedText);
          handleSendMessage(recognizedText);
        } else {
          
          if (Platform.OS === 'android') {
            ToastAndroid.show('没有识别到语音，请重试', ToastAndroid.SHORT);
          }
        }
      } catch (recordingError) {
        
        
        if (Platform.OS === 'android') {
          ToastAndroid.show('语音识别功能暂时不可用，请稍后再试', ToastAndroid.LONG);
        }
      }
    } catch (error) {
      
    } finally {
      
      setIsListening(false);
    }
  };
  
  
  const generateAIResponse = (userMessage: string): Promise<string> => {
    return new Promise((resolve) => {
      
      setTimeout(() => {
        
        if (userMessage.includes('今晚') && userMessage.includes('做什么')) {
          const pendingTasks = api.local.getPendingTasks() as Task[];
          if (pendingTasks.length > 0) {
            const taskList = pendingTasks.map(task => task.title).join('、');
            resolve(`今晚你需要完成这些任务：${taskList}。需要我帮你安排顺序吗？`);
          } else {
            resolve('今晚没有待完成的任务，你可以好好休息了！');
          }
        } 
        
        else if (userMessage.includes('提醒我') || userMessage.includes('添加任务')) {
          const taskMatch = userMessage.match(/提醒我(.+)/) || userMessage.match(/添加任务(.+)/);
          if (taskMatch && taskMatch[1]) {
            const newTask = api.local.addTask(taskMatch[1].trim()) as Task;
            setTasks(api.local.getAllTasks() as Task[]);
            resolve(`好的，我已经添加了任务：${newTask.title}`);
          } else {
            resolve('抱歉，我没有理解你想添加什么任务，能再说一次吗？');
          }
        }
        
        else if (userMessage.includes('完成') || userMessage.includes('做完了')) {
          const allTasks = api.local.getAllTasks() as Task[];
          for (const task of allTasks) {
            if (userMessage.includes(task.title)) {
              const updatedTask = api.local.updateTaskStatus(task.id, true) as Task | null;
              if (updatedTask) {
                setTasks(api.local.getAllTasks() as Task[]);
                resolve(`太棒了！你已经完成了"${updatedTask.title}"，今天辛苦了，喝杯奶茶奖励自己吧！`);
                return;
              }
            }
          }
          resolve('请告诉我你完成了哪项具体的任务，这样我可以更新你的任务列表。');
        }
        
        else {
          resolve('我可以帮你查看任务、添加任务或者标记任务为已完成。有什么需要我帮忙的吗？');
        }
      }, 1000);
    });
  };
  
  
  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;
    
    
    const userMessage: Message = {
      id: Date.now().toString(),
      text,
      createdAt: new Date(),
      author: {
        id: USER_ID,
        firstName: '我',
      },
      type: 'text',
    };
    
    
    setMessages(prevMessages => [...prevMessages, userMessage]);
    
    
    setInputText('');
    
    
    const aiResponse = await generateAIResponse(text);
    
    
    const aiMessage: Message = {
      id: (Date.now() + 1).toString(),
      text: aiResponse,
      createdAt: new Date(),
      author: {
        id: AI_ID,
        firstName: '小助手',
      },
      type: 'text',
    };
    
    
    setMessages(prevMessages => [...prevMessages, aiMessage]);
    
    
    setIsSpeaking(true);
    
    try {
      
      await api.audio.speak(aiResponse, {
        voice: 'xiaoyan',
        speed: 0,
        volume: 80,
        pitch: 5,
        region: 'shanghai'
      });
    } catch (error) {
      
    } finally {
      
      setIsSpeaking(false);
    }
  };
  
  
  const renderInputToolbar = () => {
    return (
      <Surface style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="输入消息..."
          multiline
        />
        <View style={styles.buttonContainer}>
          <IconButton
            icon={isListening ? 'microphone' : 'microphone-outline'}
            iconColor={isListening ? theme.colors.error : theme.colors.primary}
            size={24}
            onPress={isListening ? stopListening : startListening}
          />
          <IconButton
            icon="send"
            iconColor={theme.colors.primary}
            size={24}
            onPress={() => handleSendMessage(inputText)}
            disabled={!inputText.trim()}
          />
        </View>
      </Surface>
    );
  };
  
  
  const renderTaskList = () => {
    const pendingTasks = api.local.getPendingTasks() as Task[];
    
    if (pendingTasks.length === 0) return null;
    
    return (
      <Surface style={styles.tasksContainer}>
        <Text style={styles.taskTitle}>待完成任务：</Text>
        <View style={styles.chipContainer}>
          {pendingTasks.map((task) => (
            <Chip
              key={task.id}
              icon="checkbox-blank-circle-outline"
              mode="outlined"
              style={styles.taskChip}
              onPress={() => {
                api.local.updateTaskStatus(task.id, true);
                setTasks(api.local.getAllTasks() as Task[]);
                handleSendMessage(`我完成了${task.title}`);
              }}
            >
              {task.title}
            </Chip>
          ))}
        </View>
      </Surface>
    );
  };
  
  useEffect(() => {
    const checkServices = async () => {
      try {
        const isTaskServiceAvailable = await api.checkTaskServiceHealth();
        const isVoiceServiceAvailable = await api.checkVoiceServiceHealth();
        
        console.log('任务服务可用:', isTaskServiceAvailable);
        console.log('语音服务可用:', isVoiceServiceAvailable);
      } catch (error) {
        console.error('服务健康检查失败:', error);
      }
    };
    
    checkServices();
  }, []);
  
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <SafeAreaView style={styles.container}>
        {}
        <ScrollView
          ref={scrollViewRef}
          style={styles.chatContainer}
          contentContainerStyle={styles.chatContent}
        >
          {messages.map((message, index) => (
            <View
              key={message.id}
              style={[
                styles.messageBubble,
                message.author.id === USER_ID ? styles.userBubble : styles.aiBubble,
              ]}
            >
              {message.author.id === AI_ID && index > 0 && (
                <Avatar.Image
                  size={32}
                  source={CommonImages.ai_chat}
                  style={styles.avatar}
                />
              )}
              <Surface style={[
                styles.bubbleSurface,
                message.author.id === USER_ID ? styles.userBubbleSurface : styles.aiBubbleSurface,
              ]}>
                <Text
                  style={[
                    styles.messageText,
                    message.author.id === USER_ID ? styles.userText : styles.aiText,
                  ]}
                >
                  {message.text}
                </Text>
              </Surface>
            </View>
          ))}
          {}
          {isSpeaking && (
            <View style={styles.speakingIndicator}>
              <ActivityIndicator size={20} color={theme.colors.primary} />
              <Text style={styles.speakingText}>AI正在说话...</Text>
            </View>
          )}
        </ScrollView>
        
        {}
        {renderTaskList()}
        
        {}
        {renderInputToolbar()}
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  chatContainer: {
    flex: 1,
  },
  chatContent: {
    paddingVertical: 16,
  },
  messageBubble: {
    flexDirection: 'row',
    marginVertical: 4,
    marginHorizontal: 8,
    alignItems: 'flex-end',
  },
  userBubble: {
    justifyContent: 'flex-end',
  },
  aiBubble: {
    justifyContent: 'flex-start',
  },
  bubbleSurface: {
    padding: 10,
    borderRadius: 16,
    maxWidth: '80%',
    elevation: 1,
  },
  userBubbleSurface: {
    backgroundColor: '#6200ee',
  },
  aiBubbleSurface: {
    backgroundColor: '#f0f0f0',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 24,
  },
  userText: {
    color: '#fff',
  },
  aiText: {
    color: '#000',
  },
  avatar: {
    marginRight: 8,
  },
  speakingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    marginLeft: 16,
  },
  speakingText: {
    marginLeft: 8,
    color: '#666',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  input: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 100,
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tasksContainer: {
    margin: 8,
    padding: 12,
    borderRadius: 8,
  },
  taskTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 8,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  taskChip: {
    margin: 4,
  }
});

export default AIAssistant; 