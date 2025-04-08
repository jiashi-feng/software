import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {
  Text,
  Surface,
  Avatar,
  List,
  Button,
  useTheme,
} from 'react-native-paper';
import { useAuth } from './store/AuthContext';
import { CommonImages } from './assets/images';

const PersonCenter = ({ navigation }) => {
  const theme = useTheme();
  const { isLoggedIn, userInfo, logout } = useAuth();

  const menuItems = [
    {
      id: 'profile',
      title: '个人资料',
      icon: 'account-edit',
      onPress: () => isLoggedIn ? navigation.navigate('PrivateInformation') : navigation.navigate('LogIn'),
    },
    {
      id: 'points',
      title: '我的积分',
      icon: 'star',
      onPress: () => isLoggedIn ? navigation.navigate('Ranking') : navigation.navigate('LogIn'),
    },
    {
      id: 'tasks',
      title: '我的任务',
      icon: 'checkbox-marked-circle',
      onPress: () => isLoggedIn ? navigation.navigate('TaskDetail') : navigation.navigate('LogIn'),
    },
    {
      id: 'achievements',
      title: '我的成就',
      icon: 'trophy',
      onPress: () => isLoggedIn ? navigation.navigate('Achievement') : navigation.navigate('LogIn'),
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
      onPress: () => isLoggedIn ? navigation.navigate('TabooSettings') : navigation.navigate('LogIn'),
    },
    {
      id: 'special-scenarios',
      title: '特殊情景设置',
      icon: 'calendar-sync',
      onPress: () => isLoggedIn ? navigation.navigate('SpecialScenarios') : navigation.navigate('LogIn'),
    },
    {
      id: 'settings',
      title: '设置',
      icon: 'cog',
      onPress: () => navigation.navigate('Setting'),
    },
  ];

  // 点击头像或用户信息区域跳转到登录页面
  const handleUserInfoPress = () => {
    if (!isLoggedIn) {
      navigation.navigate('LogIn');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Surface style={styles.header}>
        <TouchableOpacity onPress={handleUserInfoPress} style={styles.userInfo}>
          {isLoggedIn ? (
            <Avatar.Image size={80} source={userInfo.avatar}  />
          ) : (
            <Avatar.Image size={80} source={CommonImages.unlogin}  style={{backgroundColor:'#fff'}}/>
          )}
          <View style={styles.userText}>
            <Text style={styles.userName}>{isLoggedIn ? userInfo.name : '未登录'}</Text>
            <Text style={styles.userLevel}>{isLoggedIn ? userInfo.level : '点击登录账号'}</Text>
          </View>
        </TouchableOpacity>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{isLoggedIn ? userInfo.points : '0'}</Text>
            <Text style={styles.statLabel}>积分</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{isLoggedIn ? userInfo.achievements : '0'}</Text>
            <Text style={styles.statLabel}>成就</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{isLoggedIn ? userInfo.completionRate : '0%'}</Text>
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

      {isLoggedIn ? (
        <Button
          mode="outlined"
          onPress={() => {
            logout();
          }}
          style={styles.logoutButton}
        >
          退出登录
        </Button>
      ) : (
        <Button
          mode="contained"
          onPress={() => navigation.navigate('LogIn')}
          style={styles.loginButton}
        >
          立即登录
        </Button>
      )}
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
  loggedInAvatar: {
    opacity: 1,
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
  loginButton: {
    margin: 16,
    marginTop: 0,
    backgroundColor: '#6200ee',
  },
});

export default PersonCenter;
