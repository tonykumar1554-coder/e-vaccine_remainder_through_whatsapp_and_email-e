const User = require('../models/User');
const Vaccine = require('../models/Vaccine');
const Child = require('../models/Child');
const VaccinationRecord = require('../models/VaccinationRecord');
const Reminder = require('../models/Reminder');
const { defaultVaccines } = require('../routes/vaccine_routes');

const seedDatabase = async () => {
  try {
    // 1. Seed Vaccines if empty
    const vaccineCount = await Vaccine.countDocuments();
    let vaccinesList = [];

    if (vaccineCount === 0) {
      console.log('Seeding default pediatric vaccines catalog...');
      vaccinesList = await Vaccine.insertMany(defaultVaccines);
      console.log(`Successfully seeded ${vaccinesList.length} vaccines.`);
    } else {
      vaccinesList = await Vaccine.find().sort({ targetAgeDays: 1 });
    }

    // 2. Seed Default Demo Users
    const adminExists = await User.findOne({ email: 'admin@evaccine.com' });
    let adminUser = adminExists;
    if (!adminExists) {
      adminUser = await User.create({
        name: 'System Admin',
        email: 'admin@evaccine.com',
        password: 'admin123',
        role: 'admin',
        phone: '+1-555-0100',
        hospitalOrClinic: 'Central Immunization Authority',
      });
      console.log('Default Admin created: admin@evaccine.com / admin123');
    }

    const doctorExists = await User.findOne({ email: 'doctor@evaccine.com' });
    let doctorUser = doctorExists;
    if (!doctorExists) {
      doctorUser = await User.create({
        name: 'Dr. Sarah Jenkins, MD',
        email: 'doctor@evaccine.com',
        password: 'doctor123',
        role: 'doctor',
        phone: '+1-555-0199',
        hospitalOrClinic: 'Metro City Pediatric Clinic',
        specialization: 'Chief Pediatrician',
      });
      console.log('Default Doctor created: doctor@evaccine.com / doctor123');
    }

    const parentExists = await User.findOne({ email: 'parent@evaccine.com' });
    let parentUser = parentExists;
    if (!parentExists) {
      parentUser = await User.create({
        name: 'Emily & John Doe',
        email: 'parent@evaccine.com',
        password: 'parent123',
        role: 'parent',
        phone: '+1-555-0144',
      });
      console.log('Default Parent created: parent@evaccine.com / parent123');
    }

    // 3. Seed Demo Child & Vaccination Records for Parent if none exist
    if (parentUser) {
      const existingChild = await Child.findOne({ parent: parentUser._id });
      if (!existingChild) {
        // Child born 4 months ago
        const dob = new Date();
        dob.setMonth(dob.getMonth() - 4);

        const child = await Child.create({
          parent: parentUser._id,
          name: 'Liam Doe',
          dateOfBirth: dob,
          gender: 'male',
          bloodGroup: 'O+',
          birthWeight: 3.4,
          allergies: 'None',
          emergencyContact: '+1-555-0144',
          notes: 'Healthy infant. Delivered full term.',
        });

        console.log(`Demo child '${child.name}' created.`);

        // Generate schedule for Liam
        const today = new Date();
        const recordsToInsert = [];
        const remindersToInsert = [];

        for (const v of vaccinesList) {
          const dueDate = new Date(dob);
          dueDate.setDate(dueDate.getDate() + (v.targetAgeDays || 0));

          let status = 'Pending';
          let administeredDate = null;
          let batchNumber = '';
          let clinicOrHospital = '';
          let docName = '';

          // If targetAgeDays is 0 (Birth vaccines), mark them completed by Dr. Jenkins
          if (v.targetAgeDays === 0) {
            status = 'Completed';
            administeredDate = new Date(dob);
            administeredDate.setDate(administeredDate.getDate() + 1);
            batchNumber = `VAC-${v.name.slice(0, 3).toUpperCase()}-9042`;
            clinicOrHospital = 'Metro City Pediatric Clinic';
            docName = doctorUser ? doctorUser.name : 'Dr. Sarah Jenkins';
          } else {
            const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            if (diffDays < 0) {
              status = 'Overdue';
            } else if (diffDays <= 14) {
              status = 'Due';
            }
          }

          recordsToInsert.push({
            child: child._id,
            vaccine: v._id,
            parent: parentUser._id,
            dueDate,
            status,
            administeredDate,
            batchNumber,
            clinicOrHospital,
            doctorName: docName,
            administeredBy: status === 'Completed' && doctorUser ? doctorUser._id : undefined,
          });
        }

        const insertedRecords = await VaccinationRecord.insertMany(recordsToInsert);

        // Insert initial reminders for Due or Overdue
        for (const rec of insertedRecords) {
          if (rec.status === 'Due' || rec.status === 'Overdue') {
            const v = vaccinesList.find((vac) => vac._id.toString() === rec.vaccine.toString());
            remindersToInsert.push({
              child: child._id,
              parent: parentUser._id,
              vaccine: rec.vaccine,
              record: rec._id,
              dueDate: rec.dueDate,
              reminderType: rec.status === 'Overdue' ? 'Overdue' : 'Upcoming',
              title: `${rec.status === 'Overdue' ? '⚠️ OVERDUE' : '🔔 UPCOMING'}: ${v ? v.name : 'Vaccine'} for ${child.name}`,
              message: `Vaccine ${v ? v.name : ''} is ${rec.status.toLowerCase()} for ${child.name}. Scheduled due date: ${new Date(rec.dueDate).toLocaleDateString()}.`,
              isRead: false,
            });
          }
        }

        if (remindersToInsert.length > 0) {
          await Reminder.insertMany(remindersToInsert);
        }

        console.log(`Generated ${insertedRecords.length} records and ${remindersToInsert.length} reminders for Liam.`);
      }
    }
  } catch (error) {
    console.error('Data seeding note:', error.message);
  }
};

module.exports = seedDatabase;
