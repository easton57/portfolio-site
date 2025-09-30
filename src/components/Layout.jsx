import React from 'react'
import { Link } from 'react-router-dom'

function Layout({ children }) {
  return (
    <div className="w-3/4 p-5 flex flex-col box-border mx-auto">
      <Link to="/"><h1 className="text-white text-3xl font-bold mb-5">Easton Seidel</h1></Link>
      
      <nav className="my-5 border-b border-white pb-2.5 w-full">
        <ul className="list-none p-0 m-0 flex gap-5">
          <li className="p-0"><Link to="/about" className="font-bold text-white hover:text-gray-300">About</Link></li>
          <li className="p-0"><Link to="/blog" className="font-bold text-white hover:text-gray-300">Blog</Link></li>
        </ul>
      </nav>

      {children}

      <div className="mt-10 text-center text-gray-500 text-sm w-full relative clear-both">
        <table className="mx-auto items-center">
          <tbody>
          <tr>
            <td className="text-center px-2.5"><p className="m-0">Copyright 2025 Easton Seidel</p></td>
            <td className="text-center px-2.5"><a href="/rss/blog-feed.xml" className="text-white hover:text-gray-300">RSS Feed</a></td>
          </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Layout
