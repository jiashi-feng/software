import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
} from 'react-native';
import {
  Text,
  Surface,
  Avatar,
  useTheme,
  SegmentedButtons,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { CommonImages } from './assets/images';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Ranking = () => {
  const [timeRange, setTimeRange] = useState('weekly');
  const [familyMembers, setFamilyMembers] = useState([]);
  const [myPoints, setMyPoints] = useState(0);
  const [completedTasks, setCompletedTasks] = useState(0);
  const theme = useTheme();

  // Load family members and points from AsyncStorage
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load family members
        const savedMembers = await AsyncStorage.getItem('chatMembers');
        if (savedMembers) {
          const members = JSON.parse(savedMembers);
          setFamilyMembers(members);
        }

        // Load my points and sync with personal points
        const [savedPoints, personalPoints] = await Promise.all([
          AsyncStorage.getItem('myPoints'),
          AsyncStorage.getItem('userPoints')
        ]);

        let pointsToUse = 0;
        if (savedPoints && personalPoints) {
          // Use the larger value between ranking points and personal points
          const rankingPoints = parseInt(savedPoints, 10);
          const userPoints = parseInt(personalPoints, 10);
          pointsToUse = Math.max(rankingPoints, userPoints);
          
          // If ranking points are lower, update them
          if (rankingPoints < userPoints) {
            await AsyncStorage.setItem('myPoints', String(userPoints));
          }
        } else if (personalPoints) {
          pointsToUse = parseInt(personalPoints, 10);
          await AsyncStorage.setItem('myPoints', personalPoints);
        } else if (savedPoints) {
          pointsToUse = parseInt(savedPoints, 10);
        }
        
        setMyPoints(pointsToUse);

        // Load completed tasks count
        const savedTasks = await AsyncStorage.getItem('familyTasks');
        if (savedTasks) {
          const tasks = JSON.parse(savedTasks);
          const completedCount = tasks.filter(task => task.completed).length;
          setCompletedTasks(completedCount);
        }
      } catch (error) {
        console.error('Error loading ranking data:', error);
      }
    };

    loadData();
  }, []);

  // Listen for task completion updates
  useEffect(() => {
    const checkTaskUpdates = async () => {
      try {
        const savedTasks = await AsyncStorage.getItem('familyTasks');
        if (savedTasks) {
          const tasks = JSON.parse(savedTasks);
          const completedCount = tasks.filter(task => task.completed).length;
          setCompletedTasks(completedCount);
        }
      } catch (error) {
        console.error('Error checking task updates:', error);
      }
    };

    const interval = setInterval(checkTaskUpdates, 1000); // Check every second
    return () => clearInterval(interval);
  }, []);

  const getRankColor = (rank) => {
    switch (rank) {
      case 1:
        return '#FFD700';
      case 2:
        return '#C0C0C0';
      case 3:
        return '#CD7F32';
      default:
        return '#666';
    }
  };

  const getChangeIcon = (change) => {
    if (change > 0) {
      return <Icon name="arrow-up" size={16} color="#4CAF50" />;
    } else if (change < 0) {
      return <Icon name="arrow-down" size={16} color="#F44336" />;
    }
    return null;
  };

  // Calculate rankings based on family members
  const calculateRankings = () => {
    const rankings = familyMembers.map((member, index) => ({
      id: member.id,
      name: member.name,
      avatar: member.avatar,
      points: member.id === 'currentUser' ? myPoints : 0,
      rank: index + 1,
      change: 0,
    }));

    // Sort by points in descending order
    return rankings.sort((a, b) => b.points - a.points);
  };

  return (
    <ScrollView style={styles.container}>
      <Surface style={styles.header}>
        <Text style={styles.headerTitle}>积分排行</Text>
        <SegmentedButtons
          value={timeRange}
          onValueChange={setTimeRange}
          buttons={[
            { value: 'weekly', label: '本周' },
            { value: 'monthly', label: '本月' },
          ]}
          style={styles.segmentedButtons}
        />
      </Surface>

      <View style={styles.rankingsContainer}>
        {calculateRankings().map((user, index) => (
          <Surface key={user.id} style={styles.rankingCard}>
            <View style={styles.rankNumber}>
              <Text style={[styles.rankText, { color: getRankColor(user.rank) }]}>
                {user.rank}
              </Text>
            </View>
            <View style={styles.userInfo}>
              <Avatar.Image
                size={50}
                source={user.avatar || CommonImages.avatar}
              />
              <View style={styles.userText}>
                <Text style={styles.userName}>{user.name}</Text>
                <View style={styles.pointsContainer}>
                  <Icon name="star" size={16} color={theme.colors.primary} />
                  <Text style={styles.points}>{user.points}</Text>
                </View>
              </View>
            </View>
            <View style={styles.changeContainer}>
              {getChangeIcon(user.change)}
              {user.change !== 0 && (
                <Text style={[
                  styles.changeText,
                  { color: user.change > 0 ? '#4CAF50' : '#F44336' }
                ]}>
                  {Math.abs(user.change)}
                </Text>
              )}
            </View>
          </Surface>
        ))}
      </View>

      <Surface style={styles.statsCard}>
        <Text style={styles.statsTitle}>本周统计</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{myPoints}</Text>
            <Text style={styles.statLabel}>我的积分</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{completedTasks}</Text>
            <Text style={styles.statLabel}>完成任务</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>排名变化</Text>
          </View>
        </View>
      </Surface>
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
    elevation: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  segmentedButtons: {
    marginBottom: 8,
  },
  rankingsContainer: {
    padding: 16,
  },
  rankingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    elevation: 2,
  },
  rankNumber: {
    width: 40,
    alignItems: 'center',
  },
  rankText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  userInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  userText: {
    marginLeft: 12,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  points: {
    marginLeft: 4,
    color: '#666',
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  changeText: {
    marginLeft: 4,
    fontSize: 14,
  },
  statsCard: {
    margin: 16,
    padding: 16,
    borderRadius: 10,
    elevation: 2,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6200ee',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
});

export default Ranking;
