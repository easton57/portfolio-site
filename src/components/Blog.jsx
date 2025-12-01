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
    <div className="w-full">
      <div className="flex gap-5 my-5 w-full box-border">
        <div className="bg-[var(--color-surface)] p-5 rounded-md flex-[0_0_100%] min-w-0 box-border">
        <h2 className="text-[var(--color-text)] text-xl sm:text-2xl font-bold mb-5">Blog</h2>
        <div id="blog-posts">
          {loading ? (
            <p className="text-[var(--color-textSecondary)]">Loading posts...</p>
          ) : blogPosts.length > 0 ? (
            blogPosts.map((post) => (
              <div key={post.id} className="mb-5 pb-5 border-b border-[var(--color-border)] last:border-b-0 last:mb-0 last:pb-0">
                <h3 className="m-0 mb-2.5 text-[var(--color-text)] text-lg sm:text-xl">
                  <Link to={`/blog-post?id=${post.id}`} className="text-[var(--color-text)] no-underline hover:opacity-70">{post.title}</Link>
                </h3>
                <p className="m-0 mb-2.5 text-[var(--color-textSecondary)]">{post.summary}</p>
                <small className="text-[var(--color-textTertiary)] text-xs">{new Date(post.created_at).toLocaleDateString()}</small>
              </div>
            ))
          ) : (
            <p className="text-[var(--color-textSecondary)]">No posts available</p>
          )}
        </div>
      </div>
    </div>
    </div>
  )
}

export default Blog
