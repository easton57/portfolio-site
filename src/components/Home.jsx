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
    <div className="w-full">
      <div className="flex gap-5 my-5 w-full box-border">
        <div className="bg-[#2d2d2d] p-5 rounded-md flex-[1.3] min-w-0 box-border">
        <img src="/img/me.jpg" alt="Easton Seidel" className="max-w-[200px] block h-auto float-left mr-5 mb-2.5 clear-left" />
        <p className="m-0 overflow-hidden inline text-white">
          I'm Easton Seidel. I'm a Systems Administrator and
          aspiring Software Engineer in Southern California.
        </p>
        <br />
        <br />
        <p className="m-0 overflow-hidden inline text-white">
          I'm passionate about technology and how it can increase
          efficiency and productivity. You can find examples of
          that on my
          <a href="https://github.com/easton57" className="text-white hover:text-gray-300">github</a> where I
          have my linux configuration and other projects.
        </p>
        <br />
        <br />
        <p className="m-0 overflow-hidden inline text-white">
          In my free time, I play the upright bass in Southern
          California Philharmonic and tinker with any electronics
          I can get my hands on.
        </p>
      </div>

      <div className="flex-[0.7] flex flex-col gap-5 min-w-0">
        <div className="bg-[#2d2d2d] p-5 rounded-md w-full box-border">
          <table className="w-full mx-auto">
            <tbody>
              <tr>
              <td className="text-center px-2.5">
                <a
                  href="https://www.linkedin.com/in/easton-seidel/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-white hover:text-gray-300"
                >
                  <img
                    src="/img/linkedin.png"
                    className="social-media-icon"
                    alt="LinkedIn"
                  />
                </a>
              </td>
              </tr>
              <tr>
              <td className="text-center px-2.5">
                <a
                  href="https://github.com/easton57"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-white hover:text-gray-300"
                >
                  <img
                    src="/img/github.png"
                    className="social-media-icon"
                    alt="GitHub"
                  />
                </a>
              </td>
              </tr>
              <tr>
              <td className="text-center px-2.5">
                <a
                  href="https://www.youtube.com/@eastonseidel5024"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-white hover:text-gray-300"
                >
                  <img
                    src="/img/youtube.png"
                    className="social-media-icon"
                    alt="YouTube"
                  />
                </a>
              </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="bg-[#2d2d2d] p-5 rounded-md w-full box-border">
          <h3 className="text-white text-lg font-bold mb-4">Recent Blog Posts</h3>
          <div id="blog-posts">
            {loading ? (
              <p className="text-gray-300">Loading posts...</p>
            ) : blogPosts.length > 0 ? (
              blogPosts.map((post) => (
                <div key={post.id} className="mb-5 pb-5 border-b border-gray-600 last:border-b-0 last:mb-0 last:pb-0">
                  <h5 className="m-0 mb-2.5 text-white">
                    <Link to={`/blog-post?id=${post.id}`} className="text-white no-underline hover:text-gray-300">{post.title}</Link>
                  </h5>
                  <p className="m-0 mb-2.5 text-gray-300">{post.summary}</p>
                  <small className="text-gray-500 text-xs">{new Date(post.created_at).toLocaleDateString()}</small>
                </div>
              ))
            ) : (
              <p className="text-gray-300">No posts available</p>
            )}
          </div>
        </div>
      </div>
    </div>
    </div>
  )
}

export default Home
