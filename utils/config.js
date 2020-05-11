require('dotenv').config()


// eslint-disable-next-line no-undef
const environment = process.env
let PORT = environment.PORT
let MONGODB_URI = environment.MONGODB_URI

module.exports = {
  MONGODB_URI,
  PORT
}