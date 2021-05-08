const ErrorResponse = require('../utils/ErrorResponse')
const asyncHandler = require('../middleware/asyncHandler')
const User = require('../models/User')
const {sendTokenResponse} = require('../utils/responseHandler')

// @desc    Get all users
// @route   GET /api/v1/users
// @access  Private/Admin
const getUsers = async (req, res, next) => {
  await res.status(200).json(res.advancedResults)
}
exports.getUsers = asyncHandler(getUsers)

// @desc    Get single user
// @route   GET /api/v1/users/:id
// @access  Private/Admin
const getUser = async (req, res, next) => {
  const user = await User.findById(req.params.id)

  await res.status(200).json({
    success: true,
    data: user
  })
}
exports.getUser = asyncHandler(getUser)

// @desc    Create user
// @route   POST /api/v1/users
// @access  Private/Admin
const createUser = async (req, res, next) => {
  const user = await User.create(req.body)

  await res.status(201).json({
    success: true,
    data: user
  })
}
exports.createUser = asyncHandler(createUser)

// @desc    Update user
// @route   PUT /api/v1/users/:id
// @access  Private/Admin
const updateUser = async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  })

  await res.status(200).json({
    success: true,
    data: user
  })
}
exports.updateUser = asyncHandler(updateUser)

// @desc    Delete user
// @route   DELETE /api/v1/users/:id
// @access  Private/Admin
const deleteUser = async (req, res, next) => {
  await User.findByIdAndDelete(req.params.id)

  await res.status(200).json({
    success: true,
    status: 'deleted',
    data: {}
  })
}
exports.deleteUser = asyncHandler(deleteUser)