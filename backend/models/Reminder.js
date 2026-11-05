const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema(
  {
    child: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Child',
      required: [true, 'Child is required'],
    },
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Parent is required'],
    },
    vaccine: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vaccine',
      required: [true, 'Vaccine is required'],
    },
    record: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'VaccinationRecord',
    },
    dueDate: {
      type: Date,
      required: true,
    },
    reminderType: {
      type: String,
      enum: ['Upcoming', 'Due Today', 'Overdue', 'Appointment Alert'],
      default: 'Upcoming',
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Reminder', reminderSchema);
