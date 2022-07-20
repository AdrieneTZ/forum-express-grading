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
}

module.exports = adminServices
