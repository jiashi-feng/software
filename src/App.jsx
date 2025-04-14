import React, { useEffect } from 'react';
import { Provider as PaperProvider, DefaultTheme } from 'react-native-paper';
import { Provider as StoreProvider } from 'react-redux';
import { store } from './store';
import AppNavigator from './navigation/AppNavigator';
import VirtualAICompanionProvider from './components/VirtualAICompanionProvider';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';
import { AuthProvider, useAuth } from './store/AuthContext';
import { FamilyProvider, useFamily } from './store/FamilyContext';

// 用于同步认证和家庭状态的组件
const AuthStateListener = () => {
  const { isLoggedIn } = useAuth();
  const { leaveFamily, hasFamily } = useFamily();

  // 监听登录状态变化，当用户登出时重置家庭状态
  useEffect(() => {
    if (!isLoggedIn && hasFamily) {
      leaveFamily();
    }
  }, [isLoggedIn]);

  return null; // 这是一个功能性组件，不需要渲染UI
};

// 定义应用的默认主题
const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#6200ee',
    accent: '#03dac4',
  },
};

const App = () => {
  return (
    <GestureHandlerRootView style={styles.container}>
      <StoreProvider store={store}>
        <PaperProvider theme={theme}>
          <AuthProvider>
            <FamilyProvider>
              <AuthStateListener />
              <VirtualAICompanionProvider>
                <AppNavigator />
              </VirtualAICompanionProvider>
            </FamilyProvider>
          </AuthProvider>
        </PaperProvider>
      </StoreProvider>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App; 