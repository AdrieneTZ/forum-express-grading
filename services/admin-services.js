const { User, Restaurant, Category } = require('../models')
const { imgurFileHandler } = require('../helpers/file-helpers')

const adminServices = {
  getRestaurants: async (req, callbackFn) => {
    try {
      // restaurants >> [{}, {}, {}]
      const restaurants = await Restaurant.findAll({
        raw: true,
        nest: true,
        include: [Category],
      })
      return callbackFn(null, { restaurants })
    } catch (error) {
      callbackFn(error)
    }
  },
  deleteRestaurant: async (req, callbackFn) => {
    try {
      // 1. find by primary key: id
      // not necessary to change data into plain object, don't add { raw: true }
      const theRestaurantId = req.params.id
      const restaurant = await Restaurant.findByPk(theRestaurantId)

      if (!restaurant) throw new Error(`This restaurant doesn't exist!`)

      // 2. if this restaurant exists, destroy it
      const afterDeletedRestaurants = await restaurant.destroy()

      return callbackFn(null, { restaurant: afterDeletedRestaurants })
    } catch (error) {
      callbackFn(error)
    }
  },
}
module.exports = adminServices
