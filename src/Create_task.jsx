import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
} from 'react-native';
import {
  Text,
  Surface,
  TextInput,
  Button,
  SegmentedButtons,
  Avatar,
  List,
  IconButton,
  useTheme,
} from 'react-native-paper';
import { CommonImages } from './assets/images';

const CreateTask = ({ navigation }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [points, setPoints] = useState('');
  const [priority, setPriority] = useState('medium');
  const [deadline, setDeadline] = useState('');
  const [assignee, setAssignee] = useState(null);
  const theme = useTheme();

  
  const familyMembers = [
    {
      id: 1,
      name: '张三',
      avatar: null,
    },
    {
      id: 2,
      name: '李四',
      avatar: null,
    },
    {
      id: 3,
      name: '王五',
      avatar: null,
    },
  ];

  const handleSubmit = () => {
    
    const newTask = {
      id: Date.now().toString(), 
      title,
      description,
      points: parseInt(points),
      priority,
      deadline,
      assignee,
      status: 'pending',
      createdAt: new Date().toISOString(),
      comments: [],
    };

    
    navigation.navigate('MainTabs', { 
      screen: 'Home', 
      params: { newTask } 
    });
  };

  return (
    <ScrollView style={styles.container}>
      <Surface style={styles.card}>
        <Text style={styles.sectionTitle}>基本信息</Text>
        
        <TextInput
          label="任务标题"
          value={title}
          onChangeText={setTitle}
          mode="outlined"
          style={styles.input}
        />

        <TextInput
          label="任务描述"
          value={description}
          onChangeText={setDescription}
          mode="outlined"
          multiline
          numberOfLines={4}
          style={styles.input}
        />

        <TextInput
          label="积分奖励"
          value={points}
          onChangeText={setPoints}
          mode="outlined"
          keyboardType="numeric"
          style={styles.input}
        />

        <Text style={styles.label}>优先级</Text>
        <SegmentedButtons
          value={priority}
          onValueChange={setPriority}
          buttons={[
            { value: 'low', label: '低' },
            { value: 'medium', label: '中' },
            { value: 'high', label: '高' },
          ]}
          style={styles.segmentedButtons}
        />

        <TextInput
          label="截止时间"
          value={deadline}
          onChangeText={setDeadline}
          mode="outlined"
          style={styles.input}
        />
      </Surface>

      <Surface style={styles.card}>
        <Text style={styles.sectionTitle}>选择负责人</Text>
        {familyMembers.map(member => (
          <List.Item
            key={member.id}
            title={member.name}
            left={props => (
              <Avatar.Image
                {...props}
                size={40}
                source={member.avatar || CommonImages.avatar}
              />
            )}
            right={props => (
              <IconButton
                {...props}
                icon={assignee?.id === member.id ? 'check-circle' : 'circle-outline'}
                onPress={() => setAssignee(member)}
              />
            )}
          />
        ))}
      </Surface>

      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          onPress={handleSubmit}
          style={styles.button}
          disabled={!title || !description || !points || !deadline || !assignee}
        >
          创建任务
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  card: {
    margin: 16,
    padding: 16,
    borderRadius: 10,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  input: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  segmentedButtons: {
    marginBottom: 16,
  },
  buttonContainer: {
    padding: 16,
  },
  button: {
    marginBottom: 8,
  },
});

export default CreateTask; 