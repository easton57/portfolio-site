require("dotenv").config();
const bcrypt = require("bcryptjs");
const { Pool } = require("pg");
const readline = require("readline");

// PostgreSQL connection configuration
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
});

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Function to ask questions
function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

// Function to ask for password (hidden input)
function askPassword(question) {
  return new Promise((resolve) => {
    process.stdout.write(question);
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.setEncoding("utf8");

    let password = "";

    process.stdin.on("data", function (char) {
      char = char + "";

      switch (char) {
        case "\n":
        case "\r":
        case "\u0004":
          // Enter key pressed
          process.stdin.setRawMode(false);
          process.stdin.pause();
          process.stdout.write("\n");
          resolve(password);
          break;
        case "\u0003":
          // Ctrl+C
          process.exit();
          break;
        case "\u007f":
          // Backspace
          if (password.length > 0) {
            password = password.slice(0, -1);
            process.stdout.write("\b \b");
          }
          break;
        default:
          // Any other character
          password += char;
          process.stdout.write("*");
          break;
      }
    });
  });
}

async function createAdminUser() {
  try {
    console.log("=== Admin User Creation ===\n");

    // Get username
    const username = await askQuestion("Enter admin username: ");
    if (!username || username.trim().length === 0) {
      console.log("Username cannot be empty.");
      return;
    }

    // Check if username already exists
    const existingUser = await pool.query(
      "SELECT id FROM users WHERE username = $1",
      [username.trim()],
    );

    if (existingUser.rows.length > 0) {
      console.log(
        "Username already exists. Please choose a different username.",
      );
      return;
    }

    // Get password
    const password = await askPassword("Enter admin password: ");
    if (!password || password.length < 6) {
      console.log("\nPassword must be at least 6 characters long.");
      return;
    }

    // Confirm password
    const confirmPassword = await askPassword("Confirm admin password: ");
    if (password !== confirmPassword) {
      console.log("\nPasswords do not match.");
      return;
    }

    console.log("\nCreating admin user...");

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert user into database
    const result = await pool.query(
      "INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING id, username, created_at",
      [username.trim(), hashedPassword],
    );

    console.log("\n✅ Admin user created successfully!");
    console.log(`User ID: ${result.rows[0].id}`);
    console.log(`Username: ${result.rows[0].username}`);
    console.log(`Created at: ${result.rows[0].created_at}`);
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
  } finally {
    rl.close();
    await pool.end();
  }
}

// Handle graceful shutdown
process.on("SIGINT", async () => {
  console.log("\n\nOperation cancelled by user.");
  rl.close();
  await pool.end();
  process.exit(0);
});

// Run the script
createAdminUser();
