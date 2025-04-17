import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CommonImages } from '../assets/images';

const AuthContext = createContext();

const defaultUserInfo = {
  name: '王小明',
  level: '家务达人 Lv.5',
  avatar: CommonImages.avatar,
  points: '2580',
  achievements: '12',
  completionRate: '98%'
};

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState(defaultUserInfo);
  const [loading, setLoading] = useState(true);

  
  useEffect(() => {
    const loadAuthState = async () => {
      try {
        const authStateJSON = await AsyncStorage.getItem('authState');
        if (authStateJSON) {
          const authState = JSON.parse(authStateJSON);
          setIsLoggedIn(authState.isLoggedIn);
          setUserInfo(authState.userInfo || defaultUserInfo);
        }
      } catch (error) {
        
      } finally {
        setLoading(false);
      }
    };

    loadAuthState();
  }, []);

  
  const saveAuthState = async (isLoggedIn, userInfo) => {
    try {
      const authState = { isLoggedIn, userInfo };
      await AsyncStorage.setItem('authState', JSON.stringify(authState));
    } catch (error) {
      
    }
  };

  
  const login = async (userData = {}) => {
    const newUserInfo = { ...defaultUserInfo, ...userData };
    setIsLoggedIn(true);
    setUserInfo(newUserInfo);
    await saveAuthState(true, newUserInfo);
    return true;
  };

  
  const logout = async () => {
    setIsLoggedIn(false);
    setUserInfo(defaultUserInfo);
    await saveAuthState(false, defaultUserInfo);
    return true;
  };

  
  const updateUserInfo = async (newUserInfo) => {
    const updatedUserInfo = { ...userInfo, ...newUserInfo };
    setUserInfo(updatedUserInfo);
    await saveAuthState(isLoggedIn, updatedUserInfo);
  };

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        userInfo,
        loading,
        login,
        logout,
        updateUserInfo
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext; 