import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';

// 创建通知上下文
const NotificationContext = createContext();

// 系统默认通知
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

// 通知状态提供者组件
export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [hasUnread, setHasUnread] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hasAddedSystemNotification, setHasAddedSystemNotification] = useState(false);
  const { isLoggedIn } = useAuth();

  // 从存储中加载通知状态
  useEffect(() => {
    const loadNotificationState = async () => {
      try {
        const notificationStateJSON = await AsyncStorage.getItem('notificationState');
        if (notificationStateJSON) {
          const notificationState = JSON.parse(notificationStateJSON);
          setNotifications(notificationState.notifications || []);
          
          // 检查是否有未读消息
          const unreadExists = notificationState.notifications.some(notification => !notification.isRead);
          setHasUnread(unreadExists);

          // 检查是否已经添加过系统通知
          const hasSystem = notificationState.notifications.some(
            notification => notification.id === 'system-task-assign'
          );
          setHasAddedSystemNotification(hasSystem);
        }
      } catch (error) {
        console.error('Error loading notification state', error);
      } finally {
        setLoading(false);
      }
    };

    loadNotificationState();
  }, []);

  // 用户登录或注册后添加系统通知
  useEffect(() => {
    const addSystemNotificationAfterLogin = async () => {
      if (isLoggedIn && !loading && !hasAddedSystemNotification) {
        // 添加系统默认通知
        const updatedNotifications = [systemNotification, ...notifications];
        setNotifications(updatedNotifications);
        setHasUnread(true);
        setHasAddedSystemNotification(true);
        await saveNotificationState(updatedNotifications);
      }
    };

    addSystemNotificationAfterLogin();
  }, [isLoggedIn, loading, hasAddedSystemNotification]);

  // 保存通知状态到存储
  const saveNotificationState = async (notifications) => {
    try {
      const notificationState = { notifications };
      await AsyncStorage.setItem('notificationState', JSON.stringify(notificationState));
    } catch (error) {
      console.error('Error saving notification state', error);
    }
  };

  // 添加新通知
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

  // 标记通知为已读
  const markAsRead = async (notificationId) => {
    const updatedNotifications = notifications.map(notification => 
      notification.id === notificationId 
        ? { ...notification, isRead: true } 
        : notification
    );
    
    setNotifications(updatedNotifications);
    
    // 检查是否还有未读通知
    const unreadExists = updatedNotifications.some(notification => !notification.isRead);
    setHasUnread(unreadExists);
    
    await saveNotificationState(updatedNotifications);
    return true;
  };

  // 标记所有通知为已读
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

  // 删除通知
  const deleteNotification = async (notificationId) => {
    const updatedNotifications = notifications.filter(
      notification => notification.id !== notificationId
    );
    
    setNotifications(updatedNotifications);
    
    // 检查是否还有未读通知
    const unreadExists = updatedNotifications.some(notification => !notification.isRead);
    setHasUnread(unreadExists);
    
    await saveNotificationState(updatedNotifications);
    return true;
  };

  // 清空所有通知
  const clearAllNotifications = async () => {
    setNotifications([]);
    setHasUnread(false);
    setHasAddedSystemNotification(false);
    await saveNotificationState([]);
    return true;
  };

  // 重置系统通知（用于测试）
  const resetSystemNotification = async () => {
    // 移除系统通知
    const filteredNotifications = notifications.filter(
      notification => notification.id !== 'system-task-assign'
    );
    
    setHasAddedSystemNotification(false);
    setNotifications(filteredNotifications);
    await saveNotificationState(filteredNotifications);
    
    // 重新添加系统通知
    const updatedNotifications = [
      {
        ...systemNotification,
        createdAt: new Date().toISOString() // 更新时间戳
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

// 自定义钩子，方便在组件中使用通知上下文
export const useNotification = () => useContext(NotificationContext);

export default NotificationContext; 