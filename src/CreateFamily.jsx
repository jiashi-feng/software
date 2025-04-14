import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  Modal,
  Alert,
} from 'react-native';
import { IconButton } from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import * as ImagePicker from 'react-native-image-picker';
import { useFamily } from './store/FamilyContext';
import { FamilyAvatars } from './assets/images';

const CreateFamily = ({ navigation }) => {
  const { createFamily } = useFamily();
  const [familyName, setFamilyName] = useState('');
  const [avatar, setAvatar] = useState(null);
  const [avatarSource, setAvatarSource] = useState(null);
  const [showAvatarModal, setShowAvatarModal] = useState(false);

  // 默认头像列表
  const defaultAvatars = [
    { key: 'profile1', source: FamilyAvatars.profile1 },
    { key: 'profile2', source: FamilyAvatars.profile2 },
    { key: 'profile3', source: FamilyAvatars.profile3 },
    { key: 'profile4', source: FamilyAvatars.profile4 },
    { key: 'profile5', source: FamilyAvatars.profile5 },
    { key: 'profile6', source: FamilyAvatars.profile6 },
    { key: 'profile7', source: FamilyAvatars.profile7 },
    { key: 'profile8', source: FamilyAvatars.profile8 },
    { key: 'profile9', source: FamilyAvatars.profile9 },
    { key: 'profile10', source: FamilyAvatars.profile10 },
    { key: 'profile11', source: FamilyAvatars.profile11 },
  ];

  const handleSelectImage = () => {
    setShowAvatarModal(true);
  };

  const handleCustomImageUpload = () => {
    ImagePicker.launchImageLibrary({
      mediaType: 'photo',
      includeBase64: true,
      maxHeight: 300,
      maxWidth: 300,
    }, (response) => {
      if (response.assets && response.assets.length > 0) {
        const base64Image = response.assets[0].base64;
        setAvatar(`data:image/jpeg;base64,${base64Image}`);
        setAvatarSource({ uri: `data:image/jpeg;base64,${base64Image}` });
        setShowAvatarModal(false);
      }
    });
  };

  const selectDefaultAvatar = (item) => {
    setAvatarSource(item.source);
    setAvatar(item.key);
    setShowAvatarModal(false);
  };

  const handleCreate = async () => {
    if (!familyName.trim()) {
      Alert.alert('提示', '请输入家庭名称');
      return;
    }

    if (!avatar) {
      Alert.alert('提示', '请选择家庭头像');
      return;
    }

    try {
      const newFamily = {
        name: familyName,
        avatar: avatar,
        createdAt: new Date().toISOString(),
      };

      await createFamily(newFamily);
      navigation.navigate('MainTabs');
    } catch (error) {
      console.error('创建家庭失败', error);
      Alert.alert('错误', '创建家庭失败，请重试');
    }
  };

  return (
    <LinearGradient
      colors={['#E6E6FA', '#D8BFD8']}
      style={styles.container}
    >

      <ScrollView style={styles.content}>
        <View style={styles.formContainer}>
          <TouchableOpacity
            style={styles.avatarContainer}
            onPress={handleSelectImage}
          >
            {avatarSource ? (
              <Image source={avatarSource} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <IconButton icon="camera" size={30} />
                <Text>点击选择头像</Text>
              </View>
            )}
          </TouchableOpacity>

          <TextInput
            style={styles.input}
            placeholder="请输入家庭名称"
            value={familyName}
            onChangeText={setFamilyName}
            maxLength={10}
          />

          <TouchableOpacity
            style={styles.createButton}
            onPress={handleCreate}
          >
            <Text style={styles.createButtonText}>创建家庭</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* 头像选择模态框 */}
      <Modal
        visible={showAvatarModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAvatarModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>选择头像</Text>
              <IconButton
                icon="close"
                size={24}
                onPress={() => setShowAvatarModal(false)}
              />
            </View>

            <Text style={styles.sectionTitle}>系统头像</Text>
            <View style={styles.avatarsGrid}>
              {defaultAvatars.map((item) => (
                <TouchableOpacity
                  key={item.key}
                  style={styles.avatarOption}
                  onPress={() => selectDefaultAvatar(item)}
                >
                  <Image source={item.source} style={styles.avatarOptionImage} />
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={styles.uploadButton}
              onPress={handleCustomImageUpload}
            >
              <Text style={styles.uploadButtonText}>上传自定义头像</Text>
            </TouchableOpacity>
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

  content: {
    flex: 1,
  },
  formContainer: {
    padding: 20,
    alignItems: 'center',
  },
  avatarContainer: {
    marginBottom: 30,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  input: {
    backgroundColor: 'white',
    width: '100%',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  createButton: {
    backgroundColor: '#9B7EDE',
    width: '100%',
    paddingVertical: 15,
    borderRadius: 25,
    marginTop: 20,
  },
  createButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  avatarsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  avatarOption: {
    width: '18%',
    marginBottom: 10,
  },
  avatarOptionImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  uploadButton: {
    backgroundColor: '#E6E6FA',
    width: '100%',
    paddingVertical: 15,
    borderRadius: 25,
    marginTop: 10,
  },
  uploadButtonText: {
    color: '#6200ee',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default CreateFamily; 