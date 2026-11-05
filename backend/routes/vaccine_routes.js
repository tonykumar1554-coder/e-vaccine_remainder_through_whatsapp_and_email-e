const express = require('express');
const router = express.Router();
const Vaccine = require('../models/Vaccine');
const { protect, authorize } = require('../middleware/auth');

// Default initial pediatric vaccination catalog
const defaultVaccines = [
  {
    name: 'BCG',
    diseasePrevented: 'Tuberculosis (TB)',
    doseNumber: 1,
    targetAgeDays: 0,
    targetAgeMonths: 0,
    ageLabel: 'At Birth',
    description: 'Bacillus Calmette-Guérin vaccine protects against severe childhood tuberculosis including TB meningitis.',
    routeOfAdministration: 'Intradermal',
    isMandatory: true,
    possibleSideEffects: 'Small red tender spot at injection site that later forms a small scar.',
  },
  {
    name: 'Hepatitis B (Birth Dose)',
    diseasePrevented: 'Hepatitis B Virus',
    doseNumber: 1,
    targetAgeDays: 0,
    targetAgeMonths: 0,
    ageLabel: 'At Birth',
    description: 'Administered within 24 hours of birth to prevent vertical mother-to-child hepatitis B transmission.',
    routeOfAdministration: 'Intramuscular',
    isMandatory: true,
    possibleSideEffects: 'Mild soreness or irritability.',
  },
  {
    name: 'OPV (Zero Dose)',
    diseasePrevented: 'Poliomyelitis (Polio)',
    doseNumber: 1,
    targetAgeDays: 0,
    targetAgeMonths: 0,
    ageLabel: 'At Birth',
    description: 'Oral Polio Vaccine given at birth to generate gut immunity against poliovirus.',
    routeOfAdministration: 'Oral',
    isMandatory: true,
    possibleSideEffects: 'Extremely rare mild loose stools.',
  },
  {
    name: 'Pentavalent 1',
    diseasePrevented: 'Diphtheria, Pertussis, Tetanus, Hepatitis B, Hib',
    doseNumber: 1,
    targetAgeDays: 42,
    targetAgeMonths: 1.5,
    ageLabel: '6 Weeks',
    description: '5-in-1 combo vaccine protecting against five dangerous childhood infections.',
    routeOfAdministration: 'Intramuscular',
    isMandatory: true,
    possibleSideEffects: 'Mild fever, swelling or redness at injection site.',
  },
  {
    name: 'Rotavirus 1',
    diseasePrevented: 'Rotavirus Diarrhea',
    doseNumber: 1,
    targetAgeDays: 42,
    targetAgeMonths: 1.5,
    ageLabel: '6 Weeks',
    description: 'Protects young infants from severe dehydration caused by rotaviral gastroenteritis.',
    routeOfAdministration: 'Oral',
    isMandatory: true,
    possibleSideEffects: 'Mild restlessness or temporary loss of appetite.',
  },
  {
    name: 'PCV 1 (Pneumococcal)',
    diseasePrevented: 'Pneumococcal Pneumonia & Meningitis',
    doseNumber: 1,
    targetAgeDays: 42,
    targetAgeMonths: 1.5,
    ageLabel: '6 Weeks',
    description: 'Pneumococcal Conjugate Vaccine protects infants against bacterial pneumonia and bacteremia.',
    routeOfAdministration: 'Intramuscular',
    isMandatory: true,
    possibleSideEffects: 'Low grade fever, localized injection soreness.',
  },
  {
    name: 'Pentavalent 2',
    diseasePrevented: 'Diphtheria, Pertussis, Tetanus, Hepatitis B, Hib',
    doseNumber: 2,
    targetAgeDays: 70,
    targetAgeMonths: 2.5,
    ageLabel: '10 Weeks',
    description: 'Second dose of the 5-in-1 pentavalent series.',
    routeOfAdministration: 'Intramuscular',
    isMandatory: true,
    possibleSideEffects: 'Mild fever, temporary fussiness.',
  },
  {
    name: 'Rotavirus 2',
    diseasePrevented: 'Rotavirus Diarrhea',
    doseNumber: 2,
    targetAgeDays: 70,
    targetAgeMonths: 2.5,
    ageLabel: '10 Weeks',
    description: 'Second oral dose for rotavirus protection.',
    routeOfAdministration: 'Oral',
    isMandatory: true,
    possibleSideEffects: 'Rare mild diarrhea or vomiting.',
  },
  {
    name: 'Pentavalent 3',
    diseasePrevented: 'Diphtheria, Pertussis, Tetanus, Hepatitis B, Hib',
    doseNumber: 3,
    targetAgeDays: 98,
    targetAgeMonths: 3.5,
    ageLabel: '14 Weeks',
    description: 'Third dose completing the primary pentavalent series.',
    routeOfAdministration: 'Intramuscular',
    isMandatory: true,
    possibleSideEffects: 'Mild fever, swelling at injection site.',
  },
  {
    name: 'Rotavirus 3',
    diseasePrevented: 'Rotavirus Diarrhea',
    doseNumber: 3,
    targetAgeDays: 98,
    targetAgeMonths: 3.5,
    ageLabel: '14 Weeks',
    description: 'Third oral rotavirus dose.',
    routeOfAdministration: 'Oral',
    isMandatory: true,
    possibleSideEffects: 'Mild fever.',
  },
  {
    name: 'PCV 2 (Pneumococcal)',
    diseasePrevented: 'Pneumococcal Disease',
    doseNumber: 2,
    targetAgeDays: 98,
    targetAgeMonths: 3.5,
    ageLabel: '14 Weeks',
    description: 'Second primary dose of Pneumococcal Conjugate Vaccine.',
    routeOfAdministration: 'Intramuscular',
    isMandatory: true,
    possibleSideEffects: 'Low grade fever.',
  },
  {
    name: 'MR / Measles-Rubella 1',
    diseasePrevented: 'Measles and Rubella',
    doseNumber: 1,
    targetAgeDays: 270,
    targetAgeMonths: 9,
    ageLabel: '9 Months',
    description: 'Provides critical immunity against measles and congenital rubella syndrome.',
    routeOfAdministration: 'Subcutaneous',
    isMandatory: true,
    possibleSideEffects: 'Mild transient rash or fever 6-10 days after dose.',
  },
  {
    name: 'MR / Measles-Rubella 2',
    diseasePrevented: 'Measles and Rubella',
    doseNumber: 2,
    targetAgeDays: 480,
    targetAgeMonths: 16,
    ageLabel: '16-24 Months',
    description: 'Second booster dose guaranteeing long-term protection against measles and rubella.',
    routeOfAdministration: 'Subcutaneous',
    isMandatory: true,
    possibleSideEffects: 'Mild fever.',
  },
  {
    name: 'DTP Booster 1',
    diseasePrevented: 'Diphtheria, Tetanus, Pertussis',
    doseNumber: 1,
    targetAgeDays: 500,
    targetAgeMonths: 16.5,
    ageLabel: '16-24 Months',
    description: 'First booster shot for diphtheria, tetanus and whooping cough.',
    routeOfAdministration: 'Intramuscular',
    isMandatory: true,
    possibleSideEffects: 'Pain and swelling at injection site.',
  },
  {
    name: 'DTP Booster 2',
    diseasePrevented: 'Diphtheria, Tetanus, Pertussis',
    doseNumber: 2,
    targetAgeDays: 1825,
    targetAgeMonths: 60,
    ageLabel: '5-6 Years',
    description: 'Second booster given prior to primary school entry.',
    routeOfAdministration: 'Intramuscular',
    isMandatory: true,
    possibleSideEffects: 'Temporary soreness or swelling.',
  },
];

