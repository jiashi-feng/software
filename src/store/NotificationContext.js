import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

const systemNotification = {
  id: 'system-task-assign',
  title: '系统任务分配通知',
  content: '已为你自动分配6个任务，请点击查看任务详情。',
  isRead: false,
  createdAt: new Date().toISOString(),
  type: 'task',
  category: 'task_assign',
  action: 'TaskDetail'
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [hasUnread, setHasUnread] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hasAddedSystemNotification, setHasAddedSystemNotification] = useState(false);
  const { isLoggedIn } = useAuth();

  
  useEffect(() => {
    const loadNotificationState = async () => {
      try {
        const notificationStateJSON = await AsyncStorage.getItem('notificationState');
        if (notificationStateJSON) {
          const notificationState = JSON.parse(notificationStateJSON);
          setNotifications(notificationState.notifications || []);
          
          
          const unreadExists = notificationState.notifications.some(notification => !notification.isRead);
          setHasUnread(unreadExists);

          
          const hasSystem = notificationState.notifications.some(
            notification => notification.id === 'system-task-assign'
          );
          setHasAddedSystemNotification(hasSystem);
        }
      } catch (error) {
        
      } finally {
        setLoading(false);
      }
    };

    loadNotificationState();
  }, []);

  
  useEffect(() => {
    const addSystemNotificationAfterLogin = async () => {
      if (isLoggedIn && !loading && !hasAddedSystemNotification) {
        
        const updatedNotifications = [systemNotification, ...notifications];
        setNotifications(updatedNotifications);
        setHasUnread(true);
        setHasAddedSystemNotification(true);
        await saveNotificationState(updatedNotifications);
      }
    };

    addSystemNotificationAfterLogin();
  }, [isLoggedIn, loading, hasAddedSystemNotification]);

  
  const saveNotificationState = async (notifications) => {
    try {
      const notificationState = { notifications };
      await AsyncStorage.setItem('notificationState', JSON.stringify(notificationState));
    } catch (error) {
      
    }
  };

  
  const addNotification = async (notification) => {
    const newNotification = {
      id: Date.now().toString(),
      isRead: false,
      createdAt: new Date().toISOString(),
      ...notification
    };
    
    const updatedNotifications = [newNotification, ...notifications];
    setNotifications(updatedNotifications);
    setHasUnread(true);
    await saveNotificationState(updatedNotifications);
    return true;
  };

  
  const markAsRead = async (notificationId) => {
    const updatedNotifications = notifications.map(notification => 
      notification.id === notificationId 
        ? { ...notification, isRead: true } 
        : notification
    );
    
    setNotifications(updatedNotifications);
    
    
    const unreadExists = updatedNotifications.some(notification => !notification.isRead);
    setHasUnread(unreadExists);
    
    await saveNotificationState(updatedNotifications);
    return true;
  };

  
  const markAllAsRead = async () => {
    const updatedNotifications = notifications.map(notification => ({ 
      ...notification, 
      isRead: true 
    }));
    
    setNotifications(updatedNotifications);
    setHasUnread(false);
    await saveNotificationState(updatedNotifications);
    return true;
  };

  
  const deleteNotification = async (notificationId) => {
    const updatedNotifications = notifications.filter(
      notification => notification.id !== notificationId
    );
    
    setNotifications(updatedNotifications);
    
    
    const unreadExists = updatedNotifications.some(notification => !notification.isRead);
    setHasUnread(unreadExists);
    
    await saveNotificationState(updatedNotifications);
    return true;
  };

  
  const clearAllNotifications = async () => {
    setNotifications([]);
    setHasUnread(false);
    setHasAddedSystemNotification(false);
    await saveNotificationState([]);
    return true;
  };

  
  const resetSystemNotification = async () => {
    
    const filteredNotifications = notifications.filter(
      notification => notification.id !== 'system-task-assign'
    );
    
    setHasAddedSystemNotification(false);
    setNotifications(filteredNotifications);
    await saveNotificationState(filteredNotifications);
    
    
    const updatedNotifications = [
      {
        ...systemNotification,
        createdAt: new Date().toISOString() 
      }, 
      ...filteredNotifications
    ];
    
    setNotifications(updatedNotifications);
    setHasUnread(true);
    setHasAddedSystemNotification(true);
    await saveNotificationState(updatedNotifications);
    return true;
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        hasUnread,
        loading,
        addNotification,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAllNotifications,
        resetSystemNotification
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);

export default NotificationContext; 