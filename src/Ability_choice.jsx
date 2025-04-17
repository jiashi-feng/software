import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Dimensions,
  Animated,
} from 'react-native';
import {
  Text,
  Surface,
  Button,
  Chip,
  useTheme,
  ProgressBar,
  Title,
  Subheading,
  Divider,
  IconButton,
  Portal,
  Modal,
  RadioButton,
  Checkbox,
  Card,
  Switch,
} from 'react-native-paper';
import CustomIcon from './components/CustomIcon';

const { width } = Dimensions.get('window');

const skillCategories = [
  {
    id: 'household',
    name: '生活家务类',
    skills: [
      { id: 'cooking', name: '烹饪', icon: 'food' },
      { id: 'cleaning', name: '清洁', icon: 'broom' },
      { id: 'laundry', name: '洗衣', icon: 'washing-machine' },
      { id: 'ironing', name: '熨烫', icon: 'iron' },
      { id: 'shopping', name: '购物', icon: 'cart' },
      { id: 'organizing', name: '收纳整理', icon: 'folder-organize' },
      { id: 'meal-prep', name: '餐食准备', icon: 'silverware' },
    ]
  },
  {
    id: 'parenting',
    name: '育儿教育类',
    skills: [
      { id: 'childcare', name: '育儿', icon: 'baby-face-outline' },
      { id: 'teaching', name: '教育辅导', icon: 'school' },
      { id: 'story-telling', name: '讲故事', icon: 'book-open-variant' },
      { id: 'activities', name: '亲子活动', icon: 'balloon' },
      { id: 'meal-planning', name: '儿童餐饮', icon: 'food-apple' },
    ]
  },
  {
    id: 'technical',
    name: '技术维护类',
    skills: [
      { id: 'repair', name: '家电维修', icon: 'wrench' },
      { id: 'plumbing', name: '水管维修', icon: 'pipe' },
      { id: 'electric', name: '电路维修', icon: 'lightning-bolt' },
      { id: 'gardening', name: '园艺', icon: 'tree' },
      { id: 'device-setup', name: '设备安装', icon: 'hammer-screwdriver' },
      { id: 'furniture', name: '家具组装', icon: 'sofa' },
    ]
  },
  {
    id: 'management',
    name: '综合管理类',
    skills: [
      { id: 'scheduling', name: '日程规划', icon: 'calendar' },
      { id: 'budgeting', name: '家庭预算', icon: 'cash' },
      { id: 'pet-care', name: '宠物护理', icon: 'paw' },
      { id: 'elderly-care', name: '老人护理', icon: 'account-heart' },
      { id: 'health-mgmt', name: '健康管理', icon: 'heart-pulse' },
      { id: 'doc-mgmt', name: '文件管理', icon: 'file-document' },
    ]
  }
];

const taskPreferences = [
  { id: 'routine', name: '日常例行任务', icon: 'repeat', description: '偏好有规律、周期性的任务' },
  { id: 'complex', name: '复杂性任务', icon: 'puzzle', description: '偏好需要解决问题的复杂任务' },
  { id: 'creative', name: '创意性任务', icon: 'lightbulb', description: '偏好需要创意和创新的任务' },
  { id: 'physical', name: '体力型任务', icon: 'arm-flex', description: '偏好需要体力的活动任务' },
  { id: 'mental', name: '思考型任务', icon: 'head', description: '偏好需要思考和规划的任务' },
  { id: 'social', name: '社交型任务', icon: 'account-group', description: '偏好与人互动的任务' },
];

