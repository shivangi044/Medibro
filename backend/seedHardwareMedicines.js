const mongoose = require('mongoose');
require('dotenv').config();
const HardwareMedicine = require('./models/HardwareMedicine');

const sampleMedicines = [
  {
    medicineName: 'Aspirin',
    dosage: '100mg',
    slot: 1,
    scheduledTime: '08:00',
    status: 'pending',
    snoozeCount: 0,
    date: new Date().toISOString().split('T')[0]
  },
  {
    medicineName: 'Vitamin D',
    dosage: '50mg',
    slot: 2,
    scheduledTime: '14:00',
    status: 'pending',
    snoozeCount: 0,
    date: new Date().toISOString().split('T')[0]
  },
  {
    medicineName: 'Calcium',
    dosage: '500mg',
    slot: 3,
    scheduledTime: '20:00',
    status: 'pending',
    snoozeCount: 0,
    date: new Date().toISOString().split('T')[0]
  },
  {
    medicineName: 'Paracetamol',
    dosage: '500mg',
    slot: 4,
    scheduledTime: '06:00',
    status: 'taken',
    takenTime: new Date(),
    snoozeCount: 0,
    date: new Date().toISOString().split('T')[0]
  },
  {
    medicineName: 'Ibuprofen',
    dosage: '200mg',
    slot: 1,
    scheduledTime: '10:00',
    status: 'missed',
    snoozeCount: 0,
    date: new Date().toISOString().split('T')[0]
  },
  {
    medicineName: 'Antibiotic',
    dosage: '250mg',
    slot: 2,
    scheduledTime: '12:00',
    status: 'snoozed',
    snoozedUntil: new Date(Date.now() + 30 * 60 * 1000),
    snoozeCount: 1,
    date: new Date().toISOString().split('T')[0]
  }
];

const seedDatabase = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    console.log('🗑️  Clearing existing hardware medicines...');
    await HardwareMedicine.deleteMany({});
    console.log('✅ Cleared existing data');

    console.log('🌱 Seeding sample medicines...');
    const medicines = await HardwareMedicine.insertMany(sampleMedicines);
    console.log(`✅ Added ${medicines.length} sample medicines`);

    console.log('\n📋 Sample Medicines:');
    medicines.forEach(med => {
      console.log(`   - ${med.medicineName} (${med.dosage}) - Slot ${med.slot} at ${med.scheduledTime} - Status: ${med.status}`);
    });

    console.log('\n✅ Database seeding complete!');
    console.log('\n🚀 You can now start the server and test the APIs:');
    console.log('   GET http://localhost:5000/api/hardware/upcoming');
    console.log('   GET http://localhost:5000/api/hardware/taken');
    console.log('   GET http://localhost:5000/api/hardware/missed');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
