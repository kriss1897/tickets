const mongoose = require('mongoose')

const ScreenSchema = mongoose.Schema({
  name: String,
  rows: Object
})

module.exports = mongoose.model('screen', ScreenSchema)
