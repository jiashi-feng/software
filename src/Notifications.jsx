import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import {
  Text,
  IconButton,
  Surface,
  Divider,
  Button,
  Badge,
  Chip,
} from 'react-native-paper';
import { useNotification } from './store/NotificationContext';
import LinearGradient from 'react-native-linear-gradient';

const CATEGORIES = {
  TASK_ASSIGN: '任务分配',
  TASK_DEADLINE: '任务截止',
  FAMILY_REQUEST: '家庭申请',
};

// 添加分类标识符常量
const CATEGORY_KEYS = {
  TASK_ASSIGN: 'task_assign',
  TASK_DEADLINE: 'task_deadline',
  FAMILY_REQUEST: 'family_request',
};

const Notifications = ({ navigation }) => {
  const { 
    notifications, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification,
    clearAllNotifications 
  } = useNotification();
  
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    // 进入通知页面时，标记所有通知为已读
    markAllAsRead();
  }, []);

  const filteredNotifications = selectedCategory
    ? notifications.filter(notification => {
        // 根据标题自动判断分类
        const title = notification.title?.toLowerCase() || '';
        const content = notification.content?.toLowerCase() || '';
        
        switch(selectedCategory) {
          case CATEGORIES.TASK_ASSIGN:
            return title.includes('任务分配') || 
                   title.includes('分配任务') || 
                   content.includes('分配') ||
                   notification.category === CATEGORY_KEYS.TASK_ASSIGN;
          case CATEGORIES.TASK_DEADLINE:
            return title.includes('截止') || 
                   title.includes('到期') || 
                   content.includes('截止') ||
                   notification.category === CATEGORY_KEYS.TASK_DEADLINE;
          case CATEGORIES.FAMILY_REQUEST:
            return title.includes('申请') || 
                   title.includes('家庭') || 
                   content.includes('申请') ||
                   notification.category === CATEGORY_KEYS.FAMILY_REQUEST;
          default:
            return true;
        }
      })
    : notifications;

  const handleNotificationPress = (notification) => {
    setSelectedNotification(notification);
    setShowDetail(true);
    markAsRead(notification.id);

    // 直接处理任务分配通知的跳转
    const title = notification.title?.toLowerCase() || '';
    if (title.includes('任务分配')) {
      navigation.navigate('TaskDetail');
      return;
    }
  };

  const handleCloseDetail = () => {
    setShowDetail(false);
    setSelectedNotification(null);
  };

  const handleActionPress = () => {
    if (selectedNotification?.action) {
      const title = selectedNotification.title?.toLowerCase() || '';
      
      if (title.includes('任务分配')) {
        navigation.navigate('TaskDetail');
      } else {
        navigation.navigate(selectedNotification.action);
      }
      setShowDetail(false);
    }
  };

  const handleDeleteNotification = (id) => {
    deleteNotification(id);
    if (selectedNotification?.id === id) {
      setShowDetail(false);
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case CATEGORIES.TASK_ASSIGN:
        return 'clipboard-check-outline';
      case CATEGORIES.TASK_DEADLINE:
        return 'clock-alert-outline';
      case CATEGORIES.FAMILY_REQUEST:
        return 'account-group-outline';
      default:
        return 'bell-outline';
    }
  };

  // 获取每个分类的未读消息数量
  const getUnreadCount = (category = null) => {
    return notifications.filter(notification => {
      if (!notification.isRead) {
        if (!category) return true;
        
        const title = notification.title?.toLowerCase() || '';
        const content = notification.content?.toLowerCase() || '';
        
        switch(category) {
          case CATEGORIES.TASK_ASSIGN:
            return title.includes('任务分配') || 
                   title.includes('分配任务') || 
                   content.includes('分配') ||
                   notification.category === CATEGORY_KEYS.TASK_ASSIGN;
          case CATEGORIES.TASK_DEADLINE:
            return title.includes('截止') || 
                   title.includes('到期') || 
                   content.includes('截止') ||
                   notification.category === CATEGORY_KEYS.TASK_DEADLINE;
          case CATEGORIES.FAMILY_REQUEST:
            return title.includes('申请') || 
                   title.includes('家庭') || 
                   content.includes('申请') ||
                   notification.category === CATEGORY_KEYS.FAMILY_REQUEST;
          default:
            return false;
        }
      }
      return false;
    }).length;
  };

  const renderNotificationItem = ({ item }) => (
    <TouchableOpacity
      style={styles.notificationItem}
      onPress={() => handleNotificationPress(item)}
    >
      <View style={styles.notificationContent}>
        <View style={styles.notificationHeader}>
          <IconButton
            icon={getCategoryIcon(item.category)}
            size={24}
            iconColor="#9B7EDE"
            style={styles.categoryIcon}
          />
          <View style={styles.titleContainer}>
            <Text style={styles.notificationTitle}>{item.title}</Text>
            {!item.isRead && <Badge size={8} style={styles.unreadBadge} />}
          </View>
        </View>
        <Text style={styles.notificationPreview} numberOfLines={2}>
          {item.content}
        </Text>
        <Text style={styles.notificationTime}>
          {new Date(item.createdAt).toLocaleString()}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDeleteNotification(item.id)}
      >
        <IconButton icon="delete" size={20} iconColor="#999" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderCategories = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.categoriesContainer}
      contentContainerStyle={styles.categoriesContent}
    >
      <View style={styles.chipContainer}>
        <Chip
          mode="outlined"
          selected={selectedCategory === null}
          onPress={() => setSelectedCategory(null)}
          style={styles.categoryChip}
        >
          全部
        </Chip>
        {getUnreadCount() > 0 && (
          <Badge
            size={16}
            style={[styles.categoryBadge, { right: -6, top: -6 }]}
          >
            {getUnreadCount()}
          </Badge>
        )}
      </View>
      
      {Object.values(CATEGORIES).map((category) => (
        <View key={category} style={styles.chipContainer}>
          <Chip
            mode="outlined"
            selected={selectedCategory === category}
            onPress={() => setSelectedCategory(category)}
            style={styles.categoryChip}
            icon={() => (
              <IconButton
                icon={getCategoryIcon(category)}
                size={18}
                iconColor={selectedCategory === category ? '#8e24aa' : '#9B7EDE'}
              />
            )}
          >
            {category}
          </Chip>
          {getUnreadCount(category) > 0 && (
            <Badge
              size={16}
              style={[styles.categoryBadge, { right: -6, top: -6 }]}
            >
              {getUnreadCount(category)}
            </Badge>
          )}
        </View>
      ))}
    </ScrollView>
  );

  return (
    <LinearGradient
      colors={['#E6E6FA', '#D8BFD8']}
      style={styles.container}
    >
      <View style={styles.header}>
        <IconButton
          icon="arrow-left"
          size={24}
          onPress={() => navigation.goBack()}
        />
        <Text style={styles.headerTitle}>通知消息</Text>
        {notifications.length > 0 && (
          <TouchableOpacity onPress={clearAllNotifications}>
            <Text style={styles.clearAllText}>清空</Text>
          </TouchableOpacity>
        )}
      </View>

      {renderCategories()}

      <View style={styles.contentContainer}>
        {filteredNotifications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <IconButton 
              icon="bell-off" 
              size={50} 
              iconColor="#9B7EDE" 
            />
            <Text style={styles.emptyText}>暂无消息通知</Text>
          </View>
        ) : (
          <FlatList
            data={filteredNotifications}
            renderItem={renderNotificationItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            ItemSeparatorComponent={() => <Divider style={styles.divider} />}
          />
        )}
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  clearAllText: {
    color: '#6200ee',
    marginRight: 10,
  },
  categoriesContainer: {
    maxHeight: 50,
    marginBottom: 10,
  },
  categoriesContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryChip: {
    marginRight: 8,
    backgroundColor: 'white',
    height: 36,
    minWidth: 90,
    justifyContent: 'center',
  },
  listContainer: {
    padding: 16,
  },
  notificationItem: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 8,
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  categoryIcon: {
    margin: 0,
    marginRight: 8,
  },
  titleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
  unreadBadge: {
    backgroundColor: 'red',
  },
  notificationPreview: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
    marginLeft: 32,
  },
  notificationTime: {
    fontSize: 12,
    color: '#999',
    marginLeft: 32,
  },
  deleteButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 8,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
  },
  chipContainer: {
    position: 'relative',
    marginRight: 8,
    height: 36,
  },
  categoryBadge: {
    position: 'absolute',
    backgroundColor: '#FF4444',
    color: 'white',
    zIndex: 1,
  },
});

export default Notifications; 