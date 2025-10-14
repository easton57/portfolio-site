import React from 'react'
import { Link } from 'react-router-dom'

function Layout({ children }) {
  return (
    <div className="w-full sm:w-3/4 p-3 sm:p-5 flex flex-col box-border mx-auto">
      <Link to="/"><h1 className="text-white text-2xl sm:text-3xl font-bold mb-5">Easton Seidel</h1></Link>
      
      <nav className="my-5 border-b border-white pb-2.5 w-full">
        <ul className="list-none p-0 m-0 flex gap-3 sm:gap-5">
          <li className="p-0"><Link to="/about" className="font-bold text-white hover:text-gray-300 text-sm sm:text-base">About</Link></li>
          <li className="p-0"><Link to="/blog" className="font-bold text-white hover:text-gray-300 text-sm sm:text-base">Blog</Link></li>
        </ul>
      </nav>

      {children}

      <div className="mt-10 text-center text-gray-500 text-xs sm:text-sm w-full relative clear-both">
        <div className="flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-0">
          <p className="m-0">Copyright 2025 Easton Seidel</p>
          <span className="hidden sm:inline px-2">|</span>
          <a href="/rss/blog-feed.xml" className="text-white hover:text-gray-300">RSS Feed</a>
        </div>
      </div>
    </div>
  )
}

export default Layout
