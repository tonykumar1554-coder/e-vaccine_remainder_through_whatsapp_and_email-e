const express = require('express');
const router = express.Router();
const Child = require('../models/Child');
const Vaccine = require('../models/Vaccine');
const VaccinationRecord = require('../models/VaccinationRecord');
const Appointment = require('../models/Appointment');
const Reminder = require('../models/Reminder');
const { protect } = require('../middleware/auth');

// @route   GET /api/children
// @desc    Get all children (Parent gets their own; Admin/Doctor gets all)
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    let filter = {};

    // Parents can only view their own registered children
    if (req.user.role === 'parent') {
      filter.parent = req.user._id;
    }

    const children = await Child.find(filter)
      .populate('parent', 'name email phone hospitalOrClinic')
      .sort({ createdAt: -1 });

    // Attach basic record stats to each child for quick dashboard display
    const enrichedChildren = await Promise.all(
      children.map(async (child) => {
        const totalRecords = await VaccinationRecord.countDocuments({ child: child._id });
        const completedRecords = await VaccinationRecord.countDocuments({
          child: child._id,
          status: 'Completed',
        });
        const overdueRecords = await VaccinationRecord.countDocuments({
          child: child._id,
          status: 'Overdue',
        });
        const dueRecords = await VaccinationRecord.countDocuments({
          child: child._id,
          status: 'Due',
        });

        return {
          ...child.toObject(),
          stats: {
            total: totalRecords,
            completed: completedRecords,
            due: dueRecords,
            overdue: overdueRecords,
            pending: totalRecords - (completedRecords + dueRecords + overdueRecords),
          },
        };
      })
    );

    res.json({
      success: true,
      count: enrichedChildren.length,
      data: enrichedChildren,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/children/:id
// @desc    Get single child details with complete vaccination statistics
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const child = await Child.findById(req.params.id).populate(
      'parent',
      'name email phone'
    );

    if (!child) {
      return res.status(404).json({ success: false, message: 'Child not found' });
    }

    // Role-based authorization check: Parent can only view their own child
    if (
      req.user.role === 'parent' &&
      child.parent._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this child profile',
      });
    }

    const records = await VaccinationRecord.find({ child: child._id })
      .populate('vaccine')
      .sort({ dueDate: 1 });

    const total = records.length;
    const completed = records.filter((r) => r.status === 'Completed').length;
    const overdue = records.filter((r) => r.status === 'Overdue').length;
    const due = records.filter((r) => r.status === 'Due').length;
    const pending = total - (completed + overdue + due);

    res.json({
      success: true,
      data: {
        ...child.toObject(),
        stats: { total, completed, due, overdue, pending },
        records,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/children
// @desc    Add new child and auto-generate their vaccination schedule
// @access  Private (Parent, Admin, Doctor)
router.post('/', protect, async (req, res) => {
  try {
    const {
      name,
      dateOfBirth,
      gender,
      bloodGroup,
      birthWeight,
      allergies,
      emergencyContact,
      notes,
      parentId,
    } = req.body;

    if (!name || !dateOfBirth) {
      return res.status(400).json({
        success: false,
        message: 'Child name and date of birth are required.',
      });
    }

    // Determine parent: If doctor/admin creating for a parent, use parentId if provided
    let assignedParent = req.user._id;
    if (['admin', 'doctor'].includes(req.user.role) && parentId) {
      assignedParent = parentId;
    }

    const child = await Child.create({
      parent: assignedParent,
      name,
      dateOfBirth: new Date(dateOfBirth),
      gender: gender || 'male',
      bloodGroup: bloodGroup || 'Unknown',
      birthWeight: birthWeight ? Number(birthWeight) : 0,
      allergies: allergies || 'None reported',
      emergencyContact: emergencyContact || '',
      notes: notes || '',
    });

    // Auto-generate vaccination schedule based on registered vaccines
    const allVaccines = await Vaccine.find().sort({ targetAgeDays: 1 });
    const birthDate = new Date(dateOfBirth);
    const today = new Date();

    const recordDocs = [];
    const reminderDocs = [];

    for (const v of allVaccines) {
      // Calculate due date: DOB + targetAgeDays
      const dueDate = new Date(birthDate);
      dueDate.setDate(dueDate.getDate() + (v.targetAgeDays || 0));

      // Determine initial status based on due date vs current date
      let status = 'Pending';
      const diffTime = dueDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays < 0) {
        status = 'Overdue';
      } else if (diffDays <= 14) {
        status = 'Due';
      }

      recordDocs.push({
        child: child._id,
        vaccine: v._id,
        parent: assignedParent,
        dueDate,
        status,
      });
    }

    if (recordDocs.length > 0) {
      const createdRecords = await VaccinationRecord.insertMany(recordDocs);

      // Create reminders for Due or Overdue vaccines
      for (const rec of createdRecords) {
        if (rec.status === 'Due' || rec.status === 'Overdue') {
          const v = allVaccines.find((vac) => vac._id.toString() === rec.vaccine.toString());
          reminderDocs.push({
            child: child._id,
            parent: assignedParent,
            vaccine: rec.vaccine,
            record: rec._id,
            dueDate: rec.dueDate,
            reminderType: rec.status === 'Overdue' ? 'Overdue' : 'Upcoming',
            title: `${rec.status === 'Overdue' ? '⚠️ OVERDUE' : '🔔 UPCOMING'}: ${v ? v.name : 'Vaccination'} for ${child.name}`,
            message: `Vaccine ${v ? v.name : ''} is ${rec.status.toLowerCase()} for ${child.name}. Recommended age: ${v ? v.ageLabel : 'N/A'}. Due date: ${new Date(rec.dueDate).toLocaleDateString()}. Please schedule an immunization appointment.`,
          });
        }
      }

      if (reminderDocs.length > 0) {
        await Reminder.insertMany(reminderDocs);
      }
    }

    res.status(201).json({
      success: true,
      message: `Child '${child.name}' registered successfully with ${recordDocs.length} scheduled vaccination doses!`,
      data: child,
      scheduledDosesCount: recordDocs.length,
    });
  } catch (error) {
    console.error('Error adding child:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/children/:id
// @desc    Update child profile (CRUD Update)
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    const child = await Child.findById(req.params.id);
    if (!child) {
      return res.status(404).json({ success: false, message: 'Child not found' });
    }

    if (
      req.user.role === 'parent' &&
      child.parent.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to edit this child profile',
      });
    }

    const updatedChild = await Child.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Child details updated successfully!',
      data: updatedChild,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/children/:id
// @desc    Delete child profile and all associated records (CRUD Delete)
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const child = await Child.findById(req.params.id);
    if (!child) {
      return res.status(404).json({ success: false, message: 'Child not found' });
    }

    if (
      req.user.role === 'parent' &&
      child.parent.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this child profile',
      });
    }

    // Cascade delete child's records, appointments, and reminders
    await Promise.all([
      VaccinationRecord.deleteMany({ child: child._id }),
      Appointment.deleteMany({ child: child._id }),
      Reminder.deleteMany({ child: child._id }),
      Child.findByIdAndDelete(req.params.id),
    ]);

    res.json({
      success: true,
      message: `Child '${child.name}' and all associated vaccination records and reminders were removed.`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
