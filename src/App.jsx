import React from 'react';
import { Provider as PaperProvider, DefaultTheme } from 'react-native-paper';
import { Provider as StoreProvider } from 'react-redux';
import { store } from './store';
import AppNavigator from './navigation/AppNavigator';
import VirtualAICompanionProvider from './components/VirtualAICompanionProvider';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';
import { AuthProvider } from './store/AuthContext';

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
            <VirtualAICompanionProvider>
              <AppNavigator />
            </VirtualAICompanionProvider>
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