const lodash = require('lodash')

const dummy = (_blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  const totalLikesReducer = (likes, blog) => {
    return likes + blog.likes
  }

  return blogs.reduce(totalLikesReducer, 0)
}

const favoriteBlog = (blogs) => {

  if (blogs.length === 0) {
    return {}
  }

  const maxLikesBlog = blogs.sort((a, b) => { return b.likes - a.likes })[0]

  return {
    title: maxLikesBlog.title,
    author: maxLikesBlog.author,
    likes: maxLikesBlog.likes
  }
}

const mostBlogs = (blogs) => {

  if (blogs.length === 0) {
    return {}
  }

  const authorGroups = lodash.groupBy(blogs, 'author')

  const blogPerAuthor = (item, key) => {
    return {
      author: key,
      blogs: item.length
    }
  }

  const authorActivity = lodash.map(authorGroups, blogPerAuthor)
  return authorActivity.sort((a, b) => { return b.blogs - a.blogs })[0]
}

const mostLikes = (blogs) => {
  if (blogs.length === 0) {
    return {}
  }

  const authorGroups = lodash.groupBy(blogs, 'author')

  const likesPerAuthor = (blogs, author) => {
    return {
      author: author,
      likes: totalLikes(blogs)
    }
  }

  const authorLikes = lodash.map(authorGroups, likesPerAuthor)
  return authorLikes.sort((a, b) => { return b.likes - a.likes })[0]
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes
}