const express = require('express');
const router = express.Router();
const Reminder = require('../models/Reminder');
const VaccinationRecord = require('../models/VaccinationRecord');
const Child = require('../models/Child');
const { protect } = require('../middleware/auth');

// @route   GET /api/reminders
// @desc    Get reminders for current user
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    let filter = {};

    if (req.user.role === 'parent') {
      filter.parent = req.user._id;
    }

    const reminders = await Reminder.find(filter)
      .populate('child', 'name dateOfBirth gender')
      .populate('vaccine', 'name ageLabel diseasePrevented isMandatory')
      .sort({ createdAt: -1 });

    const unreadCount = reminders.filter((r) => !r.isRead).length;

    res.json({
      success: true,
      count: reminders.length,
      unreadCount,
      data: reminders,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/reminders/:id/read
// @desc    Mark reminder as read
// @access  Private
router.put('/:id/read', protect, async (req, res) => {
  try {
    const reminder = await Reminder.findById(req.params.id);
    if (!reminder) {
      return res.status(404).json({ success: false, message: 'Reminder not found' });
    }

    reminder.isRead = true;
    await reminder.save();

    res.json({
      success: true,
      message: 'Reminder marked as read.',
      data: reminder,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/reminders/refresh
// @desc    Scan records and generate fresh reminders for due and overdue vaccines
// @access  Private
router.post('/refresh', protect, async (req, res) => {
  try {
    let childFilter = {};
    if (req.user.role === 'parent') {
      childFilter.parent = req.user._id;
    }

    const children = await Child.find(childFilter);
    const today = new Date();
    let newRemindersCount = 0;

    for (const child of children) {
      const records = await VaccinationRecord.find({
        child: child._id,
        status: { $ne: 'Completed' },
      }).populate('vaccine');

      for (const rec of records) {
        const dueDate = new Date(rec.dueDate);
        const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        let currentStatus = rec.status;
        let shouldRemind = false;
        let reminderType = 'Upcoming';

        if (diffDays < 0) {
          currentStatus = 'Overdue';
          shouldRemind = true;
          reminderType = 'Overdue';
        } else if (diffDays <= 7) {
          currentStatus = 'Due';
          shouldRemind = true;
          reminderType = diffDays === 0 ? 'Due Today' : 'Upcoming';
        }

        if (rec.status !== currentStatus) {
          rec.status = currentStatus;
          await rec.save();
        }

        if (shouldRemind) {
          // Check if an unread reminder for this record already exists
          const existingReminder = await Reminder.findOne({
            record: rec._id,
            reminderType,
            isRead: false,
          });

          if (!existingReminder) {
            await Reminder.create({
              child: child._id,
              parent: child.parent,
              vaccine: rec.vaccine._id,
              record: rec._id,
              dueDate: rec.dueDate,
              reminderType,
              title: `${reminderType === 'Overdue' ? '⚠️ OVERDUE' : '🔔 REMINDER'}: ${rec.vaccine.name} for ${child.name}`,
              message: `Vaccine dose ${rec.vaccine.name} (${rec.vaccine.ageLabel}) is ${reminderType.toLowerCase()} for ${child.name}. Due on ${new Date(rec.dueDate).toLocaleDateString()}. Make sure to visit the clinic on time.`,
              isRead: false,
            });
            newRemindersCount++;
          }
        }
      }
    }

    res.json({
      success: true,
      message: `Refreshed vaccination statuses. ${newRemindersCount} new reminder alerts generated.`,
      newRemindersCount,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/reminders/:id
// @desc    Dismiss reminder
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const reminder = await Reminder.findById(req.params.id);
    if (!reminder) {
      return res.status(404).json({ success: false, message: 'Reminder not found' });
    }

    await Reminder.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Reminder dismissed.',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