// @route   GET /api/vaccines
// @desc    Get all vaccines (CRUD Read all)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const vaccines = await Vaccine.find().sort({ targetAgeDays: 1, doseNumber: 1 });
    res.json({
      success: true,
      count: vaccines.length,
      data: vaccines,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/vaccines/:id
// @desc    Get single vaccine by ID (CRUD Read one)
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const vaccine = await Vaccine.findById(req.params.id);
    if (!vaccine) {
      return res.status(404).json({ success: false, message: 'Vaccine not found' });
    }
    res.json({ success: true, data: vaccine });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/vaccines
// @desc    Create new vaccine (CRUD Create)
// @access  Private (Admin, Doctor)
router.post('/', protect, authorize('admin', 'doctor'), async (req, res) => {
  try {
    const {
      name,
      diseasePrevented,
      doseNumber,
      targetAgeDays,
      targetAgeMonths,
      ageLabel,
      description,
      routeOfAdministration,
      isMandatory,
      possibleSideEffects,
    } = req.body;

    if (!name || !diseasePrevented || !ageLabel) {
      return res.status(400).json({
        success: false,
        message: 'Name, disease prevented, and age label are required fields.',
      });
    }

    const calculatedDays =
      targetAgeDays !== undefined
        ? Number(targetAgeDays)
        : (Number(targetAgeMonths) || 0) * 30;

    const vaccine = await Vaccine.create({
      name,
      diseasePrevented,
      doseNumber: Number(doseNumber) || 1,
      targetAgeDays: calculatedDays,
      targetAgeMonths: Number(targetAgeMonths) || Math.round(calculatedDays / 30),
      ageLabel,
      description: description || '',
      routeOfAdministration: routeOfAdministration || 'Intramuscular',
      isMandatory: isMandatory !== undefined ? isMandatory : true,
      possibleSideEffects: possibleSideEffects || 'Mild soreness or fever.',
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: 'Vaccine added successfully!',
      data: vaccine,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/vaccines/:id
// @desc    Update vaccine details (CRUD Update)
// @access  Private (Admin, Doctor)
router.put('/:id', protect, authorize('admin', 'doctor'), async (req, res) => {
  try {
    const vaccine = await Vaccine.findById(req.params.id);
    if (!vaccine) {
      return res.status(404).json({ success: false, message: 'Vaccine not found' });
    }

    const updatedVaccine = await Vaccine.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Vaccine updated successfully!',
      data: updatedVaccine,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/vaccines/:id
// @desc    Delete vaccine (CRUD Delete)
// @access  Private (Admin)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const vaccine = await Vaccine.findById(req.params.id);
    if (!vaccine) {
      return res.status(404).json({ success: false, message: 'Vaccine not found' });
    }

    await Vaccine.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Vaccine deleted successfully!',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/vaccines/seed
// @desc    Seed standard national pediatric vaccine catalog
// @access  Public (or Admin)
router.post('/seed', async (req, res) => {
  try {
    const count = await Vaccine.countDocuments();
    if (count > 0 && !req.query.force) {
      const existing = await Vaccine.find().sort({ targetAgeDays: 1 });
      return res.json({
        success: true,
        message: 'Vaccines catalog already populated.',
        count,
        data: existing,
      });
    }

    if (req.query.force) {
      await Vaccine.deleteMany({});
    }

    const inserted = await Vaccine.insertMany(defaultVaccines);

    res.status(201).json({
      success: true,
      message: `Successfully seeded ${inserted.length} standard pediatric vaccines!`,
      count: inserted.length,
      data: inserted,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
module.exports.defaultVaccines = defaultVaccines;
