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
import { ServerVoiceService } from '../services/ServerVoiceService';

// 获取屏幕尺寸
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// 定义虚拟AI伙伴的属性接口
interface VirtualAICompanionProps {
  size?: number;
  position?: 'left' | 'right';
}

// 创建一个事件发布订阅机制
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

// 导出导航事件，供外部组件使用
export const AICompanionNavigationEvents = navigationEvents;

// 温馨的颜色
const WARM_COLORS = {
  primaryBg: '#FF9EB3',  // 粉色
  secondaryBg: '#FFC7D9', // 浅粉色
  accent: '#FFEBF1',     // 极浅粉色
  shadow: '#FFB6C1',     // 粉色阴影
  indicator: '#FF5E8F',  // 指示器颜色
};

const VirtualAICompanion: React.FC<VirtualAICompanionProps> = ({
  size = 80,
  position = 'right',
}) => {
  // 状态管理
  const [isExpanded, setIsExpanded] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechText, setSpeechText] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  
  // 位置状态
  const [positionX, setPositionX] = useState(position === 'right' ? screenWidth - size / 2 : size / 2);
  const [positionY, setPositionY] = useState(screenHeight * 0.5);
  
  // 半隐藏的偏移量 (显示一半)
  const hiddenOffset = size * 0.5;
  
  // 创建动画值
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.8);
  
  // 处理语音识别结果
  const handleSpeechResult = (recognizedText: string) => {
    setSpeechText(recognizedText);
    
    // 在这里可以处理语音命令，例如导航到AI对话界面
    if (recognizedText.includes('助手') || recognizedText.includes('对话')) {
      navigateToAIAssistant();
    }
  };
  
  // 请求麦克风权限
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
        console.error(err);
        return false;
      }
    }
    return true;
  };
  
  // 开始语音识别
  const startListening = async () => {
    const hasPermission = await requestMicrophonePermission();
    if (!hasPermission) return;
    
    try {
      setIsListening(true);
      await ServerVoiceService.startRecording();
    } catch (e) {
      console.error('开始语音识别失败:', e);
      setIsListening(false);
    }
  };
  
  // 停止语音识别
  const stopListening = async () => {
    try {
      setIsListening(false);
      const recognizedText = await ServerVoiceService.stopRecording();
      if (recognizedText) {
        handleSpeechResult(recognizedText);
      }
    } catch (e) {
      console.error('停止语音识别失败:', e);
    }
  };
  
  // 使用服务端TTS播放文本
  const speak = (text: string) => {
    ServerVoiceService.speak(text);
  };
  
  // 导航到AI助手界面
  const navigateToAIAssistant = () => {
    try {
      // 使用动画效果
      scale.value = withSpring(1.2, { damping: 10 }, () => {
        scale.value = withSpring(1);
      });
      
      // 使用事件系统触发导航事件
      navigationEvents.navigate('AIAssistant', { speechText });
      
      // 重置语音文本
      setSpeechText('');
      
      // 展开后重新收回
      setTimeout(() => {
        toggleExpand(false);
      }, 500);
    } catch (error) {
      console.error('导航到AI助手错误:', error);
    }
  };
  
  // 展开/收起AI伙伴
  const toggleExpand = (expand = !isExpanded) => {
    setIsExpanded(expand);
    
    if (expand) {
      // 完全展示AI伙伴
      if (positionX > screenWidth / 2) {
        // 在右侧
        setPositionX(screenWidth - size / 2);
      } else {
        // 在左侧
        setPositionX(size / 2);
      }
      
      opacity.value = withTiming(1, { duration: 200 });
      scale.value = withSpring(1.1, { damping: 10 }, () => {
        scale.value = withSpring(1);
      });
    } else {
      // 半隐藏AI伙伴
      if (positionX > screenWidth / 2) {
        // 在右侧
        setPositionX(screenWidth - size / 2 + hiddenOffset);
      } else {
        // 在左侧
        setPositionX(size / 2 - hiddenOffset);
      }
      opacity.value = withTiming(0.8, { duration: 200 });
    }
  };
  
  // 处理AI伙伴点击事件
  const handlePress = () => {
    if (isDragging) return;
    
    if (!isExpanded) {
      // 先展开
      toggleExpand(true);
      
      // 然后延迟导航到AI助手界面
      setTimeout(() => {
        navigateToAIAssistant();
      }, 300);
    } else {
      // 已经展开，直接导航
      navigateToAIAssistant();
    }
  };
  
  // 创建PanResponder来处理拖动
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        setIsDragging(false);
        toggleExpand(true); // 开始拖动时展开
      },
      onPanResponderMove: (e: GestureResponderEvent, gestureState: PanResponderGestureState) => {
        // 如果移动超过一定距离，则认为是拖动
        if (Math.abs(gestureState.dx) > 5 || Math.abs(gestureState.dy) > 5) {
          setIsDragging(true);
        }
        
        // 计算新的位置
        let newX = positionX + gestureState.dx;
        let newY = positionY + gestureState.dy;
        
        // 边界检查
        if (newX < size / 2) newX = size / 2;
        if (newX > screenWidth - size / 2) newX = screenWidth - size / 2;
        if (newY < size / 2) newY = size / 2;
        if (newY > screenHeight - size / 2) newY = screenHeight - size / 2;
        
        // 更新位置
        setPositionX(newX);
        setPositionY(newY);
      },
      onPanResponderRelease: () => {
        // 拖动结束，重置拖动状态
        setTimeout(() => {
          setIsDragging(false);
          
          // 如果靠近左右边缘，则半隐藏
          if (positionX < 50) {
            // 靠近左边缘
            setPositionX(size / 2 - hiddenOffset);
            toggleExpand(false);
          } else if (positionX > screenWidth - 50) {
            // 靠近右边缘
            setPositionX(screenWidth - size / 2 + hiddenOffset);
            toggleExpand(false);
          }
        }, 100);
      },
    })
  ).current;
  
  // 定义动画样式
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: scale.value },
      ],
      opacity: opacity.value,
    };
  });
  
  return (
    <Animated.View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          left: positionX - size / 2, // 计算左边距
          top: positionY - size / 2, // 计算上边距
        },
        animatedStyle,
      ]}
      {...panResponder.panHandlers}
    >
      <TouchableWithoutFeedback onPress={handlePress}>
        <View style={styles.innerContainer}>
          <Image
            source={require('../assets/images/ai_assistant.png')}
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