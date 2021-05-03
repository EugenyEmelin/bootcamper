const ErrorResponse = require('../utils/ErrorResponse')
const asyncHandler = require('../middleware/asyncHandler')
const User = require('../models/User')
const {sendTokenResponse} = require('../utils/responseHandler')

// @desc    Register user
// @route   POST /api/v1/auth/register
// @access  Public
const register = async (req, res, next) => {
  const {name, email, password, role} = req.body

  //Create user
  const user = await User.create({
    name,
    email,
    password,
    role
  })

  sendTokenResponse(user, 200, res)
}
exports.register = asyncHandler(register)

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
const login = async (req, res, next) => {
  const {email, password} = req.body

  //Validate email and password
  if (!email || !password) {
    return next(new ErrorResponse('Please provide an email and password', 400))
  }

  //Check for user
  const user = await User.findOne({email}).select('+password')

  if (!user) {
    return next(new ErrorResponse('Invalid credentials', 401))
  }

  //Check if password matches
  const isMatch = await user.matchPassword(password)

  if (!isMatch) {
    return next(new ErrorResponse('Invalid credentials', 401))
  }
  
  sendTokenResponse(user, 200, res)
}
exports.login = asyncHandler(login)

// @desc    Get current logged in user
// @route   POST /api/v1/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  const user = await User.findById(req.user.id)

  res.status(200).json({
    success: true,
    data: user
  })
}
exports.getMe = asyncHandler(getMe)

