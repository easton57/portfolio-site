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
    <div className="w-full">
      <div className="flex gap-5 my-5 w-full box-border">
        <div className="max-w-md mx-auto my-12 bg-[#2d2d2d] p-10 rounded-md shadow-lg">
        <div className="text-center mb-8">
          <h2 className="text-white m-0 mb-2.5 text-2xl">Admin Login</h2>
          <p className="text-gray-300 m-0">Please enter your credentials to access the admin panel</p>
        </div>

        <form id="loginForm" onSubmit={handleSubmit}>
          <div className="mb-5">
            <label htmlFor="username" className="block mb-1 font-bold text-white">Username:</label>
            <input 
              type="text" 
              id="username" 
              name="username" 
              required 
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-3 border border-gray-600 rounded bg-[#2d2d2d] text-white font-sans box-border text-base focus:outline-none focus:border-white focus:shadow-[0_0_5px_rgba(255,255,255,0.3)]"
            />
          </div>

          <div className="mb-5">
            <label htmlFor="password" className="block mb-1 font-bold text-white">Password:</label>
            <input 
              type="password" 
              id="password" 
              name="password" 
              required 
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-gray-600 rounded bg-[#2d2d2d] text-white font-sans box-border text-base focus:outline-none focus:border-white focus:shadow-[0_0_5px_rgba(255,255,255,0.3)]"
            />
          </div>

          <button 
            type="submit" 
            className="w-full bg-white text-gray-900 p-3 border-none rounded cursor-pointer font-bold text-base mt-2.5 transition-colors duration-300 hover:bg-gray-300 disabled:bg-gray-600 disabled:cursor-not-allowed" 
            id="loginBtn"
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {errorMessage && (
          <div id="errorMessage" className="bg-red-800 text-white p-2.5 rounded mt-4 text-center font-bold block">
            {errorMessage}
          </div>
        )}

        <div className="text-center mt-5">
          <a href="/" className="text-white no-underline text-sm hover:underline">← Back to Home</a>
        </div>
      </div>
    </div>
    </div>
  )
}

export default Login
