import React, { useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {
  Text,
  Surface,
  Avatar,
  List,
  Button,
  useTheme,
  Dialog,
  Portal,
} from 'react-native-paper';
import { useAuth } from './store/AuthContext';
import { CommonImages } from './assets/images';

const PersonCenter = ({ navigation }) => {
  const theme = useTheme();
  const { isLoggedIn, userInfo, logout } = useAuth();
  const [showLogoutDialog, setShowLogoutDialog] = React.useState(false);

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
      onPress: () => navigation.navigate('FamilyCheck'),
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
      id: 'exchange-history',
      icon: 'history',
      title: '积分兑换记录',
      onPress: () => navigation.navigate('ExchangeHistory'),
      color: '#4A6FA5',
    },
    {
      id: 'settings',
      title: '设置',
      icon: 'cog',
      onPress: () => navigation.navigate('Setting'),
    },
  ];

  
  const handleUserInfoPress = () => {
    if (!isLoggedIn) {
      navigation.navigate('LogIn');
    }
  };

  
  const handleLogout = async () => {
    setShowLogoutDialog(true);
  };

  const confirmLogout = useCallback(async () => {
    try {
      await logout();
      setShowLogoutDialog(false);
      navigation.navigate('MainTabs', { screen: 'Index' });
    } catch (error) {
      console.error('退出登录失败:', error);
    }
  }, [logout, navigation]);

  const hideLogoutDialog = () => {
    setShowLogoutDialog(false);
  };

  return (
    <ScrollView style={styles.container}>
      <Surface style={styles.header}>
        <TouchableOpacity onPress={handleUserInfoPress} style={styles.userInfo}>
          {isLoggedIn ? (
            <Avatar.Image size={80} source={CommonImages.default_avatar}  />
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
          onPress={handleLogout}
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

      <Portal>
        <Dialog visible={showLogoutDialog} onDismiss={hideLogoutDialog}>
          <Dialog.Title>退出登录</Dialog.Title>
          <Dialog.Content>
            <Text>确定要退出登录吗？</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={hideLogoutDialog}>取消</Button>
            <Button onPress={confirmLogout}>确定</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
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