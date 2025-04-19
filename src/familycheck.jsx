import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView, Modal, Button, ImageBackground } from 'react-native';
import { CommonImages, FamilyAvatars } from './assets/images';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FamilyCard = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [members, setMembers] = useState([
    {
      id: 'currentUser',
      name: '我',
      avatar: null,
      role: '管理员',
    }
  ]);

  // 监听并加载家庭成员数据
  useEffect(() => {
    const loadMembers = async () => {
      try {
        // 使用与 Group_chat.jsx 相同的 storage key
        const storedMembers = await AsyncStorage.getItem('chatMembers');
        if (storedMembers) {
          setMembers(JSON.parse(storedMembers));
        } else {
          // 如果没有存储的成员数据，使用默认成员
          const defaultMembers = [{
            id: 'currentUser',
            name: '我',
            avatar: null,
            role: '管理员',
          }];
          setMembers(defaultMembers);
          await AsyncStorage.setItem('chatMembers', JSON.stringify(defaultMembers));
        }
      } catch (error) {
        console.error('Failed to load members:', error);
      }
    };

    loadMembers();
    // 设置监听器以检测成员更改
    const interval = setInterval(loadMembers, 1000);
    return () => clearInterval(interval);
  }, []);

  const toggleModal = () => {
    setModalVisible(!modalVisible);
  };

  return (
    <View style={styles.familyCard}>
      <Image source={FamilyAvatars.profile6} style={styles.familyImage} />
      <View style={styles.familyInfo}>
        <Text style={styles.familyName}>我的家庭</Text>
        <Text style={styles.familyId}>家庭号: F001</Text>
        <Text style={styles.memberCount}>成员数: {members.length}</Text>
        <TouchableOpacity onPress={toggleModal} style={styles.button}>
          <Text style={styles.buttonText}>查看家庭成员</Text>
        </TouchableOpacity>
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={toggleModal}
      >
        <View style={styles.modalBackground}>
          <ImageBackground 
            source={CommonImages.tanchuangBg} 
            style={styles.modalView}
            imageStyle={{ borderRadius: 20 }} 
          >
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>家庭成员</Text>
              <ScrollView>
                {members.map((member) => (
                  <View key={member.id} style={styles.memberItem}>
                    <Image 
                      source={member.avatar || CommonImages.avatar} 
                      style={styles.memberAvatar} 
                    />
                    <View style={styles.memberDetails}>
                      <Text style={styles.memberName}>{member.name}</Text>
                      <Text style={styles.memberRole}>{member.role}</Text>
                    </View>
                  </View>
                ))}
              </ScrollView>
              <Button title="关闭" onPress={toggleModal} color="#7c3aed" />
            </View>
          </ImageBackground>
        </View>
      </Modal>
    </View>
  );
};

const FamilyList = () => {
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.familyList}>
        <FamilyCard />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ede9fe',
  },
  familyList: {
    padding: 20,
  },
  familyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f5ff',
    borderColor: '#c4b5fd',
    borderWidth: 1,
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  familyImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#8b5cf6',
    marginRight: 10,
  },
  familyInfo: {
    flex: 1,
  },
  familyName: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#5b21b6',
    marginBottom: 4,
  },
  familyId: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 2,
  },
  memberCount: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 6,
  },
  button: {
    backgroundColor: '#d6bcf7',
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginTop: 5,
  },
  buttonText: {
    color: 'white',
    letterSpacing: 0.5,
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    marginLeft: 20,
    alignItems: 'center',
  },
  modalView: {
    width: '95%',
    height: '50%',
    marginRight: -10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    flex: 1,
    width: '100%',
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#5b21b6',
    textAlign: 'center',
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 10,
    marginBottom: 10,
    borderRadius: 10,
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#8b5cf6',
  },
  memberDetails: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#5b21b6',
  },
  memberRole: {
    fontSize: 14,
    color: '#6b7280',
  },
});

export default FamilyList;