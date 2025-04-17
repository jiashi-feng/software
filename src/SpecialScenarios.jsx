import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
} from 'react-native';
import {
  Text,
  Surface,
  Switch,
  Button,
  Divider,
  useTheme,
  Title,
  Subheading,
  IconButton,
  Chip,
  Card,
  Paragraph,
} from 'react-native-paper';
import CustomIcon from './components/CustomIcon';

const specialScenarios = [
  {
    id: 'period',
    name: '生理周期',
    description: '女性成员经期自动屏蔽重体力任务',
    icon: 'calendar-heart',
    adjustment: '+30%',
    enabled: true,
  },
  {
    id: 'exam',
    name: '考试季',
    description: '学生成员任务量减少50%',
    icon: 'school',
    adjustment: '+25%',
    enabled: true,
  },
  {
    id: 'project',
    name: '项目冲刺期',
    description: '工作繁忙成员只分配5分钟微任务',
    icon: 'rocket-launch',
    adjustment: '+20%',
    enabled: false,
  },
  {
    id: 'holiday',
    name: '节庆模式',
    description: '开启装饰布置类任务偏好',
    icon: 'party-popper',
    adjustment: '+15%',
    enabled: false,
  },
  {
    id: 'pet',
    name: '宠物发情期',
    description: '增加遛狗频次偏好设置',
    icon: 'dog',
    adjustment: '+10%',
    enabled: false,
  },
];

const SpecialScenarios = ({ navigation }) => {
  const theme = useTheme();
  const [scenarios, setScenarios] = useState(specialScenarios);

  const toggleScenario = (id) => {
    setScenarios(scenarios.map(scenario => 
      scenario.id === id 
        ? {...scenario, enabled: !scenario.enabled} 
        : scenario
    ));
  };

  const resetScenarios = () => {
    setScenarios(specialScenarios.map(scenario => ({...scenario, enabled: false})));
  };

  return (
    <ScrollView style={styles.container}>
      <Surface style={styles.header}>
        <Title style={styles.headerTitle}>特殊情境偏好</Title>
        <Paragraph style={styles.headerDescription}>
          启用特殊情境将自动调整任务分配算法，使其更符合当前情况下的家庭成员需求
        </Paragraph>
      </Surface>

      <Surface style={styles.tableContainer}>
        {}
        <View style={styles.tableHeaderRow}>
          <Text style={[styles.tableHeaderCell, styles.scenarioCell]}>情境类型</Text>
          <Text style={[styles.tableHeaderCell, styles.adjustmentCell]}>偏好调整规则</Text>
          <Text style={[styles.tableHeaderCell, styles.weightCell]}>算法权重</Text>
        </View>
        
        <Divider />
        
        {}
        {scenarios.map((scenario) => (
          <View key={scenario.id}>
            <View style={styles.tableRow}>
              <View style={[styles.tableCell, styles.scenarioCell]}>
                <CustomIcon name={scenario.icon} size={24} color={theme.colors.primary} style={styles.scenarioIcon} />
                <View style={styles.scenarioTextContainer}>
                  <Text style={styles.scenarioName}>{scenario.name}</Text>
                </View>
              </View>
              
              <View style={[styles.tableCell, styles.adjustmentCell]}>
                <Text style={styles.adjustmentText}>{scenario.description}</Text>
              </View>
              
              <View style={[styles.tableCell, styles.weightCell]}>
                <Text style={styles.weightText}>{scenario.adjustment}</Text>
                <Switch
                  value={scenario.enabled}
                  onValueChange={() => toggleScenario(scenario.id)}
                  color={theme.colors.primary}
                />
              </View>
            </View>
            <Divider />
          </View>
        ))}
      </Surface>
      
      <View style={styles.noticeContainer}>
        <CustomIcon name="information" size={20} color={theme.colors.primary} />
        <Text style={styles.noticeText}>
          特殊情境设置将在符合条件时自动激活，并调整家务分配算法
        </Text>
      </View>
      
      <Button
        mode="outlined"
        onPress={resetScenarios}
        style={styles.resetButton}
      >
        重置所有特殊情境
      </Button>
    </ScrollView>
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
    marginBottom: 0,
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
  tableContainer: {
    margin: 16,
    borderRadius: 8,
    elevation: 2,
    overflow: 'hidden',
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  tableHeaderCell: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#555',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  tableCell: {
    justifyContent: 'center',
  },
  scenarioCell: {
    width: '25%',
    flexDirection: 'row',
    alignItems: 'center',
  },
  scenarioIcon: {
    marginRight: 8,
  },
  scenarioTextContainer: {
    flex: 1,
  },
  scenarioName: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  adjustmentCell: {
    width: '50%',
    paddingRight: 8,
  },
  adjustmentText: {
    fontSize: 13,
    color: '#444',
  },
  weightCell: {
    width: '25%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  weightText: {
    fontWeight: 'bold',
    color: '#4CAF50',
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
  resetButton: {
    margin: 16,
    marginTop: 0,
  },
});

export default SpecialScenarios; 