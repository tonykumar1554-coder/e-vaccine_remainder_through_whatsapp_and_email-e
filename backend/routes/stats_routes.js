const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Child = require('../models/Child');
const Vaccine = require('../models/Vaccine');
const VaccinationRecord = require('../models/VaccinationRecord');
const Appointment = require('../models/Appointment');
const Reminder = require('../models/Reminder');
const { protect } = require('../middleware/auth');

// @route   GET /api/stats/dashboard
// @desc    Get dashboard metrics customized per user role
// @access  Private
router.get('/dashboard', protect, async (req, res) => {
  try {
    const role = req.user.role;
    let data = {};

    if (role === 'admin') {
      const [
        totalUsers,
        totalParents,
        totalDoctors,
        totalChildren,
        totalVaccines,
        totalRecords,
        completedRecords,
        pendingRecords,
        dueRecords,
        overdueRecords,
        totalAppointments,
      ] = await Promise.all([
        User.countDocuments(),
        User.countDocuments({ role: 'parent' }),
        User.countDocuments({ role: 'doctor' }),
        Child.countDocuments(),
        Vaccine.countDocuments(),
        VaccinationRecord.countDocuments(),
        VaccinationRecord.countDocuments({ status: 'Completed' }),
        VaccinationRecord.countDocuments({ status: 'Pending' }),
        VaccinationRecord.countDocuments({ status: 'Due' }),
        VaccinationRecord.countDocuments({ status: 'Overdue' }),
        Appointment.countDocuments(),
      ]);

      const recentAppointments = await Appointment.find()
        .populate('child', 'name')
        .populate('vaccine', 'name')
        .populate('parent', 'name')
        .sort({ appointmentDate: 1 })
        .limit(5);

      const recentChildren = await Child.find()
        .populate('parent', 'name')
        .sort({ createdAt: -1 })
        .limit(5);

      data = {
        role,
        metrics: {
          totalUsers,
          totalParents,
          totalDoctors,
          totalChildren,
          totalVaccines,
          totalRecords,
          completedRecords,
          pendingRecords,
          dueRecords,
          overdueRecords,
          totalAppointments,
          completionRate: totalRecords > 0 ? Math.round((completedRecords / totalRecords) * 100) : 0,
        },
        recentAppointments,
        recentChildren,
      };
    } else if (role === 'doctor') {
      const [
        totalChildren,
        myAdministered,
        totalScheduledAppointments,
        pendingAppointments,
      ] = await Promise.all([
        Child.countDocuments(),
        VaccinationRecord.countDocuments({ administeredBy: req.user._id, status: 'Completed' }),
        Appointment.countDocuments({
          $or: [{ doctor: req.user._id }, { doctor: null }],
        }),
        Appointment.countDocuments({
          status: 'Scheduled',
          $or: [{ doctor: req.user._id }, { doctor: null }],
        }),
      ]);

      const upcomingAppointments = await Appointment.find({
        status: { $in: ['Scheduled', 'Confirmed'] },
        $or: [{ doctor: req.user._id }, { doctor: null }],
      })
        .populate('child', 'name dateOfBirth gender')
        .populate('parent', 'name phone email')
        .populate('vaccine', 'name ageLabel')
        .sort({ appointmentDate: 1 })
        .limit(6);

      data = {
        role,
        metrics: {
          totalPatients: totalChildren,
          myAdministered,
          totalScheduledAppointments,
          pendingAppointments,
        },
        upcomingAppointments,
      };
    } else {
      // Parent
      const children = await Child.find({ parent: req.user._id });
      const childIds = children.map((c) => c._id);

      const [
        totalChildren,
        totalRecords,
        completedRecords,
        dueRecords,
        overdueRecords,
        upcomingAppointments,
        unreadReminders,
      ] = await Promise.all([
        Child.countDocuments({ parent: req.user._id }),
        VaccinationRecord.countDocuments({ child: { $in: childIds } }),
        VaccinationRecord.countDocuments({ child: { $in: childIds }, status: 'Completed' }),
        VaccinationRecord.countDocuments({ child: { $in: childIds }, status: 'Due' }),
        VaccinationRecord.countDocuments({ child: { $in: childIds }, status: 'Overdue' }),
        Appointment.find({ parent: req.user._id })
          .populate('child', 'name')
          .populate('vaccine', 'name')
          .sort({ appointmentDate: 1 })
          .limit(4),
        Reminder.countDocuments({ parent: req.user._id, isRead: false }),
      ]);

      const nextDueRecords = await VaccinationRecord.find({
        child: { $in: childIds },
        status: { $in: ['Due', 'Overdue', 'Pending'] },
      })
        .populate('vaccine')
        .populate('child', 'name')
        .sort({ dueDate: 1 })
        .limit(5);

      data = {
        role,
        metrics: {
          totalChildren,
          totalRecords,
          completedRecords,
          dueRecords,
          overdueRecords,
          pendingRecords: totalRecords - (completedRecords + dueRecords + overdueRecords),
          unreadReminders,
          completionRate: totalRecords > 0 ? Math.round((completedRecords / totalRecords) * 100) : 0,
        },
        children,
        upcomingAppointments,
        nextDueRecords,
      };
    }

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
