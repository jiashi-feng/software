import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
} from 'react-native';
import {
  Text,
  IconButton,
  Surface,
  Divider,
  Button,
  Badge,
} from 'react-native-paper';
import { useNotification } from './store/NotificationContext';
import LinearGradient from 'react-native-linear-gradient';

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

  useEffect(() => {
    // 进入通知页面时，标记所有通知为已读
    markAllAsRead();
  }, []);

  const handleNotificationPress = (notification) => {
    setSelectedNotification(notification);
    setShowDetail(true);
    markAsRead(notification.id);
  };

  const handleCloseDetail = () => {
    setShowDetail(false);
    setSelectedNotification(null);
  };

  const handleActionPress = () => {
    if (selectedNotification?.action) {
      navigation.navigate(selectedNotification.action);
      setShowDetail(false);
    }
  };

  const handleDeleteNotification = (id) => {
    deleteNotification(id);
    if (selectedNotification?.id === id) {
      setShowDetail(false);
    }
  };

  const renderNotificationItem = ({ item }) => (
    <TouchableOpacity
      style={styles.notificationItem}
      onPress={() => handleNotificationPress(item)}
    >
      <View style={styles.notificationContent}>
        <View style={styles.notificationHeader}>
          <Text style={styles.notificationTitle}>{item.title}</Text>
          {!item.isRead && <Badge size={8} style={styles.unreadBadge} />}
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
        <Text style={styles.headerTitle}>消息通知</Text>
        {notifications.length > 0 && (
          <TouchableOpacity onPress={clearAllNotifications}>
            <Text style={styles.clearAllText}>清空</Text>
          </TouchableOpacity>
        )}
      </View>

      {notifications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <IconButton icon="bell-off" size={50} iconColor="#9B7EDE" />
          <Text style={styles.emptyText}>暂无消息通知</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderNotificationItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          ItemSeparatorComponent={() => <Divider style={styles.divider} />}
        />
      )}

      {/* 消息详情模态框 */}
      <Modal
        visible={showDetail}
        transparent
        animationType="slide"
        onRequestClose={handleCloseDetail}
      >
        <View style={styles.modalContainer}>
          <Surface style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>消息详情</Text>
              <IconButton
                icon="close"
                size={24}
                onPress={handleCloseDetail}
              />
            </View>
            
            {selectedNotification && (
              <View style={styles.detailContainer}>
                <Text style={styles.detailTitle}>{selectedNotification.title}</Text>
                <Text style={styles.detailTime}>
                  {new Date(selectedNotification.createdAt).toLocaleString()}
                </Text>
                <View style={styles.detailContentContainer}>
                  <Text style={styles.detailContent}>{selectedNotification.content}</Text>
                </View>
                
                {selectedNotification.action && (
                  <Button
                    mode="contained"
                    onPress={handleActionPress}
                    style={styles.actionButton}
                  >
                    查看详情
                  </Button>
                )}
              </View>
            )}
          </Surface>
        </View>
      </Modal>
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
  },
  notificationTime: {
    fontSize: 12,
    color: '#999',
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    elevation: 5,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  detailContainer: {
    flex: 1,
  },
  detailTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  detailTime: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  detailContentContainer: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  detailContent: {
    fontSize: 16,
    lineHeight: 24,
  },
  actionButton: {
    marginTop: 'auto',
    backgroundColor: '#9B7EDE',
  },
});

export default Notifications; 