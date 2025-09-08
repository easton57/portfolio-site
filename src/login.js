document.getElementById('loginForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const loginBtn = document.getElementById('loginBtn');
    const errorMessage = document.getElementById('errorMessage');
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Hide previous error messages
    errorMessage.style.display = 'none';

    // Disable login button and show loading state
    loginBtn.disabled = true;
    loginBtn.textContent = 'Signing in...';

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
        });

        const data = await response.json();

        if (response.ok && data.success) {
            // Store the token
            localStorage.setItem('authToken', data.token);

            // Redirect to admin panel
            window.location.href = 'admin.html';
        } else {
            // Show error message
            errorMessage.textContent = data.message || 'Login failed. Please check your credentials.';
            errorMessage.style.display = 'block';
        }
    } catch (error) {
        console.error('Login error:', error);
        errorMessage.textContent = 'An error occurred. Please try again.';
        errorMessage.style.display = 'block';
    } finally {
        // Re-enable login button
        loginBtn.disabled = false;
        loginBtn.textContent = 'Sign In';
    }
});

// Check if user is already logged in
window.addEventListener('load', function () {
    const token = localStorage.getItem('authToken');
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
                    window.location.href = 'admin.html';
                } else {
                    // Remove invalid token
                    localStorage.removeItem('authToken');
                }
            })
            .catch(error => {
                console.error('Token verification error:', error);
                localStorage.removeItem('authToken');
            });
    }
});
