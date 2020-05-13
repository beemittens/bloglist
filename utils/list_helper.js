const lodash = require('lodash');

const dummy = (_blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  const reducer = (likes, blog) => {
    return likes + blog.likes
  }

  return blogs.reduce(reducer, 0)
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

  var authorActivity = lodash.map(authorGroups, blogPerAuthor)
  return authorActivity.sort((a, b) => { return b.blogs - a.blogs })[0]
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs
}