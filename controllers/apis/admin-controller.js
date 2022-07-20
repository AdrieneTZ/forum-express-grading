const adminServices = require('../../services/admin-services')

const adminController = {
  getRestaurants: (req, res, next) => {
    const getRestaurantsApiData = (error, apiData) => (error ? next(error) : res.json({ status: 'success', apiData }))
    adminServices.getRestaurants(req, getRestaurantsApiData)
  },
  deleteRestaurant: (req, res, next) => {
    const deletedRestaurantsApiData = (error, apiData) =>
      error ? next(error) : res.json({ status: 'success', apiData })
    adminServices.deleteRestaurant(req, deletedRestaurantsApiData)
  },
}

module.exports = adminController
