import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableWithoutFeedback,
  Image,
  Platform,
  PermissionsAndroid,
  Dimensions,
  PanResponder,
  GestureResponderEvent,
  PanResponderGestureState,
} from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  Easing,
  withSpring,
} from 'react-native-reanimated';
import { useVirtualAICompanion } from './VirtualAICompanionProvider';
import api from '../services/api';
import {CommonImages} from '../assets/images';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface VirtualAICompanionProps {
  size?: number;
  position?: 'left' | 'right';
}

const navigationEvents = {
  listeners: new Set<(screenName: string, params?: any) => void>(),
  
  addListener(callback: (screenName: string, params?: any) => void) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  },
  
  navigate(screenName: string, params?: any) {
    this.listeners.forEach(listener => listener(screenName, params));
  }
};

export const AICompanionNavigationEvents = navigationEvents;

const WARM_COLORS = {
  primaryBg: '#FF9EB3',  
  secondaryBg: '#FFC7D9', 
  accent: '#FFEBF1',     
  shadow: '#FFB6C1',     
  indicator: '#FF5E8F',  
};

const VirtualAICompanion: React.FC<VirtualAICompanionProps> = ({
  size = 80,
  position = 'right',
}) => {
  
  const [isExpanded, setIsExpanded] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechText, setSpeechText] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  
  
  const [positionX, setPositionX] = useState(position === 'right' ? screenWidth - size / 2 : size / 2);
  const [positionY, setPositionY] = useState(screenHeight * 0.5);
  
  
  const hiddenOffset = size * 0.5;
  
  
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.8);
  
  
  const handleSpeechResult = (recognizedText: string) => {
    setSpeechText(recognizedText);
    
    
    if (recognizedText.includes('助手') || recognizedText.includes('对话')) {
      navigateToAIAssistant();
    }
  };
  
  
  const requestMicrophonePermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: '需要麦克风权限',
            message: '要使用语音功能，应用需要访问您的麦克风',
            buttonPositive: '确定',
            buttonNegative: '取消',
          },
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.error('请求麦克风权限失败:', err);
        return false;
      }
    }
    return true;
  };
  
  /**
   * 开始语音输入
   */
  const startListening = async () => {
    if (isListening) return;
    
    setIsListening(true);
    try {
      // 短暂延迟以确保UI更新
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // 检查麦克风权限
      const hasPermission = await requestMicrophonePermission();
      if (!hasPermission) {
        console.error('没有麦克风权限');
        setIsListening(false);
        return;
      }
      
      // 检查语音服务是否可用
      const isVoiceServiceAvailable = await api.checkVoiceServiceHealth();
      
      // 开始录音
      await api.audio.startRecording();
    } catch (error) {
      console.error('启动语音识别失败:', error);
      setIsListening(false);
    }
  };
  
  /**
   * 停止语音输入并识别
   */
  const stopListening = async () => {
    if (!isListening) return;
    
    try {
      // 检查语音服务是否可用
      const isVoiceServiceAvailable = await api.checkVoiceServiceHealth();
      let recognizedText = '';
      
      if (isVoiceServiceAvailable) {
        // 停止录音并获取音频数据
        const audioData = await api.audio.stopRecording();
        
        // 如果有音频数据，发送到API服务进行语音识别
        if (audioData) {
          try {
            const response = await api.voice.speechToText(audioData);
            recognizedText = response.text || '';
          } catch (apiError) {
            console.error('API语音识别失败:', apiError);
            // 如果API识别失败，使用本地结果
            recognizedText = audioData;
          }
        }
      } else {
        // 如果API服务不可用，使用本地识别
        recognizedText = await api.audio.stopRecording();
      }
      
      if (recognizedText) {
        setSpeechText(recognizedText);
        handleSpeechResult(recognizedText);
      }
    } catch (error) {
      console.error('语音识别处理失败:', error);
    } finally {
      setIsListening(false);
    }
  };
  
  /**
   * 处理AI响应
   * @param text 响应文本
   */
  const speakResponse = async (text: string) => {
    if (text && text.trim()) {
      try {
        // 检查语音服务是否可用
        const isVoiceServiceAvailable = await api.checkVoiceServiceHealth();
        
        if (isVoiceServiceAvailable) {
          const options = {
            voice: 'xiaoyan',
            speed: 0,
            volume: 80,
            pitch: 5,
            region: 'shanghai'
          };
          
          try {
            // 调用API进行语音合成
            await api.voice.textToSpeech(text, options);
          } catch (apiError) {
            console.error('API语音合成失败:', apiError);
            // 失败时回退到本地语音合成
            await api.audio.speak(text, options);
          }
        } else {
          // 如果API服务不可用，使用本地语音合成
          await api.audio.speak(text, {
            voice: 'xiaoyan',
            speed: 0,
            volume: 80,
            pitch: 5,
            region: 'shanghai'
          });
        }
      } catch (error) {
        console.error('语音合成失败:', error);
      }
    }
  };
  
  
  const navigateToAIAssistant = () => {
    try {
      
      scale.value = withSpring(1.2, { damping: 10 }, () => {
        scale.value = withSpring(1);
      });
      
      
      navigationEvents.navigate('AIAssistant', { speechText });
      
      
      setSpeechText('');
      
      
      setTimeout(() => {
        toggleExpand(false);
      }, 500);
    } catch (error) {
      
    }
  };
  
  
  const toggleExpand = (expand = !isExpanded) => {
    setIsExpanded(expand);
    
    if (expand) {
      
      if (positionX > screenWidth / 2) {
        
        setPositionX(screenWidth - size / 2);
      } else {
        
        setPositionX(size / 2);
      }
      
      opacity.value = withTiming(1, { duration: 200 });
      scale.value = withSpring(1.1, { damping: 10 }, () => {
        scale.value = withSpring(1);
      });
    } else {
      
      if (positionX > screenWidth / 2) {
        
        setPositionX(screenWidth - size / 2 + hiddenOffset);
      } else {
        
        setPositionX(size / 2 - hiddenOffset);
      }
      opacity.value = withTiming(0.8, { duration: 200 });
    }
  };
  
  
  const handlePress = () => {
    if (isDragging) return;
    
    if (!isExpanded) {
      
      toggleExpand(true);
      
      
      setTimeout(() => {
        navigateToAIAssistant();
      }, 300);
    } else {
      
      navigateToAIAssistant();
    }
  };
  
  
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        setIsDragging(false);
        toggleExpand(true); 
      },
      onPanResponderMove: (e: GestureResponderEvent, gestureState: PanResponderGestureState) => {
        
        if (Math.abs(gestureState.dx) > 5 || Math.abs(gestureState.dy) > 5) {
          setIsDragging(true);
        }
        
        
        let newX = positionX + gestureState.dx;
        let newY = positionY + gestureState.dy;
        
        
        if (newX < size / 2) newX = size / 2;
        if (newX > screenWidth - size / 2) newX = screenWidth - size / 2;
        if (newY < size / 2) newY = size / 2;
        if (newY > screenHeight - size / 2) newY = screenHeight - size / 2;
        
        
        setPositionX(newX);
        setPositionY(newY);
      },
      onPanResponderRelease: () => {
        
        setTimeout(() => {
          setIsDragging(false);
          
          
          if (positionX < 50) {
            
            setPositionX(size / 2 - hiddenOffset);
            toggleExpand(false);
          } else if (positionX > screenWidth - 50) {
            
            setPositionX(screenWidth - size / 2 + hiddenOffset);
            toggleExpand(false);
          }
        }, 100);
      },
    })
  ).current;
  
  
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: scale.value },
      ],
      opacity: opacity.value,
    };
  });
  
  
  const handleConversationEnd = async (result: { text?: string }) => {
    
    setIsExpanded(false);
    if (result.text) {
      speakResponse(result.text);
    }
  };
  
  return (
    <Animated.View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          left: positionX - size / 2, 
          top: positionY - size / 2, 
        },
        animatedStyle,
      ]}
      {...panResponder.panHandlers}
    >
      <TouchableWithoutFeedback onPress={handlePress}>
        <View style={styles.innerContainer}>
          <Image
            source={CommonImages.ai_assistant}
            style={styles.image}
            resizeMode="cover"
          />
          {isListening && (
            <View style={styles.listeningIndicator} />
          )}
        </View>
      </TouchableWithoutFeedback>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    backgroundColor: WARM_COLORS.primaryBg,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: WARM_COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 8,
    zIndex: 1000,
    borderWidth: 3,
    borderColor: WARM_COLORS.secondaryBg,
  },
  innerContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 40,
    overflow: 'hidden',
  },
  image: {
    width: '80%',
    height: '80%',
    borderRadius: 40,
  },
  listeningIndicator: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: WARM_COLORS.indicator,
  },
});

export default VirtualAICompanion; 