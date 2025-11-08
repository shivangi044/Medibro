import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const CustomButton = ({
  title,
  onPress,
  variant = 'primary', // primary, secondary, outline, danger
  size = 'medium', // small, medium, large
  icon = null,
  iconPosition = 'left', // left, right
  loading = false,
  disabled = false,
  style = {},
  textStyle = {},
  ...props
}) => {
  const getButtonStyle = () => {
    const baseStyle = [styles.button, styles[`button_${variant}`], styles[`size_${size}`]];
    
    if (disabled || loading) {
      baseStyle.push(styles.disabled);
    }
    
    return [...baseStyle, style];
  };

  const getTextStyle = () => {
    const baseStyle = [styles.text, styles[`text_${variant}`], styles[`textSize_${size}`]];
    return [...baseStyle, textStyle];
  };

  const renderIcon = () => {
    if (!icon || loading) return null;
    
    const iconColor = variant === 'outline' || variant === 'secondary' ? '#2E86AB' : '#fff';
    const iconSize = size === 'small' ? 16 : size === 'large' ? 24 : 20;
    
    return (
      <Ionicons 
        name={icon} 
        size={iconSize} 
        color={iconColor} 
        style={iconPosition === 'right' ? styles.iconRight : styles.iconLeft}
      />
    );
  };

  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      {...props}
    >
      {loading && <ActivityIndicator color="#fff" style={styles.loader} />}
      {!loading && iconPosition === 'left' && renderIcon()}
      <Text style={getTextStyle()}>{title}</Text>
      {!loading && iconPosition === 'right' && renderIcon()}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  
  // Variants
  button_primary: {
    backgroundColor: '#2E86AB',
  },
  button_secondary: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  button_outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#2E86AB',
  },
  button_danger: {
    backgroundColor: '#F44336',
  },
  
  // Sizes
  size_small: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  size_medium: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  size_large: {
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  
  // Text styles
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
  text_primary: {
    color: '#fff',
  },
  text_secondary: {
    color: '#2E86AB',
  },
  text_outline: {
    color: '#2E86AB',
  },
  text_danger: {
    color: '#fff',
  },
  
  // Text sizes
  textSize_small: {
    fontSize: 14,
  },
  textSize_medium: {
    fontSize: 16,
  },
  textSize_large: {
    fontSize: 18,
  },
  
  // States
  disabled: {
    opacity: 0.6,
  },
  
  // Icon styles
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
  
  loader: {
    marginRight: 8,
  },
});

export default CustomButton;