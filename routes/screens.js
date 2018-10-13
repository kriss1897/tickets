const router = require('express').Router()
const { auth } = require('../middleware')
const Screen = require('../models')
const { ScreenController } = require('../controllers')

/**
 * @method post
 * @description accept details of a movie screen.
 */
router.post('/', auth, async function (req, res, next) {
  try {
    // extract data from requser
    const { name, seatInfo } = req.body

    // Check if the screen alredy exists
    const scr = await Screen.findOne({ name: name }).exec()
    if (scr) throw new Error('Screen already exists')

    // Parse seatInfo to rows and create screen instance
    const rows = ScreenController.parseSeatInfo(seatInfo)
    let screen = new Screen({ name, rows })

    // Update screen instance in database
    let dbScreen = await screen.save()

    if (!dbScreen) throw new Error('Could not add screen at this time. Please try again later')

    res.status(200).json({
      message: 'screen added'
    })
  } catch (err) {
    res.status(500).json({
      error: err.message
    })
  }
})

/**
 * @method post
 * @param screenName
 * @description Reserve seats for a given screen
 */
router.post('/:screenName/reserve', auth, async function (req, res, next) {
  try {
    const name = req.params.screenName
    const { seats } = req.body
    let availableSeats = await ScreenController.getAvailableSeats(name)

    // Check if all the seats are available or not
    Object.keys(seats).map(row => {
      // check if the row exists and get available seats in a row
      if (!availableSeats[row]) throw new Error('Looks like the row you want to book does not exist')
      let available = availableSeats[row]
      let required = seats[row]
      let reserved = []

      // loop through requested seats to check if it's
      // available or not
      required.map(seat => {
        // If any seat is not available, throw an error
        if (available.indexOf(seat) === -1) throw new Error(`Seat ${row}${seat} is not available`)
      })

      // Remove the reserved seats from the available seats array
      availableSeats[row] = available.filter(_seat => reserved.indexOf(_seat) === -1)
    })
    let screen = await Screen.findOne({ name: name }).exec()
    Object.keys(seats).map(row => {
      screen.rows[row].available = availableSeats[row].available
    })
    await Screen.updateOne({ name: name }, screen).exec()
    res.json(screen)
  } catch (err) {
    res.json({
      error: err.message
    })
  }
})

/**
 * @method get
 * @description get the available seats for a given screen
 */
router.get('/:screenName/seats', auth, async function (req, res, next) {
  try {
    // Extract details from params and query
    const name = req.params.screenName
    let { numSeats, choice, status } = req.query

    // Fetch and select the available seats for a row
    const availableSeats = await ScreenController.getAvailableSeats(name)

    // if the request only asks for unreserved seats, return the list
    if (status && status === 'unreserved') return res.json({ seats: availableSeats })

    // Check if input is valid on not
    if (!numSeats || !choice || Number.parseInt(numSeats) <= 0) throw new Error('Number of seats and choice of seat required')

    // Parse the input to get rwo and seat details
    numSeats = Number.parseInt(numSeats)
    let row = choice.match(/^[A-Z]+/)[0]
    let seat = Number.parseInt(choice.match(/[0-9]+/)[0])

    // Available seats for the row
    let available = availableSeats[row]

    // Check if numeber of seats are available or not
    if (available.length < numSeats || available.indexOf(seat) === -1) {
      throw new Error('Seats not available')
    }

    // Get optimal seat options
    let result = ScreenController.getOptimalSeats(available, numSeats, seat)
    const seats = {}
    seats[row] = result
    res.json({
      availableSeats: seats
    })
  } catch (err) {
    res.status(503).json({
      error: err.message
    })
  }
})

module.exports = router
