const mongoose = require('mongoose');

const vaccineSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide the vaccine name'],
      trim: true,
    },
    diseasePrevented: {
      type: String,
      required: [true, 'Please provide disease prevented'],
      trim: true,
    },
    doseNumber: {
      type: Number,
      default: 1,
      min: 1,
    },
    targetAgeDays: {
      type: Number,
      required: true,
      default: 0, // Days after birth (0 = at birth, 42 = 6 weeks, etc.)
    },
    targetAgeMonths: {
      type: Number,
      default: 0,
    },
    ageLabel: {
      type: String,
      required: [true, 'Please provide target age label (e.g. At Birth, 6 Weeks)'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    routeOfAdministration: {
      type: String,
      trim: true,
      default: 'Intramuscular',
    },
    isMandatory: {
      type: Boolean,
      default: true,
    },
    possibleSideEffects: {
      type: String,
      trim: true,
      default: 'Mild fever or slight soreness at the injection site.',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Vaccine', vaccineSchema);
