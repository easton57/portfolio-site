import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

function Blog() {
  const [blogPosts, setBlogPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadBlogPosts()
  }, [])

  const loadBlogPosts = async () => {
    try {
      const response = await fetch("/api/all-posts")
      const posts = await response.json()
      setBlogPosts(posts)
    } catch (error) {
      console.error("Error loading blog posts:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <h2>Blog</h2>
      <div className="main-content full-width">
        <div className="content-body">
          <div id="blog-posts">
            {loading ? (
              <p>Loading posts...</p>
            ) : blogPosts.length > 0 ? (
              blogPosts.map((post) => (
                <div key={post.id} className="blog-post">
                  <h3>
                    <Link to={`/blog-post?id=${post.id}`}>{post.title}</Link>
                  </h3>
                  <p>{post.summary}</p>
                  <small>{new Date(post.created_at).toLocaleDateString()}</small>
                </div>
              ))
            ) : (
              <p>No posts available</p>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default Blog
