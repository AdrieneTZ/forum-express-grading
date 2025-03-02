const passport = require('passport')
const LocalStrategy = require('passport-local')
const passportJWT = require('passport-jwt')
const bcrypt = require('bcryptjs')

const { User, Restaurant } = require('../models')

const JWTStrategy = passportJWT.Strategy
const ExtractJWT = passportJWT.ExtractJwt

// set passport strategy: local
// new LocalStrategy(option, function)
passport.use(
  new LocalStrategy(
    // customize user field
    {
      usernameField: 'email',
      passwordField: 'password',
      passReqToCallback: true,
    },

    // authenticate user
    (req, email, password, cb) => {
      User.findOne({ where: { email } }).then((user) => {
        // 1. user doesn't exist: if () return
        if (!user) return cb(null, false, req.flash('error_messages', 'Incorrect email or password!'))

        bcrypt.compare(password, user.password).then((res) => {
          // 2. user exists: compare password !== user.password
          // wrong password: if () return
          if (!res) return cb(null, false, req.flash('error_messages', 'Incorrect email or password!'))
          // 3. pass authenticate
          return cb(null, user)
        })
      })
    }
  )
)

const jwtOptions = {
  // where to find the token? in authorization header, bearer
  jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
  // check if the token was editted with JWT_SECRECT
  secretOrKey: process.env.JWT_SECRET,
}
passport.use(
  // as user signing in, the user data is in payload
  // so we can use payload id to find user
  // find the user and return user to use `req.user` in api server
  new JWTStrategy(jwtOptions, async (jwtPayload, callbackFn) => {
    try {
      const user = await User.findByPk(jwtPayload.id, {
        include: [
          { model: Restaurant, as: 'FavoritedRestaurants' },
          { model: Restaurant, as: 'LikedRestaurants' },
          { model: User, as: 'Followers' },
          { model: User, as: 'Followings' },
        ],
      })
      return callbackFn(null, user)
    } catch (error) {
      callbackFn(error)
    }
  })
)

// serialize and deserialize user
// serialization: a process turn data type into storable
// only store user.id
passport.serializeUser((user, cb) => {
  cb(null, user.id)
})
passport.deserializeUser(async (id, cb) => {
  try {
    const user = await User.findByPk(id, {
      include: [
        { model: Restaurant, as: 'FavoritedRestaurants' },
        { model: Restaurant, as: 'LikedRestaurants' },
        { model: User, as: 'Followers' },
        { model: User, as: 'Followings' },
      ],
    })

    return cb(null, user.toJSON())
  } catch (error) {
    cb(error)
  }
})

module.exports = passport
