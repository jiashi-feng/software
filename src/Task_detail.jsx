import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {
  Text,
  Surface,
  IconButton,
  TextInput,
  Button,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';

const TaskDetail = ({ navigation }) => {
  const [tasks, setTasks] = useState([
    { 
      id: 1, 
      content: '整理杂物', 
      completed: false,
      points: 30,
      deadline: '今天 18:00'
    },
    { 
      id: 2, 
      content: '扫地', 
      completed: false,
      points: 20,
      deadline: '今天 20:00'
    },
    { 
      id: 3, 
      content: '拖地', 
      completed: false,
      points: 25,
      deadline: '明天 10:00'
    },
    { 
      id: 4, 
      content: '擦桌子', 
      completed: false,
      points: 15,
      deadline: '今天 19:00'
    },
    { 
      id: 5, 
      content: '清理垃圾', 
      completed: false,
      points: 10,
      deadline: '今天 21:00'
    },
  ]);
  const [newTask, setNewTask] = useState('');
  const [isAddingTask, setIsAddingTask] = useState(false);

  const handleTaskToggle = (taskId) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
  };

  const handleAddTask = () => {
    if (newTask.trim()) {
      setTasks([
        ...tasks,
        {
          id: Date.now(),
          content: newTask.trim(),
          completed: false,
          points: 20, // 默认积分
          deadline: '今天 20:00' // 默认截止时间
        }
      ]);
      setNewTask('');
      setIsAddingTask(false);
    }
  };

  const TaskItem = ({ task, onToggle }) => (
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

  return (
    <LinearGradient
      colors={['#E6E6FA', '#D8BFD8']}
      style={styles.container}
    >

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
    marginLeft: 36, // 与任务内容对齐
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
});

export default TaskDetail;