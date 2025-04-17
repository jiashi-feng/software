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
  Button,
  Divider,
  useTheme,
  Title,
  Paragraph,
  List,
  Chip,
} from 'react-native-paper';
import CustomIcon from './components/CustomIcon';

const iconOptions = [
  { name: 'head-cough', label: '咳嗽' },
  { name: 'allergy', label: '过敏' },
  { name: 'food-steak-off', label: '食物禁忌' },
  { name: 'weather-dust', label: '粉尘' },
  { name: 'fish', label: '海鲜' },
  { name: 'window-open', label: '高空' },
  { name: 'dog', label: '宠物' },
  { name: 'baby-carriage', label: '婴儿' },
  { name: 'weather-windy', label: '通风' },
];

const mechanismOptions = [
  '自动屏蔽',
  '强制排除',
  '系统警示',
  '智能替换',
  '文化适配',
];

const AddCustomTaboo = ({ navigation }) => {
  const theme = useTheme();
  const [tabooName, setTabooName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('head-cough');
  const [selectedMechanism, setSelectedMechanism] = useState('自动屏蔽');

  const handleSave = () => {
    
    
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView style={styles.container}>
        <Surface style={styles.header}>
          <Title style={styles.headerTitle}>添加自定义禁忌规则</Title>
          <Paragraph style={styles.headerDescription}>
            创建一个新的禁忌规则，帮助家庭成员避免接触不适合的任务
          </Paragraph>
        </Surface>

        <Surface style={styles.formContainer}>
          <TextInput
            label="禁忌名称"
            value={tabooName}
            onChangeText={setTabooName}
            style={styles.input}
            placeholder="例如：花粉过敏者 vs 户外任务"
          />

          <TextInput
            label="规则描述"
            value={description}
            onChangeText={setDescription}
            style={styles.input}
            placeholder="描述该禁忌规则的详细信息和原因"
            multiline
            numberOfLines={3}
          />

          <Text style={styles.sectionTitle}>选择图标</Text>
          <View style={styles.iconsContainer}>
            {iconOptions.map(icon => (
              <Chip
                key={icon.name}
                icon={icon.name}
                selected={selectedIcon === icon.name}
                onPress={() => setSelectedIcon(icon.name)}
                style={styles.iconChip}
                selectedColor={theme.colors.primary}
              >
                {icon.label}
              </Chip>
            ))}
          </View>

          <Text style={styles.sectionTitle}>选择生效机制</Text>
          <View style={styles.mechanismContainer}>
            {mechanismOptions.map(mechanism => (
              <Chip
                key={mechanism}
                selected={selectedMechanism === mechanism}
                onPress={() => setSelectedMechanism(mechanism)}
                style={styles.mechanismChip}
                selectedColor={theme.colors.primary}
              >
                {mechanism}
              </Chip>
            ))}
          </View>
        </Surface>

        <View style={styles.noticeContainer}>
          <CustomIcon name="information" size={20} color={theme.colors.primary} />
          <Text style={styles.noticeText}>
            添加禁忌规则后，系统将自动避免分配不适合的任务给相关成员
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            onPress={handleSave}
            style={styles.saveButton}
            disabled={!tabooName || !description}
          >
            保存
          </Button>
          <Button
            mode="outlined"
            onPress={() => navigation.goBack()}
            style={styles.cancelButton}
          >
            取消
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 16,
    margin: 16,
    marginBottom: 8,
    borderRadius: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  headerDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  formContainer: {
    margin: 16,
    padding: 16,
    borderRadius: 8,
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  iconsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  iconChip: {
    margin: 4,
  },
  mechanismContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  mechanismChip: {
    margin: 4,
  },
  noticeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f8ff',
    padding: 12,
    margin: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#4A6FA5',
  },
  noticeText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#555',
    flex: 1,
  },
  buttonContainer: {
    flexDirection: 'column',
    margin: 16,
  },
  saveButton: {
    marginBottom: 8,
  },
  cancelButton: {
    marginBottom: 16,
  },
});

export default AddCustomTaboo; 