const jwt = require('jsonwebtoken')

function auth (req, res, next) {
  try {
    if (!req.headers.authorization) throw new Error('Auth token required')
    const token = req.headers.authorization.split(' ')[1]
    const data = jwt.verify(token, process.env.APP_SECRET)
    req.user = data.user
    next()
  } catch (err) {
    res.json({
      error: err.message
    })
  }
}

module.exports = { auth }
