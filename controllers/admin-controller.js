const { User, Restaurant, Category } = require('../models')
const { imgurFileHandler } = require('../helpers/file-helpers')

const adminController = {
  getUsers: async (req, res, next) => {
    try {
      const users = await User.findAll({ raw: true })
      return res.render('admin/users', { users })
    } catch (error) {
      next(error)
    }
  },
  patchUser: async (req, res, next) => {
    try {
      const userId = req.params.id
      const user = await User.findByPk(userId)

      if (!user) throw new Error('This user does not exist!')

      if (user.email === 'root@example.com') {
        req.flash('error_messages', '禁止變更 root 權限')
        return res.redirect('back')
      }

      user.isAdmin ? await user.update({ isAdmin: false }) : await user.update({ isAdmin: true })
      req.flash('success_messages', '使用者權限變更成功')
      return res.redirect('/admin/users')
    } catch (error) {
      next(error)
    }
  },
  getRestaurants: (req, res, next) => {
    Restaurant.findAll({
      raw: true,
      nest: true,
      include: [Category],
    })
      .then((restaurants) => {
        // restaurants >> [{}, {}, {}]
        // restaurant >> { ..., ..., Category: { id: 1, ... } }
        return res.render('admin/restaurants', { restaurants })
      })
      .catch((error) => next(error))
  },
  createRestaurant: async (req, res) => {
    try {
      const categories = await Category.findAll({ raw: true })
      return res.render('admin/create-restaurant', { categories })
    } catch (error) {
      next(error)
    }
  },
  postRestaurant: async (req, res, next) => {
    try {
      const { name, tel, address, openingHours, description, categoryId } = req.body

      // make sure restaurant name is not null
      if (!name) throw new Error('Restaurant name is required field!')

      // take out image file
      const { file } = req

      // pass image file to middleware: file-helpers
      // create this restaurant
      const filePath = await imgurFileHandler(file)
      await Restaurant.create({
        name,
        tel,
        address,
        openingHours,
        description,
        image: filePath || null,
        categoryId,
      })

      req.flash('success_messages', 'You have created restaurant successfully!')
      return res.redirect('/admin/restaurants')
    } catch (error) {
      next(error)
    }
  },
  getRestaurant: (req, res, next) => {
    Restaurant.findByPk(req.params.id, {
      raw: true,
      nest: true,
      include: [Category],
    })
      .then((restaurant) => {
        if (!restaurant) throw new Error(`This restaurant doesn't exist!`)

        // only one data set, { raw: true, nest: true } = restaurant.toJSON()
        res.render('admin/restaurant', { restaurant })
      })
      .catch((error) => next(error))
  },
  editRestaurant: async (req, res, next) => {
    // do find one restaurant and do find all categories at the same time
    // more efficient
    try {
      const [restaurant, categories] = await Promise.all([
        Restaurant.findByPk(req.params.id, { raw: true }),
        Category.findAll({ raw: true }),
      ])
      if (!restaurant) throw new Error('This restaurant has not been created!')
      return res.render('admin/edit-restaurant', { restaurant, categories })
    } catch (error) {
      next(error)
    }
  },
  putRestaurant: async (req, res, next) => {
    try {
      // 1. take out data from req.body
      const { name, tel, address, openingHours, description, categoryId } = req.body

      // 2. make sure restaurant name is not null
      if (!name) throw new Error('Restaurant name is required field!')

      // 3. deal with two Promise at the same time
      // 3-1. find by primary key: id
      // `restaurant` is insatnce of Restaurant
      // not necessary to change data into plain object, don't add { raw: true }
      // 3-2. take out image file from req, and pass to middleware: localFileHandler
      // get filePath
      // 4. update data getting from req.body and localFileHandler
      const { file } = req
      const [restaurant, filePath] = await Promise.all([Restaurant.findByPk(req.params.id), imgurFileHandler(file)])
      if (!restaurant) throw new Error(`This restaurant doesn't exist!`)

      await restaurant.update({
        name,
        tel,
        address,
        openingHours,
        description,
        image: filePath || restaurant.image,
        categoryId,
      })
      req.flash('success_messages', 'Restaurant was updated successfully!')
      return res.redirect('/admin/restaurants')
    } catch (error) {
      next(error)
    }
  },
  deleteRestaurant: (req, res, next) => {
    // 1. find by primary key: id
    // not necessary to change data into plain object, don't add { raw: true }
    return Restaurant.findByPk(req.params.id)
      .then((restaurant) => {
        if (!restaurant) throw new Error(`This restaurant doesn't exist!`)
        // 2. if this restaurant exists, destroy it
        return restaurant.destroy()
      })
      .then(() => res.redirect('/admin/restaurants'))
      .catch((error) => next(error))
  },
}

module.exports = adminController
