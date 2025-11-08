import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

const HomeScreen = ({ navigation }) => {
  const [userName, setUserName] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [todayMedicines, setTodayMedicines] = useState([]);
  const [adherenceRate, setAdherenceRate] = useState(85);
  const [botStatus, setBotStatus] = useState('connected');

  useEffect(() => {
    loadUserData();
    loadTodayMedicines();
  }, []);

  const loadUserData = async () => {
    try {
      const profile = await AsyncStorage.getItem('userProfile');
      if (profile) {
        const userData = JSON.parse(profile);
        setUserName(userData.name.split(' ')[0]); // First name only
      }
    } catch (error) {
      console.log('Error loading user data:', error);
    }
  };

  const loadTodayMedicines = async () => {
    // Mock data for today's medicines
    const mockMedicines = [
      {
        id: 1,
        name: 'Paracetamol',
        dosage: '500mg',
        time: '09:00 AM',
        status: 'taken',
        slot: 'A1'
      },
      {
        id: 2,
        name: 'Vitamin D',
        dosage: '1000 IU',
        time: '02:00 PM',
        status: 'pending',
        slot: 'A2'
      },
      {
        id: 3,
        name: 'Omega-3',
        dosage: '1000mg',
        time: '06:00 PM',
        status: 'pending',
        slot: 'A3'
      },
      {
        id: 4,
        name: 'Aspirin',
        dosage: '75mg',
        time: '09:00 PM',
        status: 'pending',
        slot: 'B1'
      }
    ];
    setTodayMedicines(mockMedicines);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTodayMedicines();
    setRefreshing(false);
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

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getNextMedicine = () => {
    const pending = todayMedicines.filter(med => med.status === 'pending');
    if (pending.length > 0) {
      const now = new Date();
      const currentTime = now.getHours() * 60 + now.getMinutes();
      
      for (let medicine of pending) {
        const [time, period] = medicine.time.split(' ');
        const [hours, minutes] = time.split(':').map(Number);
        const medicineTime = (period === 'PM' && hours !== 12 ? hours + 12 : hours) * 60 + minutes;
        
        if (medicineTime >= currentTime) {
          return medicine;
        }
      }
    }
    return null;
  };

  const getCompletedCount = () => {
    return todayMedicines.filter(med => med.status === 'taken').length;
  };

  const nextMedicine = getNextMedicine();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <LinearGradient
          colors={['#2E86AB', '#A23B72']}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.greeting}>{getGreeting()}</Text>
              <Text style={styles.userName}>{userName || 'User'}</Text>
            </View>
            <View style={styles.headerRight}>
              <View style={[styles.botStatus, { backgroundColor: botStatus === 'connected' ? '#4CAF50' : '#F44336' }]}>
                <Ionicons name="bluetooth" size={16} color="#fff" />
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{getCompletedCount()}/{todayMedicines.length}</Text>
            <Text style={styles.statLabel}>Today's Doses</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{adherenceRate}%</Text>
            <Text style={styles.statLabel}>Adherence Rate</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>2</Text>
            <Text style={styles.statLabel}>Remaining</Text>
          </View>
        </View>

        {/* Next Medicine */}
        {nextMedicine && (
          <View style={styles.nextMedicineCard}>
            <View style={styles.nextMedicineHeader}>
              <Ionicons name="time-outline" size={24} color="#2E86AB" />
              <Text style={styles.nextMedicineTitle}>Next Medicine</Text>
            </View>
            <View style={styles.nextMedicineContent}>
              <Text style={styles.nextMedicineName}>{nextMedicine.name}</Text>
              <Text style={styles.nextMedicineDosage}>{nextMedicine.dosage}</Text>
              <Text style={styles.nextMedicineTime}>Due at {nextMedicine.time}</Text>
            </View>
            <TouchableOpacity style={styles.nextMedicineButton}>
              <Text style={styles.nextMedicineButtonText}>Set Reminder</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Today's Schedule */}
        <View style={styles.scheduleContainer}>
          <View style={styles.scheduleHeader}>
            <Text style={styles.scheduleTitle}>Today's Schedule</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Medicines')}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          {todayMedicines.map((medicine) => (
            <View key={medicine.id} style={styles.medicineItem}>
              <View style={styles.medicineLeft}>
                <Ionicons
                  name={getStatusIcon(medicine.status)}
                  size={24}
                  color={getStatusColor(medicine.status)}
                />
                <View style={styles.medicineInfo}>
                  <Text style={styles.medicineName}>{medicine.name}</Text>
                  <Text style={styles.medicineDosage}>{medicine.dosage} • Slot {medicine.slot}</Text>
                </View>
              </View>
              <View style={styles.medicineRight}>
                <Text style={styles.medicineTime}>{medicine.time}</Text>
                <Text style={[styles.medicineStatus, { color: getStatusColor(medicine.status) }]}>
                  {medicine.status.charAt(0).toUpperCase() + medicine.status.slice(1)}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsContainer}>
          <Text style={styles.actionsTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => navigation.navigate('Analytics')}
            >
              <Ionicons name="analytics-outline" size={32} color="#2E86AB" />
              <Text style={styles.actionText}>View Analytics</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionCard}>
              <Ionicons name="add-circle-outline" size={32} color="#2E86AB" />
              <Text style={styles.actionText}>Add Medicine</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionCard}>
              <Ionicons name="notifications-outline" size={32} color="#2E86AB" />
              <Text style={styles.actionText}>Set Reminders</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => navigation.navigate('Profile')}
            >
              <Ionicons name="settings-outline" size={32} color="#2E86AB" />
              <Text style={styles.actionText}>Settings</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 5,
  },
  headerRight: {
    alignItems: 'center',
  },
  botStatus: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: -20,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 15,
    paddingVertical: 20,
    paddingHorizontal: 15,
    alignItems: 'center',
    marginHorizontal: 5,
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E86AB',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
    textAlign: 'center',
  },
  nextMedicineCard: {
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 15,
    padding: 20,
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  nextMedicineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  nextMedicineTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2E86AB',
    marginLeft: 10,
  },
  nextMedicineContent: {
    marginBottom: 15,
  },
  nextMedicineName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  nextMedicineDosage: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  nextMedicineTime: {
    fontSize: 16,
    color: '#2E86AB',
    fontWeight: '500',
    marginTop: 5,
  },
  nextMedicineButton: {
    backgroundColor: '#2E86AB',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  nextMedicineButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  scheduleContainer: {
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 15,
    padding: 20,
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  scheduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  scheduleTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  viewAllText: {
    fontSize: 14,
    color: '#2E86AB',
    fontWeight: '500',
  },
  medicineItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  medicineLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  medicineInfo: {
    marginLeft: 12,
    flex: 1,
  },
  medicineName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  medicineDosage: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  medicineRight: {
    alignItems: 'flex-end',
  },
  medicineTime: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  medicineStatus: {
    fontSize: 12,
    marginTop: 2,
    fontWeight: '500',
  },
  actionsContainer: {
    margin: 20,
    marginBottom: 30,
  },
  actionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    backgroundColor: '#fff',
    width: '48%',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    marginBottom: 15,
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  actionText: {
    marginTop: 10,
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default HomeScreen;