import React from 'react'
import { Link } from 'react-router-dom'

function Layout({ children }) {
  return (
    <div className="w-full sm:w-3/4 p-3 sm:p-5 flex flex-col box-border mx-auto">
      <div className="mb-5">
        <Link to="/"><h1 className="text-[var(--color-text)] text-2xl sm:text-3xl font-bold m-0">Easton Seidel</h1></Link>
      </div>
      
      <nav className="my-5 border-b border-[var(--color-border)] pb-2.5 w-full">
        <ul className="list-none p-0 m-0 flex gap-3 sm:gap-5">
          <li className="p-0"><Link to="/about" className="font-bold text-[var(--color-text)] hover:opacity-70 text-sm sm:text-base transition-opacity">About</Link></li>
          <li className="p-0"><Link to="/blog" className="font-bold text-[var(--color-text)] hover:opacity-70 text-sm sm:text-base transition-opacity">Blog</Link></li>
        </ul>
      </nav>

      {children}

      <div className="mt-10 text-center text-[var(--color-textTertiary)] text-xs sm:text-sm w-full relative clear-both">
        <div className="flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-0">
          <p className="m-0">Copyright 2025 Easton Seidel</p>
          <span className="hidden sm:inline px-2">|</span>
          <a href="/rss/blog-feed.xml" className="text-[var(--color-text)] hover:opacity-70 transition-opacity">RSS Feed</a>
        </div>
      </div>
    </div>
  )
}

export default Layout
