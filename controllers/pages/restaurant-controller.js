const { Restaurant, Category, Comment, User } = require('../../models')
const restaurantServices = require('../../services/restaurant-services')

const restaurantController = {
  getRestaurants: (req, res, next) => {
    restaurantServices.getRestaurants(req, (error, data) => (error ? next(error) : res.render('restaurants', data)))
  },
  getRestaurant: async (req, res, next) => {
    try {
      const restaurant = await Restaurant.findByPk(req.params.id, {
        include: [
          Category,
          { model: Comment, include: User },
          { model: User, as: 'FavoritedUsers' },
          { model: User, as: 'LikedUsers' },
        ],
      })
      if (!restaurant) throw new Error('This restaurant does not exist!')

      const isFavorited = restaurant.FavoritedUsers.some((favUser) => favUser.id === req.user.id)
      const isLiked = restaurant.LikedUsers.some((likedUser) => likedUser.id === req.user.id)
      await restaurant.increment('view_counts', { by: 1 })

      return res.render('restaurant', { restaurant: restaurant.toJSON(), isFavorited, isLiked })
    } catch (error) {
      next(error)
    }
  },
  getDashboard: async (req, res, next) => {
    try {
      const restaurant = await Restaurant.findByPk(req.params.id, { include: Category, raw: true, nest: true })
      if (!restaurant) throw new Error('This restaurant does not exist!')

      return res.render('dashboard', { restaurant })
    } catch (error) {
      next(error)
    }
  },
  getFeeds: async (req, res, next) => {
    try {
      // step 1. get data through Restaurant model and Comment model at the same time
      const [restaurants, comments] = await Promise.all([
        Restaurant.findAll({
          limit: 10,
          order: [['createdAt', 'DESC']],
          include: [Category],
          raw: true,
          nest: true,
        }),
        Comment.findAll({
          limit: 10,
          order: [['createdAt', 'DESC']],
          include: [User, Restaurant],
          raw: true,
          nest: true,
        }),
      ])

      // step 2. pass data to template
      return res.render('feeds', { restaurants, comments })
    } catch (error) {
      next(error)
    }
  },
  getTopRestaurants: async (req, res, next) => {
    try {
      const theSignInUser = req.user
      const favoritedRestaurantsIds =
        (theSignInUser &&
          theSignInUser.FavoritedRestaurants.map((favoritedRestaurant) => {
            return favoritedRestaurant.id
          })) ||
        []

      let restaurants = await Restaurant.findAll({
        include: [{ model: User, as: 'FavoritedUsers' }],
      })
      restaurants = restaurants
        .map((restaurant) => ({
          ...restaurant.toJSON(),
          favoritedCount: restaurant.FavoritedUsers.length,
          isFavorited: favoritedRestaurantsIds.some((frid) => frid === restaurant.id),
        }))
        .sort((a, b) => b.favoritedCount - a.favoritedCount)
        .slice(0, 10)

      return res.render('top-restaurants', { restaurants })
    } catch (error) {
      next(error)
    }
  },
}

module.exports = restaurantController
