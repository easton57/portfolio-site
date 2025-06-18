require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const port = process.env.PORT || 3000;

// Enable CORS
app.use(cors());
app.use(express.json()); // Add middleware to parse JSON requests

// PostgreSQL connection configuration
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT || 5432,
});

// API endpoint to get recent blog posts
app.get('/api/recent-posts', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT id, title, summary, excerpt, created_at FROM blog_posts ORDER BY created_at DESC LIMIT 5'
        );
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching blog posts:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/projects', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT id, title, summary, excerpt, created_at FROM projects ORDER BY created_at DESC'
        );
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching projects:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/all-posts', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT id, title, summary, excerpt, created_at FROM blog_posts ORDER BY created_at DESC'
        );
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching all posts:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET endpoint to fetch a specific blog post by ID
app.get('/api/blog/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            'SELECT id, title, summary, excerpt, created_at FROM blog_posts WHERE id = $1',
            [id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Blog post not found' });
        }
        
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error fetching blog post:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET endpoint to fetch a specific project by ID
app.get('/api/project/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            'SELECT id, title, summary, excerpt, created_at FROM projects WHERE id = $1',
            [id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Project not found' });
        }
        
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error fetching project:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST endpoint to create a new blog post
app.post('/api/blogs', async (req, res) => {
    try {
        const { title, summary, excerpt } = req.body;
        
        // Validate required fields
        if (!title || !summary || !excerpt) {
            return res.status(400).json({ error: 'Title, summary, and excerpt are required' });
        }
        
        const result = await pool.query(
            'INSERT INTO blog_posts (title, summary, excerpt) VALUES ($1, $2, $3) RETURNING *',
            [title, summary, excerpt]
        );
        
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error creating blog post:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST endpoint to create a new project
app.post('/api/projects', async (req, res) => {
    try {
        const { title, summary, excerpt } = req.body;
        
        // Validate required fields
        if (!title || !summary || !excerpt) {
            return res.status(400).json({ error: 'Title, summary, and excerpt are required' });
        }
        
        const result = await pool.query(
            'INSERT INTO projects (title, summary, excerpt) VALUES ($1, $2, $3) RETURNING *',
            [title, summary, excerpt]
        );
        
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error creating project:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// reCAPTCHA verification configuration
const recaptchaConfig = {
    secretKey: process.env.RECAPTCHA_SECRET_KEY,
    verifyUrl: process.env.RECAPTCHA_VERIFY_URL
};

// API endpoint to verify reCAPTCHA
app.post('/api/recaptcha-verify', async (req, res) => {
    try {
        const { recaptchaResponse } = req.body;
        const response = await fetch(recaptchaConfig.verifyUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `secret=${recaptchaConfig.secretKey}&response=${recaptchaResponse}`
        });
        const data = await response.json();
        res.json(data.success);
    } catch (err) {
        res.json(false);
    }
});

// Contact form endpoint using EmailJS REST API
app.post('/api/contact', async (req, res) => {
    const { from_name, from_email, message } = req.body;
    if (!from_name || !from_email || !message) {
        return res.status(400).json({ error: 'Name, email, and message are required.' });
    }
    try {
        const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                service_id: process.env.EMAILJS_SERVICE_ID,
                template_id: process.env.EMAILJS_TEMPLATE_ID,
                user_id: process.env.EMAILJS_PUBLIC_KEY,
                template_params: {
                    from_name,
                    from_email,
                    message
                }
            })
        });
        if (response.ok) {
            res.status(200).json({ success: true });
        } else {
            const error = await response.text();
            console.error('EmailJS error:', error);
            res.status(500).json({ error: 'Failed to send email.' });
        }
    } catch (err) {
        console.error('Error sending contact email:', err);
        res.status(500).json({ error: 'Failed to send email.' });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
}); 