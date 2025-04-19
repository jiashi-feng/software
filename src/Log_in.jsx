import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  StatusBar,
  Animated,
  Dimensions,
} from 'react-native';
import {
  TextInput,
  Button,
  Text,
  Surface,
  useTheme,
  HelperText,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { CommonImages } from './assets/images';
import { useAuth } from './store/AuthContext';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const LogIn = ({ navigation }) => {
  const { login } = useAuth();
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
  
  
  const slideAnimation = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  
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

  
  useEffect(() => {
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);
    setIsFormValid(isEmailValid && isPasswordValid);
  }, [email, password]);

  
  useEffect(() => {
    
    const timer = setTimeout(() => {
      setLoginModalVisible(true);
      Animated.timing(slideAnimation, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }).start();
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

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

  const handleLogin = async () => {
    if (isFormValid) {
      
      await login({ email });
      
      
      navigation.replace('MainTabs');
    }
  };

  const handleGuest = () => {
    
    navigation.replace('MainTabs');
  };

  const handleStartRegister = () => {
    
    hideLoginModal();
    navigation.navigate('Register');
  };

  const showLoginModal = () => {
    setLoginModalVisible(true);
    Animated.timing(slideAnimation, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
    }).start();
  };

  const hideLoginModal = () => {
    Animated.timing(slideAnimation, {
      toValue: SCREEN_HEIGHT,
      duration: 500,
      useNativeDriver: true,
    }).start(() => {
      setLoginModalVisible(false);
    });
  };

  const handleThirdPartyLogin = async (platform) => {
    
    await login({ provider: platform });
    
    
    hideLoginModal();
    
    
    navigation.replace('MainTabs');
  };

  const renderThirdPartyLogin = () => (
    <View style={styles.thirdPartyContainer}>
      <Text style={styles.dividerText}>使用第三方账号登录</Text>
      <View style={styles.socialButtonsContainer}>
        <View style={styles.socialButtons}>
          <TouchableOpacity 
            style={styles.socialButton}
            onPress={() => handleThirdPartyLogin('微信')}
          >
            <Icon name="wechat" size={30} color="#07C160" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.socialButton}
            onPress={() => handleThirdPartyLogin('QQ')}
          >
            <Icon name="qqchat" size={30} color="#12B7F5" />
          </TouchableOpacity>
        </View>
        <View style={styles.registerContainer}>
          <Text style={styles.registerText}>没有账号？</Text>
          <TouchableOpacity onPress={handleStartRegister}>
            <Text style={styles.registerButton}>立即注册</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderLoginForm = () => (
    <Animated.View
      style={[
        styles.modalContainer,
        {
          transform: [{ translateY: slideAnimation }],
          top: '50%',
          marginTop: -200, 
        },
      ]}
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
    </Animated.View>
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
        {loginModalVisible && renderLoginForm()}
      </KeyboardAvoidingView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 240,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 15,
    color: '#]ff8c94',
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
    marginTop: 20,
  },
  thirdPartyLoginHome: {
    marginTop: 30,
  },
  dividerText: {
    marginVertical: 10,
    color: '#123',
    fontSize: 14,
  },
  socialButtonsContainer: {
    width: '100%',
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
    position: 'absolute',
    width: '90%',
    maxWidth: 400,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalSurface: {
    padding: 20,
    borderRadius: 15,
    elevation: 5,
    width: '100%',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 15,
  },
  registerText: {
    color: '#666',
    fontSize: 14,
  },
  registerButton: {
    color: '#6200ee',
    fontWeight: 'bold',
    fontSize: 14,
    marginLeft: 5,
  },
});

export default LogIn;
