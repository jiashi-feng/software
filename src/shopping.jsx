import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  ImageBackground,
  Dimensions,
  Alert,
} from 'react-native';
import {
  Text,
  Surface,
  Button,
  Chip,
  IconButton,
  Dialog,
  Portal,
  Paragraph,
  ActivityIndicator,
  Snackbar,
} from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import CustomIcon from './components/CustomIcon';
import { CommonImages } from './assets/images';

const { width: screenWidth } = Dimensions.get('window');

// 更新主题颜色为紫色系
const COLORS = {
  primary: '#9B7EDE',      // 主色调：中等紫色
  accent: '#E6B3FF',       // 强调色：浅紫色
  background: '#F8F0FF',   // 背景色：极浅紫色
  surface: '#FFFFFF',      // 表面色：白色
  text: '#4A4A4A',        // 文字色：深灰色
  subtext: '#8E8E8E',     // 次要文字：中灰色
  border: '#E6E0FF',      // 边框色：浅紫色
  success: '#9B7EDE',     // 成功色：紫色
  error: '#FF9ECD',       // 错误色：粉紫色
};

// 商品类别图标
const CATEGORY_ICONS = {
  '全部': 'view-grid',
  '家务券': 'broom',
  '娱乐券': 'ticket',
  '玩具': 'toy-brick',
  '亲子活动': 'account-group',
  '其他': 'dots-horizontal-circle',
};

const categories = [
  '全部',
  '家务券',
  '娱乐券',
  '玩具',
  '亲子活动',
  '其他',
];

// 更新积分范围分类
const pointsRanges = [
  '100-300小币',
  '300-800小币',
  '800-1500小币',
  '1500以上小币'
];

// 更新商品数据，按积分从低到高排序
const mockProducts = [
  {
    id: '1',
    name: '家务转移券',
    description: '可以将一次家务任务转移给其他家庭成员完成',
    points: 200,
    image: CommonImages.a4,
    exchangeCount: 3494,
    category: '100-300小币'
  },
  {
    id: '2',
    name: '家务延时券',
    description: '可以将一次家务任务延期24小时完成',
    points: 300,
    image: CommonImages.a2,
    exchangeCount: 2156,
    category: '300-800小币'
  },
  {
    id: '3',
    name: '看电影券',
    description: '和家人一起观看一场电影',
    points: 500,
    image: CommonImages.a5,
    exchangeCount: 1856,
    category: '300-800小币'
  },
  {
    id: '4',
    name: '野餐券',
    description: '和家人一起享受户外野餐时光',
    points: 600,
    image: CommonImages.a6,
    exchangeCount: 1234,
    category: '300-800小币'
  },
  {
    id: '5',
    name: '郊游券',
    description: '和家人一起郊游一天',
    points: 800,
    image: CommonImages.a11,
    exchangeCount: 987,
    category: '800-1500小币'
  },
  {
    id: '6',
    name: '露营券',
    description: '和家人一起体验露营的乐趣',
    points: 1000,
    image: CommonImages.a6,
    exchangeCount: 876,
    category: '800-1500小币'
  },
  {
    id: '7',
    name: '爬山券',
    description: '和家人一起登山远足',
    points: 1200,
    image: CommonImages.a12,
    exchangeCount: 654,
    category: '800-1500小币'
  },
  {
    id: '8',
    name: '看海券',
    description: '和家人一起去海边度假',
    points: 1500,
    image: CommonImages.a7,
    exchangeCount: 432,
    category: '1500以上小币'
  },
  {
    id: '9',
    name: '豪华玩具',
    description: '可以兑换一个心仪的玩具',
    points: 2000,
    image: CommonImages.a10,
    exchangeCount: 321,
    category: '1500以上小币'
  }
];

