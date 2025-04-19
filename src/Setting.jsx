import React, { useState } from 'react';
import {
  StyleSheet,
  ScrollView,
} from 'react-native';
import {
  Text,
  Surface,
  List,
  Switch,
  Button,
  Divider,
  useTheme,
} from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';

const Setting = ({ navigation }) => {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [sound, setSound] = useState(true);
  const [vibration, setVibration] = useState(true);
  const theme = useTheme();

  
  const handleGoBack = () => {
    navigation.navigate('MainTabs');
  };

  const menuItems = [
    {
      id: 'account',
      title: '账号设置',
      icon: 'account-cog',
      onPress: () => navigation.navigate('PrivateInformation'),
    },
    {
      id: 'family',
      title: '家庭成员管理',
      icon: 'account-group',
      onPress: () => navigation.navigate('GroupChat'),
    },
    {
      id: 'task',
      title: '任务设置',
      icon: 'checkbox-marked-circle',
      onPress: () => navigation.navigate('TaskDetail'),
    },
    {
      id: 'notification',
      title: '通知设置',
      icon: 'bell',
      onPress: () => {},
    },
    {
      id: 'privacy',
      title: '隐私设置',
      icon: 'shield-lock',
      onPress: () => {},
    },
    {
      id: 'about',
      title: '关于我们',
      icon: 'information',
      onPress: () => {},
    },
  ];

  return (
    <LinearGradient
      colors={['#E6E6FA', '#D8BFD8']}
      style={styles.container}
    >
      <ScrollView>

        <Surface style={styles.section}>
          <Text style={styles.sectionTitle}>通用设置</Text>
          <List.Item
            title="深色模式"
            description="切换应用主题"
            left={props => <List.Icon {...props} icon="theme-light-dark" />}
            right={() => (
              <Switch
                value={darkMode}
                onValueChange={setDarkMode}
                color={theme.colors.primary}
              />
            )}
          />
          <Divider />
          <List.Item
            title="声音"
            description="开启/关闭提示音"
            left={props => <List.Icon {...props} icon="volume-high" />}
            right={() => (
              <Switch
                value={sound}
                onValueChange={setSound}
                color={theme.colors.primary}
              />
            )}
          />
          <Divider />
          <List.Item
            title="震动"
            description="开启/关闭震动"
            left={props => <List.Icon {...props} icon="vibrate" />}
            right={() => (
              <Switch
                value={vibration}
                onValueChange={setVibration}
                color={theme.colors.primary}
              />
            )}
          />
        </Surface>

        <Surface style={styles.section}>
          <Text style={styles.sectionTitle}>功能设置</Text>
          {menuItems.map(item => (
            <React.Fragment key={item.id}>
              <List.Item
                title={item.title}
                left={props => <List.Icon {...props} icon={item.icon} />}
                onPress={item.onPress}
              />
              {item.id !== menuItems[menuItems.length - 1].id && <Divider />}
            </React.Fragment>
          ))}
        </Surface>

        <Surface style={styles.section}>
          <Text style={styles.sectionTitle}>数据管理</Text>
          <List.Item
            title="清除缓存"
            description="清除应用缓存数据"
            left={props => <List.Icon {...props} icon="delete" />}
            onPress={() => {}}
          />
          <Divider />
          <List.Item
            title="数据备份"
            description="备份应用数据"
            left={props => <List.Icon {...props} icon="backup-restore" />}
            onPress={() => {}}
          />
        </Surface>

        <Surface style={styles.section}>
          <Text style={styles.sectionTitle}>版本信息</Text>
          <List.Item
            title="当前版本"
            description="v1.0.0"
            left={props => <List.Icon {...props} icon="information" />}
          />
        </Surface>

        <Button
          mode="outlined"
          onPress={() => navigation.navigate('LogIn')}
          style={styles.logoutButton}
        >
          退出登录
        </Button>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  section: {
    margin: 16,
    borderRadius: 10,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    padding: 16,
    paddingBottom: 8,
  },
  logoutButton: {
    margin: 16,
    marginTop: 0,
  },
});

export default Setting;
