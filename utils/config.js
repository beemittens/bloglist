require('dotenv').config()


// eslint-disable-next-line no-undef
const environment = process.env
let PORT = environment.PORT
let MONGODB_URI = environment.MONGODB_URI
let NODE_ENV = environment.NODE_ENV

if (NODE_ENV === 'test') {
  MONGODB_URI = environment.TEST_MONGODB_URI
}

module.exports = {
  MONGODB_URI,
  PORT,
  NODE_ENV
}