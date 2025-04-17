import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CommonImages } from '../assets/images';

const FamilyContext = createContext();

const defaultFamily = {
  id: null,
  name: '',
  avatar: null,
  description: '',
  role: '管理员',
  quote: '一起创建温馨的家',
  members: []
};

export const FamilyProvider = ({ children }) => {
  const [hasFamily, setHasFamily] = useState(false);
  const [familyInfo, setFamilyInfo] = useState(defaultFamily);
  const [loading, setLoading] = useState(true);

  
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
        
      } finally {
        setLoading(false);
      }
    };

    loadFamilyState();
  }, []);

  
  const saveFamilyState = async (hasFamily, familyInfo) => {
    try {
      const familyState = { hasFamily, familyInfo };
      await AsyncStorage.setItem('familyState', JSON.stringify(familyState));
    } catch (error) {
      
    }
  };

  
  const createFamily = async (familyData) => {
    const newFamilyInfo = { 
      ...defaultFamily, 
      ...familyData,
      id: Date.now().toString(), 
      role: '管理员' 
    };
    setHasFamily(true);
    setFamilyInfo(newFamilyInfo);
    await saveFamilyState(true, newFamilyInfo);
    return newFamilyInfo;
  };

  
  const joinFamily = async (familyData) => {
    setHasFamily(true);
    setFamilyInfo({...defaultFamily, ...familyData, role: '成员'});
    await saveFamilyState(true, {...defaultFamily, ...familyData, role: '成员'});
    return true;
  };

  
  const leaveFamily = async () => {
    setHasFamily(false);
    setFamilyInfo(defaultFamily);
    await saveFamilyState(false, defaultFamily);
    return true;
  };

  
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

export const useFamily = () => useContext(FamilyContext);

export default FamilyContext; 