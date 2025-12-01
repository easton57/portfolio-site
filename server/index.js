require("dotenv").config();
const express = require("express");
const fetch = require("node-fetch");
const { Pool } = require("pg");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");
const multer = require("multer");

const app = express();
const port = process.env.PORT || 3000;

// Enable CORS
app.use(cors());
app.use(express.json()); // Add middleware to parse JSON requests

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const publicDir = path.join(__dirname, 'public');
    const uploadDir = path.join(publicDir, 'uploads');
    try {
      // Create public directory if it doesn't exist
      if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir, { recursive: true });
        console.log('Created public directory:', publicDir);
      }
      // Create uploads directory if it doesn't exist
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
        console.log('Created uploads directory:', uploadDir);
      }
      cb(null, uploadDir);
    } catch (error) {
      console.error('Error creating uploads directory:', error);
      cb(error, null);
    }
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check if file is an image
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// PostgreSQL connection configuration
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
});

// JWT configuration
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error("JWT_SECRET environment variable is required");
  process.exit(1);
}

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Invalid or expired token" });
    }
    req.user = user;
    next();
  });
};

// Authentication endpoints
app.post("/api/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Username and password are required",
      });
    }

    // Get user from database
    const result = await pool.query(
      "SELECT id, username, password_hash FROM users WHERE username = $1",
      [username],
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const user = result.rows[0];

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: "24h" },
    );

    res.json({
      success: true,
      token: token,
      message: "Login successful",
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

app.post("/api/verify-token", authenticateToken, (req, res) => {
  // If we get here, the token is valid (middleware verified it)
  res.json({
    valid: true,
    user: {
      userId: req.user.userId,
      username: req.user.username,
    },
  });
});

app.post("/api/logout", (req, res) => {
  // With JWT, logout is handled client-side by removing the token
  res.json({ success: true, message: "Logged out successfully" });
});

// API endpoint to get recent blog posts
app.get("/api/recent-posts", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, title, summary, excerpt, created_at FROM blog_posts ORDER BY created_at DESC LIMIT 5",
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching blog posts:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/api/all-posts", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, title, summary, excerpt, created_at FROM blog_posts ORDER BY created_at DESC",
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching all posts:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET endpoint to fetch a specific blog post by ID
app.get("/api/blog/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "SELECT id, title, summary, excerpt, created_at FROM blog_posts WHERE id = $1",
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Blog post not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching blog post:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST endpoint to create a new blog post (protected)
app.post("/api/blogs", authenticateToken, async (req, res) => {
  try {
    const { title, summary, excerpt } = req.body;

    // Validate required fields
    if (!title || !summary || !excerpt) {
      return res
        .status(400)
        .json({ error: "Title, summary, and excerpt are required" });
    }

    const result = await pool.query(
      "INSERT INTO blog_posts (title, summary, excerpt) VALUES ($1, $2, $3) RETURNING *",
      [title, summary, excerpt],
    );

    // Generate RSS feed after successful post creation
    await generateRSSFeed();

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error creating blog post:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PUT endpoint to update a blog post (protected)
app.put("/api/blogs/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, summary, excerpt } = req.body;

    // Validate required fields
    if (!title || !summary || !excerpt) {
      return res
        .status(400)
        .json({ error: "Title, summary, and excerpt are required" });
    }

    const result = await pool.query(
      "UPDATE blog_posts SET title = $1, summary = $2, excerpt = $3 WHERE id = $4 RETURNING *",
      [title, summary, excerpt, id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Blog post not found" });
    }

    // Generate RSS feed after successful post creation
    await generateRSSFeed();

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error updating blog post:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Function to generate RSS feed from all blog posts
async function generateRSSFeed() {
  try {
    const result = await pool.query(
      "SELECT id, title, summary, excerpt, created_at FROM blog_posts ORDER BY created_at DESC",
    );
    const posts = result.rows;
    const siteUrl = process.env.SITE_URL || "https://eastonseidel.com";
    const rssItems = posts
      .map(
        (post) => `    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${siteUrl}/blog-post?id=${post.id}</link>
      <description><![CDATA[${post.summary || post.excerpt}]]></description>
      <pubDate>${new Date(post.created_at).toUTCString()}</pubDate>
      <guid>${siteUrl}/blog-post?id=${post.id}</guid>
    </item>`,
      )
      .join("\n");
    const rss = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Easton Seidel Blog</title>
    <atom:link href="${siteUrl}/rss/blog-feed.xml" rel="self" type="application/rss+xml" />
    <link>${siteUrl}</link>
    <description>Latest blog posts from Easton Seidel</description>
    <language>en-us</language>
${rssItems}
  </channel>
</rss>`;
    const rssPath = path.join(__dirname, "./public/rss/blog-feed.xml");
    fs.mkdirSync(path.dirname(rssPath), { recursive: true });
    fs.writeFileSync(rssPath, rss, "utf8");
  } catch (err) {
    console.error("Error generating RSS feed:", err);
  }
}

// API endpoint to serve RSS feed
app.get("/rss/blog-feed.xml", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, title, summary, excerpt, created_at FROM blog_posts ORDER BY created_at DESC",
    );
    const posts = result.rows;
    const siteUrl = process.env.SITE_URL || "https://eastonseidel.com";
    const rssItems = posts
      .map(
        (post) => `    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${siteUrl}/blog-post?id=${post.id}</link>
      <description><![CDATA[${post.summary || post.excerpt}]]></description>
      <pubDate>${new Date(post.created_at).toUTCString()}</pubDate>
      <guid>${siteUrl}/blog-post?id=${post.id}</guid>
    </item>`,
      )
      .join("\n");
    const rss = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Easton Seidel Blog</title>
    <atom:link href="${siteUrl}/rss/blog-feed.xml" rel="self" type="application/rss+xml" />
    <link>${siteUrl}</link>
    <description>Latest blog posts from Easton Seidel</description>
    <language>en-us</language>
${rssItems}
  </channel>
</rss>`;
    
    res.setHeader('Content-Type', 'application/rss+xml');
    res.send(rss);
  } catch (err) {
    console.error("Error serving RSS feed:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// reCAPTCHA verification configuration
const recaptchaConfig = {
  secretKey: process.env.RECAPTCHA_SECRET_KEY,
  verifyUrl: process.env.RECAPTCHA_VERIFY_URL,
};

// Contact form endpoint using EmailJS REST API
app.post("/api/contact", async (req, res) => {
  const { from_name, from_email, message, recaptchaResponse } = req.body;
  if (!from_name || !from_email || !message || !recaptchaResponse) {
    return res
      .status(400)
      .json({ error: "Name, email, message, and reCAPTCHA are required." });
  }

  // Verify reCAPTCHA first
  try {
    const verifyResponse = await fetch(recaptchaConfig.verifyUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `secret=${recaptchaConfig.secretKey}&response=${recaptchaResponse}`,
    });
    const verifyData = await verifyResponse.json();

    if (!verifyData.success) {
      return res.status(400).json({ error: "reCAPTCHA verification failed." });
    }
  } catch (err) {
    return res.status(500).json({ error: "reCAPTCHA verification error." });
  }

  try {
    const response = await fetch(
      "https://api.emailjs.com/api/v1.0/email/send",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service_id: process.env.EMAILJS_SERVICE_ID,
          template_id: process.env.EMAILJS_TEMPLATE_ID,
          user_id: process.env.EMAILJS_PUBLIC_KEY,
          accessToken: process.env.EMAILJS_PRIVATE_KEY,
          template_params: {
            from_name,
            from_email,
            message,
          },
        }),
      },
    );
    if (response.ok) {
      res.status(200).json({ success: true });
    } else {
      const error = await response.text();
      console.error("EmailJS error:", error);
      res.status(500).json({ error: "Failed to send email." });
    }
  } catch (err) {
    console.error("Error sending contact email:", err);
    res.status(500).json({ error: "Failed to send email." });
  }
});

// Image upload endpoint
app.post('/api/upload-image', authenticateToken, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    console.log('Image uploaded successfully:', req.file.filename);
    console.log('File saved to:', req.file.path);

    // Return the URL where the image can be accessed
    const imageUrl = `/uploads/${req.file.filename}`;
    res.json({ 
      success: true, 
      imageUrl: imageUrl,
      filename: req.file.filename 
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

// Error handling middleware for multer
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    console.error('Multer error:', error);
    return res.status(400).json({ error: `Upload error: ${error.message}` });
  } else if (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ error: 'Failed to upload image' });
  }
  next();
});

// API endpoint to get available images
app.get('/api/available-images', async (req, res) => {
  try {
    const images = [];
    
    // Get images from src/img directory (static assets)
    const srcImgPath = path.join(__dirname, '..', 'src', 'img');
    if (fs.existsSync(srcImgPath)) {
      try {
        const srcImgFiles = fs.readdirSync(srcImgPath)
          .filter(file => /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(file))
          .map(file => ({
            name: file,
            url: `/src/img/${file}`,
            type: 'static',
            path: path.join(srcImgPath, file)
          }));
        images.push(...srcImgFiles);
      } catch (err) {
        console.log('Could not read src/img directory:', err.message);
      }
    } else {
      console.log('src/img directory does not exist');
    }
    
    // Get images from uploads directory
    const uploadsPath = path.join(__dirname, 'public', 'uploads');
    if (fs.existsSync(uploadsPath)) {
      try {
        const uploadFiles = fs.readdirSync(uploadsPath)
          .filter(file => /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(file))
          .map(file => ({
            name: file,
            url: `/uploads/${file}`,
            type: 'uploaded',
            path: path.join(uploadsPath, file)
          }));
        images.push(...uploadFiles);
      } catch (err) {
        console.log('Could not read uploads directory:', err.message);
      }
    } else {
      console.log('uploads directory does not exist');
    }
    
    // Sort images by name
    images.sort((a, b) => a.name.localeCompare(b.name));
    
    res.json(images);
  } catch (error) {
    console.error('Error fetching available images:', error);
    res.status(500).json({ error: 'Failed to fetch available images' });
  }
});

// Serve uploaded images statically
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

// Serve static images from src/img
app.use('/src/img', express.static(path.join(__dirname, '..', 'src', 'img')));

// Comments API endpoints

// POST endpoint to create a new comment (public)
app.post("/api/comments", async (req, res) => {
  try {
    const { blog_post_id, author_name, author_email, content } = req.body;

    // Validate required fields
    if (!blog_post_id || !author_name || !content) {
      return res
        .status(400)
        .json({ error: "Blog post ID, author name, and content are required" });
    }

    // Verify that the blog post exists
    const postCheck = await pool.query(
      "SELECT id FROM blog_posts WHERE id = $1",
      [blog_post_id]
    );

    if (postCheck.rows.length === 0) {
      return res.status(404).json({ error: "Blog post not found" });
    }

    // Insert comment (defaults to approved = false)
    const result = await pool.query(
      "INSERT INTO comments (blog_post_id, author_name, author_email, content) VALUES ($1, $2, $3, $4) RETURNING *",
      [blog_post_id, author_name, author_email || null, content]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error creating comment:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET endpoint to fetch approved comments for a specific blog post (public)
app.get("/api/comments/:postId", async (req, res) => {
  try {
    const { postId } = req.params;
    const result = await pool.query(
      "SELECT id, blog_post_id, author_name, author_email, content, created_at FROM comments WHERE blog_post_id = $1 AND approved = true ORDER BY created_at ASC",
      [postId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching comments:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET endpoint to fetch all comments for admin (protected)
app.get("/api/admin/comments", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT c.*, bp.title as blog_post_title 
       FROM comments c 
       LEFT JOIN blog_posts bp ON c.blog_post_id = bp.id 
       ORDER BY c.created_at DESC`
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching comments for admin:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PUT endpoint to approve a comment (protected)
app.put("/api/admin/comments/:id/approve", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "UPDATE comments SET approved = true WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Comment not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error approving comment:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE endpoint to delete a comment (protected)
app.delete("/api/admin/comments/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "DELETE FROM comments WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Comment not found" });
    }

    res.json({ success: true, message: "Comment deleted successfully" });
  } catch (err) {
    console.error("Error deleting comment:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(port, async () => {
  console.log(`Server running on port ${port}`);
  // Generate RSS feed on startup
  await generateRSSFeed();
  console.log("RSS feed generated");
});
