require("dotenv").config();
const express = require("express");
const fetch = require("node-fetch");
const { Pool } = require("pg");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");

const app = express();
const port = process.env.PORT || 3000;

// Enable CORS
app.use(cors());
app.use(express.json()); // Add middleware to parse JSON requests

// Serve static files
app.use('/CSS', express.static(path.join(__dirname, '../CSS')));
app.use('/IMG', express.static(path.join(__dirname, '../IMG')));
app.use('/public', express.static(path.join(__dirname, '../public')));
app.use('/', express.static(path.join(__dirname, '../HTML')));

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
      "SELECT id, title, summary, excerpt, created_at FROM blog_posts ORDER BY created_at DESC"
    );
    const posts = result.rows;
    const siteUrl = process.env.SITE_URL || "https://eastonseidel.com";
    const rssItems = posts
      .map(
        (post) => `    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${siteUrl}/blog/${post.id}</link>
      <description><![CDATA[${post.summary || post.excerpt}]]></description>
      <pubDate>${new Date(post.created_at).toUTCString()}</pubDate>
      <guid>${siteUrl}/blog/${post.id}</guid>
    </item>`
      )
      .join("\n");
    const rss = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
  <channel>
    <title>Easton Seidel Blog</title>
    <link>${siteUrl}</link>
    <description>Latest blog posts from Easton Seidel</description>
    <language>en-us</language>
${rssItems}
  </channel>
</rss>`;
    const rssPath = path.join(__dirname, "../public/rss.xml");
    fs.mkdirSync(path.dirname(rssPath), { recursive: true });
    fs.writeFileSync(rssPath, rss, "utf8");
  } catch (err) {
    console.error("Error generating RSS feed:", err);
  }
}

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

// Serve static files from public directory (for RSS)
app.use(express.static(path.join(__dirname, "../public")));

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
