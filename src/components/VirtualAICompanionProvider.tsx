import React, { ReactNode, createContext, useState, useContext, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import VirtualAICompanion from './VirtualAICompanion';

interface VirtualAICompanionContextType {
  isVisible: boolean;
  showCompanion: () => void;
  hideCompanion: () => void;
  toggleCompanion: () => void;
  setScreenName: (screenName: string) => void;
}

const defaultContextValue: VirtualAICompanionContextType = {
  isVisible: false,
  showCompanion: () => {},
  hideCompanion: () => {},
  toggleCompanion: () => {},
  setScreenName: () => {},
};

export const VirtualAICompanionContext = createContext<VirtualAICompanionContextType>(defaultContextValue);

export const useVirtualAICompanion = () => useContext(VirtualAICompanionContext);

interface VirtualAICompanionProviderProps {
  children: ReactNode;
  initialVisible?: boolean;
}

const EXCLUDED_SCREENS = ['LogIn', 'Register', 'AbilityChoice', 'PrivateInformation'];

const VirtualAICompanionProvider: React.FC<VirtualAICompanionProviderProps> = ({
  children,
  initialVisible = false,
}) => {
  const [isVisible, setIsVisible] = useState(initialVisible);
  const [currentScreen, setCurrentScreen] = useState<string>('');

  
  const shouldShowCompanion = !EXCLUDED_SCREENS.includes(currentScreen);

  
  const showCompanion = () => setIsVisible(true);
  const hideCompanion = () => setIsVisible(false);
  const toggleCompanion = () => setIsVisible(prev => !prev);
  const setScreenName = (screenName: string) => setCurrentScreen(screenName);

  
  const contextValue = {
    isVisible,
    showCompanion,
    hideCompanion,
    toggleCompanion,
    setScreenName,
  };

  return (
    <VirtualAICompanionContext.Provider value={contextValue}>
      {children}
      {isVisible && shouldShowCompanion && <VirtualAICompanion />}
    </VirtualAICompanionContext.Provider>
  );
};

export default VirtualAICompanionProvider; 