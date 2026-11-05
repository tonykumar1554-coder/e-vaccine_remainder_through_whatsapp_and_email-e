const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const Child = require('../models/Child');
const { protect } = require('../middleware/auth');

// @route   GET /api/appointments
// @desc    Get appointments based on role
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    let filter = {};

    if (req.user.role === 'parent') {
      filter.parent = req.user._id;
    } else if (req.user.role === 'doctor') {
      // Doctor sees appointments assigned to them, or open scheduled appointments
      filter = {
        $or: [{ doctor: req.user._id }, { doctor: { $exists: false } }, { doctor: null }],
      };
    }

    const appointments = await Appointment.find(filter)
      .populate('child', 'name dateOfBirth gender bloodGroup')
      .populate('parent', 'name email phone')
      .populate('doctor', 'name hospitalOrClinic specialization')
      .populate('vaccine', 'name ageLabel diseasePrevented')
      .sort({ appointmentDate: 1 });

    res.json({
      success: true,
      count: appointments.length,
      data: appointments,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/appointments/:id
// @desc    Get single appointment details
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('child')
      .populate('parent', 'name email phone')
      .populate('doctor', 'name hospitalOrClinic specialization')
      .populate('vaccine');

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    if (
      req.user.role === 'parent' &&
      appointment.parent._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.json({ success: true, data: appointment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/appointments
// @desc    Book a new vaccination appointment
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { childId, vaccineId, doctorId, appointmentDate, timeSlot, hospitalOrClinic, notes } =
      req.body;

    if (!childId || !appointmentDate || !timeSlot) {
      return res.status(400).json({
        success: false,
        message: 'Child, appointment date, and time slot are required.',
      });
    }

    const child = await Child.findById(childId);
    if (!child) {
      return res.status(404).json({ success: false, message: 'Child not found' });
    }

    const appointment = await Appointment.create({
      child: childId,
      parent: req.user.role === 'parent' ? req.user._id : child.parent,
      doctor: doctorId || null,
      vaccine: vaccineId || null,
      appointmentDate: new Date(appointmentDate),
      timeSlot,
      hospitalOrClinic: hospitalOrClinic || 'City Immunization Center',
      notes: notes || '',
      status: 'Scheduled',
    });

    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('child', 'name')
      .populate('vaccine', 'name')
      .populate('doctor', 'name hospitalOrClinic');

    res.status(201).json({
      success: true,
      message: 'Vaccination appointment booked successfully!',
      data: populatedAppointment,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/appointments/:id/status
// @desc    Update appointment status (e.g. Confirm, Complete, Cancel)
// @access  Private
router.put('/:id/status', protect, async (req, res) => {
  try {
    const { status, notes } = req.body;
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    const validStatuses = ['Scheduled', 'Confirmed', 'Completed', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    appointment.status = status;
    if (notes) appointment.notes = notes;

    // If doctor confirms it, assign current doctor if not set
    if (status === 'Confirmed' && req.user.role === 'doctor' && !appointment.doctor) {
      appointment.doctor = req.user._id;
    }

    await appointment.save();

    res.json({
      success: true,
      message: `Appointment status updated to '${status}'.`,
      data: appointment,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/appointments/:id
// @desc    Update appointment details
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    const updated = await Appointment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Appointment updated successfully!',
      data: updated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/appointments/:id
// @desc    Cancel and delete appointment
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    await Appointment.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Appointment cancelled and removed successfully.',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
