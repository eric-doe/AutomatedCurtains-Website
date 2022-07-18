const mongoose = require('mongoose')

const TemperatureData = new mongoose.Schema({
    temperature: {
        type: Number,
        required: true
    },
    time: {
        type: Object,
        required: true
    },
    curtainsClosed: {
        type: Boolean,
        required: true
    },
    doorClosed: {
        type: Boolean,
        default: Date.now
    }
})

const TempData = mongoose.model('Temperature', TemperatureData) 
module.exports = TempData
