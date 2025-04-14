import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CommonImages } from '../assets/images';

// 创建家庭上下文
const FamilyContext = createContext();

// 默认家庭信息
const defaultFamily = {
  id: null,
  name: '',
  avatar: null,
  description: '',
  role: '管理员',
  quote: '一起创建温馨的家',
  members: []
};

// 家庭状态提供者组件
export const FamilyProvider = ({ children }) => {
  const [hasFamily, setHasFamily] = useState(false);
  const [familyInfo, setFamilyInfo] = useState(defaultFamily);
  const [loading, setLoading] = useState(true);

  // 从存储中加载家庭状态
  useEffect(() => {
    const loadFamilyState = async () => {
      try {
        const familyStateJSON = await AsyncStorage.getItem('familyState');
        if (familyStateJSON) {
          const familyState = JSON.parse(familyStateJSON);
          setHasFamily(familyState.hasFamily);
          setFamilyInfo(familyState.familyInfo || defaultFamily);
        }
      } catch (error) {
        console.error('Error loading family state', error);
      } finally {
        setLoading(false);
      }
    };

    loadFamilyState();
  }, []);

  // 保存家庭状态到存储
  const saveFamilyState = async (hasFamily, familyInfo) => {
    try {
      const familyState = { hasFamily, familyInfo };
      await AsyncStorage.setItem('familyState', JSON.stringify(familyState));
    } catch (error) {
      console.error('Error saving family state', error);
    }
  };

  // 创建家庭
  const createFamily = async (familyData) => {
    const newFamilyInfo = { 
      ...defaultFamily, 
      ...familyData,
      id: Date.now().toString(), // 使用时间戳生成唯一ID
      role: '管理员' // 创建者默认为管理员
    };
    setHasFamily(true);
    setFamilyInfo(newFamilyInfo);
    await saveFamilyState(true, newFamilyInfo);
    return newFamilyInfo;
  };

  // 加入家庭
  const joinFamily = async (familyData) => {
    setHasFamily(true);
    setFamilyInfo({...defaultFamily, ...familyData, role: '成员'});
    await saveFamilyState(true, {...defaultFamily, ...familyData, role: '成员'});
    return true;
  };

  // 退出家庭
  const leaveFamily = async () => {
    setHasFamily(false);
    setFamilyInfo(defaultFamily);
    await saveFamilyState(false, defaultFamily);
    return true;
  };

  // 更新家庭信息
  const updateFamilyInfo = async (newFamilyInfo) => {
    const updatedFamilyInfo = { ...familyInfo, ...newFamilyInfo };
    setFamilyInfo(updatedFamilyInfo);
    await saveFamilyState(hasFamily, updatedFamilyInfo);
  };

  return (
    <FamilyContext.Provider
      value={{
        hasFamily,
        familyInfo,
        loading,
        createFamily,
        joinFamily,
        leaveFamily,
        updateFamilyInfo
      }}
    >
      {children}
    </FamilyContext.Provider>
  );
};

// 自定义钩子，方便在组件中使用家庭上下文
export const useFamily = () => useContext(FamilyContext);

export default FamilyContext; 