const Shopping = ({ navigation }) => {
  const [selectedRange, setSelectedRange] = useState(pointsRanges[0]);
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [dialogVisible, setDialogVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [userPoints, setUserPoints] = useState(2580);
  const scrollViewRef = React.useRef(null);

  const handleRangeSelect = (range) => {
    setSelectedRange(range);
    
    // 计算banner和其他内容的总高度
    const headerHeight = 160 + 16 * 2; // banner高度 + margin
    const pointsSectionHeight = 50; // 积分显示区域高度
    const rangesHeight = 50; // 范围选择区域高度
    const baseOffset = headerHeight + pointsSectionHeight + rangesHeight;
    
    // 找到该范围内的第一个商品
    const firstProductIndex = mockProducts.findIndex(p => p.category === range);
    
    if (firstProductIndex !== -1) {
      // 计算需要滚动的位置
      const itemHeight = 200; // 每个商品卡片的实际高度
      const itemsPerRow = 2; // 每行显示2个商品
      const rowIndex = Math.floor(firstProductIndex / itemsPerRow);
      const scrollPosition = baseOffset + (rowIndex * itemHeight);

      // 使用setTimeout确保在状态更新后执行滚动
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({
          y: scrollPosition,
          animated: true
        });
      }, 100);
    }
  };

  const handleExchange = (product) => {
    setSelectedProduct(product);
    setDialogVisible(true);
  };

  return (
    <View style={styles.container}>
      {/* 固定在顶部的部分 */}
      <View style={styles.fixedHeader}>
        {/* Banner */}
        <View style={styles.banner}>
          <LinearGradient
            colors={['#9B7EDE', '#E6B3FF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.bannerGradient}
          >
            <Text style={styles.bannerTitle}>欢迎来到积分商城</Text>
            <Text style={styles.bannerSubtitle}>用积分换取心仪的奖励吧！</Text>
          </LinearGradient>
        </View>

        {/* 积分显示和赚取按钮 */}
        <View style={styles.pointsSection}>
          <View style={styles.pointsDisplay}>
            <CustomIcon name="coin" size={24} color={COLORS.primary} />
            <Text style={styles.pointsText}>{userPoints}</Text>
          </View>
          <Button
            mode="contained"
            style={styles.earnButton}
            onPress={() => navigation.navigate('TaskDetail')}
          >
            赚取积分
          </Button>
        </View>

        {/* 积分范围选择 */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.rangesContainer}
        >
          {pointsRanges.map((range) => (
            <Chip
              key={range}
              selected={selectedRange === range}
              onPress={() => handleRangeSelect(range)}
              style={[
                styles.rangeChip,
                selectedRange === range && styles.selectedRangeChip,
              ]}
              textStyle={{
                color: selectedRange === range ? '#fff' : COLORS.primary,
              }}
            >
              {range}
            </Chip>
          ))}
        </ScrollView>
      </View>

      {/* 可滚动的商品列表 */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.productsGrid}>
          {mockProducts.map((product) => (
            <View 
              key={product.id} 
              style={[
                styles.productCard,
                { height: 250 }
              ]}
            >
              <Image
                source={product.image}
                style={styles.productImage}
                resizeMode="cover"
              />
              <View style={styles.productInfo}>
                <Text style={styles.productName}>{product.name}</Text>
                <Text style={styles.productDescription} numberOfLines={2}>
                  {product.description}
                </Text>
                <Text style={styles.exchangeCount}>
                  已兑换 {product.exchangeCount} 次
                </Text>
                <View style={styles.productBottom}>
                  <View style={styles.pointsContainer}>
                    <CustomIcon name="coin" size={16} color={COLORS.primary} />
                    <Text style={styles.productPoints}>{product.points}</Text>
                  </View>
                  <Button
                    mode="contained"
                    style={styles.exchangeButton}
                    labelStyle={styles.exchangeButtonLabel}
                    contentStyle={{ height: 32 }}
                    onPress={() => handleExchange(product)}
                  >
                    兑换
                  </Button>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* 兑换确认对话框 */}
      <Portal>
        <Dialog
          visible={dialogVisible}
          onDismiss={() => setDialogVisible(false)}
        >
          <Dialog.Title>确认兑换</Dialog.Title>
          <Dialog.Content>
            <Paragraph>
              确定要使用 {selectedProduct?.points} 积分兑换 {selectedProduct?.name} 吗？
            </Paragraph>
            <Paragraph style={{ marginTop: 8, color: COLORS.primary }}>
              当前积分：{userPoints}
            </Paragraph>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDialogVisible(false)}>取消</Button>
            <Button
              mode="contained"
              onPress={() => {
                if (userPoints >= selectedProduct?.points) {
                  // 更新用户积分
                  setUserPoints(prevPoints => prevPoints - selectedProduct?.points);
                  // 关闭对话框
                  setDialogVisible(false);
                  // 这里可以添加兑换成功的提示或其他逻辑
                } else {
                  // 积分不足的提示
                  Alert.alert('积分不足', '您的积分不足以兑换该商品');
                }
              }}
            >
              确认兑换
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  fixedHeader: {
    backgroundColor: COLORS.background,
    zIndex: 1,
  },
  content: {
    flex: 1,
  },
  banner: {
    height: 160,
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  bannerGradient: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  bannerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  bannerSubtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.8,
  },
  pointsSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  pointsDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pointsText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  earnButton: {
    borderRadius: 20,
    backgroundColor: COLORS.primary,
  },
  rangesContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  rangeChip: {
    marginRight: 8,
    backgroundColor: '#fff',
    borderColor: COLORS.primary,
    borderWidth: 1,
  },
  selectedRangeChip: {
    backgroundColor: COLORS.primary,
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
    paddingBottom: 20,
  },
  productCard: {
    width: '50%',
    padding: 8,
    height: 250,
  },
  productImage: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  productInfo: {
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginTop: -20,
    elevation: 2,
    borderColor: COLORS.border,
    borderWidth: 1,
    height: 130,
    justifyContent: 'space-between',
  },
  productName: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  productDescription: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    height: 32,
    lineHeight: 16,
  },
  exchangeCount: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  productBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  productPoints: {
    marginLeft: 4,
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  exchangeButton: {
    borderRadius: 16,
    paddingHorizontal: 12,
    backgroundColor: COLORS.primary,
    height: 32,
    justifyContent: 'center',
    minWidth: 60,
  },
  exchangeButtonLabel: {
    fontSize: 12,
    marginVertical: 0,
    marginHorizontal: 0,
  },
});

export default Shopping;