const timeSlots = [
  {
    id: 'early_morning',
    timeRange: '6:00-8:00',
    taskTypes: '晨练督导/早餐准备',
    defaultStrength: 5,
  },
  {
    id: 'morning',
    timeRange: '9:00-11:00',
    taskTypes: '家居整理/室内清洁',
    defaultStrength: 4,
  },
  {
    id: 'noon',
    timeRange: '12:00-14:00',
    taskTypes: '午餐准备/餐后整理',
    defaultStrength: 3,
  },
  {
    id: 'afternoon',
    timeRange: '15:00-17:00',
    taskTypes: '育儿看护/宠物照料',
    defaultStrength: 4,
  },
  {
    id: 'evening',
    timeRange: '18:00-20:00',
    taskTypes: '晚餐准备/家庭活动',
    defaultStrength: 5,
  },
  {
    id: 'night',
    timeRange: '21:00-23:00',
    taskTypes: '明日准备/休闲时光',
    defaultStrength: 2,
  },
];

const environmentPreferences = [
  { 
    id: 'noise',
    name: '噪音耐受度',
    min: '喜欢安静',
    max: '不介意噪音',
    icon: 'volume-high'
  },
  { 
    id: 'space',
    name: '空间需求',
    min: '小空间',
    max: '大空间',
    icon: 'floor-plan'
  },
  { 
    id: 'urgency',
    name: '紧急程度接受度',
    min: '喜欢从容',
    max: '能应对紧急',
    icon: 'timer-sand'
  },
  { 
    id: 'multitasking',
    name: '多任务处理',
    min: '专注单任务',
    max: '擅长多任务',
    icon: 'checkbox-multiple-marked'
  },
];

const emotionalPreferences = [
  {
    id: 'achievement',
    name: '成就导向型',
    description: '喜欢有明确目标和成果的任务，享受完成挑战的成就感',
    icon: 'trophy',
  },
  {
    id: 'relationship',
    name: '关系导向型',
    description: '偏好能够增进家庭成员互动和感情的任务类型',
    icon: 'heart',
  },
  {
    id: 'growth',
    name: '成长导向型',
    description: '偏好能够学习新技能或提升能力的任务类型',
    icon: 'chart-line',
  },
  {
    id: 'altruistic',
    name: '利他导向型',
    description: '愿意承担更多家务，减轻他人负担',
    icon: 'hand-heart',
  },
  {
    id: 'comfort',
    name: '舒适优先型',
    description: '偏好简单、熟悉且不会带来压力的任务',
    icon: 'sofa',
  },
];

