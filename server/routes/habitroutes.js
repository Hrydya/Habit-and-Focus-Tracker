const express = require('express')
const router = express.Router()
const protect= require('../middleware/authmiddleware')
const  {createHabit,deleteHabit, getHabits} = require('../controllers/habitcontroller.js')
router.route('/').post(protect,createHabit)
router.route('/').get(protect, getHabits)
router.route('/:id').delete(protect, deleteHabit)
module.exports = router