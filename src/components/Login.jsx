import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('authToken')
    if (token) {
      // Verify token is still valid
      fetch('/api/verify-token', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
        .then(response => response.json())
        .then(data => {
          if (data.valid) {
            // Redirect to admin panel if already logged in
            navigate('/admin')
          } else {
            // Remove invalid token
            localStorage.removeItem('authToken')
          }
        })
        .catch(error => {
          console.error('Token verification error:', error)
          localStorage.removeItem('authToken')
        })
    }
  }, [navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMessage('')

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username,
          password: password
        })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        // Store the token
        localStorage.setItem('authToken', data.token)
        // Redirect to admin panel
        navigate('/admin')
      } else {
        // Show error message
        setErrorMessage(data.message || 'Login failed. Please check your credentials.')
      }
    } catch (error) {
      console.error('Login error:', error)
      setErrorMessage('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="main-content full-width">
      <div className="login-container">
        <div className="login-header">
          <h2>Admin Login</h2>
          <p>Please enter your credentials to access the admin panel</p>
        </div>

        <form id="loginForm" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username:</label>
            <input 
              type="text" 
              id="username" 
              name="username" 
              required 
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password:</label>
            <input 
              type="password" 
              id="password" 
              name="password" 
              required 
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button 
            type="submit" 
            className="login-btn" 
            id="loginBtn"
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {errorMessage && (
          <div id="errorMessage" className="error-message">
            {errorMessage}
          </div>
        )}

        <div className="back-link">
          <a href="/">← Back to Home</a>
        </div>
      </div>
    </div>
  )
}

export default Login
