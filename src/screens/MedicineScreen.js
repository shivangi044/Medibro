import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  Modal,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const MedicineScreen = ({ navigation }) => {
  const [medicines, setMedicines] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [filter, setFilter] = useState('all'); // all, pending, taken, snoozed, skipped

  useEffect(() => {
    loadMedicines();
  }, []);

  const loadMedicines = () => {
    // Mock medicine data with more detailed information
    const mockMedicines = [
      {
        id: 1,
        name: 'Paracetamol',
        dosage: '500mg',
        times: ['09:00 AM', '06:00 PM'],
        slot: 'A1',
        status: 'taken',
        lastTaken: new Date().toISOString(),
        description: 'For pain relief and fever reduction',
        sideEffects: 'Mild drowsiness, stomach upset',
        instructions: 'Take with food',
        quantity: 28,
        remaining: 25,
      },
      {
        id: 2,
        name: 'Vitamin D',
        dosage: '1000 IU',
        times: ['02:00 PM'],
        slot: 'A2',
        status: 'pending',
        lastTaken: null,
        description: 'Vitamin D3 supplement for bone health',
        sideEffects: 'None reported',
        instructions: 'Take with a meal containing fat',
        quantity: 30,
        remaining: 28,
      },
      {
        id: 3,
        name: 'Omega-3',
        dosage: '1000mg',
        times: ['08:00 AM'],
        slot: 'A3',
        status: 'snoozed',
        lastTaken: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        description: 'Fish oil for heart and brain health',
        sideEffects: 'Fishy aftertaste',
        instructions: 'Can be taken with or without food',
        quantity: 60,
        remaining: 55,
      },
      {
        id: 4,
        name: 'Aspirin',
        dosage: '75mg',
        times: ['09:00 PM'],
        slot: 'B1',
        status: 'pending',
        lastTaken: null,
        description: 'Low-dose aspirin for cardiovascular health',
        sideEffects: 'May cause stomach irritation',
        instructions: 'Take with food to reduce stomach irritation',
        quantity: 90,
        remaining: 88,
      },
      {
        id: 5,
        name: 'Metformin',
        dosage: '500mg',
        times: ['09:00 AM', '09:00 PM'],
        slot: 'B2',
        status: 'taken',
        lastTaken: new Date().toISOString(),
        description: 'For type 2 diabetes management',
        sideEffects: 'Nausea, diarrhea (usually temporary)',
        instructions: 'Take with meals',
        quantity: 60,
        remaining: 45,
      },
    ];
    setMedicines(mockMedicines);
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadMedicines();
    setRefreshing(false);
  };

  const handleStatusUpdate = (medicineId, newStatus) => {
    setMedicines(prev => prev.map(med => 
      med.id === medicineId 
        ? { 
            ...med, 
            status: newStatus,
            lastTaken: newStatus === 'taken' ? new Date().toISOString() : med.lastTaken
          }
        : med
    ));
    setModalVisible(false);
    
    // Show confirmation
    Alert.alert(
      'Status Updated',
      `Medicine marked as ${newStatus}`,
      [{ text: 'OK' }]
    );
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'taken': return 'checkmark-circle';
      case 'snoozed': return 'time';
      case 'skipped': return 'close-circle';
      default: return 'ellipse-outline';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'taken': return '#4CAF50';
      case 'snoozed': return '#FF9800';
      case 'skipped': return '#F44336';
      default: return '#2E86AB';
    }
  };

  const filteredMedicines = medicines.filter(medicine => 
    filter === 'all' || medicine.status === filter
  );

  const getFilteredCount = (filterType) => {
    if (filterType === 'all') return medicines.length;
    return medicines.filter(med => med.status === filterType).length;
  };

  const openMedicineModal = (medicine) => {
    setSelectedMedicine(medicine);
    setModalVisible(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Medicines</Text>
        <TouchableOpacity style={styles.addButton}>
          <Ionicons name="add" size={24} color="#2E86AB" />
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
        {[
          { key: 'all', label: 'All' },
          { key: 'pending', label: 'Pending' },
          { key: 'taken', label: 'Taken' },
          { key: 'snoozed', label: 'Snoozed' },
          { key: 'skipped', label: 'Skipped' },
        ].map((filterItem) => (
          <TouchableOpacity
            key={filterItem.key}
            style={[
              styles.filterTab,
              filter === filterItem.key && styles.filterTabActive,
            ]}
            onPress={() => setFilter(filterItem.key)}
          >
            <Text style={[
              styles.filterText,
              filter === filterItem.key && styles.filterTextActive,
            ]}>
              {filterItem.label} ({getFilteredCount(filterItem.key)})
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView
        style={styles.medicineList}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {filteredMedicines.map((medicine) => (
          <TouchableOpacity
            key={medicine.id}
            style={styles.medicineCard}
            onPress={() => openMedicineModal(medicine)}
          >
            <View style={styles.medicineHeader}>
              <View style={styles.medicineLeft}>
                <Ionicons
                  name={getStatusIcon(medicine.status)}
                  size={32}
                  color={getStatusColor(medicine.status)}
                />
                <View style={styles.medicineInfo}>
                  <Text style={styles.medicineName}>{medicine.name}</Text>
                  <Text style={styles.medicineDosage}>{medicine.dosage}</Text>
                  <Text style={styles.medicineSlot}>Slot: {medicine.slot}</Text>
                </View>
              </View>
              <View style={styles.medicineRight}>
                <Text style={styles.medicineQuantity}>
                  {medicine.remaining}/{medicine.quantity}
                </Text>
                <Text style={styles.quantityLabel}>remaining</Text>
              </View>
            </View>

            <View style={styles.medicineDetails}>
              <Text style={styles.medicineDescription}>{medicine.description}</Text>
              
              <View style={styles.timesContainer}>
                <Ionicons name="time-outline" size={16} color="#666" />
                <Text style={styles.medicineTimesLabel}>Times: </Text>
                <Text style={styles.medicineTimes}>{medicine.times.join(', ')}</Text>
              </View>

              {medicine.lastTaken && (
                <View style={styles.lastTakenContainer}>
                  <Ionicons name="checkmark-circle-outline" size={16} color="#4CAF50" />
                  <Text style={styles.lastTakenText}>
                    Last taken: {new Date(medicine.lastTaken).toLocaleString()}
                  </Text>
                </View>
              )}
            </View>

            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(medicine.status) }]}>
              <Text style={styles.statusText}>
                {medicine.status.charAt(0).toUpperCase() + medicine.status.slice(1)}
              </Text>
            </View>
          </TouchableOpacity>
        ))}

        {filteredMedicines.length === 0 && (
          <View style={styles.emptyContainer}>
            <Ionicons name="medical-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No medicines found</Text>
            <Text style={styles.emptySubtext}>
              {filter === 'all' ? 'Add your first medicine' : `No ${filter} medicines`}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Medicine Detail Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedMedicine && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>{selectedMedicine.name}</Text>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => setModalVisible(false)}
                  >
                    <Ionicons name="close" size={24} color="#666" />
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.modalBody}>
                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>Dosage & Instructions</Text>
                    <Text style={styles.modalText}>{selectedMedicine.dosage}</Text>
                    <Text style={styles.modalText}>{selectedMedicine.instructions}</Text>
                  </View>

                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>Schedule</Text>
                    <Text style={styles.modalText}>Times: {selectedMedicine.times.join(', ')}</Text>
                    <Text style={styles.modalText}>Slot: {selectedMedicine.slot}</Text>
                  </View>

                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>Description</Text>
                    <Text style={styles.modalText}>{selectedMedicine.description}</Text>
                  </View>

                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>Side Effects</Text>
                    <Text style={styles.modalText}>{selectedMedicine.sideEffects}</Text>
                  </View>

                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>Stock</Text>
                    <Text style={styles.modalText}>
                      {selectedMedicine.remaining} remaining out of {selectedMedicine.quantity}
                    </Text>
                  </View>
                </ScrollView>

                <View style={styles.modalActions}>
                  <Text style={styles.actionsTitle}>Update Status:</Text>
                  <View style={styles.actionButtons}>
                    <TouchableOpacity
                      style={[styles.actionButton, { backgroundColor: '#4CAF50' }]}
                      onPress={() => handleStatusUpdate(selectedMedicine.id, 'taken')}
                    >
                      <Ionicons name="checkmark" size={16} color="#fff" />
                      <Text style={styles.actionButtonText}>Taken</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.actionButton, { backgroundColor: '#FF9800' }]}
                      onPress={() => handleStatusUpdate(selectedMedicine.id, 'snoozed')}
                    >
                      <Ionicons name="time" size={16} color="#fff" />
                      <Text style={styles.actionButtonText}>Snooze</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.actionButton, { backgroundColor: '#F44336' }]}
                      onPress={() => handleStatusUpdate(selectedMedicine.id, 'skipped')}
                    >
                      <Ionicons name="close" size={16} color="#fff" />
                      <Text style={styles.actionButtonText}>Skip</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E86AB',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f8ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
  },
  filterTab: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
  },
  filterTabActive: {
    backgroundColor: '#2E86AB',
  },
  filterText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#fff',
  },
  medicineList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  medicineCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginVertical: 8,
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  medicineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  medicineLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  medicineInfo: {
    marginLeft: 15,
    flex: 1,
  },
  medicineName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  medicineDosage: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  medicineSlot: {
    fontSize: 12,
    color: '#2E86AB',
    marginTop: 4,
    fontWeight: '500',
  },
  medicineRight: {
    alignItems: 'flex-end',
  },
  medicineQuantity: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E86AB',
  },
  quantityLabel: {
    fontSize: 10,
    color: '#666',
  },
  medicineDetails: {
    marginBottom: 15,
  },
  medicineDescription: {
    fontSize: 14,
    color: '#333',
    marginBottom: 10,
  },
  timesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  medicineTimesLabel: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  medicineTimes: {
    fontSize: 14,
    color: '#2E86AB',
    fontWeight: '500',
  },
  lastTakenContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lastTakenText: {
    fontSize: 12,
    color: '#4CAF50',
    marginLeft: 8,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginTop: 20,
    fontWeight: '500',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    maxHeight: '80%',
    paddingTop: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
  modalBody: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  modalSection: {
    marginBottom: 20,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E86AB',
    marginBottom: 8,
  },
  modalText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  modalActions: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  actionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    marginHorizontal: 5,
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 5,
  },
});

export default MedicineScreen;