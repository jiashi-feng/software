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
  IconButton,
  TextInput,
  Button,
  Menu,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import ConfettiCannon from 'react-native-confetti-cannon';
import { useAuth } from './store/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FamilyTaskDetail = ({ navigation }) => {
  const { userInfo, updateUserInfo } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [selectedAssignee, setSelectedAssignee] = useState(null);
  const [showAssigneeMenu, setShowAssigneeMenu] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showSubtitle, setShowSubtitle] = useState(false);
  const confettiRef = useRef(null);

  const familyMembers = ['我'];

  // Load tasks from AsyncStorage on component mount
  useEffect(() => {
    const loadTasks = async () => {
      try {
        const savedTasks = await AsyncStorage.getItem('familyTasks');
        if (savedTasks) {
          const parsedTasks = JSON.parse(savedTasks);
          // Recreate Animated.Value for each task
          const tasksWithAnimation = parsedTasks.map(task => ({
            ...task,
            animationValue: new Animated.Value(0)
          }));
          setTasks(tasksWithAnimation);
        } else {
          // Initialize with default tasks if no saved tasks
          const defaultTasks = [
            {
              id: 1,
              content: '整理杂物',
              completed: false,
              points: 30,
              deadline: '今天 18:00',
              assignee: '妈妈',
              animationValue: new Animated.Value(0),
            },
            {
              id: 2,
              content: '修理水管',
              completed: false,
              points: 40,
              deadline: '今天 20:00',
              assignee: '爸爸',
              animationValue: new Animated.Value(0),
            },
            {
              id: 3,
              content: '打扫卫生间',
              completed: false,
              points: 25,
              deadline: '明天 10:00',
              assignee: '我',
              animationValue: new Animated.Value(0),
            },
          ];
          setTasks(defaultTasks);
          await AsyncStorage.setItem('familyTasks', JSON.stringify(defaultTasks));
        }
      } catch (error) {
        console.error('Error loading family tasks:', error);
      }
    };

    loadTasks();
  }, []);

  const handleTaskToggle = async (taskId) => {
    const updatePoints = async (points) => {
      try {
        await updateUserInfo({ points: String(points) });
        // Save points to both ranking and personal storage
        await Promise.all([
          AsyncStorage.setItem('myPoints', String(points)),
          AsyncStorage.setItem('userPoints', String(points))
        ]);
      } catch (error) {
        console.error('Failed to update points:', error);
        Alert.alert('更新失败', '积分更新失败，请重试');
        throw error;
      }
    };

    // Find the task first
    const taskToUpdate = tasks.find(task => task.id === taskId);
    if (!taskToUpdate) return;

    const newCompletedState = !taskToUpdate.completed;
    
    // Handle points update if task is being completed
    if (newCompletedState) {
      const currentPoints = parseInt(userInfo?.points ?? '0', 10);
      const newPoints = currentPoints + taskToUpdate.points;
      
      try {
        await updatePoints(newPoints);
        
        setShowConfetti(true);
        setShowSubtitle(true);
        Animated.timing(taskToUpdate.animationValue, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start(() => {
          taskToUpdate.animationValue.setValue(0);
        });

        setTimeout(() => {
          setShowSubtitle(false);
        }, 3000);
      } catch (error) {
        return; // Don't update task if points update fails
      }
    }

    // Update the tasks array
    const updatedTasks = tasks.map(task => 
      task.id === taskId 
        ? { ...task, completed: newCompletedState }
        : task
    );

    setTasks(updatedTasks);
    try {
      await AsyncStorage.setItem('familyTasks', JSON.stringify(updatedTasks));
    } catch (error) {
      console.error('Error saving family tasks:', error);
    }
  };

  const handleAddTask = async () => {
    if (newTask.trim() && selectedAssignee) {
      const newTaskObj = {
        id: Date.now(),
        content: newTask.trim(),
        completed: false,
        points: 20,
        deadline: '今天 20:00',
        assignee: selectedAssignee,
        animationValue: new Animated.Value(0),
      };
      
      const updatedTasks = [...tasks, newTaskObj];
      setTasks(updatedTasks);
      setNewTask('');
      setSelectedAssignee(null);
      setIsAddingTask(false);
      
      // Save updated tasks to AsyncStorage
      try {
        await AsyncStorage.setItem('familyTasks', JSON.stringify(updatedTasks));
      } catch (error) {
        console.error('Error saving family tasks:', error);
      }
    }
  };

  const TaskItem = ({ task, onToggle }) => {
    const animatedStyle = {
      opacity: task.animationValue,
      transform: [{
        scale: task.animationValue.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 1.2],
        }),
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
          <View style={styles.taskContent}>
            <Text style={[styles.taskText, task.completed && styles.completedTaskText]}>
              {task.content}
            </Text>
            <Text style={styles.assigneeText}>指派给：{task.assignee}</Text>
          </View>
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
          />
          <Menu
            visible={showAssigneeMenu}
            onDismiss={() => setShowAssigneeMenu(false)}
            anchor={
              <Button
                mode="outlined"
                onPress={() => setShowAssigneeMenu(true)}
                style={styles.assigneeButton}
              >
                {selectedAssignee || '选择指派对象'}
              </Button>
            }
          >
            {familyMembers.map(member => (
              <Menu.Item
                key={member}
                onPress={() => {
                  setSelectedAssignee(member);
                  setShowAssigneeMenu(false);
                }}
                title={member}
              />
            ))}
          </Menu>
          <View style={styles.addTaskButtons}>
            <Button
              mode="text"
              onPress={() => {
                setIsAddingTask(false);
                setSelectedAssignee(null);
              }}
              style={styles.cancelButton}
            >
              取消
            </Button>
            <Button
              mode="contained"
              onPress={handleAddTask}
              disabled={!newTask.trim() || !selectedAssignee}
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
          添加家庭任务
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
    marginTop: 20,
    flex: 1,
    paddingHorizontal: 16,
  },
  taskBox: {
    marginBottom: 20,
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
    backgroundColor: '#FFF',
  },
  taskMain: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  taskContent: {
    flex: 1,
    marginLeft: 12,
  },
  taskText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
  assigneeText: {
    fontSize: 13,
    color: '#666',
  },
  taskInfo: {
    flexDirection: 'row',
    marginLeft: 36,
    marginTop: 4,
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
    backgroundColor: '#FFF9E6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  pointsText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#FFA000',
    fontWeight: '500',
  },
  deadlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  deadlineText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#666',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#9B7EDE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#9B7EDE',
    borderColor: '#9B7EDE',
  },
  completedTaskText: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  addTaskContainer: {
    padding: 16,
    margin: 16,
    borderRadius: 12,
    backgroundColor: '#FFF',
    elevation: 2,
  },
  addTaskInput: {
    marginBottom: 12,
    backgroundColor: '#FFF',
  },
  assigneeButton: {
    marginBottom: 12,
  },
  addTaskButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  cancelButton: {
    marginRight: 12,
  },
  confirmButton: {
    backgroundColor: '#9B7EDE',
  },
  addButton: {
    margin: 16,
    marginTop: 8,
    backgroundColor: '#9B7EDE',
    borderRadius: 8,
    elevation: 2,
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

export default FamilyTaskDetail; 