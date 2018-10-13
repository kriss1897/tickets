const router = require('express').Router()
const { AuthController } = require('../controllers')

/* GET home page. */
router.post('/register', function (req, res, next) {
  const token = AuthController.register()
  res.json({
    token
  })
})

/**
 * @method post
 * @description user login
 */
router.get('/login', function () {
  // login logic
})

module.exports = router
