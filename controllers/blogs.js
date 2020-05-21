const blogRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')

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
  const token = request.token

  if (!token || !token.id) {
    return response.status(401).json({ error: 'token missing or invalid' })
  } else if (!body.title || !body.url) {
    return response.status(400).json({ error: 'Title or url missing' })
  }

  const user = await User.findById(token.id)

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
    const savedBlog = await blog.save()
    Blog.populate(savedBlog, { path: 'user', select: { 'username': 1, 'name': 1 } })

    user.blogs = user.blogs.concat(savedBlog._id)
    await user.save()

    response.status(200).json(savedBlog)
  }
  catch (exception) {
    next(exception)
  }
})

blogRouter.put('/:id', async (request, response, next) => {
  const token = request.token

  if (!token || !token.id) {
    return response.status(401).json({ error: 'token missing or invalid' })
  }

  const body = request.body

  const blog = {
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes
  }

  if (!blog.title || !blog.url) {
    return response.status(400).end()
  }

  if (!blog.likes) {
    blog.likes = 0
  }

  try {
    const foundBlog = (await Blog.findById(request.params.id)).toJSON()

    if (!foundBlog) {
      return response.status(404).end()
    } else if (foundBlog.user.toString() !== token.id) {
      return response.status(401).json({ error: 'user not allowed to update this blog' })
    }

    const updatedBlog = await (Blog.findByIdAndUpdate(request.params.id, blog, { new: true }))
      .populate('user', { username: 1, name: 1 })
    response.json(updatedBlog.toJSON())
  }
  catch (exception) {
    next(exception)
  }
})

blogRouter.delete('/:id', async (request, response, next) => {
  const token = request.token

  if (!token || !token.id) {
    return response.status(401).json({ error: 'token missing or invalid' })
  }

  try {
    const blog = await Blog.findById(request.params.id)

    if(!blog) {
      return response.status(204).end()
    } else if (blog.user.toString() !== token.id) {
      return response.status(401).json({ error: 'user not allowed to remove this blog' })
    }

    await blog.delete()
    response.status(204).end()
  }
  catch (exception) {
    next(exception)
  }
})

module.exports = blogRouter