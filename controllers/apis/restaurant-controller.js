const restaurantServices = require('../../services/restaurant-services')

const restaurantController = {
  getRestaurants: (req, res, next) => {
    // callback: (error, data) => (error ? next(error) : res.json(data))
    restaurantServices.getRestaurants(req, (error, data) => (error ? next(error) : res.json(data)))
  },
}

module.exports = restaurantController
