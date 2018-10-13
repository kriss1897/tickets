const router = require('express').Router()
const auth = require('./auth')
const screens = require('./screens')

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' })
})

module.exports = {
  index: router,
  auth,
  screens
}
