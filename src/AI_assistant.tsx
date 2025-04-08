import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
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
import CustomIcon from './components/CustomIcon';
import { MixedVoiceService } from './services/MixedVoiceService';
import { TaskService } from './services/TaskService';
import { Task } from './types/Task';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

// 定义消息接口
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

// AI助手界面组件
const AIAssistant: React.FC<AIAssistantProps> = ({ route, navigation }) => {
  const theme = useTheme();
  
  // 从路由参数中获取语音文本
  const initialSpeechText = route?.params?.speechText || '';
  
  // 状态管理
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState(initialSpeechText);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  
  // 引用
  const scrollViewRef = useRef<ScrollView>(null);
  
  // 用户和AI ID常量
  const USER_ID = 'user';
  const AI_ID = 'ai_assistant';
  
  // 初始化
  useEffect(() => {
    // 初始欢迎消息
    const welcomeMessage: Message = {
      id: Date.now().toString(),
      text: '你好！我是你的家务助手，有什么可以帮助你的吗？',
      createdAt: new Date(),
      author: {
        id: AI_ID,
        firstName: '小助手',
        imageUrl: require('./assets/images/ai_assistant.png'),
      },
      type: 'text',
    };
    
    setMessages([welcomeMessage]);
    
    // 获取任务列表
    try {
      const tasks = TaskService.getAllTasks();
      setTasks(tasks);
    } catch (error) {
      console.error('获取任务列表失败:', error);
    }
    
    // 如果有初始语音文本，则处理它
    if (initialSpeechText) {
      handleSendMessage(initialSpeechText);
    }
  }, []);
  
  // 滚动到底部
  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);
  
  // 开始语音识别
  const startListening = async () => {
    if (isListening) return;
    
    try {
      setIsListening(true);
      console.log('开始语音识别...');
      
      // 等待UI更新后再执行
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // 在一个全局try-catch块中包装所有可能导致崩溃的代码
      try {
        // 开始录音
        await MixedVoiceService.startRecording();
      } catch (recordingError) {
        console.error('录音过程中发生严重错误:', recordingError);
        // 不要让应用崩溃，只是显示错误并重置状态
        setIsListening(false);
        
        // 显示友好的错误信息
        if (Platform.OS === 'android') {
          ToastAndroid.show('语音输入功能暂时不可用，请稍后再试', ToastAndroid.LONG);
        }
        return;
      }
      
    } catch (error) {
      // 捕获所有其他错误
      console.error('开始语音输入时发生未知错误:', error);
      setIsListening(false);
    }
  };
  
  // 停止语音识别
  const stopListening = async () => {
    if (!isListening) return;
    
    try {
      console.log('停止语音识别...');
      
      // 在全局try-catch块中包装所有代码
      try {
        // 停止录音并获取识别结果
        const recognizedText = await MixedVoiceService.stopRecording();
        
        if (recognizedText) {
          setInputText(recognizedText);
          handleSendMessage(recognizedText);
        } else {
          console.log('没有识别到文本');
          if (Platform.OS === 'android') {
            ToastAndroid.show('没有识别到语音，请重试', ToastAndroid.SHORT);
          }
        }
      } catch (recordingError) {
        console.error('停止录音过程中发生严重错误:', recordingError);
        // 只显示错误，不让应用崩溃
        if (Platform.OS === 'android') {
          ToastAndroid.show('语音识别功能暂时不可用，请稍后再试', ToastAndroid.LONG);
        }
      }
    } catch (error) {
      console.error('停止语音输入时发生未知错误:', error);
    } finally {
      // 确保无论如何都重置状态
      setIsListening(false);
    }
  };
  
  // 生成AI回复
  const generateAIResponse = (userMessage: string): Promise<string> => {
    return new Promise((resolve) => {
      // 模拟AI处理延迟
      setTimeout(() => {
        // 任务查询逻辑
        if (userMessage.includes('今晚') && userMessage.includes('做什么')) {
          const pendingTasks = TaskService.getPendingTasks();
          if (pendingTasks.length > 0) {
            const taskList = pendingTasks.map((task: Task) => task.title).join('、');
            resolve(`今晚你需要完成这些任务：${taskList}。需要我帮你安排顺序吗？`);
          } else {
            resolve('今晚没有待完成的任务，你可以好好休息了！');
          }
        } 
        // 添加任务逻辑
        else if (userMessage.includes('提醒我') || userMessage.includes('添加任务')) {
          const taskMatch = userMessage.match(/提醒我(.+)/) || userMessage.match(/添加任务(.+)/);
          if (taskMatch && taskMatch[1]) {
            const newTask = TaskService.addTask(taskMatch[1].trim());
            setTasks(TaskService.getAllTasks());
            resolve(`好的，我已经添加了任务：${newTask.title}`);
          } else {
            resolve('抱歉，我没有理解你想添加什么任务，能再说一次吗？');
          }
        }
        // 完成任务逻辑
        else if (userMessage.includes('完成') || userMessage.includes('做完了')) {
          const allTasks = TaskService.getAllTasks();
          for (const task of allTasks) {
            if (userMessage.includes(task.title)) {
              const updatedTask = TaskService.updateTaskStatus(task.id, true);
              if (updatedTask) {
                setTasks(TaskService.getAllTasks());
                resolve(`太棒了！你已经完成了"${updatedTask.title}"，今天辛苦了，喝杯奶茶奖励自己吧！`);
                return;
              }
            }
          }
          resolve('请告诉我你完成了哪项具体的任务，这样我可以更新你的任务列表。');
        }
        // 默认回复
        else {
          resolve('我可以帮你查看任务、添加任务或者标记任务为已完成。有什么需要我帮忙的吗？');
        }
      }, 1000);
    });
  };
  
  // 处理发送消息
  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;
    
    // 创建用户消息
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
    
    // 更新消息列表
    setMessages(prevMessages => [...prevMessages, userMessage]);
    
    // 清空输入框
    setInputText('');
    
    // 获取AI回复
    const aiResponse = await generateAIResponse(text);
    
    // 创建AI消息
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
    
    // 更新消息列表
    setMessages(prevMessages => [...prevMessages, aiMessage]);
    
    // 设置正在说话状态
    setIsSpeaking(true);
    
    try {
      // 使用服务端语音合成播放AI回复
      await MixedVoiceService.speak(aiResponse, {
        voice: 'xiaoyan',
        speed: 0,
        volume: 80,
        pitch: 5,
        region: 'shanghai'
      });
    } catch (error) {
      console.error('语音合成失败:', error);
    } finally {
      // 无论如何都要重置状态
      setIsSpeaking(false);
    }
  };
  
  // 渲染输入栏
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
  
  // 渲染任务列表
  const renderTaskList = () => {
    const pendingTasks = TaskService.getPendingTasks();
    
    if (pendingTasks.length === 0) return null;
    
    return (
      <Surface style={styles.tasksContainer}>
        <Text style={styles.taskTitle}>待完成任务：</Text>
        <View style={styles.chipContainer}>
          {pendingTasks.map((task: Task) => (
            <Chip
              key={task.id}
              icon="checkbox-blank-circle-outline"
              mode="outlined"
              style={styles.taskChip}
              onPress={() => {
                TaskService.updateTaskStatus(task.id, true);
                setTasks(TaskService.getAllTasks());
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
  
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <SafeAreaView style={styles.container}>
        {/* 聊天列表 */}
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
                  source={require('./assets/images/ai_assistant.png')}
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
          {/* 当AI正在说话时显示指示器 */}
          {isSpeaking && (
            <View style={styles.speakingIndicator}>
              <ActivityIndicator size={20} color={theme.colors.primary} />
              <Text style={styles.speakingText}>AI正在说话...</Text>
            </View>
          )}
        </ScrollView>
        
        {/* 任务列表 */}
        {renderTaskList()}
        
        {/* 输入工具栏 */}
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
  },
});

export default AIAssistant; 