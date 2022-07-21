const jwt = require('jsonwebtoken')

const userController = {
  signIn: (req, res, next) => {
    try {
      const theSignInUser = req.user.toJSON()
      delete theSignInUser.password

      // jwt.sign(payload, secretOrPrivateKey, options)
      // payload: data that developer wants to pack in this token
      // as the token passed to config/passport.js and being solved, server side gets theSignInUser
      const token = jwt.sign(theSignInUser, process.env.JWT_SECRET, { expiresIn: '30d' })
      res.json({
        status: 'successful sign in',
        data: { token, user: theSignInUser },
      })
    } catch (error) {
      next(error)
    }
  },
}

module.exports = userController
