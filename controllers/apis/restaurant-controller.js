const restaurantServices = require('../../services/restaurant-services')

const restaurantController = {
  getRestaurants: (req, res, next) => {
    const getRestaurantsApiData = (error, data) => (error ? next(error) : res.json(data))
    restaurantServices.getRestaurants(req, getRestaurantsApiData)
  },
}

module.exports = restaurantController
