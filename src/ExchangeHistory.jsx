import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
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
  '待发货': { icon: 'clock-time-four', color: COLORS.warning },
  '已发货': { icon: 'truck-delivery', color: COLORS.info },
  '已完成': { icon: 'check-circle', color: COLORS.success },
};

const mockRecords = [
  {
    id: '1',
    productName: '多功能清洁套装',
    productImage: ProductImages.cleaningKit,
    exchangeDate: '2024-06-10',
    points: 500,
    status: '已完成',
    orderNumber: 'EX202406100001',
    address: '北京市海淀区中关村大街1号',
    trackingNumber: 'SF1234567890',
    logistics: '顺丰速运',
  },
  {
    id: '2',
    productName: '智能收纳盒',
    productImage: ProductImages.storageBox,
    exchangeDate: '2024-06-05',
    points: 300,
    status: '已发货',
    orderNumber: 'EX202406050002',
    address: '北京市海淀区中关村大街1号',
    trackingNumber: 'YT0987654321',
    logistics: '圆通速递',
  },
  {
    id: '3',
    productName: '厨房调味料套装',
    productImage: ProductImages.kitchenSet,
    exchangeDate: '2024-06-01',
    points: 800,
    status: '待发货',
    orderNumber: 'EX202406010003',
    address: '北京市海淀区中关村大街1号',
    trackingNumber: '-',
    logistics: '-',
  },
  {
    id: '4',
    productName: '防滑厨房手套',
    productImage: ProductImages.kitchenGloves,
    exchangeDate: '2024-05-20',
    points: 150,
    status: '已完成',
    orderNumber: 'EX202405200004',
    address: '北京市海淀区中关村大街1号',
    trackingNumber: 'ZT5678901234',
    logistics: '中通快递',
  },
];

