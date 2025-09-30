import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('new')
  const navigate = useNavigate()

  useEffect(() => {
    checkAuthentication()
  }, [])

  const checkAuthentication = async () => {
    const token = localStorage.getItem('authToken')
    if (!token) {
      navigate('/login')
      return
    }

    try {
      const response = await fetch('/api/verify-token', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()
      if (data.valid) {
        setIsAuthenticated(true)
      } else {
        localStorage.removeItem('authToken')
        navigate('/login')
      }
    } catch (error) {
      console.error('Authentication check failed:', error)
      localStorage.removeItem('authToken')
      navigate('/login')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('authToken')
    navigate('/login')
  }

  if (isLoading) {
    return (
      <div id="authOverlay" className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-80 flex justify-center items-center z-[1000]">
        <div className="bg-[#2d2d2d] p-10 rounded-md text-center text-white">
          <div className="loading-spinner"></div>
          <h3 className="m-0 mb-5 text-xl">Checking authentication...</h3>
          <p className="m-0 mb-5 text-gray-300">Please wait while we verify your access.</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="w-full">
      <div className="flex gap-5 my-5 w-full box-border admin-content" id="adminContent">
        <div className="bg-[#2d2d2d] p-5 rounded-md flex-[0_0_100%] min-w-0 box-border">
        <div className="text-center mb-8">
          <h2 className="text-white m-0 text-2xl">Admin Panel</h2>
          <p className="text-gray-300 mb-4">Manage blog posts</p>
          <button className="bg-red-800 text-white px-4 py-2 border-none rounded cursor-pointer text-sm ml-5 hover:bg-red-700" id="logoutBtn" onClick={handleLogout}>
            Logout
          </button>
        </div>

        <div className="my-5">
          <div className="flex border-b-2 border-gray-600 mb-5">
            <button 
              className={`bg-[#2d2d2d] text-gray-300 border-none px-6 py-3 cursor-pointer border-b-2 border-transparent text-base font-bold transition-all duration-300 hover:bg-gray-800 hover:text-white ${activeTab === 'new' ? 'bg-gray-800 text-white border-b-2 border-white' : ''}`}
              onClick={() => setActiveTab('new')}
            >
              New
            </button>
            <button 
              className={`bg-[#2d2d2d] text-gray-300 border-none px-6 py-3 cursor-pointer border-b-2 border-transparent text-base font-bold transition-all duration-300 hover:bg-gray-800 hover:text-white ${activeTab === 'edit' ? 'bg-gray-800 text-white border-b-2 border-white' : ''}`}
              onClick={() => setActiveTab('edit')}
            >
              Edit
            </button>
          </div>

          {activeTab === 'new' && (
            <div id="newTab" className="block">
              <h3 className="text-white text-xl mb-4">Create New Blog Post</h3>
              <form id="newForm" className="bg-[#2d2d2d] p-8 rounded-md my-5">
                <div className="mb-5">
                  <label htmlFor="newTitle" className="block mb-1 font-bold text-white">Title:</label>
                  <input type="text" id="newTitle" name="title" required className="w-full p-2.5 border border-gray-600 rounded bg-[#2d2d2d] text-white font-sans box-border focus:outline-none focus:border-white" />
                </div>
                <div className="mb-5">
                  <label htmlFor="newSummary" className="block mb-1 font-bold text-white">Summary:</label>
                  <textarea id="newSummary" name="summary" required className="w-full p-2.5 border border-gray-600 rounded bg-[#2d2d2d] text-white font-sans box-border min-h-[200px] resize-y focus:outline-none focus:border-white"></textarea>
                </div>
                <div className="mb-5">
                  <label htmlFor="newExcerpt" className="block mb-1 font-bold text-white">Content:</label>
                  <textarea id="newExcerpt" name="excerpt" required className="w-full p-2.5 border border-gray-600 rounded bg-[#2d2d2d] text-white font-sans box-border min-h-[200px] resize-y focus:outline-none focus:border-white"></textarea>
                </div>
                <button type="submit" className="bg-white text-gray-900 px-6 py-3 border-none rounded cursor-pointer font-bold text-base hover:bg-gray-300 disabled:bg-gray-600 disabled:cursor-not-allowed">Create Post</button>
              </form>
            </div>
          )}

          {activeTab === 'edit' && (
            <div id="editTab" className="block">
              <h3 className="text-white text-xl mb-4">Edit Existing Blog Post</h3>
              <div className="mb-5">
                <label htmlFor="editContentSelect" className="block mb-1 font-bold text-white">Select Post to Edit:</label>
                <select id="editContentSelect" disabled className="w-full p-2.5 border border-gray-600 rounded bg-[#2d2d2d] text-white font-sans box-border focus:outline-none focus:border-white">
                  <option value="">Select an item...</option>
                </select>
              </div>
              <form id="editForm" style={{ display: 'none' }} className="bg-[#2d2d2d] p-8 rounded-md my-5">
                <input type="hidden" id="editItemId" />
                <input type="hidden" id="editItemType" />
                <div className="mb-5">
                  <label htmlFor="editTitle" className="block mb-1 font-bold text-white">Title:</label>
                  <input type="text" id="editTitle" name="title" required className="w-full p-2.5 border border-gray-600 rounded bg-[#2d2d2d] text-white font-sans box-border focus:outline-none focus:border-white" />
                </div>
                <div className="mb-5">
                  <label htmlFor="editSummary" className="block mb-1 font-bold text-white">Summary:</label>
                  <textarea id="editSummary" name="summary" required className="w-full p-2.5 border border-gray-600 rounded bg-[#2d2d2d] text-white font-sans box-border min-h-[200px] resize-y focus:outline-none focus:border-white"></textarea>
                </div>
                <div className="mb-5">
                  <label htmlFor="editExcerpt" className="block mb-1 font-bold text-white">Content:</label>
                  <textarea id="editExcerpt" name="excerpt" required className="w-full p-2.5 border border-gray-600 rounded bg-[#2d2d2d] text-white font-sans box-border min-h-[200px] resize-y focus:outline-none focus:border-white"></textarea>
                </div>
                <button type="submit" className="bg-white text-gray-900 px-6 py-3 border-none rounded cursor-pointer font-bold text-base hover:bg-gray-300 disabled:bg-gray-600 disabled:cursor-not-allowed">Update Post</button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
    </div>
  )
}

export default Admin
