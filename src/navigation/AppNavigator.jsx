import React, { useEffect, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTheme } from 'react-native-paper';
import CustomIcon from '../components/CustomIcon';
import { useVirtualAICompanion } from '../components/VirtualAICompanionProvider';
import { AICompanionNavigationEvents } from '../components/VirtualAICompanion';

// 导入所有页面
import LogIn from '../Log_in';
import Register from '../Register';
import PrivateInformation from '../Private_information';
import AbilityChoice from '../Ability_choice';
import Home from '../Index';
import Achievement from '../Achievement';
import AIAssistant from '../AI_assistant';
import Community from '../Community';
import GroupChat from '../Group_chat';
import PersonCenter from '../Person_center';
import Ranking from '../Ranking';
import Shopping from '../shopping';
import Setting from '../Setting';
import TaskDetail from '../Task_detail';
import CreateTask from '../Create_task';
import PostDetail from '../Post_detail';
import CreatePost from '../Create_post';
import ExchangeHistory from '../ExchangeHistory';
import SpecialScenarios from '../SpecialScenarios';
import TabooSettings from '../TabooSettings';
import AddCustomTaboo from '../AddCustomTaboo';
import JoinFamily from '../JoinFamily';
import CreateFamily from '../CreateFamily';
import FamilyTaskDetail from '../Family_task_detail';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const MainTabs = () => {
  const theme = useTheme();
  const { setScreenName } = useVirtualAICompanion();

  // 监听标签切换
  const handleTabChange = (e) => {
    try {
      const index = e.data.state.index;
      const routes = ['Home', 'Community', 'Shopping', 'PersonCenter'];
      if (index >= 0 && index < routes.length) {
        console.log(`切换到标签页: ${routes[index]}`);
        setScreenName(routes[index]);
      }
    } catch (error) {
      console.error('处理标签切换错误:', error);
    }
  };

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: '#666',
        tabBarStyle: {
          paddingBottom: 5,
          paddingTop: 5,
        },
        headerShown: false,
      }}
      screenListeners={{
        state: handleTabChange
      }}
    >
      <Tab.Screen
        name="Home"
        component={Home}
        options={{
          title: '首页',
          tabBarIcon: ({ color, size }) => (
            <CustomIcon name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Community"
        component={Community}
        options={{
          title: '社区',
          tabBarIcon: ({ color, size }) => (
            <CustomIcon name="account-group" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Shopping"
        component={Shopping}
        options={{
          title: '积分商城',
          tabBarIcon: ({ color, size }) => (
            <CustomIcon name="shopping" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="PersonCenter"
        component={PersonCenter}
        options={{
          title: '我的',
          tabBarIcon: ({ color, size }) => (
            <CustomIcon name="account" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  const { setScreenName, showCompanion } = useVirtualAICompanion();
  const navigationRef = useRef(null);
  const initialMainTabsLoad = useRef(true);

  // 设置导航事件监听
  useEffect(() => {
    // 监听AI助手发出的导航事件
    const unsubscribe = AICompanionNavigationEvents.addListener((screenName, params) => {
      if (navigationRef.current && screenName) {
        console.log(`AI助手请求导航到: ${screenName}`, params);
        navigationRef.current.navigate(screenName, params);
      }
    });
    
    return unsubscribe;
  }, []);

  // 监听导航状态变化
  const handleNavigationStateChange = (state) => {
    try {
      if (state?.routes?.length > 0) {
        const currentRoute = state.routes[state.index];
        const currentRouteName = currentRoute.name;
        
        // 如果是MainTabs，检查当前激活的标签页
        if (currentRouteName === 'MainTabs' && currentRoute.state?.routes?.length > 0) {
          const tabIndex = currentRoute.state.index || 0;
          const tabRoutes = ['Home', 'Community', 'Shopping', 'PersonCenter'];
          if (tabIndex >= 0 && tabIndex < tabRoutes.length) {
            console.log(`设置屏幕名称: ${tabRoutes[tabIndex]} (从MainTabs)`);
            setScreenName(tabRoutes[tabIndex]);
            
            // 只在第一次进入MainTabs时显示AI助手
            if (initialMainTabsLoad.current) {
              initialMainTabsLoad.current = false;
              // 延迟显示AI助手，确保页面已完全加载
              setTimeout(() => {
                showCompanion();
              }, 1000);
            }
            
            return;
          }
        }
        
        // 不是MainTabs或无法获取标签信息，使用当前路由名称
        console.log(`设置屏幕名称: ${currentRouteName}`);
        setScreenName(currentRouteName);
      }
    } catch (error) {
      console.error('处理导航状态变化错误:', error);
    }
  };

  return (
    <NavigationContainer 
      ref={navigationRef}
      onStateChange={handleNavigationStateChange}
    >
      <Stack.Navigator 
        initialRouteName="LogIn"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#fff',
          },
          headerTintColor: '#333',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen 
          name="LogIn" 
          component={LogIn} 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="Register" 
          component={Register}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="PrivateInformation" 
          component={PrivateInformation}
          options={{ title: '个人信息' }}
        />
        <Stack.Screen 
          name="AbilityChoice" 
          component={AbilityChoice}
          options={{ title: '技能选择' }}
        />
        <Stack.Screen 
          name="MainTabs" 
          component={MainTabs}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="GroupChat" 
          component={GroupChat}
          options={{ title: '群聊' ,
            headerShown: false,
          }}
        />
        <Stack.Screen 
          name="FamilyTaskDetail" 
          component={FamilyTaskDetail}
          options={{ 
            title: '家庭任务',
            headerShown: false,
          }}
        />
        <Stack.Screen 
          name="Ranking" 
          component={Ranking}
          options={{ title: '积分排行' }}
        />
        <Stack.Screen 
          name="Setting" 
          component={Setting}
          options={{ title: '设置' }}
        />
        <Stack.Screen 
          name="TaskDetail" 
          component={TaskDetail}
          options={{ title: '任务详情' ,
            headerShown: false, 
          }}
          
        />
        <Stack.Screen 
          name="CreateTask" 
          component={CreateTask}
          options={{ title: '创建任务' }}
        />
        <Stack.Screen 
          name="PostDetail" 
          component={PostDetail}
          options={{
            title: '帖子详情',
            headerBackTitle: '返回',
          }}
        />
        <Stack.Screen 
          name="CreatePost" 
          component={CreatePost}
          options={{
            title: '发布帖子',
            headerBackTitle: '返回',
          }}
        />
        <Stack.Screen
          name="ExchangeHistory"
          component={ExchangeHistory}
          options={{
            title: '兑换记录',
            headerBackTitle: '返回',
          }}
        />
        <Stack.Screen
          name="Achievement"
          component={Achievement}
          options={{
            title: '我的成就',
            headerBackTitle: '返回',
          }}
        />
        <Stack.Screen
          name="SpecialScenarios"
          component={SpecialScenarios}
          options={{
            title: '特殊情景设置',
            headerBackTitle: '返回',
          }}
        />
        <Stack.Screen
          name="AIAssistant"
          component={AIAssistant}
          options={{
            title: 'AI 助手',
            headerBackTitle: '返回',
          }}
        />
        <Stack.Screen
          name="TabooSettings"
          component={TabooSettings}
          options={{
            title: '禁忌设置',
            headerBackTitle: '返回',
          }}
        />
        <Stack.Screen
          name="AddCustomTaboo"
          component={AddCustomTaboo}
          options={{
            title: '添加自定义禁忌',
            headerBackTitle: '返回',
          }}
        />
        <Stack.Screen 
          name="JoinFamily" 
          component={JoinFamily}
          options={{ 
            headerShown: false,  // 因为JoinFamily组件内已经有自己的header
          }}
        />
        <Stack.Screen 
          name="CreateFamily" 
          component={CreateFamily}
          options={{ 
            headerShown: false,  // 如果CreateFamily组件也有自己的header
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator; 