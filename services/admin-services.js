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
  postRestaurant: async (req, callbackFn) => {
    try {
      const { name, tel, address, openingHours, description, categoryId } = req.body

      // make sure restaurant name is not null
      if (!name) throw new Error('Restaurant name is required field!')

      // take out image file
      const { file } = req

      // pass image file to middleware: file-helpers
      // create this restaurant
      const filePath = await imgurFileHandler(file)
      const newRestaurant = await Restaurant.create({
        name,
        tel,
        address,
        openingHours,
        description,
        image: filePath || null,
        categoryId,
      })

      // after creating a new data, backend has to return data to frontend
      return callbackFn(null, { restaurant: newRestaurant })
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
