import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  FlatList,
  Image,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { FamilyAvatars } from './assets/images';
import LinearGradient from 'react-native-linear-gradient';
import { useNotification } from './store/NotificationContext';

const mockSearchResults = [
  {
    id: '1',
    name: '快乐家庭',
    familyId: 'F001',
    memberCount: 4,
    avatar: FamilyAvatars.profile6,
  },
  {
    id: '2',
    name: '温暖之家',
    familyId: 'F002',
    memberCount: 3, 
    avatar: FamilyAvatars.profile7,
  },
];

const JoinFamily = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { addNotification } = useNotification();

  const handleSearch = (query) => {
    setSearchQuery(query);
    
    if (query.trim()) {
      setSearchResults(mockSearchResults);
    } else {
      setSearchResults([]);
    }
  };

  const handleJoinRequest = async (family) => {
    setIsLoading(true);
    try {
      
      await addNotification({
        title: '家庭入驻申请',
        content: `您已申请加入"${family.name}"，请等待管理员审核。`,
        category: 'family_request',
        type: 'family',
        action: 'FamilyCheck',
        createdAt: new Date().toISOString(),
      });

      
      await new Promise(resolve => setTimeout(resolve, 1500));

      
      navigation.navigate('MainTabs');
    } catch (error) {
      
    } finally {
      setIsLoading(false);
    }
  };

  const renderFamilyItem = ({ item }) => (
    <View style={styles.familyItem}>
      <Image source={item.avatar} style={styles.familyAvatar} />
      <View style={styles.familyInfo}>
        <Text style={styles.familyName}>{item.name}</Text>
        <Text style={styles.familyId}>家庭号: {item.familyId}</Text>
        <Text style={styles.memberCount}>成员数: {item.memberCount}</Text>
      </View>
      <TouchableOpacity
        style={styles.joinButton}
        onPress={() => handleJoinRequest(item)}
        disabled={isLoading}
      >
        <Text style={styles.joinButtonText}>申请入驻</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <LinearGradient
      colors={['#E6E6FA', '#D8BFD8']}
      style={styles.container}
    >
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="请输入家庭号搜索"
          value={searchQuery}
          onChangeText={handleSearch}
        />
      </View>

      <FlatList
        data={searchResults}
        renderItem={renderFamilyItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
      />

      {}
      <Modal
        transparent
        visible={isLoading}
        animationType="fade"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <ActivityIndicator size="large" color="#9B7EDE" />
            <Text style={styles.loadingText}>申请提交中...</Text>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    padding: 16,
  },
  searchInput: {
    backgroundColor: 'white',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 10,
    fontSize: 16,
  },
  listContainer: {
    padding: 16,
  },
  familyItem: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    elevation: 2,
  },
  familyAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  familyInfo: {
    flex: 1,
    marginLeft: 16,
  },
  familyName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  familyId: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  memberCount: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  joinButton: {
    backgroundColor: '#9B7EDE',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  joinButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 5,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
});

export default JoinFamily; 