const express = require('express')
const router = express.Router()
const protect= require('../middleware/authmiddleware')
const  {createHabit,deleteHabit, getHabits,completeHabit,getAnalytics} = require('../controllers/habitcontroller.js')
router.route('/analytics').get(protect, getAnalytics);
router.route('/').post(protect,createHabit)
router.route('/').get(protect, getHabits)
router.route('/:id').delete(protect, deleteHabit);
router.route('/:id/complete').patch(protect,completeHabit);

module.exports = router