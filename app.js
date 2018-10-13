require('dotenv').config() // for .env support
const express = require('express')
const { createServer } = require('http')
const path = require('path')
const cookieParser = require('cookie-parser')
const logger = require('morgan')
const routes = require('./routes')
const helmet = require('helmet')

// Turn on the engine
const app = express()
app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

// Put the helmet on
app.use(helmet())

// Bring in the database
const mongoose = require('mongoose')
mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true })

// Route guide ready!!
app.use('/', routes.index)
app.use('/screens', routes.screens)
app.use('/auth', routes.auth)

// Action!!
const server = createServer(app)
server.listen(process.env.PORT || '9080', function () {
  console.log('game on')
})
