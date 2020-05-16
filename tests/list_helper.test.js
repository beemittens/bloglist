const listHelper = require('../utils/list_helper')
const helper = require('./test_helper')

test('dummy returns one', () => {
  const blogs = []

  const result = listHelper.dummy(blogs)
  expect(result).toBe(1)
})

describe('total likes', () => {

  test('when list has only one blog equals the likes of that', () => {
    const result = listHelper.totalLikes(helper.listWithOneBlog)
    expect(result).toBe(5)
  })

  test('when list has multiple blog count all likes', () => {
    const result = listHelper.totalLikes(helper.listBlogs)
    expect(result).toBe(36)
  })
})

describe('favorite blog', () => {

  test('when list has only one blog return empty item', () => {
    const result = listHelper.favoriteBlog([])
    expect(result).toEqual({})
  })

  test('when list has only one blog return first', () => {
    const result = listHelper.favoriteBlog(helper.listWithOneBlog)

    const expected = {
      title: 'Go To Statement Considered Harmful',
      author: 'Edsger W. Dijkstra',
      likes: 5,
    }

    expect(result).toEqual(expected)
  })

  test('when list has multiple blogs return most liked one', () => {
    const result = listHelper.favoriteBlog(helper.listBlogs)

    const expected = {
      title: 'Canonical string reduction',
      author: 'Edsger W. Dijkstra',
      likes: 12,
    }

    expect(result).toEqual(expected)
  })
})

describe('most blogs', () => {

  test('when list has only one blog return empty item', () => {
    const result = listHelper.mostBlogs([])
    expect(result).toEqual({})
  })

  test('when list has only one blog return first', () => {
    const result = listHelper.mostBlogs(helper.listWithOneBlog)

    const expected = {
      author: 'Edsger W. Dijkstra',
      blogs: 1
    }

    expect(result).toEqual(expected)
  })

  test('when list has multiple blogs return author with most blogs', () => {
    const result = listHelper.mostBlogs(helper.listBlogs)

    const expected = {
      author: 'Robert C. Martin',
      blogs: 3
    }

    expect(result).toEqual(expected)
  })
})

describe('most likes', () => {

  test('when list has only one blog return empty item', () => {
    const result = listHelper.mostLikes([])
    expect(result).toEqual({})
  })

  test('when list has only one blog return first', () => {
    const result = listHelper.mostLikes(helper.listWithOneBlog)

    const expected = {
      author: 'Edsger W. Dijkstra',
      likes: 5
    }

    expect(result).toEqual(expected)
  })

  test('when list has multiple blogs return author with most blogs', () => {
    const result = listHelper.mostLikes(helper.listBlogs)

    const expected = {
      author: 'Edsger W. Dijkstra',
      likes: 17
    }

    expect(result).toEqual(expected)
  })
})