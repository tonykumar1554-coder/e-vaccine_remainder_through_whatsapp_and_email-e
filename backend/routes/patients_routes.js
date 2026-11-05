// Patients / Children routes alias
const express = require('express');
const router = express.Router();
const Child = require('../models/Child');
const { protect } = require('../middleware/auth');

router.get('/', protect, async (req, res) => {
  try {
    const filter = req.user.role === 'parent' ? { parent: req.user._id } : {};
    const patients = await Child.find(filter).populate('parent', 'name email phone');
    res.json({ success: true, count: patients.length, data: patients });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
