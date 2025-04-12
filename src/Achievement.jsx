import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import {
  Text,
  Surface,
  Avatar,
  ProgressBar,
  useTheme,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width } = Dimensions.get('window');

const achievements = [
  {
    id: 1,
    title: '家务达人',
    description: '完成100个家务任务',
    icon: 'star',
    progress: 0.75,
    total: 100,
    current: 75,
    points: 500,
    isUnlocked: false,
  },
  {
    id: 2,
    title: '清洁专家',
    description: '完成50次清洁任务',
    icon: 'broom',
    progress: 0.4,
    total: 50,
    current: 20,
    points: 300,
    isUnlocked: false,
  },
  {
    id: 3,
    title: '烹饪大师',
    description: '完成30次烹饪任务',
    icon: 'food',
    progress: 0.2,
    total: 30,
    current: 6,
    points: 400,
    isUnlocked: false,
  },
  {
    id: 4,
    title: '团队之星',
    description: '与家人完成20个协作任务',
    icon: 'account-group',
    progress: 0.6,
    total: 20,
    current: 12,
    points: 600,
    isUnlocked: false,
  },
];

const Achievement = () => {
  const theme = useTheme();

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <Surface style={styles.header}>
        <View style={styles.headerContent}>
          <Icon name="trophy" size={36} color={theme.colors.primary} />
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>我的成就</Text>
            <Text style={styles.headerSubtitle}>继续努力，解锁更多成就！</Text>
          </View>
        </View>
      </Surface>

      <View style={styles.achievementsContainer}>
        {achievements.map(achievement => (
          <Surface key={achievement.id} style={styles.achievementCard}>
            <View style={styles.achievementHeader}>
              <Avatar.Icon
                size={36}
                icon={achievement.icon}
                style={[
                  styles.achievementIcon,
                  achievement.isUnlocked && styles.unlockedIcon,
                ]}
              />
              <View style={styles.achievementInfo}>
                <Text style={styles.achievementTitle} numberOfLines={1}>
                  {achievement.title}
                </Text>
                <Text style={styles.achievementDescription} numberOfLines={2}>
                  {achievement.description}
                </Text>
              </View>
            </View>

            <View style={styles.progressContainer}>
              <View style={styles.progressBarContainer}>
                <ProgressBar
                  progress={achievement.progress}
                  color={achievement.isUnlocked ? theme.colors.primary : '#ccc'}
                  style={styles.progressBar}
                />
              </View>
              <Text style={styles.progressText}>
                {achievement.current}/{achievement.total}
              </Text>
            </View>

            <View style={styles.pointsContainer}>
              <Icon name="star" size={16} color={theme.colors.primary} />
              <Text style={styles.pointsText}>{achievement.points} 积分</Text>
            </View>
          </Surface>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    paddingBottom: 20,
  },
  header: {
    margin: 12,
    padding: 14,
    borderRadius: 10,
    elevation: 4,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    marginLeft: 14,
    flex: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#7b4f93',
  },
  achievementsContainer: {
    paddingHorizontal: 12,
  },
  achievementCard: {
    padding: 14,
    borderRadius: 10,
    marginBottom: 12,
    elevation: 2,
    width: width - 24, // 考虑屏幕宽度减去左右边距
  },
  achievementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  achievementIcon: {
    backgroundColor: '#e53f63',
  },
  unlockedIcon: {
    backgroundColor: '#ab4c53',
  },
  achievementInfo: {
    marginLeft: 12,
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  achievementDescription: {
    fontSize: 13,
    color: '#d05eb5',
    marginTop: 2,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    marginTop: 4,
  },
  progressBarContainer: {
    flex: 1,
    marginRight: 8,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
  },
  progressText: {
    fontSize: 13,
    color: '#f1a7d6',
    width: 40, // 固定宽度
    textAlign: 'right',
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pointsText: {
    marginLeft: 4,
    fontSize: 13,
    color: '#7b4f93',
    fontWeight: 'bold',
  },
});

export default Achievement;
