import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
} from 'react-native';
import { IconButton } from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import * as ImagePicker from 'react-native-image-picker';

const CreateFamily = ({ navigation }) => {
  const [familyName, setFamilyName] = useState('');
  const [familyId, setFamilyId] = useState('');
  const [avatar, setAvatar] = useState(null);

  const handleSelectImage = () => {
    ImagePicker.launchImageLibrary({
      mediaType: 'photo',
      includeBase64: false,
      maxHeight: 200,
      maxWidth: 200,
    }, (response) => {
      if (response.assets) {
        setAvatar(response.assets[0].uri);
      }
    });
  };

  const handleCreate = () => {
    // 处理创建家庭逻辑
    console.log('创建家庭:', { familyName, familyId, avatar });
    // TODO: 实现创建家庭的API调用
    navigation.navigate('MainTabs');
  };


  return (
    <LinearGradient
      colors={['#E6E6FA', '#D8BFD8']}
      style={styles.container}
    >

      <View style={styles.content}>
        <TouchableOpacity
          style={styles.avatarContainer}
          onPress={handleSelectImage}
        >
          {avatar ? (
            <Image source={{ uri: avatar }} style={styles.avatar} />
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
        />

        <TextInput
          style={styles.input}
          placeholder="请输入家庭号"
          value={familyId}
          onChangeText={setFamilyId}
        />

        <TouchableOpacity
          style={styles.createButton}
          onPress={handleCreate}
        >
          <Text style={styles.createButtonText}>创建家庭</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
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
  backButtonContainer: {
    padding: 8,
  },
});

export default CreateFamily; 