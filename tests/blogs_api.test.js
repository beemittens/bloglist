const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const Blog = require('../models/blog')
const User = require('../models/user')
const helper = require('./test_helper')
const api = supertest(app)
const bcrypt = require('bcrypt')

let rootAuthHeader = ''
let rootUserId = ''
let otherAuthHeader = ''

beforeAll(async () => {
  await User.deleteMany({})

  const passwordHash = await bcrypt.hash('psw_!', 10)

  const rootUser = new User({ username: 'root', passwordHash })
  const createdRootUser = await rootUser.save()
  rootUserId = createdRootUser._id
  rootAuthHeader = `Bearer ${helper.encodeToken(createdRootUser)}`

  const otherUser = new User({ username: 'other', passwordHash })
  const createdOtherUser = await otherUser.save()
  otherAuthHeader = `Bearer ${helper.encodeToken(createdOtherUser)}`
})



describe('retrieving blogs', () => {
  beforeEach(async () => {
    await Blog.deleteMany({})

    for (const blog of helper.initialApiBlogs) {
      let blogItem = new Blog(blog)
      blogItem.user = rootUserId
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
})

describe('adding a blog', () => {
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
      .set('Authorization', rootAuthHeader)
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
      .set('Authorization', rootAuthHeader)
      .send(newBlog)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(blogsAtBeginning.length + 1)
    const lastBlog = blogsAtEnd[blogsAtEnd.length - 1]

    expect(lastBlog.likes).toBeDefined()
    expect(lastBlog.likes).toEqual(0)
  })

  test('if token is missing status 401 is given', async () => {
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
      .expect(401)

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(blogsAtBeginning.length)
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
      .set('Authorization', rootAuthHeader)
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
      .set('Authorization', rootAuthHeader)
      .send(newBlog)
      .expect(400)

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(blogsAtBeginning.length)
  })
})

describe('deleting a blog', () => {
  beforeEach(async () => {
    await Blog.deleteMany({})

    for (const blog of helper.initialApiBlogs) {
      let blogItem = new Blog(blog)
      blogItem.user = rootUserId
      await blogItem.save()
    }
  })

  test('removing blog with a valid id', async () => {
    const blogsAtBeginning = await helper.blogsInDb()

    await api
      .delete(`/api/blogs/${blogsAtBeginning[0].id}`)
      .set('Authorization', rootAuthHeader)
      .expect(204)

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(blogsAtBeginning.length - 1)
  })

  test('removing blog with other user', async () => {
    const blogsAtBeginning = await helper.blogsInDb()

    await api
      .delete(`/api/blogs/${blogsAtBeginning[0].id}`)
      .set('Authorization', otherAuthHeader)
      .expect(401)

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(blogsAtBeginning.length)
  })

  test('removing blog with a faulty id', async () => {
    const blogsAtBeginning = await helper.blogsInDb()

    await api
      .delete('/api/blogs/000000000000000000000000')
      .set('Authorization', rootAuthHeader)
      .expect(204)

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(blogsAtBeginning.length)
  })
})

describe('updating a blog', () => {
  beforeEach(async () => {
    await Blog.deleteMany({})

    for (const blog of helper.initialApiBlogs) {
      let blogItem = new Blog(blog)
      blogItem.user = rootUserId
      await blogItem.save()
    }
  })

  test('updating blog with a valid id', async () => {
    const blogsAtBeginning = await helper.blogsInDb()
    const updatedBlog = blogsAtBeginning[0]

    updatedBlog.title = 'Updated title'
    updatedBlog.author = 'Updated author'
    updatedBlog.url = 'Updated url'

    await api
      .put(`/api/blogs/${updatedBlog.id}`)
      .set('Authorization', rootAuthHeader)
      .send(updatedBlog)
      .expect(200)

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(blogsAtBeginning.length)

    const savedBlog = blogsAtEnd.find(blog => blog.id === updatedBlog.id)
    expect(savedBlog).toEqual(updatedBlog)
  })

  test('updating blog with wrong user', async () => {
    const blogsAtBeginning = await helper.blogsInDb()
    const updatedBlog = blogsAtBeginning[0]

    updatedBlog.title = 'Updated title'
    updatedBlog.author = 'Updated author'
    updatedBlog.url = 'Updated url'

    await api
      .put(`/api/blogs/${updatedBlog.id}`)
      .set('Authorization', otherAuthHeader)
      .send(updatedBlog)
      .expect(401)

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(blogsAtBeginning.length)

    const savedBlog = blogsAtEnd.find(blog => blog.id === updatedBlog.id)
    expect(savedBlog).not.toEqual(updatedBlog)
  })
})

describe('when there is initially one user at db', () => {

  test('creation succeeds with a fresh username', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'lso',
      name: 'Lars Sonninen',
      password: 'salainen',
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)

    const usernames = usersAtEnd.map(user => user.username)
    expect(usernames).toContain(newUser.username)
  })

  test('creation fails with proper statuscode and message if username already taken', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'root',
      name: 'Lars Sonninen',
      password: 'salainen',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain('`username` to be unique')

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length)
  })

  test('creation fails with proper statuscode and message if password is too short', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'salasana',
      name: 'Lars Sonninen',
      password: '333',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain('Password should be more than ')

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length)
  })
})

afterAll(() => {
  mongoose.connection.close()
})
