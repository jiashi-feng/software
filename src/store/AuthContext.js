import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CommonImages } from '../assets/images';

// 创建认证上下文
const AuthContext = createContext();

// 用户默认信息
const defaultUserInfo = {
  name: '王小明',
  level: '家务达人 Lv.5',
  avatar: CommonImages.avatar,
  points: '2580',
  achievements: '12',
  completionRate: '98%'
};

// 认证状态提供者组件
export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState(defaultUserInfo);
  const [loading, setLoading] = useState(true);

  // 从存储中加载认证状态
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
        console.error('Error loading auth state', error);
      } finally {
        setLoading(false);
      }
    };

    loadAuthState();
  }, []);

  // 保存认证状态到存储
  const saveAuthState = async (isLoggedIn, userInfo) => {
    try {
      const authState = { isLoggedIn, userInfo };
      await AsyncStorage.setItem('authState', JSON.stringify(authState));
    } catch (error) {
      console.error('Error saving auth state', error);
    }
  };

  // 登录函数
  const login = async (userData = {}) => {
    const newUserInfo = { ...defaultUserInfo, ...userData };
    setIsLoggedIn(true);
    setUserInfo(newUserInfo);
    await saveAuthState(true, newUserInfo);
    return true;
  };

  // 登出函数
  const logout = async () => {
    setIsLoggedIn(false);
    setUserInfo(defaultUserInfo);
    await saveAuthState(false, defaultUserInfo);
    return true;
  };

  // 更新用户信息
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

// 自定义钩子，方便在组件中使用认证上下文
export const useAuth = () => useContext(AuthContext);

export default AuthContext; 