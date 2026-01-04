require("dotenv").config();
const bcrypt = require("bcryptjs");
const { Pool } = require("pg");

// PostgreSQL connection configuration
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
});

async function createDefaultAdminUser() {
  try {
    const username = "admin";
    const password = "password";

    console.log("=== Creating Default Admin User ===\n");
    console.log(`Username: ${username}`);
    console.log(`Password: ${password}\n`);

    // Check if username already exists
    const existingUser = await pool.query(
      "SELECT id FROM users WHERE username = $1",
      [username],
    );

    if (existingUser.rows.length > 0) {
      console.log("✅ Admin user already exists. Skipping creation.");
      return;
    }

    console.log("Creating admin user...");

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert user into database
    const result = await pool.query(
      "INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING id, username, created_at",
      [username, hashedPassword],
    );

    console.log("\n✅ Default admin user created successfully!");
    console.log(`User ID: ${result.rows[0].id}`);
    console.log(`Username: ${result.rows[0].username}`);
    console.log(`Created at: ${result.rows[0].created_at}`);
    console.log("\n⚠️  WARNING: Please change the default password after first login!");
  } catch (error) {
    console.error("\n❌ Error creating admin user:", error.message);

    if (error.code === "ECONNREFUSED") {
      console.log(
        "Make sure your database is running and the connection details are correct.",
      );
    } else if (error.code === "42P01") {
      console.log(
        "Users table does not exist. Please run the database migration first.",
      );
    }
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run the script
createDefaultAdminUser();