const ExchangeHistory = () => {
  const [selectedStatus, setSelectedStatus] = useState('全部');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedItem, setExpandedItem] = useState(null);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [logisticsDialogVisible, setLogisticsDialogVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  const statusFilters = ['全部', '待发货', '已发货', '已完成'];

  
  const filteredRecords = mockRecords.filter(record => {
    const matchesStatus = selectedStatus === '全部' || record.status === selectedStatus;
    const matchesSearch = !searchQuery || 
      record.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.orderNumber.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleToggleExpand = (id) => {
    setExpandedItem(expandedItem === id ? null : id);
  };

  const handleConfirmReceipt = (record) => {
    setSelectedRecord(record);
    setDialogVisible(true);
  };

  const confirmReceived = () => {
    
    setDialogVisible(false);
    
    setTimeout(() => {
      alert('已确认收货');
    }, 500);
  };

  const handleViewLogistics = (record) => {
    setSelectedRecord(record);
    setLogisticsDialogVisible(true);
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
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.statusFiltersContainer}
          contentContainerStyle={styles.statusFiltersContent}
        >
          {statusFilters.map(status => (
            <Chip
              key={status}
              selected={selectedStatus === status}
              onPress={() => setSelectedStatus(status)}
              style={[
                styles.statusChip,
                selectedStatus === status && styles.statusChipSelected
              ]}
              selectedColor="#fff"
              textStyle={selectedStatus === status ? styles.statusChipTextSelected : styles.statusChipText}
              icon={status !== '全部' ? ORDER_STATUS_ICONS[status].icon : 'filter-variant'}
            >
              {status}
            </Chip>
          ))}
        </ScrollView>
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
                  <View style={[styles.statusBadge, { backgroundColor: ORDER_STATUS_ICONS[record.status].color }]}>
                    <Icon name={ORDER_STATUS_ICONS[record.status].icon} size={14} color="#fff" />
                    <Text style={styles.statusText}>{record.status}</Text>
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
                    title="收货地址"
                    description={record.address}
                    left={props => <List.Icon {...props} icon="map-marker" color={COLORS.primary} />}
                    titleStyle={styles.detailTitle}
                    descriptionStyle={styles.detailDescription}
                  />
                  <List.Item
                    title="物流信息"
                    description={record.trackingNumber !== '-' ? `${record.logistics} ${record.trackingNumber}` : '暂无物流信息'}
                    left={props => <List.Icon {...props} icon="truck" color={COLORS.primary} />}
                    titleStyle={styles.detailTitle}
                    descriptionStyle={styles.detailDescription}
                  />

                  <View style={styles.actionsContainer}>
                    {record.status === '已发货' && (
                      <Button
                        mode="contained"
                        onPress={() => handleConfirmReceipt(record)}
                        style={styles.actionButton}
                        color={COLORS.success}
                        icon="check"
                      >
                        确认收货
                      </Button>
                    )}
                    {record.status !== '待发货' && (
                      <Button
                        mode="outlined"
                        onPress={() => handleViewLogistics(record)}
                        style={styles.actionButton}
                        color={COLORS.primary}
                        icon="truck-fast"
                      >
                        查看物流
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
            <Text style={styles.emptyText}>暂无符合条件的兑换记录</Text>
          </View>
        )}
      </ScrollView>

      {}
      <Portal>
        <Dialog visible={dialogVisible} onDismiss={() => setDialogVisible(false)}>
          <Dialog.Title>确认收货</Dialog.Title>
          <Dialog.Content>
            <Paragraph>
              您确定已收到商品"{selectedRecord?.productName}"吗？
            </Paragraph>
            <Paragraph>
              确认收货后，订单状态将变更为"已完成"，且不可撤销。
            </Paragraph>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDialogVisible(false)} color={COLORS.subtext}>取消</Button>
            <Button onPress={confirmReceived} color={COLORS.success}>确认收货</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {}
      <Portal>
        <Dialog visible={logisticsDialogVisible} onDismiss={() => setLogisticsDialogVisible(false)}>
          <Dialog.Title>物流详情</Dialog.Title>
          <Dialog.Content>
            {selectedRecord && (
              <>
                <View style={styles.logisticsHeader}>
                  <Image 
                    source={selectedRecord.productImage}
                    style={styles.logisticsProductImage}
                  />
                  <View style={styles.logisticsProductInfo}>
                    <Text style={styles.logisticsProductName}>
                      {selectedRecord.productName}
                    </Text>
                    <Text style={styles.logisticsOrderNumber}>
                      订单编号: {selectedRecord.orderNumber}
                    </Text>
                  </View>
                </View>
                
                <Divider style={styles.logisticsDivider} />
                
                <View style={styles.logisticsInfo}>
                  <View style={styles.logisticsRow}>
                    <Text style={styles.logisticsLabel}>物流公司:</Text>
                    <Text style={styles.logisticsValue}>{selectedRecord.logistics}</Text>
                  </View>
                  <View style={styles.logisticsRow}>
                    <Text style={styles.logisticsLabel}>运单编号:</Text>
                    <Text style={styles.logisticsValue}>{selectedRecord.trackingNumber}</Text>
                  </View>
                </View>
                
                <Divider style={styles.logisticsDivider} />
                
                {}
                <View style={styles.trackingInfo}>
                  <Text style={styles.trackingTitle}>物流追踪</Text>
                  
                  <View style={styles.trackingTimeline}>
                    <View style={styles.trackingItem}>
                      <View style={styles.timelineNodeContainer}>
                        <View style={[styles.timelineNode, styles.currentNode]} />
                        <View style={styles.timelineLine} />
                      </View>
                      <View style={styles.trackingContent}>
                        <Text style={styles.trackingAction}>
                          {selectedRecord.status === '已完成' ? '已签收' : '运输中'}
                        </Text>
                        <Text style={styles.trackingLocation}>
                          {selectedRecord.address}
                        </Text>
                        <Text style={styles.trackingTime}>
                          {selectedRecord.status === '已完成' 
                            ? `${selectedRecord.exchangeDate} 15:20:33` 
                            : '2023-04-30 09:45:12'}
                        </Text>
                      </View>
                    </View>
                    
                    <View style={styles.trackingItem}>
                      <View style={styles.timelineNodeContainer}>
                        <View style={styles.timelineNode} />
                        <View style={styles.timelineLine} />
                      </View>
                      <View style={styles.trackingContent}>
                        <Text style={styles.trackingAction}>
                          运输中
                        </Text>
                        <Text style={styles.trackingLocation}>
                          北京市海淀区分拣中心
                        </Text>
                        <Text style={styles.trackingTime}>
                          2023-04-29 18:30:45
                        </Text>
                      </View>
                    </View>
                    
                    <View style={styles.trackingItem}>
                      <View style={styles.timelineNodeContainer}>
                        <View style={styles.timelineNode} />
                        <View style={styles.timelineLine} />
                      </View>
                      <View style={styles.trackingContent}>
                        <Text style={styles.trackingAction}>
                          已发货
                        </Text>
                        <Text style={styles.trackingLocation}>
                          北京市仓库
                        </Text>
                        <Text style={styles.trackingTime}>
                          2023-04-28 10:15:22
                        </Text>
                      </View>
                    </View>
                    
                    <View style={styles.trackingItem}>
                      <View style={styles.timelineNodeContainer}>
                        <View style={styles.timelineNode} />
                        <View style={[styles.timelineLine, styles.lastLine]} />
                      </View>
                      <View style={styles.trackingContent}>
                        <Text style={styles.trackingAction}>
                          订单已确认
                        </Text>
                        <Text style={styles.trackingLocation}>
                          系统自动确认
                        </Text>
                        <Text style={styles.trackingTime}>
                          {selectedRecord.exchangeDate} 00:00:00
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              </>
            )}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setLogisticsDialogVisible(false)} color={COLORS.primary}>
              关闭
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
    marginBottom: 12,
    height: 40,
  },
  statusFiltersContainer: {
    marginBottom: 4,
  },
  statusFiltersContent: {
    paddingRight: 8,
  },
  statusChip: {
    marginRight: 8,
    backgroundColor: '#fff',
    borderColor: COLORS.border,
  },
  statusChipSelected: {
    backgroundColor: COLORS.primary,
  },
  statusChipText: {
    color: COLORS.text,
  },
  statusChipTextSelected: {
    color: '#fff',
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
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyImage: {
    width: 120,
    height: 120,
    marginBottom: 16,
  },
  emptyText: {
    color: COLORS.subtext,
    fontSize: 16,
    textAlign: 'center',
  },
  logisticsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  logisticsProductImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: COLORS.background,
  },
  logisticsProductInfo: {
    marginLeft: 12,
    flex: 1,
  },
  logisticsProductName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  logisticsOrderNumber: {
    fontSize: 14,
    color: COLORS.subtext,
  },
  logisticsDivider: {
    marginVertical: 12,
  },
  logisticsInfo: {
    backgroundColor: COLORS.background,
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  logisticsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  logisticsLabel: {
    fontSize: 14,
    color: COLORS.subtext,
  },
  logisticsValue: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: 'bold',
  },
  trackingInfo: {
    marginTop: 8,
  },
  trackingTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 16,
  },
  trackingTimeline: {
    paddingLeft: 8,
  },
  trackingItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  timelineNodeContainer: {
    width: 20,
    alignItems: 'center',
    marginRight: 12,
  },
  timelineNode: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.border,
    zIndex: 2,
  },
  currentNode: {
    backgroundColor: COLORS.primary,
  },
  timelineLine: {
    position: 'absolute',
    top: 12,
    left: 9.5,
    width: 1,
    height: '100%',
    backgroundColor: COLORS.border,
    zIndex: 1,
  },
  lastLine: {
    display: 'none',
  },
  trackingContent: {
    flex: 1,
  },
  trackingAction: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  trackingLocation: {
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 4,
  },
  trackingTime: {
    fontSize: 12,
    color: COLORS.subtext,
  },
});

export default ExchangeHistory; 