import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {
  Text,
  Surface,
  Chip,
  Searchbar,
  Button,
  Portal,
  Dialog,
  Paragraph,
  List,
  Divider,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { ProductImages, CommonImages } from './assets/images';
import AsyncStorage from '@react-native-async-storage/async-storage';

const COLORS = {
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
};

const ORDER_STATUS_ICONS = {
  '未使用': { icon: 'clock-time-four', color: COLORS.warning },
  '已使用': { icon: 'check-circle', color: COLORS.success },
};

const mockRecords = [
  {
    id: '1',
    productName: '多功能清洁套装',
    productImage: ProductImages.cleaningKit,
    exchangeDate: '2024-06-10',
    points: 500,
    status: '已使用',
    orderNumber: 'EX202406100001',
  },
  {
    id: '2',
    productName: '智能收纳盒',
    productImage: ProductImages.storageBox,
    exchangeDate: '2024-06-05',
    points: 300,
    status: '未使用',
    orderNumber: 'EX202406050002',
  },
  {
    id: '3',
    productName: '厨房调味料套装',
    productImage: ProductImages.kitchenSet,
    exchangeDate: '2024-06-01',
    points: 800,
    status: '未使用',
    orderNumber: 'EX202406010003',
  },
  {
    id: '4',
    productName: '防滑厨房手套',
    productImage: ProductImages.kitchenGloves,
    exchangeDate: '2024-05-20',
    points: 150,
    status: '已使用',
    orderNumber: 'EX202405200004',
  },
];

const ExchangeHistory = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedItem, setExpandedItem] = useState(null);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [exchangeRecords, setExchangeRecords] = useState([]);

  // Load exchange records from AsyncStorage
  useEffect(() => {
    const loadExchangeRecords = async () => {
      try {
        const savedRecords = await AsyncStorage.getItem('exchangeHistory');
        if (savedRecords) {
          setExchangeRecords(JSON.parse(savedRecords));
        }
      } catch (error) {
        console.error('Error loading exchange records:', error);
      }
    };

    loadExchangeRecords();
    // Set up interval to check for new records
    const interval = setInterval(loadExchangeRecords, 1000);
    return () => clearInterval(interval);
  }, []);

  const filteredRecords = exchangeRecords.filter(record => {
    const matchesSearch = !searchQuery || 
      record.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.orderNumber.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const handleToggleExpand = (id) => {
    setExpandedItem(expandedItem === id ? null : id);
  };

  const handleConfirmReceipt = (record) => {
    setSelectedRecord(record);
    setDialogVisible(true);
  };

  const confirmReceived = async () => {
    if (selectedRecord) {
      const updatedRecords = exchangeRecords.map(record => 
        record.id === selectedRecord.id 
          ? { ...record, status: '已使用' }
          : record
      );

      try {
        await AsyncStorage.setItem('exchangeHistory', JSON.stringify(updatedRecords));
        setExchangeRecords(updatedRecords);
        setDialogVisible(false);
        Alert.alert('成功', '已确认使用');
      } catch (error) {
        console.error('Error updating record status:', error);
        Alert.alert('错误', '更新状态失败，请重试');
      }
    }
  };

  return (
    <View style={styles.container}>
      <Surface style={styles.header}>
        <Text style={styles.headerTitle}>兑换记录</Text>
        <Searchbar
          placeholder="搜索商品名称或订单号"
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
        />
      </Surface>

      <ScrollView style={styles.recordsContainer}>
        {filteredRecords.length > 0 ? (
          filteredRecords.map(record => (
            <Surface key={record.id} style={styles.recordCard}>
              <TouchableOpacity
                style={styles.recordHeader}
                onPress={() => handleToggleExpand(record.id)}
              >
                <View style={styles.recordBasicInfo}>
                  <Image
                    source={record.productImage}
                    style={styles.productImage}
                    resizeMode="cover"
                  />
                  <View style={styles.recordSummary}>
                    <Text style={styles.productName} numberOfLines={1}>
                      {record.productName}
                    </Text>
                    <Text style={styles.exchangeDate}>
                      <Icon name="calendar" size={14} color={COLORS.subtext} />
                      {' '}兑换日期: {record.exchangeDate}
                    </Text>
                    <View style={styles.pointsContainer}>
                      <Icon name="coin" size={14} color={COLORS.accent} />
                      <Text style={styles.pointsText}>{record.points} 积分</Text>
                    </View>
                  </View>
                </View>
                <View style={styles.statusContainer}>
                  <View style={[
                    styles.statusBadge, 
                    { backgroundColor: ORDER_STATUS_ICONS[record.status]?.color || ORDER_STATUS_ICONS['已使用'].color }
                  ]}>
                    <Icon 
                      name={ORDER_STATUS_ICONS[record.status]?.icon || ORDER_STATUS_ICONS['已使用'].icon} 
                      size={14} 
                      color="#fff" 
                    />
                    <Text style={styles.statusText}>{record.status || '已使用'}</Text>
                  </View>
                  <Icon
                    name={expandedItem === record.id ? 'chevron-up' : 'chevron-down'}
                    size={24}
                    color={COLORS.subtext}
                    style={styles.expandIcon}
                  />
                </View>
              </TouchableOpacity>

              {expandedItem === record.id && (
                <View style={styles.recordDetails}>
                  <Divider />
                  <List.Item
                    title="订单编号"
                    description={record.orderNumber}
                    left={props => <List.Icon {...props} icon="pound" color={COLORS.primary} />}
                    titleStyle={styles.detailTitle}
                    descriptionStyle={styles.detailDescription}
                  />
                  <List.Item
                    title="兑换日期"
                    description={record.exchangeDate}
                    left={props => <List.Icon {...props} icon="calendar" color={COLORS.primary} />}
                    titleStyle={styles.detailTitle}
                    descriptionStyle={styles.detailDescription}
                  />
                  <List.Item
                    title="消耗积分"
                    description={`${record.points} 积分`}
                    left={props => <List.Icon {...props} icon="coin" color={COLORS.primary} />}
                    titleStyle={styles.detailTitle}
                    descriptionStyle={styles.detailDescription}
                  />

                  <View style={styles.actionsContainer}>
                    {record.status === '未使用' && (
                      <Button
                        mode="contained"
                        onPress={() => handleConfirmReceipt(record)}
                        style={styles.actionButton}
                        color={COLORS.success}
                        icon="check"
                      >
                        确认使用
                      </Button>
                    )}
                  </View>
                </View>
              )}
            </Surface>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Image 
              source={CommonImages.emptyBg}
              style={styles.emptyImage}
              resizeMode="contain"
            />
            <Text style={styles.emptyTitle}>暂无兑换记录</Text>
            <Text style={styles.emptyText}>
              快去积分商城兑换心仪的奖励吧！
            </Text>
            <Button
              mode="contained"
              onPress={() => navigation.navigate('Shopping')}
              style={styles.emptyButton}
              color={COLORS.primary}
            >
              去兑换
            </Button>
          </View>
        )}
      </ScrollView>

      <Portal>
        <Dialog visible={dialogVisible} onDismiss={() => setDialogVisible(false)}>
          <Dialog.Title>确认使用</Dialog.Title>
          <Dialog.Content>
            <Paragraph>
              您确定已使用"{selectedRecord?.productName}"吗？
            </Paragraph>
            <Paragraph>
              确认后状态将变更为"已使用"，且不可撤销。
            </Paragraph>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDialogVisible(false)} color={COLORS.subtext}>取消</Button>
            <Button onPress={confirmReceived} color={COLORS.success}>确认使用</Button>
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
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.surface,
    elevation: 4,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 12,
  },
  searchBar: {
    elevation: 0,
    backgroundColor: COLORS.background,
    borderRadius: 8,
    height: 40,
  },
  recordsContainer: {
    padding: 16,
  },
  recordCard: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
  },
  recordHeader: {
    flexDirection: 'row',
    padding: 16,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recordBasicInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: COLORS.background,
  },
  recordSummary: {
    marginLeft: 12,
    justifyContent: 'space-between',
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  exchangeDate: {
    fontSize: 14,
    color: COLORS.subtext,
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pointsText: {
    fontSize: 14,
    color: COLORS.accent,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
    marginBottom: 8,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    marginLeft: 4,
  },
  expandIcon: {
    marginTop: 4,
  },
  recordDetails: {
    padding: 16,
    backgroundColor: COLORS.background,
  },
  detailTitle: {
    fontSize: 14,
    color: COLORS.subtext,
  },
  detailDescription: {
    fontSize: 16,
    color: COLORS.text,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  actionButton: {
    marginLeft: 8,
    borderRadius: 8,
  },
  emptyContainer: {
    flex: 1,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 400,
  },
  emptyImage: {
    width: 150,
    height: 150,
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.subtext,
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyButton: {
    borderRadius: 20,
    paddingHorizontal: 24,
  },
});

export default ExchangeHistory; 