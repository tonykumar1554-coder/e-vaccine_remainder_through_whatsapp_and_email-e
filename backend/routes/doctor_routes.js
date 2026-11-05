// Doctor routes alias - routes managed through user_routes, record_routes, and child_routes
const express = require('express');
const router = express.Router();
const User = require('../models/User');

router.get('/', async (req, res) => {
  try {
    const doctors = await User.find({ role: 'doctor' }).select('name email phone hospitalOrClinic specialization');
    res.json({ success: true, count: doctors.length, data: doctors });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
