const mongoose = require("mongoose")

const connectDB = async () => {
  const db = await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })

  console.log(`MongoDB Connected: ${db.connection.host}`.cyan)
}

module.exports = connectDB
