import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Dimensions,
  ImageBackground,
  TouchableOpacity,
  Text,
  Image,
} from 'react-native';
import {
  Avatar,
  IconButton,
  Badge,
  Card,
} from 'react-native-paper';
import { CommonImages, FamilyAvatars } from './assets/images';
import LinearGradient from 'react-native-linear-gradient';
import { useFamily } from './store/FamilyContext';
import { useNotification } from './store/NotificationContext';
import { useAuth } from './store/AuthContext';

const { width: screenWidth } = Dimensions.get('window');

const Index = ({ navigation }) => {
  const { hasFamily, familyInfo, loading } = useFamily();
  const { hasUnread } = useNotification();
  const { isLoggedIn } = useAuth();
  const [selectedFamily, setSelectedFamily] = useState(null);

  // 处理家庭头像来源
  const getFamilyAvatarSource = (avatar) => {
    if (!avatar) return CommonImages.placeholder;
    
    // 如果是默认头像的键名，从FamilyAvatars获取
    if (typeof avatar === 'string' && avatar.startsWith('profile')) {
      return FamilyAvatars[avatar];
    }
    
    // 如果是base64字符串
    if (typeof avatar === 'string' && avatar.startsWith('data:image')) {
      return { uri: avatar };
    }
    
    return avatar;
  };

  useEffect(() => {
    if (hasFamily && familyInfo) {
      setSelectedFamily({
        ...familyInfo,
        photo: getFamilyAvatarSource(familyInfo.avatar)
      });
    } else {
      setSelectedFamily(null);
    }
  }, [hasFamily, familyInfo]);

  // 处理按钮点击，游客状态下跳转到登录页面
  const handleButtonPress = (destination) => {
    if (isLoggedIn) {
      navigation.navigate(destination);
    } else {
      navigation.navigate('LogIn', { returnTo: destination });
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#E6E6FA', '#D8BFD8']}
        style={styles.gradientContainer}
      >
        {/* 顶部标题和按钮区 */}
        <View style={styles.header}>
          <View style={styles.rightHeader}>
            <TouchableOpacity 
              style={[styles.headerButton, !isLoggedIn && styles.guestButton]}
              onPress={() => handleButtonPress('Notifications')}
              activeOpacity={0.7}
            >
              <View>
                <IconButton
                  icon="bell"
                  size={24}
                  iconColor={isLoggedIn ? "#333" : "#888"}
                  onPress={undefined}
                />
                {isLoggedIn && hasUnread && (
                  <Badge
                    size={8}
                    style={styles.notificationBadge}
                  />
                )}
              </View>
              <Text style={[styles.buttonText, !isLoggedIn && styles.guestButtonText]}>消息</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.headerButton, !isLoggedIn && styles.guestButton]}
              onPress={() => handleButtonPress('TaskDetail')}
              activeOpacity={0.7}
            >
              <IconButton
                icon="broom"
                size={24}
                iconColor={isLoggedIn ? "#333" : "#888"}
                onPress={undefined}
              />
              <Text style={[styles.buttonText, !isLoggedIn && styles.guestButtonText]}>任务</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.headerButton, !isLoggedIn && styles.guestButton]}
              onPress={() => handleButtonPress('JoinFamily')}
              activeOpacity={0.7}
            >
              <IconButton
                icon="account-multiple-plus"
                size={24}
                iconColor={isLoggedIn ? "#333" : "#888"}
                onPress={undefined}
              />
              <Text style={[styles.buttonText, !isLoggedIn && styles.guestButtonText]}>入驻家庭</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.headerButton, !isLoggedIn && styles.guestButton]}
              onPress={() => handleButtonPress('CreateFamily')}
              activeOpacity={0.7}
            >
              <IconButton
                icon="home-plus"
                size={24}
                iconColor={isLoggedIn ? "#333" : "#888"}
                onPress={undefined}
              />
              <Text style={[styles.buttonText, !isLoggedIn && styles.guestButtonText]}>创建家庭</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 中间标题 */}
        <View style={styles.titleContainer}>
          <Text style={styles.mainTitle}>
            {!isLoggedIn ? '✨ 欢迎体验家庭助手 ✨' : 
             (hasFamily ? `✨ ${familyInfo.name} ✨` : '✨ 请创建一个家庭 ✨')}
          </Text>
        </View>

        {/* 主角色卡片 */}
        <View style={styles.cardContainer}>
          {loading ? (
            <View style={[styles.mainCard, styles.loadingCard]}>
              <Text style={styles.loadingText}>加载中...</Text>
            </View>
          ) : (
            hasFamily && selectedFamily && isLoggedIn ? (
              <TouchableOpacity 
                style={styles.mainCard}
                onPress={() => isLoggedIn ? navigation.navigate('GroupChat') : navigation.navigate('LogIn', { returnTo: 'GroupChat' })}
              >
                <ImageBackground
                  source={selectedFamily.photo}
                  style={styles.characterImage}
                  imageStyle={styles.characterImageStyle}
                >
                  <TouchableOpacity 
                    style={styles.startButton}
                    onPress={() => isLoggedIn ? navigation.navigate('GroupChat') : navigation.navigate('LogIn', { returnTo: 'GroupChat' })}
                  >
                    <Text style={styles.startButtonText}>开启互动</Text>
                  </TouchableOpacity>
                </ImageBackground>
              </TouchableOpacity>
            ) : (
              <View style={styles.mainCard}>
                <ImageBackground
                  source={CommonImages.single}
                  style={styles.characterImage}
                  imageStyle={styles.characterImageStyle}
                >
                </ImageBackground>
              </View>
            )
          )}
        </View>

        {/* 信息提示卡片 - 仅在游客状态下显示 */}
        {!isLoggedIn && (
          <View style={styles.promptContainer}>
            <ImageBackground
              source={CommonImages.word_style}
              style={styles.promptBackground}
              imageStyle={styles.promptBackgroundImage}
              resizeMode="stretch"
            >
              <View style={styles.textContainer}> 
                <Text style={styles.promptText}>注重家庭互动、教育引导和智能辅助</Text>
                <Text style={styles.promptText}>让琐碎的家务变成一种有价值的连接</Text>
              </View>
            </ImageBackground>
          </View>
        )}

        {/* 底部信息区域 */}
        {hasFamily && selectedFamily && isLoggedIn && (
          <View style={styles.bottomSection}>
            <View style={styles.familyInfoContainer}>
              <Text style={styles.familyName}>
                {selectedFamily.name}
              </Text>
              <Text style={styles.familyRole}>
                身份: {selectedFamily.role || '管理员'}
              </Text>
              <Text style={styles.familyDescription}>
                {selectedFamily.description || '这是您创建的家庭'}
              </Text>
              <Text style={styles.familyQuote}>
                {selectedFamily.quote || '一起创建温馨的家'}
              </Text>
            </View>
          </View>
        )}
        
        {/* 游客信息提示 */}
        {!isLoggedIn && (
          <View style={styles.guestHintContainer}>
            <Text style={styles.guestHintText}>
              您正在以游客身份浏览
            </Text>
          </View>
        )}
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradientContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    marginBottom: 10,
  },
  rightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    alignItems: 'center',
    marginLeft: 16,
  },
  guestButton: {
    opacity: 0.7,
  },
  notificationBadge: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'red',
  },
  buttonText: {
    fontSize: 12,
    color: '#333',
    marginTop: -8,
  },
  guestButtonText: {
    color: '#888',
  },
  titleContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 20,
  },
  mainTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  cardContainer: {
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 20,
  },
  mainCard: {
    width: screenWidth - 40,
    height: screenWidth - 40,
    borderRadius: 30,
    overflow: 'hidden',
    backgroundColor: 'white',
    elevation: 4,
  },
  loadingCard: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#666',
  },
  characterImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
    padding: 20,
  },
  characterImageStyle: {
    borderRadius: 30,
  },
  startButton: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    alignSelf: 'center',
    marginBottom: 20,
  },
  startButtonText: {
    color: '#6200ee',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // 新的信息卡片样式
  promptContainer: {
    width: screenWidth - 40,
    marginHorizontal: 20,
    marginTop: 80,
    borderRadius: 25,
    overflow: 'hidden',
    elevation: 4,
  },
  promptBackground: {
    width: '100%',
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  promptBackgroundImage: {
    borderRadius: 25,
  },
  butterflyImage: {
    position: 'absolute',
    width: 60,
    height: 60,
    top: 5,
    left: 5,
    zIndex: 1,
  },
  textContainer: {
    width: '80%',
    alignItems: 'center',
    marginTop: 60,
    marginLeft: 40,
    alignSelf: 'center',
    paddingHorizontal: 20,
  },
  promptText: {
    fontSize: 14,
    color: '#6200ee',
    textAlign: 'center',
    marginVertical: 4,
    lineHeight: 22,
    letterSpacing: 0.5,
    fontWeight: '500',
  },
  bottomSection: {
    marginTop: 'auto',
    paddingBottom: 40,
    width: '100%',
    alignItems: 'center',
  },
  familyInfoContainer: {
    width: '90%',
    alignItems: 'center',
    paddingVertical: 15,
  },
  familyName: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#4e1b6e',
    textShadowColor: 'rgba(155, 126, 222, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  familyRole: {
    fontSize: 16,
    textAlign: 'center',
    color: '#4e1b6e',
    marginVertical: 5,
    textShadowColor: 'rgba(155, 126, 222, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  familyDescription: {
    fontSize: 16,
    textAlign: 'center',
    color: '#4e1b6e',
    marginVertical: 5,
    textShadowColor: 'rgba(155, 126, 222, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  familyQuote: {
    fontSize: 16,
    fontStyle: 'italic',
    textAlign: 'center',
    color: '#4e1b6e',
    marginVertical: 5,
    textShadowColor: 'rgba(155, 126, 222, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  guestHintContainer: {
    marginTop: 20,
    marginBottom: 30,
    alignItems: 'center',
  },
  guestHintText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});

export default Index;