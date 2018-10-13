const Screen = require('../models')

module.exports = {
  // Parse seatinfo and return an object having all the
  // available seats
  parseSeatInfo: function (seatInfo) {
    let rows = {}
    Object.keys(seatInfo).map((row) => {
      let seats = []
      const { numberOfSeats, aisleSeats } = seatInfo[row]
      for (let i = 1; i <= numberOfSeats; i++) {
        if (aisleSeats.indexOf(i) === -1) {
          seats.push(i)
        }
      }
      rows[row] = { available: seats, reserved: [] }
    })
    return rows
  },
  // Get Available Seats
  getAvailableSeats: async function (name) {
    let screen = await Screen.findOne({ name }).exec()
    if (!screen) {
      throw new Error('Could not find screen with name ' + name)
    }
    const availableSeats = {}
    Object.keys(screen.rows).map(row => {
      availableSeats[row] = screen.rows[row].available
    })
    return availableSeats
  },
  // Find optimal seat combinations for given details
  getOptimalSeats: function (available, numSeats, seat) {
    let index = available.indexOf(seat)

    // leftmost seat which will have preferred set in range
    let left = Math.max(index - numSeats + 1, 0)

    // Array to store all the available options
    let options = []

    while (available[left] <= seat) {
      let option = available.slice(left, left + numSeats)
      // Check if the seats in option are contigious
      // by comparing the difference between first and last element
      if (option[option.length - 1] === option[0] + numSeats - 1) {
        options.push(option)
      }
      left++
    }
    if (options.length === 0) throw new Error('Seats Not sAvailable')

    return options
  }
}
