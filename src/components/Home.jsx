import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

function Home() {
  const [blogPosts, setBlogPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadBlogPosts()
  }, [])

  const loadBlogPosts = async () => {
    try {
      const response = await fetch("/api/recent-posts")
      const posts = await response.json()
      setBlogPosts(posts)
    } catch (error) {
      console.error("Error loading blog posts:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="main-content">
      <div className="content-body">
        <img src="/img/me.jpg" alt="Easton Seidel" />
        <p>
          I'm Easton Seidel. I'm a Systems Administrator and
          aspiring Software Engineer in Southern California.
        </p>
        <br />
        <br />
        <p>
          I'm passionate about technology and how it can increase
          efficiency and productivity. You can find examples of
          that on my
          <a href="https://github.com/easton57">github</a> where I
          have my linux configuration and other projects.
        </p>
        <br />
        <br />
        <p>
          In my free time, I play the upright bass in Southern
          California Philharmonic and tinker with any electronics
          I can get my hands on.
        </p>
      </div>

      <div className="sidebar">
        <table className="social-media">
          <tr>
            <td>
              <a
                href="https://www.linkedin.com/in/easton-seidel/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src="/img/linkedin.png"
                  className="social-media-icon"
                  alt="LinkedIn"
                />
              </a>
            </td>
            <td>
              <a
                href="https://github.com/easton57"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src="/img/github.png"
                  className="social-media-icon"
                  alt="GitHub"
                />
              </a>
            </td>
            <td>
              <a
                href="https://www.youtube.com/@eastonseidel5024"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src="/img/youtube.png"
                  className="social-media-icon"
                  alt="YouTube"
                />
              </a>
            </td>
          </tr>
        </table>

        <div className="recent-blog-posts">
          <h3>Recent Blog Posts</h3>
          <div id="blog-posts">
            {loading ? (
              <p>Loading posts...</p>
            ) : blogPosts.length > 0 ? (
              blogPosts.map((post) => (
                <div key={post.id} className="blog-post">
                  <h5>
                    <Link to={`/blog-post?id=${post.id}`}>{post.title}</Link>
                  </h5>
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
    </div>
  )
}

export default Home
