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
      <div id="authOverlay" className="auth-overlay">
        <div className="auth-message">
          <div className="loading-spinner"></div>
          <h3>Checking authentication...</h3>
          <p>Please wait while we verify your access.</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="main-content full-width admin-content" id="adminContent">
      <div className="content-body">
        <div className="admin-header">
          <h2>Admin Panel</h2>
          <p>Manage blog posts</p>
          <button className="logout-btn" id="logoutBtn" onClick={handleLogout}>
            Logout
          </button>
        </div>

        <div className="tab-container">
          <div className="tab-buttons">
            <button 
              className={`tab-btn ${activeTab === 'new' ? 'active' : ''}`}
              onClick={() => setActiveTab('new')}
            >
              New
            </button>
            <button 
              className={`tab-btn ${activeTab === 'edit' ? 'active' : ''}`}
              onClick={() => setActiveTab('edit')}
            >
              Edit
            </button>
          </div>

          {activeTab === 'new' && (
            <div id="newTab" className="tab-content">
              <h3>Create New Blog Post</h3>
              <form id="newForm">
                <div className="form-group">
                  <label htmlFor="newTitle">Title:</label>
                  <input type="text" id="newTitle" name="title" required />
                </div>
                <div className="form-group">
                  <label htmlFor="newSummary">Summary:</label>
                  <textarea id="newSummary" name="summary" required></textarea>
                </div>
                <div className="form-group">
                  <label htmlFor="newExcerpt">Content:</label>
                  <textarea id="newExcerpt" name="excerpt" required></textarea>
                </div>
                <button type="submit" className="submit-btn">Create Post</button>
              </form>
            </div>
          )}

          {activeTab === 'edit' && (
            <div id="editTab" className="tab-content">
              <h3>Edit Existing Blog Post</h3>
              <div className="form-group">
                <label htmlFor="editContentSelect">Select Post to Edit:</label>
                <select id="editContentSelect" disabled>
                  <option value="">Select an item...</option>
                </select>
              </div>
              <form id="editForm" style={{ display: 'none' }}>
                <input type="hidden" id="editItemId" />
                <input type="hidden" id="editItemType" />
                <div className="form-group">
                  <label htmlFor="editTitle">Title:</label>
                  <input type="text" id="editTitle" name="title" required />
                </div>
                <div className="form-group">
                  <label htmlFor="editSummary">Summary:</label>
                  <textarea id="editSummary" name="summary" required></textarea>
                </div>
                <div className="form-group">
                  <label htmlFor="editExcerpt">Content:</label>
                  <textarea id="editExcerpt" name="excerpt" required></textarea>
                </div>
                <button type="submit" className="submit-btn">Update Post</button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Admin
