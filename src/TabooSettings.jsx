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
  Paragraph,
  IconButton,
} from 'react-native-paper';
import CustomIcon from './components/CustomIcon';

const tabooRules = [
  {
    id: 'cough',
    name: '咳嗽患者',
    description: '自动屏蔽粉尘相关任务',
    icon: 'head-cough',
    mechanism: '自动屏蔽',
    enabled: true,
  },
  {
    id: 'allergy',
    name: '过敏成员',
    description: '强制排除特定清洁任务',
    icon: 'allergy',
    mechanism: '强制排除',
    enabled: true,
  },
  {
    id: 'seafood',
    name: '海鲜过敏者',
    description: '系统根据过敏源自动调整',
    icon: 'fish',
    mechanism: '系统警示',
    enabled: true,
  },
  {
    id: 'height',
    name: '恐高症患者',
    description: '智能识别并替换为其他任务',
    icon: 'window-open',
    mechanism: '智能替换',
    enabled: false,
  },
  {
    id: 'religion',
    name: '宗教禁忌日',
    description: '尊重文化禁忌，调整餐饮相关任务',
    icon: 'food-steak-off',
    mechanism: '文化适配',
    enabled: false,
  },
];

const TabooSettings = ({ navigation }) => {
  const theme = useTheme();
  const [taboos, setTaboos] = useState(tabooRules);

  const toggleTaboo = (id) => {
    setTaboos(taboos.map(taboo => 
      taboo.id === id 
        ? {...taboo, enabled: !taboo.enabled} 
        : taboo
    ));
  };

  const resetTaboos = () => {
    setTaboos(tabooRules.map(taboo => ({...taboo, enabled: false})));
  };

  return (
    <ScrollView style={styles.container}>
      <Surface style={styles.header}>
        <Title style={styles.headerTitle}>禁忌配对规则</Title>
        <Paragraph style={styles.headerDescription}>
          启用禁忌配对规则后，系统将智能避免分配不适合的任务给特定成员，提高家务分配的合理性
        </Paragraph>
      </Surface>

      <Surface style={styles.tableContainer}>
        {}
        <View style={styles.tableHeaderRow}>
          <Text style={[styles.tableHeaderCell, styles.tabooCell]}>禁忌类型</Text>
          <Text style={[styles.tableHeaderCell, styles.descriptionCell]}>规则描述</Text>
          <Text style={[styles.tableHeaderCell, styles.mechanismCell]}>生效机制</Text>
        </View>
        
        <Divider />
        
        {}
        {taboos.map((taboo) => (
          <View key={taboo.id}>
            <View style={styles.tableRow}>
              <View style={[styles.tableCell, styles.tabooCell]}>
                <CustomIcon name={taboo.icon} size={24} color={theme.colors.primary} style={styles.tabooIcon} />
                <View style={styles.tabooTextContainer}>
                  <Text style={styles.tabooName}>{taboo.name}</Text>
                </View>
              </View>
              
              <View style={[styles.tableCell, styles.descriptionCell]}>
                <Text style={styles.descriptionText}>{taboo.description}</Text>
              </View>
              
              <View style={[styles.tableCell, styles.mechanismCell]}>
                <Text style={styles.mechanismText}>{taboo.mechanism}</Text>
                <Switch
                  value={taboo.enabled}
                  onValueChange={() => toggleTaboo(taboo.id)}
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
          禁忌配对规则将根据家庭成员的特殊情况和偏好，自动调整任务分配算法，避免不合理的任务分配
        </Text>
      </View>
      
      <Button
        mode="contained"
        onPress={() => navigation.navigate('AddCustomTaboo')}
        style={styles.addButton}
        icon="plus"
      >
        添加自定义禁忌规则
      </Button>
      
      <Button
        mode="outlined"
        onPress={resetTaboos}
        style={styles.resetButton}
      >
        重置所有禁忌规则
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
  tabooCell: {
    width: '30%',
    flexDirection: 'row',
    alignItems: 'center',
  },
  tabooIcon: {
    marginRight: 8,
  },
  tabooTextContainer: {
    flex: 1,
  },
  tabooName: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  descriptionCell: {
    width: '45%',
    paddingRight: 8,
  },
  descriptionText: {
    fontSize: 13,
    color: '#444',
  },
  mechanismCell: {
    width: '25%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  mechanismText: {
    fontWeight: 'bold',
    color: '#4A6FA5',
    fontSize: 12,
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
  addButton: {
    margin: 16,
    marginBottom: 8,
  },
  resetButton: {
    margin: 16,
    marginTop: 8,
  },
});

export default TabooSettings; 