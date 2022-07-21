const passport = require('../config/passport')

// const authenticated = passport.authenticate('jwt', { session: false })
const authenticated = (req, res, next) => {
  const callbackFn = (error, user) => {
    if (error || !user) return res.status(401).json({ status: 'error', message: 'unauthorized' })

    next()
  }
  // passport.authenticate() is a callback middleware, so at the and adding (req, res, next)
  passport.authenticate('jwt', { session: false }, callbackFn)(req, res, next)
}

const authenticatedAdmin = (req, res, next) => {
  if (req.user && req.user.isAdmin) return next()

  return res.status(403).json({ status: 'error', message: 'permission denied' })
}

module.exports = {
  authenticated,
  authenticatedAdmin,
}
