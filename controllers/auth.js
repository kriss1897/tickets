const jwt = require('jsonwebtoken')

module.exports = {
  register: function () {
    const token = jwt.sign({ user: 'bar' }, process.env.APP_SECRET)
    return token
  }
}
