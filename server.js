const path = require('path')
const express = require('express')
const morgan = require('morgan')
const mongoSanitize = require('express-mongo-sanitize')
const helmet = require('helmet')
const xss = require('xss-clean')
const rateLimit = require('express-rate-limit')
const hpp = require('hpp')
const cors = require('cors')

const dotenv = require('dotenv')
//Load env vars
dotenv.config({path: './config/config.env'})

const colors = require('colors')
const fileupload = require('express-fileupload')
const connectDB = require('./config/db')
const cookieParser = require('cookie-parser')
const errorHandler = require("./middleware/error")

//Route files include
const bootcamps = require('./routes/bootcamps')
const courses = require('./routes/courses')
const auth = require('./routes/auth')
const users = require('./routes/users')
const reviews = require('./routes/reviews')

//Connect to database
connectDB()

//Init application
const app = express()

//Body parser
app.use(express.json())

//Cookie parser
app.use(cookieParser())

//Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
}

//File uploading
app.use(fileupload({}))

// Sanitize data
app.use(mongoSanitize())

// Set security headers
app.use(helmet())

// Prevent xss attacks
app.use(xss())

// Rate limiting
const limiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 20
})
app.use(limiter)

// Prevent http param pollution
app.use(hpp({
  checkQuery: true,
  checkBody: true,
  checkBodyOnlyForContentType: 'urlencoded',
  whitelist: null
}))

// Enable CORS
app.use(cors())

//Set static folder
app.use(express.static(path.join(__dirname, 'public')))

//Mount routes
app.use('/api/v1/bootcamps', bootcamps)
app.use('/api/v1/courses', courses)
app.use('/api/v1/auth', auth)
app.use('/api/v1/users', users)
app.use('/api/v1/reviews', reviews)

app.use(errorHandler)

const PORT = process.env.PORT || 5000

const server = app.listen(
  PORT,
  console.log(
    `Server running ${process.env.NODE_ENV} mode on port ${PORT}`.green.bold
  )
)

//Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`.red.bold)
  //Close server & exit process
  server.close(() => {
    process.exit(1)
  })
})
