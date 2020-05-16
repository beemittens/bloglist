const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const Blog = require('../models/blog')
const helper = require('./test_helper')
const api = supertest(app)

beforeEach(async () => {
  await Blog.deleteMany({})

  for (const blog of helper.initialApiBlogs) {
    let blogItem = new Blog(blog)
    await blogItem.save()
  }
})

test('blogs are returned as json', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

test('blogs are returned with an id field', async () => {
  const response = await api.get('/api/blogs')
  expect(response.body[0].id).toBeDefined()
  expect(response.body[0]._id).not.toBeDefined()
})

test('there are two blogs', async () => {
  const response = await api.get('/api/blogs')
  expect(response.body).toHaveLength(helper.initialApiBlogs.length)
})

test('the first blog is about Wiccanism', async () => {
  const response = await api.get('/api/blogs')
  expect(response.body[0].title).toEqual(helper.initialApiBlogs[0].title)
})

test('a valid blog can be added', async () => {
  const title = 'A valid blog from testing'
  const newBlog = {
    title: title,
    author: 'Integration test',
    url: 'https://tst.geocities.com/',
    likes: 1
  }

  const blogsAtBeginning = await helper.blogsInDb()

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(200)
    .expect('Content-Type', /application\/json/)

  const blogsAtEnd = await helper.blogsInDb()
  expect(blogsAtEnd).toHaveLength(blogsAtBeginning.length + 1)

  const titles = blogsAtEnd.map(n => n.title)
  expect(titles[titles.length - 1]).toContain(title)
})

test('a zero is added as likes if not given', async () => {
  const title = 'Like test'
  const newBlog = {
    title: title,
    author: 'Integration test',
    url: 'https://tst.geocities.com/'
  }

  const blogsAtBeginning = await helper.blogsInDb()

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(200)
    .expect('Content-Type', /application\/json/)

  const blogsAtEnd = await helper.blogsInDb()
  expect(blogsAtEnd).toHaveLength(blogsAtBeginning.length + 1)
  const lastBlog = blogsAtEnd[blogsAtEnd.length - 1]

  expect(lastBlog.likes).toBeDefined()
  expect(lastBlog.likes).toEqual(0)
})

test('if title is missing status 400 is given', async () => {
  const newBlog = {
    author: 'No title',
    url: 'https://tst.geocities.com/',
    likes: 0
  }

  const blogsAtBeginning = await helper.blogsInDb()

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(400)

  const blogsAtEnd = await helper.blogsInDb()
  expect(blogsAtEnd).toHaveLength(blogsAtBeginning.length)
})

test('if url is missing status 400 is given', async () => {
  const newBlog = {
    title: 'No url',
    author: 'Integration test',
    likes: 0
  }

  const blogsAtBeginning = await helper.blogsInDb()

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(400)

  const blogsAtEnd = await helper.blogsInDb()
  expect(blogsAtEnd).toHaveLength(blogsAtBeginning.length)
})

test('removing blog with a valid id', async () => {
  const blogsAtBeginning = await helper.blogsInDb()

  await api
    .delete(`/api/blogs/${blogsAtBeginning[0].id}`)
    .expect(204)

  const blogsAtEnd = await helper.blogsInDb()
  expect(blogsAtEnd).toHaveLength(blogsAtBeginning.length - 1)
})

test('removing blog with a faulty id', async () => {
  const blogsAtBeginning = await helper.blogsInDb()

  await api
    .delete('/api/blogs/000000000000000000000000')
    .expect(204)

  const blogsAtEnd = await helper.blogsInDb()
  expect(blogsAtEnd).toHaveLength(blogsAtBeginning.length)
})

test('updating blog with a valid id', async () => {
  const blogsAtBeginning = await helper.blogsInDb()
  const updatedBlog = blogsAtBeginning[0]

  updatedBlog.title = 'Updated title'
  updatedBlog.author = 'Updated author'
  updatedBlog.url = 'Updated url'

  await api
    .put(`/api/blogs/${updatedBlog.id}`)
    .send(updatedBlog)
    .expect(200)

  const blogsAtEnd = await helper.blogsInDb()
  expect(blogsAtEnd).toHaveLength(blogsAtBeginning.length)

  const savedBlog = blogsAtEnd.find(blog => blog.id === updatedBlog.id)
  expect(savedBlog).toEqual(updatedBlog)
})

afterAll(() => {
  mongoose.connection.close()
})
