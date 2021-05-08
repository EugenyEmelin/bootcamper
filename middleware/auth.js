const jwt = require('jsonwebtoken')
const asyncHandler = require('./asyncHandler')
const ErrorResponse = require('../utils/errorResponse')
const User = require('../models/User')

//Protect routes
const protect = async (req, res, next) => {
  let token

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    // Set toke from request header
    token = req.headers.authorization.split(' ')[1]
  }
  // Set token from cookie (if needed)
  // else if (req.cookies.token) {
  //   token = req.cookies.token
  // }

  //Make sure token exists
  if (!token) {
    return next(new ErrorResponse('Not authorized to access this route', 401))
  }

  try {
    //Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    req.user = await User.findById(decoded.id)
    next()
  } catch(err) {
    return next(new ErrorResponse('Not authorized to access this route (catch)', 401))

  }
}
exports.protect = asyncHandler(protect)

//Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
          new ErrorResponse(`User role ${req.user.role} is not authorized to access this route`, 403)
      )
    }
    next()
  }
}