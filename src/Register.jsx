import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import {
  TextInput,
  Button,
  Text,
  Surface,
  useTheme,
  HelperText,
  Appbar,
  RadioButton,
  Divider,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from './store/AuthContext';
import { CommonImages } from './assets/images';

const Register = ({ navigation }) => {
  const theme = useTheme();
  const { login } = useAuth();
  const [step, setStep] = useState(1); 
  const [contactType, setContactType] = useState('phone'); 
  const [contact, setContact] = useState('');
  const [contactError, setContactError] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [codeError, setCodeError] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [username, setUsername] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [secureTextEntry, setSecureTextEntry] = useState(true);

  
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  
  const validateContact = () => {
    if (contactType === 'phone') {
      const phoneRegex = /^1[3-9]\d{9}$/;
      if (!contact) {
        setContactError('请输入手机号码');
        return false;
      } else if (!phoneRegex.test(contact)) {
        setContactError('请输入有效的手机号码');
        return false;
      }
      setContactError('');
      return true;
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!contact) {
        setContactError('请输入邮箱');
        return false;
      } else if (!emailRegex.test(contact)) {
        setContactError('请输入有效的邮箱格式');
        return false;
      }
      setContactError('');
      return true;
    }
  };

  
  const validateCode = () => {
    if (!verificationCode) {
      setCodeError('请输入验证码');
      return false;
    } else if (verificationCode.length !== 6) {
      setCodeError('验证码为6位数字');
      return false;
    }
    setCodeError('');
    return true;
  };

  
  const validateUsername = () => {
    if (!username) {
      setUsernameError('请输入用户名');
      return false;
    } else if (username.length < 3) {
      setUsernameError('用户名长度至少为3位');
      return false;
    }
    setUsernameError('');
    return true;
  };

  
  const validatePassword = () => {
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    
    if (!password) {
      setPasswordError('请输入密码');
      return false;
    } else if (password.length < 6) {
      setPasswordError('密码长度至少为6位');
      return false;
    } else if (!hasLetter || !hasNumber) {
      setPasswordError('密码必须包含字母和数字');
      return false;
    }
    setPasswordError('');
    return true;
  };

  
  const validateConfirmPassword = () => {
    if (!confirmPassword) {
      setConfirmPasswordError('请再次输入密码');
      return false;
    } else if (confirmPassword !== password) {
      setConfirmPasswordError('两次输入的密码不一致');
      return false;
    }
    setConfirmPasswordError('');
    return true;
  };

  
  const sendVerificationCode = () => {
    if (validateContact()) {
      
      
      setCountdown(60); 
      
    }
  };

  
  const verifyCode = () => {
    if (validateCode()) {
      
      setStep(3);
    }
  };

  
  const completeRegistration = async () => {
    if (validateUsername() && validatePassword() && validateConfirmPassword()) {
      
      const userInfo = {
        name: username,
        level: '新手 Lv.1',
        avatar: CommonImages.avatar,
        points: '0',
        achievements: '0',
        completionRate: '0%'
      };

      
      await login(userInfo);
      
      
      navigation.navigate('AbilityChoice');
    }
  };

  
  const handleThirdPartyRegister = async (platform) => {
    
    const userInfo = {
      name: `${platform}用户`,
      level: '新手 Lv.1',
      avatar: CommonImages.avatar,
      points: '0',
      achievements: '0',
      completionRate: '0%'
    };

    
    await login(userInfo);
    
    
    navigation.navigate('AbilityChoice');
  };

  
  const renderHeader = () => (
    <Appbar.Header>
      <Appbar.BackAction onPress={() => {
        if (step > 1) {
          setStep(step - 1);
        } else {
          navigation.goBack();
        }
      }} />
      <Appbar.Content title="注册账号" />
    </Appbar.Header>
  );

  
  const renderThirdPartyLogin = () => (
    <View style={styles.thirdPartyContainer}>
      <Divider style={styles.divider} />
      <Text style={styles.dividerText}>使用第三方账号注册</Text>
      <View style={styles.socialButtons}>
        <TouchableOpacity 
          style={styles.socialButton}
          onPress={() => handleThirdPartyRegister('微信')}
        >
          <Icon name="wechat" size={30} color="#07C160" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.socialButton}
          onPress={() => handleThirdPartyRegister('QQ')}
        >
          <Icon name="qqchat" size={30} color="#12B7F5" />
        </TouchableOpacity>
      </View>
    </View>
  );

  
  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>第1步：输入联系方式</Text>
      
      <RadioButton.Group
        onValueChange={value => {
          setContactType(value);
          setContact('');
          setContactError('');
        }}
        value={contactType}
      >
        <View style={styles.radioContainer}>
          <View style={styles.radioItem}>
            <RadioButton value="phone" />
            <Text>手机号码</Text>
          </View>
          <View style={styles.radioItem}>
            <RadioButton value="email" />
            <Text>电子邮箱</Text>
          </View>
        </View>
      </RadioButton.Group>

      <TextInput
        label={contactType === 'phone' ? '手机号码' : '电子邮箱'}
        value={contact}
        onChangeText={text => {
          setContact(text);
          if (contactError) validateContact();
        }}
        mode="outlined"
        style={styles.input}
        keyboardType={contactType === 'phone' ? 'phone-pad' : 'email-address'}
        autoCapitalize="none"
        error={!!contactError}
      />
      {!!contactError && (
        <HelperText type="error">{contactError}</HelperText>
      )}

      <Button
        mode="contained"
        onPress={() => {
          if (validateContact()) {
            setStep(2);
            sendVerificationCode();
          }
        }}
        style={styles.button}
      >
        下一步
      </Button>

      {renderThirdPartyLogin()}
    </View>
  );

  
  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>第2步：验证码验证</Text>
      
      <Text style={styles.infoText}>
        验证码已发送到{contactType === 'phone' ? '手机' : '邮箱'}：{contact}
      </Text>

      <View style={styles.codeInputContainer}>
        <TextInput
          label="验证码"
          value={verificationCode}
          onChangeText={text => {
            setVerificationCode(text);
            if (codeError) validateCode();
          }}
          mode="outlined"
          style={styles.codeInput}
          keyboardType="number-pad"
          maxLength={6}
          error={!!codeError}
        />
        <Button
          mode="outlined"
          onPress={sendVerificationCode}
          style={styles.sendButton}
          disabled={countdown > 0}
        >
          {countdown > 0 ? `重新发送(${countdown}s)` : '发送验证码'}
        </Button>
      </View>
      {!!codeError && (
        <HelperText type="error">{codeError}</HelperText>
      )}

      <Button
        mode="contained"
        onPress={verifyCode}
        style={styles.button}
        disabled={!verificationCode || verificationCode.length !== 6}
      >
        下一步
      </Button>
    </View>
  );

  
  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>第3步：设置账号密码</Text>
      
      <TextInput
        label="用户名"
        value={username}
        onChangeText={text => {
          setUsername(text);
          if (usernameError) validateUsername();
        }}
        mode="outlined"
        style={styles.input}
        error={!!usernameError}
      />
      {!!usernameError && (
        <HelperText type="error">{usernameError}</HelperText>
      )}

      <TextInput
        label="密码"
        value={password}
        onChangeText={text => {
          setPassword(text);
          if (passwordError) validatePassword();
        }}
        mode="outlined"
        style={styles.input}
        error={!!passwordError}
        secureTextEntry={secureTextEntry}
        right={
          <TextInput.Icon
            icon={secureTextEntry ? 'eye-off' : 'eye'}
            onPress={() => setSecureTextEntry(!secureTextEntry)}
          />
        }
      />
      {!!passwordError && (
        <HelperText type="error">{passwordError}</HelperText>
      )}

      <TextInput
        label="确认密码"
        value={confirmPassword}
        onChangeText={text => {
          setConfirmPassword(text);
          if (confirmPasswordError) validateConfirmPassword();
        }}
        mode="outlined"
        style={styles.input}
        error={!!confirmPasswordError}
        secureTextEntry={secureTextEntry}
        right={
          <TextInput.Icon
            icon={secureTextEntry ? 'eye-off' : 'eye'}
            onPress={() => setSecureTextEntry(!secureTextEntry)}
          />
        }
      />
      {!!confirmPasswordError && (
        <HelperText type="error">{confirmPasswordError}</HelperText>
      )}

      <Button
        mode="contained"
        onPress={completeRegistration}
        style={styles.button}
      >
        完成注册
      </Button>
    </View>
  );

  
  const renderStep = () => {
    switch (step) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      default:
        return null;
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      backgroundColor: theme.colors.primary,
    },
    stepContainer: {
      padding: 20,
    },
    stepTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 20,
    },
    input: {
      marginBottom: 20,
    },
    button: {
      marginTop: 20,
    },
    thirdPartyContainer: {
      marginTop: 20,
    },
    divider: {
      marginBottom: 10,
    },
    dividerText: {
      fontSize: 16,
      fontWeight: 'bold',
      marginBottom: 10,
    },
    socialButtons: {
      flexDirection: 'row',
      justifyContent: 'space-around',
    },
    socialButton: {
      padding: 10,
    },
    codeInputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 20,
    },
    codeInput: {
      flex: 1,
    },
    sendButton: {
      marginLeft: 10,
    },
    toggleButton: {
      marginBottom: 20,
    },
    infoText: {
      marginBottom: 20,
    },
    radioContainer: {
      flexDirection: 'row',
      justifyContent: 'flex-start',
      marginVertical: 10,
    },
    radioItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginRight: 20,
    },
  });

  return (
    <View style={styles.container}>
      {renderHeader()}
      <ScrollView>
        {renderStep()}
      </ScrollView>
    </View>
  );
};

export default Register;