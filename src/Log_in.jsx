import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import {
  TextInput,
  Button,
  Text,
  Surface,
  useTheme,
  HelperText,
  Divider,
  Modal,
  Portal,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { CommonImages } from './assets/images';

const LogIn = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isFormValid, setIsFormValid] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [loginModalVisible, setLoginModalVisible] = useState(false);
  const theme = useTheme();

  // 邮箱验证
  const validateEmail = (text) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!text) {
      setEmailError('请输入邮箱');
      return false;
    } else if (!emailRegex.test(text)) {
      setEmailError('请输入有效的邮箱格式');
      return false;
    }
    setEmailError('');
    return true;
  };

  // 密码验证
  const validatePassword = (text) => {
    const hasLetter = /[a-zA-Z]/.test(text);
    const hasNumber = /[0-9]/.test(text);
    
    if (!text) {
      setPasswordError('请输入密码');
      return false;
    } else if (text.length < 6) {
      setPasswordError('密码长度至少为6位');
      return false;
    } else if (!hasLetter || !hasNumber) {
      setPasswordError('密码必须包含字母和数字');
      return false;
    }
    setPasswordError('');
    return true;
  };

  // 表单验证
  useEffect(() => {
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);
    setIsFormValid(isEmailValid && isPasswordValid);
  }, [email, password]);

  const handleEmailChange = (text) => {
    setEmail(text);
    if (emailTouched) {
      validateEmail(text);
    }
  };

  const handlePasswordChange = (text) => {
    setPassword(text);
    if (passwordTouched) {
      validatePassword(text);
    }
  };

  const handleEmailFocus = () => {
    setEmailTouched(true);
    validateEmail(email);
  };

  const handlePasswordFocus = () => {
    setPasswordTouched(true);
    validatePassword(password);
  };

  const handleLogin = () => {
    if (isFormValid) {
      // 实际登录逻辑
      setLoginModalVisible(false);
      navigation.navigate('MainTabs');
    }
  };

  const handleGuest = () => {
    // 游客访问，直接进入主页
    navigation.navigate('MainTabs');
  };

  const handleStartRegister = () => {
    // 跳转到注册页面
    navigation.navigate('Register');
  };

  const showLoginModal = () => {
    setLoginModalVisible(true);
  };

  const hideLoginModal = () => {
    setLoginModalVisible(false);
  };

  const renderThirdPartyLogin = () => (
    <View style={styles.thirdPartyContainer}>
      <Text style={styles.dividerText}>使用第三方账号登录</Text>
      <View style={styles.socialButtons}>
        <TouchableOpacity 
          style={styles.socialButton}
          onPress={() => {
            // 微信登录逻辑
            hideLoginModal();
            navigation.navigate('MainTabs');
          }}
        >
          <Icon name="wechat" size={30} color="#07C160" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.socialButton}
          onPress={() => {
            // QQ登录逻辑
            hideLoginModal();
            navigation.navigate('MainTabs');
          }}
        >
          <Icon name="qqchat" size={30} color="#12B7F5" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderLoginForm = () => (
    <Portal>
      <Modal
        visible={loginModalVisible}
        onDismiss={hideLoginModal}
        contentContainerStyle={styles.modalContainer}
      >
        <Surface style={styles.modalSurface}>
          <Text style={styles.modalTitle}>账号登录</Text>
          
          <View>
            <TextInput
              label="邮箱"
              value={email}
              onChangeText={handleEmailChange}
              onFocus={handleEmailFocus}
              mode="outlined"
              style={styles.input}
              keyboardType="email-address"
              
              autoCapitalize="none"
              error={emailTouched && !!emailError}
            />
            {emailTouched && !!emailError && (
              <HelperText type="error">{emailError}</HelperText>
            )}
          </View>

          <View>
            <TextInput
              label="密码"
              value={password}
              onChangeText={handlePasswordChange}
              onFocus={handlePasswordFocus}
              mode="outlined"
              style={styles.input}
              secureTextEntry={secureTextEntry}
              error={passwordTouched && !!passwordError}
              right={
                <TextInput.Icon
                  icon={secureTextEntry ? 'eye-off' : 'eye'}
                  onPress={() => setSecureTextEntry(!secureTextEntry)}
                />
              }
            />
            {passwordTouched && !!passwordError && (
              <HelperText type="error">{passwordError}</HelperText>
            )}
          </View>

          <Button
            mode="contained"
            onPress={handleLogin}
            style={styles.button}
            disabled={!isFormValid}
          >
            登录
          </Button>

          {renderThirdPartyLogin()}
        </Surface>
      </Modal>
    </Portal>
  );

  return (
    <ImageBackground
      source={CommonImages.background}
      style={styles.background}
    >
      <StatusBar translucent backgroundColor="transparent" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.logoContainer}>
          <Icon name="home-heart" size={100} color={theme.colors.primary} />
          <Text style={styles.title}>家庭任务智能管理系统</Text>
        </View>

        <View style={styles.buttonsContainer}>
          <Button
            mode="contained"
            onPress={showLoginModal}
            style={[styles.mainButton, { backgroundColor: 'rgba(249, 239, 239, 0.22)' }]}
            contentStyle={styles.buttonContent}
            labelStyle={[styles.buttonLabel, { color: 'rgb(48, 21, 221)' }]}
          >
            登录
          </Button>
          
          <Button
            mode="contained"
            onPress={handleStartRegister}
            style={[styles.mainButton, { backgroundColor: 'rgba(255, 255, 255, 0.22)' }]}
            contentStyle={styles.buttonContent}
            labelStyle={[styles.buttonLabel, { color: 'rgb(104, 35, 207)' }]}
          >
            注册
          </Button>
          
          <Button
            mode="outlined"
            onPress={handleGuest}
            style={styles.mainButton}
            contentStyle={styles.buttonContent}
            labelStyle={styles.buttonLabel}
          >
            游客访问
          </Button>
        </View>

        <View style={styles.thirdPartyLoginHome}>
          {renderThirdPartyLogin()}
        </View>
        
        {renderLoginForm()}
      </KeyboardAvoidingView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    paddingTop: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 15,
    color: '#fff',
  },
  buttonsContainer: {
    gap: 20,
  },
  mainButton: {
    borderRadius: 8,
    elevation: 3,
    width: '80%',
    alignSelf: 'center',
  },
  buttonContent: {
    height: 45,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  input: {
    backgroundColor: 'transparent',
    marginBottom: 10,
  },
  button: {
    marginTop: 15,
    paddingVertical: 8,
    borderRadius: 10,
  },
  thirdPartyContainer: {
    alignItems: 'center',
  },
  thirdPartyLoginHome: {
    marginTop: 30,
  },
  dividerText: {
    marginVertical: 10,
    color: '#fff',
    fontSize: 14,
  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    marginTop: 10,
  },
  socialButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 15,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  modalContainer: {
    padding: 20,
  },
  modalSurface: {
    padding: 20,
    borderRadius: 15,
    elevation: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
});

export default LogIn;
