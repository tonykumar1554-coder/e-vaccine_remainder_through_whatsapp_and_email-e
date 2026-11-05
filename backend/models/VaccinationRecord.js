const mongoose = require('mongoose');

const vaccinationRecordSchema = new mongoose.Schema(
  {
    child: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Child',
      required: [true, 'Child reference is required'],
    },
    vaccine: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vaccine',
      required: [true, 'Vaccine reference is required'],
    },
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Parent reference is required'],
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required'],
    },
    status: {
      type: String,
      enum: ['Pending', 'Due', 'Completed', 'Overdue'],
      default: 'Pending',
    },
    administeredDate: {
      type: Date,
    },
    administeredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Doctor or healthcare worker
    },
    doctorName: {
      type: String,
      trim: true,
      default: '',
    },
    clinicOrHospital: {
      type: String,
      trim: true,
      default: '',
    },
    batchNumber: {
      type: String,
      trim: true,
      default: '',
    },
    adverseEffectsReported: {
      type: String,
      trim: true,
      default: '',
    },
    remarks: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Index for fast querying by child and status
vaccinationRecordSchema.index({ child: 1, status: 1 });
vaccinationRecordSchema.index({ parent: 1, dueDate: 1 });

module.exports = mongoose.model('VaccinationRecord', vaccinationRecordSchema);
