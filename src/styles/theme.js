import { DefaultTheme } from 'react-native-paper';

export const appTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#4A6FA5', 
    accent: '#FF6B6B',  
    background: '#F8F9FB',
    surface: '#FFFFFF',
    text: '#1E2022',
    subtext: '#6F7E8C',
    border: '#E1E5EB',
    success: '#4CAF50',
    warning: '#FFC107',
    error: '#F44336',
    info: '#2196F3',
  },
};

export const themeGradients = {
  
  backgroundGradient: ['#E6E6FA', '#D8BFD8'],
  
  primaryButtonGradient: ['#4A6FA5', '#6A8CBF'],
  
  cardGradient: ['#F8F9FB', '#F0F2F5'],
  
  headerGradient: ['#4A6FA5', '#3A5F95'],
};

export const categoryIcons = {
  '全部': 'view-grid',
  '清洁用品': 'spray-bottle',
  '厨房用品': 'silverware-fork-knife',
  '收纳工具': 'box-shadow',
  '生活用品': 'home-variant',
  '其他': 'dots-horizontal-circle',
};

export const orderStatusIcons = {
  '待发货': 'clock-outline',
  '已发货': 'truck-delivery-outline',
  '已完成': 'check-circle-outline',
};

export const productImages = {
  product1: require('../assets/products/cleaning_kit.jpg'),
  product2: require('../assets/products/storage_box.jpg'),
  product3: require('../assets/products/kitchen_set.jpg'),
};

export const formatPoints = (points) => {
  return `${points} 积分`;
};

export const emptyStateMessages = {
  products: '暂无符合条件的商品',
  orders: '暂无符合条件的兑换记录',
};

export default appTheme; 