import React from 'react'
import { Link } from 'react-router-dom'

function Layout({ children }) {
  return (
    <div className="content">
      <Link to="/"><h1>Easton Seidel</h1></Link>
      
      <nav className="navbar">
        <ul>
          <li><Link to="/about">About</Link></li>
          <li><Link to="/blog">Blog</Link></li>
        </ul>
      </nav>

      {children}

      <div className="footer">
        <table>
          <tr>
            <td><p>Copyright 2025 Easton Seidel</p></td>
            <td><a href="/rss/blog-feed.xml">RSS Feed</a></td>
          </tr>
        </table>
      </div>
    </div>
  )
}

export default Layout
