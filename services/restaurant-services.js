const { Restaurant, Category } = require('../models')
const { getOffset, getPagination } = require('../helpers/pagination-helper')

const restaurantServices = {
  getRestaurants: async (req, cb) => {
    try {
      ////// Pagination
      // 9 data pre page
      const DEFAULT_LIMIT = 9

      // get values from req query and trun them into number
      const categoryId = Number(req.query.categoryId) || ''
      const page = Number(req.query.page) || 1
      // req.query.limit: incase to make selector to let user select how many data showed per page
      const limit = Number(req.query.limit) || DEFAULT_LIMIT
      const offset = getOffset(limit, page)

      /////// Find restaurants & categories data
      /*
      where: { searching condition }
      if categoryId exists >> where: { categoryId: categoryId }
        findA all data with this categoryId
      if categoryId doesn't exist >> where: {}
        find all data

        also can write:
        const where = {}
        if (categoryId) where.categoryId = categoryId
        ... where: where ...
      */
      const [restaurants, categories] = await Promise.all([
        Restaurant.findAndCountAll({
          include: Category,
          where: { ...(categoryId ? { categoryId } : {}) },
          limit,
          offset,
          raw: true,
          nest: true,
        }),
        Category.findAll({ raw: true }),
      ])

      /////// Operate restaurants data
      // favoritedRestaurantsId [{}, {}, ...]
      // req.user might be null
      const theSignInUser = req.user
      // const favoritedRestaurantsIds =
      //   theSignInUser &&
      //   theSignInUser.FavoritedRestaurants.map((favoritedRestaurant) => {
      //     return favoritedRestaurant.id
      //   })
      const favoritedRestaurantsIds = theSignInUser?.FavoritedRestaurants
        ? theSignInUser.FavoritedRestaurants.map((favoritedRestaurant) => {
            return favoritedRestaurant.id
          })
        : []

      const likedRestaurantsIds = theSignInUser?.LikedRestaurants
        ? theSignInUser.LikedRestaurants.map((likedRestaurant) => {
            return likedRestaurant.id
          })
        : []

      // restaurants { count: 50, row: [{ item }, { item }, ...] }
      const data = restaurants.rows.map((restaurant) => ({
        ...restaurant,
        description: restaurant.description.substring(0, 50),
        isFavorited: favoritedRestaurantsIds.includes(restaurant.id), // isFavorited: Boolean
        isLiked: likedRestaurantsIds.includes(restaurant.id),
      }))

      return cb(null, {
        restaurants: data,
        categories,
        categoryId,
        pagination: getPagination(limit, page, restaurants.count),
      })
    } catch (error) {
      cb(error)
    }
  },
}

module.exports = restaurantServices
