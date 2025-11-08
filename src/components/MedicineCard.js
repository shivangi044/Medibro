import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const MedicineCard = ({
  medicine,
  onPress,
  onStatusUpdate,
  showActions = false,
  style = {}
}) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'taken': return '#4CAF50';
      case 'snoozed': return '#FF9800';
      case 'skipped': return '#F44336';
      default: return '#2E86AB';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'taken': return 'checkmark-circle';
      case 'snoozed': return 'time';
      case 'skipped': return 'close-circle';
      default: return 'ellipse-outline';
    }
  };

  const renderStatusActions = () => {
    if (!showActions) return null;

    return (
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: '#4CAF50' }]}
          onPress={() => onStatusUpdate?.(medicine.id, 'taken')}
        >
          <Ionicons name="checkmark" size={16} color="#fff" />
          <Text style={styles.actionText}>Taken</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: '#FF9800' }]}
          onPress={() => onStatusUpdate?.(medicine.id, 'snoozed')}
        >
          <Ionicons name="time" size={16} color="#fff" />
          <Text style={styles.actionText}>Snooze</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: '#F44336' }]}
          onPress={() => onStatusUpdate?.(medicine.id, 'skipped')}
        >
          <Ionicons name="close" size={16} color="#fff" />
          <Text style={styles.actionText}>Skip</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <TouchableOpacity
      style={[styles.card, style]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.header}>
        <View style={styles.medicineInfo}>
          <Ionicons
            name={getStatusIcon(medicine.status)}
            size={24}
            color={getStatusColor(medicine.status)}
          />
          <View style={styles.textInfo}>
            <Text style={styles.medicineName}>{medicine.name}</Text>
            <Text style={styles.dosage}>{medicine.dosage}</Text>
            {medicine.slot && (
              <Text style={styles.slot}>Slot: {medicine.slot}</Text>
            )}
          </View>
        </View>

        <View style={styles.rightInfo}>
          {medicine.times && Array.isArray(medicine.times) && (
            <Text style={styles.times}>
              {medicine.times.join(', ')}
            </Text>
          )}
          {medicine.time && (
            <Text style={styles.times}>{medicine.time}</Text>
          )}
          
          <View style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(medicine.status) }
          ]}>
            <Text style={styles.statusText}>
              {medicine.status?.charAt(0).toUpperCase() + medicine.status?.slice(1) || 'Pending'}
            </Text>
          </View>
        </View>
      </View>

      {medicine.description && (
        <Text style={styles.description} numberOfLines={2}>
          {medicine.description}
        </Text>
      )}

      {medicine.remaining !== undefined && medicine.quantity !== undefined && (
        <View style={styles.stockInfo}>
          <Ionicons name="layers-outline" size={14} color="#666" />
          <Text style={styles.stockText}>
            {medicine.remaining}/{medicine.quantity} remaining
          </Text>
          {medicine.remaining < 7 && (
            <Text style={styles.lowStockWarning}>Low Stock</Text>
          )}
        </View>
      )}

      {medicine.lastTaken && (
        <View style={styles.lastTakenInfo}>
          <Ionicons name="checkmark-circle-outline" size={14} color="#4CAF50" />
          <Text style={styles.lastTakenText}>
            Last taken: {new Date(medicine.lastTaken).toLocaleString()}
          </Text>
        </View>
      )}

      {renderStatusActions()}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 16,
    marginVertical: 4,
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  medicineInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  textInfo: {
    marginLeft: 12,
    flex: 1,
  },
  medicineName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  dosage: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  slot: {
    fontSize: 12,
    color: '#2E86AB',
    marginTop: 4,
    fontWeight: '500',
  },
  rightInfo: {
    alignItems: 'flex-end',
  },
  times: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 4,
  },
  statusText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 18,
  },
  stockInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  stockText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 6,
  },
  lowStockWarning: {
    fontSize: 10,
    color: '#F44336',
    fontWeight: '600',
    marginLeft: 8,
    backgroundColor: '#ffebee',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  lastTakenInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  lastTakenText: {
    fontSize: 12,
    color: '#4CAF50',
    marginLeft: 6,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  actionText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default MedicineCard;