const express = require('express');
const router = express.Router();
const VaccinationRecord = require('../models/VaccinationRecord');
const Child = require('../models/Child');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/records
// @desc    Get vaccination records (filtered by child, status, etc.)
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { childId, status } = req.query;
    let filter = {};

    if (req.user.role === 'parent') {
      filter.parent = req.user._id;
    }

    if (childId) filter.child = childId;
    if (status) filter.status = status;

    const records = await VaccinationRecord.find(filter)
      .populate('vaccine')
      .populate('child', 'name dateOfBirth gender bloodGroup')
      .populate('administeredBy', 'name hospitalOrClinic')
      .sort({ dueDate: 1 });

    res.json({
      success: true,
      count: records.length,
      data: records,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/records/child/:childId
// @desc    Get complete vaccination schedule and history for a specific child
// @access  Private
router.get('/child/:childId', protect, async (req, res) => {
  try {
    const child = await Child.findById(req.params.childId);
    if (!child) {
      return res.status(404).json({ success: false, message: 'Child not found' });
    }

    if (
      req.user.role === 'parent' &&
      child.parent.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view records for this child',
      });
    }

    const records = await VaccinationRecord.find({ child: req.params.childId })
      .populate('vaccine')
      .populate('administeredBy', 'name specialization hospitalOrClinic')
      .sort({ dueDate: 1 });

    res.json({
      success: true,
      child,
      count: records.length,
      data: records,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/records/:id
// @desc    Get single vaccination record by ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const record = await VaccinationRecord.findById(req.params.id)
      .populate('vaccine')
      .populate('child')
      .populate('administeredBy', 'name hospitalOrClinic');

    if (!record) {
      return res.status(404).json({ success: false, message: 'Record not found' });
    }

    if (
      req.user.role === 'parent' &&
      record.parent.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.json({ success: true, data: record });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/records
// @desc    Create a custom vaccination record
// @access  Private (Admin, Doctor)
router.post('/', protect, authorize('admin', 'doctor'), async (req, res) => {
  try {
    const { childId, vaccineId, dueDate, status, batchNumber, remarks, clinicOrHospital } = req.body;

    const child = await Child.findById(childId);
    if (!child) {
      return res.status(404).json({ success: false, message: 'Child not found' });
    }

    const record = await VaccinationRecord.create({
      child: childId,
      vaccine: vaccineId,
      parent: child.parent,
      dueDate: dueDate || new Date(),
      status: status || 'Pending',
      batchNumber: batchNumber || '',
      remarks: remarks || '',
      clinicOrHospital: clinicOrHospital || req.user.hospitalOrClinic || '',
      administeredBy: req.user._id,
      doctorName: req.user.name,
    });

    res.status(201).json({
      success: true,
      message: 'Record created successfully',
      data: record,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/records/:id
// @desc    Update record (mark administered / completed, update batch number, doctor, remarks)
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    const record = await VaccinationRecord.findById(req.params.id);
    if (!record) {
      return res.status(404).json({ success: false, message: 'Record not found' });
    }

    // Role check: parents can update basic notes or request updates, doctors/admins can record administration
    const {
      status,
      administeredDate,
      batchNumber,
      clinicOrHospital,
      doctorName,
      remarks,
      adverseEffectsReported,
    } = req.body;

    if (status !== undefined) record.status = status;
    if (administeredDate !== undefined) {
      record.administeredDate = administeredDate ? new Date(administeredDate) : null;
    }
    if (batchNumber !== undefined) record.batchNumber = batchNumber;
    if (clinicOrHospital !== undefined) record.clinicOrHospital = clinicOrHospital;
    if (doctorName !== undefined) record.doctorName = doctorName;
    if (remarks !== undefined) record.remarks = remarks;
    if (adverseEffectsReported !== undefined) record.adverseEffectsReported = adverseEffectsReported;

    // If marked Completed by a doctor, tag doctor's account
    if (status === 'Completed' && req.user.role === 'doctor') {
      record.administeredBy = req.user._id;
      if (!record.doctorName) record.doctorName = req.user.name;
      if (!record.administeredDate) record.administeredDate = new Date();
      if (!record.clinicOrHospital && req.user.hospitalOrClinic) {
        record.clinicOrHospital = req.user.hospitalOrClinic;
      }
    }

    await record.save();

    res.json({
      success: true,
      message: 'Vaccination record updated successfully!',
      data: record,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/records/:id
// @desc    Delete vaccination record
// @access  Private (Admin)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const record = await VaccinationRecord.findById(req.params.id);
    if (!record) {
      return res.status(404).json({ success: false, message: 'Record not found' });
    }

    await VaccinationRecord.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Vaccination record deleted successfully.',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
