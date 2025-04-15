import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {
  TextInput,
  Button,
  Text,
  Surface,
  Avatar,
  Divider,
  IconButton,
  Portal,
  Dialog,
  RadioButton,
} from 'react-native-paper';
import { launchImageLibrary } from 'react-native-image-picker';
import { CommonImages } from './assets/images';
import { useAuth } from './store/AuthContext';
import LinearGradient from 'react-native-linear-gradient';

const generateUserId = () => {
  // 生成一个8位数的随机用户ID，类似微信号
  const randomPart = Math.floor(10000000 + Math.random() * 90000000);
  return `u_${randomPart}`;
};

const PrivateInformation = ({ navigation }) => {
  const { userInfo, updateUserInfo } = useAuth();
  
  const [name, setName] = useState(userInfo?.name || '');
  const [age, setAge] = useState(userInfo?.age?.toString() || '');
  const [gender, setGender] = useState(userInfo?.gender || '');
  const [userId, setUserId] = useState(userInfo?.userId || generateUserId());
  const [avatar, setAvatar] = useState(typeof userInfo?.avatar === 'string' ? userInfo.avatar : null);
  
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingAge, setIsEditingAge] = useState(false);
  const [showGenderDialog, setShowGenderDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (userInfo?.avatar && typeof userInfo.avatar === 'string') {
      setAvatar(userInfo.avatar);
    }
  }, [userInfo?.avatar]);

  const handleImagePick = () => {
    launchImageLibrary({
      mediaType: 'photo',
      includeBase64: true,
    }, (response) => {
      if (response.didCancel) {
        return;
      }
      if (response.errorCode) {
        Alert.alert('错误', '选择图片时发生错误');
        return;
      }
      if (response.assets && response.assets[0]) {
        const newAvatar = response.assets[0].uri;
        setAvatar(newAvatar);
        saveUserInfo({ avatar: newAvatar });
      }
    });
  };

  const handleSaveName = () => {
    if (!name.trim()) {
      Alert.alert('提示', '姓名不能为空');
      return;
    }
    
    setIsEditingName(false);
    saveUserInfo({ name });
  };

  const handleSaveAge = () => {
    if (!age.trim()) {
      Alert.alert('提示', '年龄不能为空');
      return;
    }
    
    const ageNum = parseInt(age);
    if (isNaN(ageNum) || ageNum < 0 || ageNum > 120) {
      Alert.alert('提示', '请输入有效的年龄（0-120岁）');
      return;
    }
    
    setIsEditingAge(false);
    saveUserInfo({ age: ageNum });
  };

  const handleSaveGender = (selectedGender) => {
    setGender(selectedGender);
    setShowGenderDialog(false);
    saveUserInfo({ gender: selectedGender });
  };

  const saveUserInfo = async (updatedInfo) => {
    setIsLoading(true);
    try {
      await updateUserInfo({
        ...updatedInfo,
        userId: userId // 确保userId不会被修改
      });
      setIsLoading(false);
    } catch (error) {
      console.error('保存用户信息出错', error);
      Alert.alert('错误', '保存信息失败，请重试');
      setIsLoading(false);
    }
  };

  const renderGenderText = () => {
    switch (gender) {
      case 'male':
        return '男';
      case 'female':
        return '女';
      default:
        return '未设置';
    }
  };

  return (
    <LinearGradient
      colors={['#E6E6FA', '#D8BFD8']}
      style={styles.container}
    >

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Surface style={styles.avatarContainer}>
          <Avatar.Image
            size={130}
            source={avatar && typeof avatar === 'string' ? { uri: avatar } : CommonImages.default_avatar}
          />
          <TouchableOpacity 
            style={styles.changeAvatarButton}
            onPress={handleImagePick}
          >
            <Text style={styles.changeAvatarText}>更换头像</Text>
          </TouchableOpacity>
        </Surface>

        <Surface style={styles.infoContainer}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>用户id</Text>
            <View style={styles.infoValueContainer}>
              <Text style={styles.infoValue}>{userId}</Text>
              <Text style={styles.infoHint}>(不可修改)</Text>
            </View>
          </View>
          
          <Divider style={styles.divider} />
          
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>姓名</Text>
            {isEditingName ? (
              <View style={styles.editContainer}>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  mode="flat"
                  style={styles.editInput}
                  autoFocus
                />
                <View style={styles.editButtons}>
                  <Button 
                    mode="text" 
                    onPress={() => {
                      setName(userInfo?.name || '');
                      setIsEditingName(false);
                    }}
                  >
                    取消
                  </Button>
                  <Button 
                    mode="contained"
                    onPress={handleSaveName}
                    loading={isLoading}
                    disabled={isLoading}
                  >
                    保存
                  </Button>
                </View>
              </View>
            ) : (
              <TouchableOpacity 
                style={styles.infoValueContainer}
                onPress={() => setIsEditingName(true)}
              >
                <Text style={styles.infoValue}>{name || '未设置'}</Text>
                <IconButton icon="chevron-right" size={20} />
              </TouchableOpacity>
            )}
          </View>
          
          <Divider style={styles.divider} />
          
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>年龄</Text>
            {isEditingAge ? (
              <View style={styles.editContainer}>
                <TextInput
                  value={age}
                  onChangeText={setAge}
                  mode="flat"
                  style={styles.editInput}
                  keyboardType="number-pad"
                  maxLength={3}
                  autoFocus
                />
                <View style={styles.editButtons}>
                  <Button 
                    mode="text" 
                    onPress={() => {
                      setAge(userInfo?.age?.toString() || '');
                      setIsEditingAge(false);
                    }}
                  >
                    取消
                  </Button>
                  <Button 
                    mode="contained"
                    onPress={handleSaveAge}
                    loading={isLoading}
                    disabled={isLoading}
                  >
                    保存
                  </Button>
                </View>
              </View>
            ) : (
              <TouchableOpacity 
                style={styles.infoValueContainer}
                onPress={() => setIsEditingAge(true)}
              >
                <Text style={styles.infoValue}>{age ? `${age}岁` : '未设置'}</Text>
                <IconButton icon="chevron-right" size={20} />
              </TouchableOpacity>
            )}
          </View>
          
          <Divider style={styles.divider} />
          
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>性别</Text>
            <TouchableOpacity 
              style={styles.infoValueContainer}
              onPress={() => setShowGenderDialog(true)}
            >
              <Text style={styles.infoValue}>{renderGenderText()}</Text>
              <IconButton icon="chevron-right" size={20} />
            </TouchableOpacity>
          </View>
        </Surface>
        
        <Text style={styles.privacyHint}>您的个人信息仅用于个性化服务，我们会严格保护您的隐私安全</Text>
      </ScrollView>
      
      {/* 性别选择对话框 */}
      <Portal>
        <Dialog
          visible={showGenderDialog}
          onDismiss={() => setShowGenderDialog(false)}
          style={styles.dialog}
        >
          <Dialog.Title>选择性别</Dialog.Title>
          <Dialog.Content>
            <RadioButton.Group onValueChange={handleSaveGender} value={gender}>
              <RadioButton.Item label="男" value="male" />
              <RadioButton.Item label="女" value="female" />
            </RadioButton.Group>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowGenderDialog(false)}>取消</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  avatarContainer: {
    alignItems: 'center',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
  },
  changeAvatarButton: {
    marginTop: 15,
    padding: 10,
  },
  changeAvatarText: {
    color: '#6200ee',
    fontSize: 16,
  },
  infoContainer: {
    borderRadius: 10,
    overflow: 'hidden',
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
  },
  infoLabel: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  infoValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoValue: {
    fontSize: 16,
    color: '#555',
  },
  infoHint: {
    fontSize: 12,
    color: '#888',
    marginLeft: 5,
  },
  editContainer: {
    flex: 1,
    marginLeft: 20,
  },
  editInput: {
    backgroundColor: 'transparent',
    fontSize: 16,
  },
  editButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 5,
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  dialog: {
    borderRadius: 15,
  },
  privacyHint: {
    textAlign: 'center',
    color: '#888',
    fontSize: 12,
    marginTop: 20,
    marginBottom: 40,
  },
});

export default PrivateInformation;