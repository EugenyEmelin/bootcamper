const path = require('path')
const ErrorResponse = require('../utils/ErrorResponse')
const asyncHandler = require('../middleware/asyncHandler')
const geocoder = require('../utils/geocoder')
const Bootcamp = require("../models/Bootcamp")

// @desc    Get all bootcamps
// @route   GET /api/v1/bootcamps
// @access  Public
const getBootcamps = async (req, res, next) => {
  await res.status(200).json(res.advancedResults)
}
exports.getBootcamps = asyncHandler(getBootcamps)

// @desc    Get single bootcamp
// @route   GET /api/v1/bootcamps/:id
// @access  Public
const getBootcamp = async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id)

  if (!bootcamp) {
    return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`))
  }

  await res.status(200).json({
    success: true,
    data: bootcamp,
  })
}
exports.getBootcamp = asyncHandler(getBootcamp)

// @desc    Create new bootcamp
// @route   POST /api/v1/bootcamps
// @access  Private
const createBootcamp = async (req, res, next) => {
  //Add user to req.body
  req.body.user = req.user.id

  // Check for published bootcamp
  const publishedBootcamp = await Bootcamp.findOne({user: req.user.id})

  // If the user in not an admin, they can only add one bootcamp only
  if (publishedBootcamp && req.user.role !== 'admin') {
    return next(
        new ErrorResponse(
            `The user with ID ${req.user.id} has already published a bootcamp`,
            400
        )
    )
  }

  const bootcamp = await Bootcamp.create(req.body)



  if (!bootcamp) {
    return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`))
  }

  await res.status(201).json({
    success: true,
    data: bootcamp
  })
}
exports.createBootcamp = asyncHandler(createBootcamp)

// @desc    Update bootcamp
// @route   PUT /api/v1/bootcamps/:id
// @access  Private
const updateBootcamp = async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id)

  if (!bootcamp) {
    if (!bootcamp) {
      return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404))
    }
  }

  //Make sure user is bootcamp owner
  if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
        new ErrorResponse(`User ${req.params.id} is not authorized to update this bootcamp`, 401)
    )
  }

  const updatedBootcamp = await Bootcamp.findOneAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  })

  await res.status(200).json({
    success: true,
    data: updatedBootcamp,
  })
}
exports.updateBootcamp = asyncHandler(updateBootcamp)

// @desc    Delete bootcamp
// @route   DELETE /api/v1/bootcamps/:id
// @access  Private
const deleteBootcamp = async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id)

  if (!bootcamp) {
    return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404))
  }

  //Make sure user is bootcamp owner
  if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
        new ErrorResponse(`User ${req.params.id} is not authorized to delete this bootcamp`, 401)
    )
  }

  bootcamp.remove()

  await res.status(200).json({
    success: true,
    status: 'deleted',
    data: {},
  })
}
exports.deleteBootcamp = asyncHandler(deleteBootcamp)

// @desc    Get bootcamps within a radius
// @route   GET /api/v1/bootcamps/radius/:zipcode/:distance
// @access  Private
const getBootcampsInRadius = async (req, res, next) => {
  const {zipcode, distance} = req.params

  console.log(distance, 'distance')

  //Get lat/lng from geocoder
  const location = await geocoder.geocode(zipcode)
  const lat = +location[0].latitude
  const lng = +location[0].longitude

  //Calc radius using radians
  //Divide distance by radius of Earth
  //Earth Radius = 3,963 mi or 6,378 km
  const radius = +distance / 6378

  const bootcamps = await Bootcamp.find({
    location: {
      $geoWithin: {
        $centerSphere: [[lat, lng], radius]
      }
    }
  })

  await res.status(200).json({
    success: true,
    count: bootcamps.length,
    data: bootcamps,
  })
}
exports.getBootcampsInRadius = asyncHandler(getBootcampsInRadius)

// @desc    Upload photo for bootcamp
// @route   PUT /api/v1/bootcamps/:id/photo
// @access  Private
const bootcampPhotoUpload = async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id)

  if (!bootcamp) {
    return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`))
  }

  //Make sure user is bootcamp owner
  if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
        new ErrorResponse(`User ${req.params.id} is not authorized to upload photo`, 401)
    )
  }

  if (!req.files) {
    return next(new ErrorResponse(`Please upload a file`, 400))
  }

  const file = req.files.file

  //Make sure the image is a photo
  if (!file.mimetype.startsWith('image')) {
    return next(new ErrorResponse(`Please upload an image file`, 400))
  }

  //Check file size
  if (file.size > process.env.MAX_FILE_UPLOAD) {
    return next(
        new ErrorResponse(
            `Please upload an image less than ${process.env.MAX_FILE_UPLOAD}`,
            400
        )
    )
  }

  //Create custom filename
  file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`

  await file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async err => {
    if (err) {
      console.log(err)
      return next(new ErrorResponse(`Problem with file upload`, 500))
    }

    await Bootcamp.findByIdAndUpdate(req.params.id, {
      photo: file.name
    })

    await res.status(200).json({
      success: true,
      data: file.name
    })
    console.log(`File ${file.name} uploaded`.blue.bold)
  })

}
exports.bootcampPhotoUpload = asyncHandler(bootcampPhotoUpload)