const AbilityChoice = ({ navigation }) => {
  const theme = useTheme();
  
  
  const [currentStep, setCurrentStep] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  
  
  const [selectedSkills, setSelectedSkills] = useState({});
  
  
  const [taskTypePreferences, setTaskTypePreferences] = useState([]);
  
  
  const [timePreferences, setTimePreferences] = useState(
    timeSlots.reduce((acc, slot) => {
      acc[slot.id] = slot.defaultStrength;
      return acc;
    }, {})
  );
  
  
  const [environmentValues, setEnvironmentValues] = useState({
    noise: 3,
    space: 3,
    urgency: 3,
    multitasking: 3
  });
  
  
  const [currentCategory, setCurrentCategory] = useState(skillCategories[0].id);
  
  
  const [helpModalVisible, setHelpModalVisible] = useState(false);
  
  
  const [emotionalValuePreferences, setEmotionalValuePreferences] = useState([]);
  
  
  const steps = ['技能选择', '任务偏好', '时间偏好', '情感价值偏好', '环境偏好'];
  const progress = (currentStep + 1) / steps.length;

  
  const toggleSkill = (skillId) => {
    setSelectedSkills(prev => {
      const newSelection = { ...prev };
      if (newSelection[skillId]) {
        delete newSelection[skillId];
      } else {
        newSelection[skillId] = true;
      }
      return newSelection;
    });
  };

  
  const toggleTaskPreference = (prefId) => {
    setTaskTypePreferences(prev => 
      prev.includes(prefId)
        ? prev.filter(id => id !== prefId)
        : [...prev, prefId]
    );
  };

  
  const handleTimePreferenceChange = (slotId, strength) => {
    setTimePreferences({
      ...timePreferences,
      [slotId]: strength,
    });
  };

  
  const handleEnvironmentChange = (prefId, value) => {
    setEnvironmentValues(prev => ({
      ...prev,
      [prefId]: value
    }));
  };

  
  const toggleEmotionalPreference = (prefId) => {
    setEmotionalValuePreferences(prev => 
      prev.includes(prefId)
        ? prev.filter(id => id !== prefId)
        : [...prev, prefId]
    );
  };

  
  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };

  
  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  
  const handleSkip = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  
  const handleSubmit = () => {
    
    const userData = {
      skills: Object.keys(selectedSkills),
      taskPreferences: taskTypePreferences,
      timePreferences: timePreferences,
      environmentPreferences: environmentValues,
      emotionalValuePreferences
    };
    
    
    
    
    navigation.navigate('MainTabs');
  };

  
  const renderCategoryTabs = () => (
    <View style={styles.categoryTabsWrapper}>
      <View style={styles.categoryTabsContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.categoryTabs}
          contentContainerStyle={styles.categoryTabsContent}
        >
          {skillCategories.map(category => (
            <Button
              key={category.id}
              mode={currentCategory === category.id ? "contained" : "outlined"}
              onPress={() => setCurrentCategory(category.id)}
              style={[
                styles.categoryTab,
                currentCategory === category.id && styles.selectedCategoryTab
              ]}
              labelStyle={[
                styles.categoryTabLabel,
                currentCategory === category.id && styles.selectedCategoryTabLabel
              ]}
            >
              {category.name}
            </Button>
          ))}
        </ScrollView>
        
        {}
        <View style={styles.tabShadowIndicator} />
      </View>
      
      {}
      <View style={styles.scrollIndicator}>
        {skillCategories.map((category, index) => (
          <View 
            key={category.id}
            style={[
              styles.scrollIndicatorDot,
              currentCategory === category.id && styles.scrollIndicatorDotActive
            ]} 
          />
        ))}
      </View>
    </View>
  );

  
  const renderSkills = () => {
    const currentCategoryData = skillCategories.find(cat => cat.id === currentCategory);
    
    return (
      <View style={styles.skillsSection}>
        <Title style={styles.sectionTitle}>{currentCategoryData.name}</Title>
        <View style={styles.skillsContainer}>
          {currentCategoryData.skills.map(skill => {
            const isSelected = !!selectedSkills[skill.id];
            return (
              <Chip
                key={skill.id}
                selected={isSelected}
                onPress={() => toggleSkill(skill.id)}
                style={[
                  styles.chip,
                  isSelected && styles.selectedChip
                ]}
                textStyle={isSelected ? styles.selectedChipText : styles.chipText}
                icon={({ size }) => (
                  <CustomIcon 
                    name={skill.icon} 
                    size={20} 
                    color={isSelected ? '#ffffff' : theme.colors.primary} 
                  />
                )}
                selectedColor="#ffffff"
              >
                {skill.name}
              </Chip>
            );
          })}
        </View>
      </View>
    );
  };

  
  const renderTaskPreferences = () => (
    <View style={styles.preferencesSection}>
      <Title style={styles.sectionTitle}>任务类型偏好</Title>
      <Subheading style={styles.sectionSubtitle}>选择你偏好的任务类型（可多选）</Subheading>
      
      {taskPreferences.map(pref => (
        <Card 
          key={pref.id} 
          style={[
            styles.preferenceCard,
            taskTypePreferences.includes(pref.id) && styles.selectedPreferenceCard
          ]}
          onPress={() => toggleTaskPreference(pref.id)}
        >
          <Card.Content style={styles.preferenceCardContent}>
            <View style={styles.preferenceIconContainer}>
              <CustomIcon 
                name={pref.icon} 
                size={28} 
                color={taskTypePreferences.includes(pref.id) ? theme.colors.primary : '#666'} 
              />
            </View>
            <View style={styles.preferenceTextContainer}>
              <Text style={styles.preferenceTitle}>{pref.name}</Text>
              <Text style={styles.preferenceDescription}>{pref.description}</Text>
            </View>
            <Checkbox
              status={taskTypePreferences.includes(pref.id) ? 'checked' : 'unchecked'}
              color={theme.colors.primary}
            />
          </Card.Content>
        </Card>
      ))}
    </View>
  );

  
  const renderTimePreferences = () => {
    return (
      <View style={styles.timePreferencesContainer}>
        <Subheading style={styles.sectionTitle}>设置您的时间偏好</Subheading>
        <Text style={styles.sectionDescription}>
          设置您在不同时间段的可用性强度，这将帮助我们更合理地分配任务
        </Text>
        
        <Surface style={styles.timeTable}>
          {}
          <View style={styles.timeTableHeader}>
            <Text style={[styles.timeTableHeaderCell, styles.timeRangeCell]}>时间段</Text>
            <Text style={[styles.timeTableHeaderCell, styles.taskTypesCell]}>适合任务类型</Text>
            <Text style={[styles.timeTableHeaderCell, styles.strengthCell]}>偏好强度</Text>
          </View>
          
          <Divider />
          
          {}
          {timeSlots.map((slot) => (
            <View key={slot.id}>
              <View style={styles.timeTableRow}>
                <View style={[styles.timeTableCell, styles.timeRangeCell]}>
                  <Text style={styles.timeRangeText}>{slot.timeRange}</Text>
                </View>
                
                <View style={[styles.timeTableCell, styles.taskTypesCell]}>
                  <Text style={styles.taskTypesText}>{slot.taskTypes}</Text>
                </View>
                
                <View style={[styles.timeTableCell, styles.strengthCell]}>
                  {}
                  <View style={styles.starsContainer}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <IconButton
                        key={`${slot.id}-star-${star}`}
                        icon={timePreferences[slot.id] >= star ? "star" : "star-outline"}
                        size={16}
                        color={timePreferences[slot.id] >= star ? "#FFD700" : "#C0C0C0"}
                        onPress={() => handleTimePreferenceChange(slot.id, star)}
                        style={styles.starButton}
                      />
                    ))}
                  </View>
                </View>
              </View>
              <Divider />
            </View>
          ))}
        </Surface>
        
        <View style={styles.timePreferenceNote}>
          <CustomIcon name="information" size={18} color={theme.colors.primary} />
          <Text style={styles.timePreferenceNoteText}>
            星级越高表示您在该时间段的可用性越强
          </Text>
        </View>
      </View>
    );
  };

  
  const renderEmotionalPreferences = () => (
    <View style={styles.preferencesSection}>
      <Title style={styles.sectionTitle}>情感价值偏好</Title>
      <Subheading style={styles.sectionSubtitle}>选择能够激励你的任务类型（可多选）</Subheading>
      
      {emotionalPreferences.map(pref => (
        <Card 
          key={pref.id} 
          style={[
            styles.emotionalPrefCard,
            emotionalValuePreferences.includes(pref.id) && styles.selectedEmotionalPrefCard
          ]}
          onPress={() => toggleEmotionalPreference(pref.id)}
        >
          <View style={styles.emotionalPrefContent}>
            <View style={styles.emotionalPrefIconContainer}>
              <CustomIcon 
                name={pref.icon} 
                size={28} 
                color={emotionalValuePreferences.includes(pref.id) ? theme.colors.primary : '#666'} 
              />
            </View>
            <View style={styles.emotionalPrefTextContainer}>
              <Text style={styles.emotionalPrefTitle}>
                <Text style={{ color: theme.colors.primary, fontWeight: 'bold' }}>• </Text>
                {pref.name}:
              </Text>
              <Text style={styles.emotionalPrefDescription}>{pref.description}</Text>
            </View>
            <Checkbox
              status={emotionalValuePreferences.includes(pref.id) ? 'checked' : 'unchecked'}
              color={theme.colors.primary}
            />
          </View>
        </Card>
      ))}
    </View>
  );

  
  const renderEnvironmentPreferences = () => (
    <View style={styles.preferencesSection}>
      <Title style={styles.sectionTitle}>环境偏好</Title>
      <Subheading style={styles.sectionSubtitle}>点击加减按钮设置你对环境的偏好</Subheading>
      
      <Surface style={styles.environmentPreferencesContainer}>
        {environmentPreferences.map(pref => (
          <View key={pref.id} style={styles.environmentPreferenceItem}>
            <View style={styles.environmentPreferenceHeader}>
              <View style={styles.environmentPreferenceIconTitle}>
                <CustomIcon name={pref.icon} size={24} color={theme.colors.primary} />
                <Text style={styles.environmentPreferenceTitle}>{pref.name}</Text>
              </View>
              <Text style={styles.environmentPreferenceValue}>{environmentValues[pref.id]}</Text>
            </View>
            
            <View style={styles.environmentPreferenceSlider}>
              <Text style={styles.environmentPreferenceMin}>{pref.min}</Text>
              
              <View style={styles.environmentPreferenceControls}>
                <IconButton
                  icon="minus"
                  size={20}
                  color={environmentValues[pref.id] > 1 ? theme.colors.primary : '#CCCCCC'}
                  style={styles.environmentPreferenceButton}
                  onPress={() => {
                    if (environmentValues[pref.id] > 1) {
                      handleEnvironmentChange(pref.id, environmentValues[pref.id] - 1);
                    }
                  }}
                  disabled={environmentValues[pref.id] <= 1}
                />
                
                <View style={styles.environmentPreferenceDotsContainer}>
                  {[1, 2, 3, 4, 5].map(value => (
                    <View 
                      key={value}
                      style={[
                        styles.environmentPreferenceDot,
                        value <= environmentValues[pref.id] ? styles.environmentPreferenceDotActive : null
                      ]}
                      onTouchEnd={() => handleEnvironmentChange(pref.id, value)}
                    />
                  ))}
                </View>
                
                <IconButton
                  icon="plus"
                  size={20}
                  color={environmentValues[pref.id] < 5 ? theme.colors.primary : '#CCCCCC'}
                  style={styles.environmentPreferenceButton}
                  onPress={() => {
                    if (environmentValues[pref.id] < 5) {
                      handleEnvironmentChange(pref.id, environmentValues[pref.id] + 1);
                    }
                  }}
                  disabled={environmentValues[pref.id] >= 5}
                />
              </View>
              
              <Text style={styles.environmentPreferenceMax}>{pref.max}</Text>
            </View>
            
            {}
            {pref.id !== environmentPreferences[environmentPreferences.length - 1].id && (
              <Divider style={styles.environmentPreferenceDivider} />
            )}
          </View>
        ))}
      </Surface>
    </View>
  );

  
  const renderStepContent = () => {
    switch(currentStep) {
      case 0:
        return (
          <View style={styles.stepContainer}>
            {renderCategoryTabs()}
            {renderSkills()}
          </View>
        );
      case 1:
        return renderTaskPreferences();
      case 2:
        return renderTimePreferences();
      case 3:
        return renderEmotionalPreferences();
      case 4:
        return renderEnvironmentPreferences();
      default:
        return null;
    }
  };

  
  const renderHelpModal = () => (
    <Portal>
      <Modal
        visible={helpModalVisible}
        onDismiss={() => setHelpModalVisible(false)}
        contentContainerStyle={styles.modalContent}
      >
        <Title style={styles.modalTitle}>帮助信息</Title>
        <Divider style={styles.modalDivider} />
        <Text style={styles.modalText}>
          {currentStep === 0 && '请选择你擅长的家务技能。您可以通过上方的分类标签切换不同类别的技能。'}
          {currentStep === 1 && '请选择你偏好的任务类型。这将帮助系统更好地为你分配适合的任务。'}
          {currentStep === 2 && '请选择你偏好的工作时间段。系统会尽量根据你的时间偏好安排任务。'}
          {currentStep === 3 && '请选择你偏好的情感价值类型。这将帮助系统更好地为你分配适合的任务。'}
          {currentStep === 4 && '请调整滑块设置你的环境偏好。这些信息将帮助系统更准确地匹配适合你的任务环境。'}
        </Text>
        <Button
          mode="contained"
          onPress={() => setHelpModalVisible(false)}
          style={styles.modalButton}
        >
          了解了
        </Button>
      </Modal>
    </Portal>
  );

  return (
    <View style={styles.container}>
      {}
      <Surface style={styles.header}>
        <View style={styles.progressContainer}>
          <Text style={styles.stepText}>步骤 {currentStep + 1}/{steps.length}: {steps[currentStep]}</Text>
          <ProgressBar progress={progress} color={theme.colors.primary} style={styles.progressBar} />
        </View>
        <IconButton
          icon="help-circle-outline"
          color={theme.colors.primary}
          size={24}
          onPress={() => setHelpModalVisible(true)}
        />
      </Surface>
      
      {}
      <ScrollView style={styles.content}>
        {renderStepContent()}
      </ScrollView>
      
      {}
      <Surface style={styles.footer}>
        {currentStep > 0 && (
          <Button
            mode="outlined"
            onPress={handleBack}
            style={styles.backButton}
          >
            上一步
          </Button>
        )}
        
        <View style={styles.rightButtons}>
          {currentStep < steps.length - 1 && (
            <Button
              mode="text"
              onPress={handleSkip}
              style={styles.skipButton}
            >
              跳过
            </Button>
          )}
          
          <Button
            mode="contained"
            onPress={handleNext}
            style={styles.nextButton}
          >
            {currentStep === steps.length - 1 ? '完成' : '下一步'}
          </Button>
        </View>
      </Surface>
      
      {}
      {renderHelpModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    elevation: 4,
  },
  progressContainer: {
    flex: 1,
    marginRight: 8,
  },
  stepText: {
    marginBottom: 8,
    fontSize: 14,
    color: '#666',
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
  },
  content: {
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    elevation: 4,
  },
  backButton: {
    minWidth: 100,
  },
  rightButtons: {
    flexDirection: 'row',
  },
  skipButton: {
    marginRight: 8,
  },
  nextButton: {
    minWidth: 100,
  },
  stepContainer: {
    padding: 16,
  },
  categoryTabsWrapper: {
    marginBottom: 16,
  },
  categoryTabsContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  categoryTabs: {
    marginBottom: 8,
  },
  categoryTabsContent: {
    paddingRight: 24,
  },
  categoryTab: {
    marginRight: 10,
    borderRadius: 20,
    minWidth: 100,
    height: 40,
    justifyContent: 'center',
  },
  selectedCategoryTab: {
    elevation: 2,
  },
  categoryTabLabel: {
    fontSize: 13,
    marginHorizontal: 0,
  },
  selectedCategoryTabLabel: {
    fontWeight: 'bold',
  },
  tabShadowIndicator: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 20,
    backgroundColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: -10, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    zIndex: 1,
  },
  scrollIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  scrollIndicatorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#e0d0ff',
    marginHorizontal: 4,
  },
  scrollIndicatorDotActive: {
    backgroundColor: '#6200ee',
    width: 18,
    height: 6,
  },
  skillsSection: {
    marginBottom: 16,
  },
  preferencesSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  chip: {
    margin: 4,
    backgroundColor: '#f0e6ff',
    paddingHorizontal: 4,
    height: 38,
    borderWidth: 1,
    borderColor: '#e0d0ff',
  },
  chipText: {
    color: '#5600c7',
    fontWeight: '500',
  },
  selectedChip: {
    backgroundColor: '#6200ee',
    borderColor: '#6200ee',
  },
  selectedChipText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  preferenceCard: {
    marginBottom: 12,
    elevation: 1,
  },
  selectedPreferenceCard: {
    borderWidth: 2,
    borderColor: '#6200ee',
  },
  preferenceCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  preferenceIconContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  preferenceTextContainer: {
    flex: 1,
  },
  preferenceTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  preferenceDescription: {
    fontSize: 12,
    color: '#666',
  },
  timePreferencesContainer: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  timeTable: {
    marginTop: 16,
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 2,
  },
  timeTableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  timeTableHeaderCell: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#555',
  },
  timeTableRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  timeTableCell: {
    justifyContent: 'center',
  },
  timeRangeCell: {
    width: '25%',
  },
  timeRangeText: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  taskTypesCell: {
    width: '45%',
  },
  taskTypesText: {
    fontSize: 13,
    color: '#444',
  },
  strengthCell: {
    width: '30%',
    alignItems: 'center',
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  starButton: {
    margin: 0,
    width: 20,
    height: 20,
    padding: 0,
  },
  timePreferenceNote: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    padding: 8,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
  },
  timePreferenceNoteText: {
    marginLeft: 8,
    fontSize: 13,
    color: '#555',
  },
  modalContent: {
    backgroundColor: 'white',
    margin: 20,
    padding: 20,
    borderRadius: 8,
  },
  modalTitle: {
    textAlign: 'center',
    marginBottom: 8,
  },
  modalDivider: {
    marginBottom: 16,
  },
  modalText: {
    marginBottom: 20,
    lineHeight: 22,
  },
  modalButton: {
    marginTop: 8,
  },
  emotionalPrefCard: {
    marginBottom: 12,
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 1,
  },
  selectedEmotionalPrefCard: {
    borderWidth: 2,
    borderColor: '#6200ee',
  },
  emotionalPrefContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  emotionalPrefIconContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  emotionalPrefTextContainer: {
    flex: 1,
    paddingRight: 8,
  },
  emotionalPrefTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 2,
    color: '#333',
  },
  emotionalPrefDescription: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  emotionalPreferencesContainer: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  emotionalPreferenceCard: {
    marginBottom: 12,
    borderRadius: 8,
    elevation: 1,
  },
  selectedEmotionalPreferenceCard: {
    backgroundColor: '#4A6FA5',
  },
  emotionalPreferenceContent: {
    paddingVertical: 16,
  },
  emotionalPreferenceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  emotionalPreferenceName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  emotionalPreferenceDescription: {
    fontSize: 14,
    color: '#666',
    paddingLeft: 36,
  },
  selectedEmotionalPreferenceText: {
    color: '#FFFFFF',
  },
  environmentPreferencesContainer: {
    marginTop: 8,
    borderRadius: 8,
    elevation: 2,
    padding: 12,
  },
  environmentPreferenceItem: {
    marginBottom: 12,
  },
  environmentPreferenceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  environmentPreferenceIconTitle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  environmentPreferenceTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  environmentPreferenceValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6200ee',
    width: 24,
    textAlign: 'center',
  },
  environmentPreferenceSlider: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  environmentPreferenceMin: {
    width: 70,
    fontSize: 12,
    color: '#666',
  },
  environmentPreferenceMax: {
    width: 70,
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
  },
  environmentPreferenceControls: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  environmentPreferenceButton: {
    margin: 0,
    padding: 0,
  },
  environmentPreferenceDotsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  environmentPreferenceDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#E0E0E0',
    borderWidth: 1,
    borderColor: '#D0D0D0',
  },
  environmentPreferenceDotActive: {
    backgroundColor: '#6200ee',
    borderColor: '#5000c0',
  },
  environmentPreferenceDivider: {
    marginTop: 12,
    marginBottom: 12,
  },
});

export default AbilityChoice;
