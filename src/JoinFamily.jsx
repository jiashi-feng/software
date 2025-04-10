import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  FlatList,
  Image,
  TouchableOpacity,
} from 'react-native';
import {CommonImages} from './assets/images';
import LinearGradient from 'react-native-linear-gradient';

// 模拟家庭数据
const mockSearchResults = [
  {
    id: '1',
    name: '快乐家庭',
    familyId: 'F001',
    memberCount: 4,
    avatar:CommonImages.avatars,
  },
  {
    id: '2',
    name: '温暖之家',
    familyId: 'F002',
    memberCount: 3,
    avatar: CommonImages.avatarss,
  },
];

const JoinFamily = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  const handleSearch = (query) => {
    setSearchQuery(query);
    // 模拟搜索结果
    if (query.trim()) {
      setSearchResults(mockSearchResults);
    } else {
      setSearchResults([]);
    }
  };

  const handleJoinRequest = (familyId) => {
    // 处理申请入驻逻辑
    console.log('申请加入家庭:', familyId);
    // TODO: 实现申请入驻的API调用
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
        onPress={() => handleJoinRequest(item.familyId)}
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
  backButtonContainer: {
    padding: 8,
  },
});

export default JoinFamily; 