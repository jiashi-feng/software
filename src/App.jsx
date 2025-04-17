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
import { NotificationProvider } from './store/NotificationContext';

const AuthStateListener = () => {
  const { isLoggedIn } = useAuth();
  const { leaveFamily, hasFamily } = useFamily();

  
  useEffect(() => {
    if (!isLoggedIn && hasFamily) {
      leaveFamily();
    }
  }, [isLoggedIn]);

  return null; 
};

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
              <NotificationProvider>
                <AuthStateListener />
                <VirtualAICompanionProvider>
                  <AppNavigator />
                </VirtualAICompanionProvider>
              </NotificationProvider>
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