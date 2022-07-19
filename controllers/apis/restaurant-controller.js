const { Restaurant, Category } = require('../../models')
const { getOffset, getPagination } = require('../../helpers/pagination-helper')

const restaurantController = {
  getRestaurants: async (req, res, next) => {
    try {
      // Pagination
      const DEFAULT_LIMIT = 9

      const categoryId = Number(req.query.categoryId) || ''
      const page = Number(req.query.page) || 1
      const limit = Number(req.query.limit) || DEFAULT_LIMIT
      const offset = getOffset(limit, page)

      // Find restaurants & categories data
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

      // Operate restaurants data
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

      const data = restaurants.rows.map((restaurant) => ({
        ...restaurant,
        description: restaurant.description.substring(0, 50),
        isFavorited: favoritedRestaurantsIds.includes(restaurant.id),
        isLiked: likedRestaurantsIds.includes(restaurant.id),
      }))

      return res.json({
        restaurants: data,
        categories,
        categoryId,
        pagination: getPagination(limit, page, restaurants.count),
      })
    } catch (error) {
      next(error)
    }
  },
}

module.exports = restaurantController
