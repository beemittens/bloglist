const bcrypt = require('bcrypt')
const userRouter = require('express').Router()
const User = require('../models/user')

userRouter.get('/', async (_request, response, next) => {
  try {
    const blogs = await User.find({}).populate('blogs', { 'title': 1, 'author': 1, 'url': 1 })
    response.json(blogs.map(blog => blog.toJSON()))
  }
  catch (exception) {
    next(exception)
  }
})

userRouter.post('/', async (request, response, next) => {
  const body = request.body

  const password = body.password
  const minPswLength = 3
  if (!password || password.length <= minPswLength) {
    response.status(400).json({ error: `Password should be more than ${minPswLength} characters long` })
    return
  }

  const saltRounds = 10
  const passwordHash = await bcrypt.hash(body.password, saltRounds)

  const user = new User({
    username: body.username,
    name: body.name,
    passwordHash: passwordHash,
  })

  try {
    const savedUser = await user.save()
    response.json(savedUser)
  }
  catch (exception) {
    next(exception)
  }
})

userRouter.delete('/:id', async (request, response, next) => {
  try {
    await User.findByIdAndDelete(request.params.id)
    response.status(204).end()
  }
  catch (exception) {
    next(exception)
  }
})

module.exports = userRouter