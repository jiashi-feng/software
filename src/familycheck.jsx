import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, FlatList, Modal, Button, ImageBackground } from 'react-native';
import { CommonImages ,FamilyAvatars} from './assets/images';

const FamilyCard = ({ family }) => {
  const [modalVisible, setModalVisible] = useState(false);

  const toggleModal = () => {
    setModalVisible(!modalVisible);
  };

  return (
    <View style={styles.familyCard}>
      <Image source={family.image} style={styles.familyImage} />
      <View style={styles.familyInfo}>
        <Text style={styles.familyName}>{family.name}</Text>
        <Text>家庭号: {family.id}</Text>
        <Text>成员数: {family.members.length}</Text>
        <TouchableOpacity onPress={toggleModal} style={styles.button}>
          <Text style={styles.buttonText}>查看家庭成员</Text>
        </TouchableOpacity>
      </View>

      {/* Modal for displaying family members */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={toggleModal}
      >
        <View style={styles.modalBackground}>
          <ImageBackground 
            source={CommonImages.tanchuangBg} // 图片路径
            style={styles.modalView}
            imageStyle={{ borderRadius: 20 }} // 圆角
          >
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>家庭成员</Text>
              {family.members.map((member, index) => (
                <Text key={index} style={styles.memberText}>• {member}</Text>
              ))}
              <Button title="关闭" onPress={toggleModal} color="#7c3aed" />
            </View>
          </ImageBackground>
        </View>
      </Modal>
    </View>
  );
};

const FamilyList = () => {
  const families = [
    {
      name: '家庭1',
      id: 'F001',
      members: ['Alice', 'Bob', 'Charlie', 'David'],
      image: FamilyAvatars.profile6,
    },
    {
      name: '家庭2',
      id: 'F002',
      members: ['Eve', 'Frank', 'Grace'],
      image: FamilyAvatars.profile7,
    },
  ];

  return (
    <View style={styles.container}>
      <FlatList
        data={families}
        renderItem={({ item }) => <FamilyCard family={item} />}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.familyList}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ede9fe', // 整体背景颜色
  },
  familyList: {
    padding: 20,
  },
  familyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f5ff', // 浅紫色背景
    borderColor: '#c4b5fd', // 淡紫色边框
    borderWidth: 1,
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#8b5cf6', // 柔和紫色阴影
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  familyImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#8b5cf6', // 紫色光晕
    marginRight: 10,
  },
  familyInfo: {
    flex: 1,
  },
  familyName: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#5b21b6', // 深紫色
  },
  button: {
    backgroundColor: '#d6bcf7', // 深一点的淡紫色
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginTop: 5,
  },
  buttonText: {
    color: 'white', // 按钮文字颜色
    letterSpacing: 0.5,
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    marginLeft: 20,
    alignItems: 'center',
  },
  modalView: {
    width: '90%', // 弹窗宽度
    height: '50%', // 弹窗高度
    marginRight: -20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    flex: 1,
    justifyContent: 'flex-start', // 将内容向上对齐
    alignItems: 'flex-start', // 将内容左对齐
    padding: 20,
    paddingRight: 30, // 增加右侧间距
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10, // 减少底部间距
    color: '#5b21b6', // 深紫色
  },
  memberText: {
    fontSize: 16,
    color: '#6b7280', // 中性灰紫色
  },
});

export default FamilyList;