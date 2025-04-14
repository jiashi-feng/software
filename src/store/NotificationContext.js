import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 创建通知上下文
const NotificationContext = createContext();

// 示例通知数据
const defaultNotifications = [
  {
    id: '1',
    title: '任务分配通知',
    content: '已为你自动分配6个任务，请点击任务详情，查看任务。',
    isRead: false,
    createdAt: new Date().toISOString(),
    type: 'task',
    action: 'TaskDetail'
  }
];

// 通知状态提供者组件
export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState(defaultNotifications);
  const [hasUnread, setHasUnread] = useState(true);
  const [loading, setLoading] = useState(true);

  // 从存储中加载通知状态
  useEffect(() => {
    const loadNotificationState = async () => {
      try {
        const notificationStateJSON = await AsyncStorage.getItem('notificationState');
        if (notificationStateJSON) {
          const notificationState = JSON.parse(notificationStateJSON);
          setNotifications(notificationState.notifications || defaultNotifications);
          
          // 检查是否有未读消息
          const unreadExists = notificationState.notifications.some(notification => !notification.isRead);
          setHasUnread(unreadExists);
        } else {
          // 如果没有存储的通知，使用默认通知
          setNotifications(defaultNotifications);
          setHasUnread(true);
        }
      } catch (error) {
        console.error('Error loading notification state', error);
      } finally {
        setLoading(false);
      }
    };

    loadNotificationState();
  }, []);

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
    await saveNotificationState([]);
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
        clearAllNotifications
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

// 自定义钩子，方便在组件中使用通知上下文
export const useNotification = () => useContext(NotificationContext);

export default NotificationContext; 