const ErrorResponse = require('../utils/ErrorResponse')
const asyncHandler = require('../middleware/asyncHandler')
const Course = require("../models/Course")
const Bootcamp = require("../models/Bootcamp")

// @desc    Get all courses
// @route   GET /api/v1/courses
// @route   GET/api/v1/bootcamps/:bootcampId/courses
// @access  Public
const getCourses = async (req, res, next) => {
  if (req.params.bootcampId) {
    const courses = await Course.find({bootcamp: req.params.bootcampId})
    return await res.status(200).json({
      success: true,
      count: courses.length,
      data: courses
    })
  } else {
    await res.status(200).json(res.advancedResults)
  }
}
exports.getCourses = asyncHandler(getCourses)

// @desc    Get single course
// @route   GET /api/v1/courses/:id
// @access  Public
const getCourse = async (req, res, next) => {
  const course = await Course.findById(req.params.id).populate({
    path: 'bootcamp',
    seletct: 'name description'
  })

  if (!course) {
    return next(
        new ErrorResponse(`No course with the id of ${req.params.id}`),
        404
    )
  }

  await res.status(200).json({
    success: true,
    data: course
  })

}
exports.getCourse = asyncHandler(getCourse)

// @desc    Add course
// @route   POST /api/v1/bootcamps/:bootcampId/courses
// @access  Private
const addCourse = async (req, res, next) => {
  req.body.bootcamp = req.params.bootcampId
  req.body.user = req.user.id

  const bootcamp = await Bootcamp.findById(req.params.bootcampId)

  if (!bootcamp) {
    return next(
        new ErrorResponse(`No bootcamp with the id of ${req.params.bootcampId}`),
        404
    )
  }

  //Make sure user is bootcamp owner
  if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
        new ErrorResponse(
            `User ${req.user.id} is not authorized to add a course to bootcamp ${bootcamp._id}`,
            401
        )
    )
  }

  const course = await Course.create(req.body)

  await res.status(200).json({
    success: true,
    data: course
  })

}
exports.addCourse = asyncHandler(addCourse)

// @desc    Update course
// @route   PUT /api/v1/courses/:id
// @access  Private
const updateCourse = async (req, res, next) => {
  let course = await Course.findById(req.params.id)

  if (!course) {
    return next(
        new ErrorResponse(`No course with the id of ${req.params.id}`),
        404
    )
  }

  //Make sure user is course owner
  if (course.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
        new ErrorResponse(
            `User ${req.user.id} is not authorized to update course ${course._id}`,
            401
        )
    )
  }

  course = await Course.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  })

  await res.status(200).json({
    success: true,
    data: course
  })

}
exports.updateCourse = asyncHandler(updateCourse)

// @desc    Delete course
// @route   DELETE /api/v1/courses/:id
// @access  Private
const deleteCourse = async (req, res, next) => {
  const course = await Course.findById(req.params.id)

  if (!course) {
    return next(
        new ErrorResponse(`No course with the id of ${req.params.id}`),
        404
    )
  }

  //Make sure user is course owner
  if (course.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
        new ErrorResponse(
            `User ${req.user.id} is not authorized to update course ${course._id}`,
            401
        )
    )
  }

  await course.remove()

  await res.status(200).json({
    success: true,
    data: {}
  })

}
exports.deleteCourse = asyncHandler(deleteCourse)

