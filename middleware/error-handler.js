module.exports = {
  generalErrorHandler(error, req, res, next) {
    /**
     * check if error is an Error Object
     * if true, this object own properties: name and message
     * if false, console.log() error message
     */
    if (error instanceof Error) {
      req.flash('error_messages', `${error.name}: ${error.message}`)
    } else {
      req.flash('error_messages', `${error}`)
    }

    res.redirect('back')
    next(error)
  },
  apiErrorHandler(error, req, res, next) {
    if (error instanceof Error) {
      res.status(500).json({
        status: 'error',
        message: `${error.name}: ${error.message}`,
      })
    } else {
      res.status(500).json({
        status: 'error',
        message: `${error}`,
      })
    }
    next(error)
  },
}
