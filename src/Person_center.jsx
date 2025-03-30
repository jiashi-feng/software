import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
} from 'react-native';
import {
  Text,
  Surface,
  Avatar,
  List,
  Button,
  useTheme,
} from 'react-native-paper';
import { CommonImages } from './assets/images';

const PersonCenter = ({ navigation }) => {
  const theme = useTheme();

  const menuItems = [
    {
      id: 'profile',
      title: '个人资料',
      icon: 'account-edit',
      onPress: () => navigation.navigate('PrivateInformation'),
    },
    {
      id: 'points',
      title: '我的积分',
      icon: 'star',
      onPress: () => navigation.navigate('Ranking'),
    },
    {
      id: 'tasks',
      title: '我的任务',
      icon: 'checkbox-marked-circle',
      onPress: () => navigation.navigate('TaskDetail'),
    },
    {
      id: 'achievements',
      title: '我的成就',
      icon: 'trophy',
      onPress: () => navigation.navigate('Achievement'),
    },
    {
      id: 'family',
      title: '家庭成员',
      icon: 'account-group',
      onPress: () => navigation.navigate('GroupChat'),
    },
    {
      id: 'taboo-settings',
      title: '禁忌设置',
      icon: 'block-helper',
      onPress: () => navigation.navigate('TabooSettings'),
    },
    {
      id: 'special-scenarios',
      title: '特殊情景设置',
      icon: 'calendar-sync',
      onPress: () => navigation.navigate('SpecialScenarios'),
    },
    {
      id: 'settings',
      title: '设置',
      icon: 'cog',
      onPress: () => navigation.navigate('Setting'),
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <Surface style={styles.header}>
        <View style={styles.userInfo}>
          <Avatar.Image
            size={80}
            source={CommonImages.avatar}
            style={styles.avatar}
          />
          <View style={styles.userText}>
            <Text style={styles.userName}>王小明</Text>
            <Text style={styles.userLevel}>家务达人 Lv.5</Text>
          </View>
        </View>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>2580</Text>
            <Text style={styles.statLabel}>积分</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>12</Text>
            <Text style={styles.statLabel}>成就</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>98%</Text>
            <Text style={styles.statLabel}>完成率</Text>
          </View>
        </View>
      </Surface>

      <Surface style={styles.menuContainer}>
        {menuItems.map(item => (
          <List.Item
            key={item.id}
            title={item.title}
            left={props => <List.Icon {...props} icon={item.icon} />}
            onPress={item.onPress}
            style={styles.menuItem}
          />
        ))}
      </Surface>

      <Button
        mode="outlined"
        onPress={() => navigation.navigate('LogIn')}
        style={styles.logoutButton}
      >
        退出登录
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
    padding: 20,
    marginBottom: 16,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    marginRight: 16,
  },
  userText: {
    flex: 1,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  userLevel: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 20,
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
  menuContainer: {
    margin: 16,
    borderRadius: 10,
    elevation: 2,
  },
  menuItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  logoutButton: {
    margin: 16,
    marginTop: 0,
  },
});

export default PersonCenter;
