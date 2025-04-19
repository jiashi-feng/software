import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Text as RNText,
  Alert,
} from 'react-native';
import {
  Text,
  Surface,
  TextInput,
  Button,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import ConfettiCannon from 'react-native-confetti-cannon';
import { useAuth } from './store/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './services/api';

const TaskDetail = ({ navigation }) => {
  const { userInfo, updateUserInfo } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showSubtitle, setShowSubtitle] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const confettiRef = useRef(null);

  // 加载任务（先尝试从后端获取推荐任务，如失败则从本地加载）
  useEffect(() => {
    const loadTasks = async () => {
      setIsLoading(true);
      try {
        // 首先尝试加载本地任务作为备份
        await loadLocalTasks();
        
        // 然后检查任务服务是否可用
        const isTaskServiceAvailable = await api.checkTaskServiceHealth();
        
        if (isTaskServiceAvailable) {
          try {
            // 如果可用，获取推荐任务
            const recommendedTasks = await api.task.getRecommendedTasks();
            if (recommendedTasks && recommendedTasks.length > 0) {
              // 添加动画值到每个任务
              const tasksWithAnimation = recommendedTasks.map(task => ({
                ...task,
                id: task.id || task._id,
                content: task.title || task.content,
                animationValue: new Animated.Value(0),
                completed: task.completed || false,
                points: task.points || 20,
                deadline: task.deadline || '今天 18:00'
              }));
              setTasks(tasksWithAnimation);
              
              // 保存到本地作为备份
              await saveTasksToStorage(tasksWithAnimation);
            }
          } catch (apiError) {
            console.log('获取推荐任务失败，使用已加载的本地任务');
            // 使用之前加载的本地任务，无需操作
          }
        } else {
          console.log('任务服务不可用，使用本地任务');
          // 已经加载了本地任务，无需操作
        }
      } catch (error) {
        console.log('任务加载过程出错，使用默认任务');
        // 加载默认任务
        const defaultTasks = [
          { 
            id: 1, 
            content: '整理杂物', 
            completed: false,
            points: 30,
            deadline: '今天 18:00',
            animationValue: new Animated.Value(0),
          },
          { 
            id: 2, 
            content: '扫地', 
            completed: false,
            points: 20,
            deadline: '今天 20:00',
            animationValue: new Animated.Value(0),
          },
          { 
            id: 3, 
            content: '拖地', 
            completed: false,
            points: 25,
            deadline: '明天 10:00',
            animationValue: new Animated.Value(0),
          },
          { 
            id: 4, 
            content: '擦桌子', 
            completed: false,
            points: 15,
            deadline: '今天 19:00',
            animationValue: new Animated.Value(0),
          },
          { 
            id: 5, 
            content: '清理垃圾', 
            completed: false,
            points: 10,
            deadline: '今天 21:00',
            animationValue: new Animated.Value(0),
          },
        ];
        setTasks(defaultTasks);
        await saveTasksToStorage(defaultTasks);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadTasks();
  }, []);
  
  // 从本地加载任务的辅助函数
  const loadLocalTasks = async () => {
    try {
      const savedTasks = await AsyncStorage.getItem('tasks');
      if (savedTasks) {
        const parsedTasks = JSON.parse(savedTasks);
        // 始终为每个任务创建新的动画值，因为动画值不能序列化
        const tasksWithAnimation = parsedTasks.map(task => ({
          ...task,
          animationValue: new Animated.Value(0)
        }));
        setTasks(tasksWithAnimation);
        return true;
      }
      return false;
    } catch (error) {
      console.log('读取本地任务失败:', error);
      return false;
    }
  };

  // 修改保存任务到AsyncStorage的方法，移除不可序列化的属性
  const saveTasksToStorage = async (tasksToSave) => {
    try {
      // 在保存前移除不可序列化的animationValue属性
      const serializableTasks = tasksToSave.map(({ animationValue, ...task }) => task);
      await AsyncStorage.setItem('tasks', JSON.stringify(serializableTasks));
      return true;
    } catch (error) {
      console.log('保存任务到本地失败:', error);
      return false;
    }
  };

  const handleTaskToggle = async (taskId) => {
    try {
      const taskToToggle = tasks.find(task => task.id.toString() === taskId.toString());
      if (!taskToToggle) return;
      
      const newCompletedState = !taskToToggle.completed;
      const currentPoints = parseInt(userInfo?.points ?? '0', 10);
      let newPoints;
      
      if (newCompletedState) {
        newPoints = currentPoints + taskToToggle.points;
        setShowConfetti(true);
        setShowSubtitle(true);
        
        Animated.timing(taskToToggle.animationValue, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start(() => {
          taskToToggle.animationValue.setValue(0);
        });

        setTimeout(() => {
          setShowSubtitle(false);
        }, 3000);
        
        // 尝试更新后端任务状态，但不阻止本地更新
        const isTaskServiceAvailable = await api.checkTaskServiceHealth();
        if (isTaskServiceAvailable) {
          try {
            await api.task.updateTask(taskId, { completed: true });
          } catch (apiError) {
            // 静默处理API错误，确保UI流程不中断
            console.log('更新后端任务状态失败，仅更新本地状态');
          }
        }
      } else {
        newPoints = currentPoints - taskToToggle.points;
      }

      // 更新用户积分
      try {
        await updateUserInfo({ points: String(newPoints) });
      } catch (pointsError) {
        // 如果更新用户信息失败，显示提示但继续更新任务状态
        console.log('更新用户积分失败:', pointsError);
        Alert.alert('注意', '积分更新可能未保存');
      }
      
      // 更新本地任务状态
      const updatedTasks = tasks.map(task => {
        if (task.id.toString() === taskId.toString()) {
          return { ...task, completed: newCompletedState };
        }
        return task;
      });
      
      setTasks(updatedTasks);
      
      // 保存到本地存储
      await saveTasksToStorage(updatedTasks);
    } catch (error) {
      console.log('任务处理过程出错:', error);
      Alert.alert('操作失败', '任务状态更新失败，请重试');
    }
  };

  const handleAddTask = async () => {
    if (!newTask.trim()) return;
    
    try {
      setIsLoading(true);
      const newTaskObj = {
        id: Date.now().toString(),
        content: newTask,
        completed: false,
        points: 15, // 默认积分
        deadline: '今天',
        animationValue: new Animated.Value(0)
      };
      
      const updatedTasks = [...tasks, newTaskObj];
      setTasks(updatedTasks);
      setNewTask('');
      setIsAddingTask(false);
      
      // 保存到本地存储
      await saveTasksToStorage(updatedTasks);
      
      // 尝试同步到后端，但不阻止本地添加流程
      try {
        const isTaskServiceAvailable = await api.checkTaskServiceHealth();
        if (isTaskServiceAvailable) {
          await api.task.createTask({
            title: newTask,
            points: 15,
            deadline: new Date(Date.now() + 24*60*60*1000).toISOString() // 默认1天后截止
          });
        }
      } catch (apiError) {
        console.log('同步任务到后端失败，已保存在本地');
        // 不影响用户体验，静默处理
      }
    } catch (error) {
      console.log('添加任务失败:', error);
      Alert.alert('添加失败', '无法添加任务，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  const TaskItem = ({ task, onToggle }) => {
    // 安全地使用动画值，确保task.animationValue一定是Animated.Value实例
    const animatedScale = task.animationValue ? task.animationValue.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 1.2],
    }) : 1;

    const animatedStyle = {
      opacity: task.animationValue || 1,
      transform: [{
        scale: animatedScale,
      }],
    };

    return (
      <View style={styles.taskItem}>
        <View style={styles.taskMain}>
          <TouchableOpacity
            style={[styles.checkbox, task.completed && styles.checkboxChecked]}
            onPress={() => onToggle(task.id)}
          >
            {task.completed && <Icon name="check" size={16} color="#FFF" />}
          </TouchableOpacity>
          <Text style={[styles.taskText, task.completed && styles.completedTaskText]}>
            {task.content}
          </Text>
        </View>
        {task.completed && (
          <Animated.View style={[styles.completedMessage, animatedStyle]}>
            <Text style={styles.completedText}>已完成</Text>
          </Animated.View>
        )}
        <View style={styles.taskInfo}>
          <View style={styles.pointsContainer}>
            <Icon name="star" size={16} color="#FFC107" />
            <Text style={styles.pointsText}>{task.points}</Text>
          </View>
          <View style={styles.deadlineContainer}>
            <Icon name="clock-outline" size={16} color="#666" />
            <Text style={styles.deadlineText}>{task.deadline}</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <LinearGradient
      colors={['#E6E6FA', '#D8BFD8']}
      style={styles.container}
    >
      {showConfetti && (
        <View style={styles.confettiContainer}>
          <ConfettiCannon
            count={200}
            origin={{ x: 0, y: 0 }}
            ref={confettiRef}
            onAnimationEnd={() => setShowConfetti(false)}
          />
        </View>
      )}
      {showSubtitle && (
        <View style={styles.subtitleContainer}>
          <RNText style={styles.subtitleText}>
            已完成一项任务,离成功更近一步
          </RNText>
        </View>
      )}
      <ScrollView style={styles.content}>
        <Surface style={styles.taskBox}>
          <View style={styles.boxHeader}>
            <Text style={styles.boxTitle}>待处理</Text>
          </View>
          {tasks.filter(task => !task.completed).map(task => (
            <TaskItem 
              key={task.id} 
              task={task} 
              onToggle={handleTaskToggle}
            />
          ))}
        </Surface>

        <Surface style={styles.taskBox}>
          <View style={styles.boxHeader}>
            <Text style={styles.boxTitle}>已完成</Text>
          </View>
          {tasks.filter(task => task.completed).map(task => (
            <TaskItem 
              key={task.id} 
              task={task} 
              onToggle={handleTaskToggle}
            />
          ))}
        </Surface>
      </ScrollView>

      {isAddingTask ? (
        <Surface style={styles.addTaskContainer}>
          <TextInput
            placeholder="输入新任务..."
            value={newTask}
            onChangeText={setNewTask}
            style={styles.addTaskInput}
            mode="outlined"
            autoFocus
          />
          <View style={styles.addTaskButtons}>
            <Button
              mode="text"
              onPress={() => setIsAddingTask(false)}
              style={styles.cancelButton}
            >
              取消
            </Button>
            <Button
              mode="contained"
              onPress={handleAddTask}
              disabled={!newTask.trim()}
              style={styles.confirmButton}
            >
              确认
            </Button>
          </View>
        </Surface>
      ) : (
        <Button
          mode="contained"
          onPress={() => setIsAddingTask(true)}
          style={styles.addButton}
          icon="plus"
        >
          添加新任务
        </Button>
      )}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  taskBox: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
  },
  boxHeader: {
    backgroundColor: '#9B7EDE',
    padding: 12,
  },
  boxTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  taskItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  taskMain: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  taskInfo: {
    flexDirection: 'row',
    marginLeft: 36, 
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  pointsText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#666',
  },
  deadlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deadlineText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#666',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#9B7EDE',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#9B7EDE',
    borderColor: '#9B7EDE',
  },
  taskText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  completedTaskText: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  addTaskContainer: {
    padding: 16,
    margin: 16,
    borderRadius: 12,
  },
  addTaskInput: {
    marginBottom: 12,
  },
  addTaskButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  cancelButton: {
    marginRight: 8,
  },
  confirmButton: {
    backgroundColor: '#9B7EDE',
  },
  addButton: {
    margin: 16,
    backgroundColor: '#9B7EDE',
    borderRadius: 8,
  },
  completedMessage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    marginBottom: 8,
  },
  completedText: {
    fontSize: 14,
    color: '#4CAF50',
  },
  confettiContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
  },
  subtitleContainer: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 20,
  },
  subtitleText: {
    fontSize: 18,
    color: '#4CAF50',
    textAlign: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: 10,
    borderRadius: 8,
  },
});

export default TaskDetail;