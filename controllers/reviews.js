const ErrorResponse = require('../utils/ErrorResponse')
const asyncHandler = require('../middleware/asyncHandler')
const Review = require("../models/Review")
const Bootcamp = require("../models/Bootcamp")

// @desc    Get reviews
// @route   GET /api/v1/reviews
// @route   GET/api/v1/bootcamps/:bootcampId/courses
// @access  Public
const getReviews = async (req, res, next) => {
  if (req.params.bootcampId) {
    const reviews = await Review.find({bootcamp: req.params.bootcampId})

    return await res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews
    })
  } else {
    await res.status(200).json(res.advancedResults)
  }
}
exports.getReviews = asyncHandler(getReviews)

// @desc    Get single review
// @route   GET /api/v1/reviews/:id
// @access  Public
const getReview = async (req, res, next) => {
  const review = await Review.findById(req.params.id).populate({
    path: 'bootcamp',
    select: 'name description'
  })

  if (!review) {
    return next(
        new ErrorResponse(`No review found with the id of ${req.params.id}`, 404)
    )
  }

  await res.status(200).json({
    success: true,
    data: review
  })
}
exports.getReview = asyncHandler(getReview)

// @desc    Add review
// @route   POST /api/v1/bootcamps/:bootcampId/reviews
// @access  Private
const addReview = async (req, res, next) => {
  req.body.bootcamp = req.params.bootcampId
  req.body.user = req.user.id

  const bootcamp = Bootcamp.findById(req.params.bootcampId)

  if (!bootcamp) {
    return next(
        new ErrorResponse(`No bootcamp with the id of ${req.params.bootcampId}`, 404)
    )
  }

  const review = await Review.create(req.body)

  await res.status(201).json({
    success: true,
    data: review
  })
}
exports.addReview = asyncHandler(addReview)

// @desc    Update review
// @route   PUT /api/v1/reviews/:id
// @access  Private
const updateReview = async (req, res, next) => {
  const review = await Review.findById(req.params.id)

  if (!review) {
    return next(
        new ErrorResponse(`No review with the id of ${req.params.id}`, 404)
    )
  }

  //Make sure review belongs to user or user is admin
  if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
        new ErrorResponse(`Not authorized to update review`, 401)
    )
  }

  const updatedReview = await Review.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  })

  await res.status(201).json({
    success: true,
    data: updatedReview
  })
}
exports.updateReview = asyncHandler(updateReview)

// @desc    Delete review
// @route   DELETE /api/v1/reviews/:id
// @access  Private
const deleteReview = async (req, res, next) => {
  const review = await Review.findById(req.params.id)

  if (!review) {
    return next(
        new ErrorResponse(`No review with the id of ${req.params.id}`, 404)
    )
  }

  //Make sure review belongs to user or user is admin
  if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
        new ErrorResponse(`Not authorized to delete review`, 401)
    )
  }

  await review.remove()

  await res.status(201).json({
    success: true,
    status: 'deleted',
    data: {}
  })
}
exports.deleteReview = asyncHandler(deleteReview)