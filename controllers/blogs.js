const blogRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const jwt = require('jsonwebtoken')
const config = require('../utils/config')

const getTokenFrom = request => {
  const authorization = request.get('authorization')
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    return authorization.substring(7)
  }
  return null
}

blogRouter.get('/', async (_request, response, next) => {
  try {
    const blogs = await Blog.find({}).populate('user', { 'username': 1, 'name': 1 })
    response.json(blogs.map(blog => blog.toJSON()))
  }
  catch (exception) {
    next(exception)
  }
})

blogRouter.post('/', async (request, response, next) => {
  const body = request.body
  const token = getTokenFrom(request)

  const decodedToken = jwt.verify(token, config.SECRET)

  if (!token || !decodedToken.id) {
    return response.status(401).json({ error: 'token missing or invalid' })
  }
  else if (!body.title || !body.url) {
    response.status(400).end()
    return
  }

  const user = await User.findById(decodedToken.id)

  const blog = new Blog({
    author: body.author,
    title: body.title,
    url: body.url,
    likes: body.likes,
    user: user._id
  })

  if(!blog.likes) {
    blog.likes = 0
  }

  try {
    console.log(blog)
    const savedBlog = await blog.save()
    user.blogs = user.blogs.concat(savedBlog._id)
    await user.save()

    response.status(200).json(savedBlog)
  }
  catch (exception) {
    next(exception)
  }
})

blogRouter.put('/:id', async (request, response, next) => {
  const body = request.body

  const blog = {
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes
  }

  if (!blog.title || !blog.url) {
    response.status(400).end()
    return
  }

  if (!blog.likes) {
    blog.likes = 0
  }

  try {
    const updatedBlog = await (await Blog.findByIdAndUpdate(request.params.id, blog, { new: true })).populate('user', { username: 1, name: 1 })

    if (updatedBlog) {
      response.json(updatedBlog.toJSON())
    } else {
      response.status(404).end()
    }
  }
  catch (exception) {
    next(exception)
  }
})

blogRouter.delete('/:id', async (request, response, next) => {
  try {
    await Blog.findByIdAndDelete(request.params.id)
    response.status(204).end()
  }
  catch (exception) {
    next(exception)
  }
})


module.exports = blogRouter