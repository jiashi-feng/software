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
} from 'react-native-paper';
import { CommonImages, FamilyAvatars } from './assets/images';
import LinearGradient from 'react-native-linear-gradient';
import { useFamily } from './store/FamilyContext';

const { width: screenWidth } = Dimensions.get('window');

const Index = ({ navigation }) => {
  const { hasFamily, familyInfo, loading } = useFamily();
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
              style={styles.headerButton}
              onPress={() => navigation.navigate('TaskDetail')}
              activeOpacity={0.7}
            >
              <IconButton
                icon="broom"
                size={24}
                iconColor="#333"
                onPress={undefined}
              />
              <Text style={styles.buttonText}>任务</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={() => navigation.navigate('JoinFamily')}
              activeOpacity={0.7}
            >
              <IconButton
                icon="account-multiple-plus"
                size={24}
                iconColor="#333"
                onPress={undefined}
              />
              <Text style={styles.buttonText}>入驻家庭</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={() => navigation.navigate('CreateFamily')}
              activeOpacity={0.7}
            >
              <IconButton
                icon="home-plus"
                size={24}
                iconColor="#333"
                onPress={undefined}
              />
              <Text style={styles.buttonText}>创建家庭</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 中间标题 */}
        <View style={styles.titleContainer}>
          <Text style={styles.mainTitle}>
            {hasFamily ? `✨ ${familyInfo.name} ✨` : '✨ 请创建一个家庭 ✨'}
          </Text>
        </View>

        {/* 主角色卡片 */}
        <View style={styles.cardContainer}>
          {loading ? (
            <View style={[styles.mainCard, styles.loadingCard]}>
              <Text style={styles.loadingText}>加载中...</Text>
            </View>
          ) : (
            hasFamily && selectedFamily ? (
              <TouchableOpacity 
                style={styles.mainCard}
                onPress={() => navigation.navigate('GroupChat')}
              >
                <ImageBackground
                  source={selectedFamily.photo}
                  style={styles.characterImage}
                  imageStyle={styles.characterImageStyle}
                >
                  <TouchableOpacity 
                    style={styles.startButton}
                    onPress={() => navigation.navigate('GroupChat')}
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

        {!hasFamily && !loading && (
          <View style={styles.bottomPromptContainer}>
            <Text style={styles.bottomPromptText}>个性化智能管理小助手值得拥有</Text>
          </View>
        )}

        {/* 底部信息区域 */}
        {hasFamily && selectedFamily && (
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
  buttonText: {
    fontSize: 12,
    color: '#333',
    marginTop: -8,
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
    flex: 1,
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
  assistantTextContainer: {
    width: '100%',
    marginTop: 'auto',
    alignItems: 'center',
    paddingBottom: 30,
  },
  assistantText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 10,
    borderRadius: 15,
    overflow: 'hidden',
    textShadowColor: 'rgba(0,0,0,0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 5,
    maxWidth: '90%',
    marginBottom: 20,
  },
  createButton: {
    backgroundColor: '#9B7EDE',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  createButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  joinButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#9B7EDE',
  },
  joinButtonText: {
    color: '#9B7EDE',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
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
  bottomSection: {
    marginTop: 'auto',
    paddingBottom: 40,
  },
  familyInfoContainer: {
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 15,
    padding: 15,
    margin: 20,
  },
  familyName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  familyRole: {
    fontSize: 14,
    color: '#555',
    marginBottom: 5,
  },
  familyDescription: {
    fontSize: 14,
    color: '#555',
    marginBottom: 5,
  },
  familyQuote: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#666',
  },
  bottomPromptContainer: {
    width: '100%',
    padding: 15,
    alignItems: 'center',
    marginTop: 15,
    marginBottom: 200,
  },
  bottomPromptText: {
    fontSize: 16,
    color: '#6200ee',
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default Index;