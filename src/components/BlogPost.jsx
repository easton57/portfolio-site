import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'

function BlogPost() {
  const [searchParams] = useSearchParams()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadBlogPost()
  }, [])

  const loadBlogPost = async () => {
    try {
      const postId = searchParams.get('id')

      if (!postId) {
        setError('Post not found')
        setLoading(false)
        return
      }

      const response = await fetch(`/api/blog/${postId}`)

      if (!response.ok) {
        throw new Error('Post not found')
      }

      const postData = await response.json()
      setPost(postData)
      
      // Update the page title
      document.title = `${postData.title} - Easton Seidel`
    } catch (error) {
      console.error('Error loading blog post:', error)
      setError('Error loading post')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="main-content full-width">
        <div className="content-body">
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <p>Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="main-content full-width">
        <div className="content-body">
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <p>{error || 'Post not found'}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="main-content full-width">
      <div className="content-body">
        <div id="blog-post-content">
          <article className="blog-post-full">
            <header className="post-header">
              <h1>{post.title}</h1>
              <div className="post-meta">
                <time dateTime={post.created_at}>
                  {new Date(post.created_at).toLocaleDateString()}
                </time>
              </div>
              <p className="post-summary">{post.summary}</p>
            </header>
            <div className="post-content">
              {post.excerpt}
            </div>
          </article>
        </div>
      </div>
    </div>
  )
}

export default BlogPost
