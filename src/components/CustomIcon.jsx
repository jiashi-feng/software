import React from 'react';
import { View, StyleSheet } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const CustomIcon = ({ name, size = 24, color, style }) => {
  
  const iconName = name || 'help-circle';
  const iconColor = color || '#6200ee';
  
  return (
    <View style={[styles.iconContainer, style]}>
      <MaterialCommunityIcons name={iconName} size={size} color={iconColor} />
    </View>
  );
};

const styles = StyleSheet.create({
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CustomIcon; 