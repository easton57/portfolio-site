require("dotenv").config();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Pool } = require("pg");

// PostgreSQL connection configuration
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
});

const JWT_SECRET = process.env.JWT_SECRET;

async function runTests() {
  console.log("=== Authentication System Test ===\n");

  try {
    // Test 1: Database connection
    console.log("1. Testing database connection...");
    await pool.query("SELECT NOW()");
    console.log("   ✅ Database connection successful\n");

    // Test 2: Check if users table exists
    console.log("2. Checking users table...");
    const tableCheck = await pool.query(
      "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users')",
    );
    if (tableCheck.rows[0].exists) {
      console.log("   ✅ Users table exists");

      // Check table structure
      const columns = await pool.query(
        "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'users'",
      );
      console.log(
        "   Table columns:",
        columns.rows.map((row) => `${row.column_name} (${row.data_type})`),
      );
    } else {
      console.log("   ❌ Users table does not exist");
      console.log(
        "   Run: psql -d your_database -f SQL/create_tables_with_ids.sql",
      );
    }
    console.log();

    // Test 3: Check JWT secret
    console.log("3. Checking JWT configuration...");
    if (JWT_SECRET && JWT_SECRET.length >= 32) {
      console.log("   ✅ JWT_SECRET is configured and appears secure");
    } else if (JWT_SECRET) {
      console.log("   ⚠️  JWT_SECRET is configured but may be too short");
      console.log("   Consider using a longer secret (64+ characters)");
    } else {
      console.log("   ❌ JWT_SECRET is not configured");
      console.log("   Add JWT_SECRET to your .env file");
    }
    console.log();

    // Test 4: Check for existing users
    console.log("4. Checking existing users...");
    const userCount = await pool.query("SELECT COUNT(*) FROM users");
    const count = parseInt(userCount.rows[0].count);

    if (count > 0) {
      console.log(`   ✅ Found ${count} user(s) in database`);
      const users = await pool.query(
        "SELECT id, username, created_at FROM users ORDER BY created_at",
      );
      users.rows.forEach((user) => {
        console.log(
          `   - ID: ${user.id}, Username: ${user.username}, Created: ${user.created_at}`,
        );
      });
    } else {
      console.log("   ⚠️  No users found in database");
      console.log("   Run: node create-admin.js to create an admin user");
    }
    console.log();

    // Test 5: Password hashing test
    console.log("5. Testing password hashing...");
    const testPassword = "test123456";
    const hashedPassword = await bcrypt.hash(testPassword, 12);
    const isValid = await bcrypt.compare(testPassword, hashedPassword);

    if (isValid) {
      console.log("   ✅ Password hashing and verification working correctly");
    } else {
      console.log("   ❌ Password hashing verification failed");
    }
    console.log();

    // Test 6: JWT token generation and verification
    console.log("6. Testing JWT token handling...");
    if (JWT_SECRET) {
      const testPayload = { userId: 1, username: "test" };
      const token = jwt.sign(testPayload, JWT_SECRET, { expiresIn: "1h" });

      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        if (
          decoded.userId === testPayload.userId &&
          decoded.username === testPayload.username
        ) {
          console.log(
            "   ✅ JWT token generation and verification working correctly",
          );
        } else {
          console.log("   ❌ JWT token payload verification failed");
        }
      } catch (error) {
        console.log("   ❌ JWT token verification failed:", error.message);
      }
    } else {
      console.log("   ⚠️  Skipping JWT test - no JWT_SECRET configured");
    }
    console.log();

    // Test 7: Environment variables check
    console.log("7. Checking required environment variables...");
    const requiredVars = [
      "DB_USER",
      "DB_HOST",
      "DB_NAME",
      "DB_PASSWORD",
      "JWT_SECRET",
    ];
    let allPresent = true;

    requiredVars.forEach((varName) => {
      if (process.env[varName]) {
        console.log(`   ✅ ${varName} is configured`);
      } else {
        console.log(`   ❌ ${varName} is missing`);
        allPresent = false;
      }
    });

    if (allPresent) {
      console.log("   ✅ All required environment variables are present");
    } else {
      console.log("   ⚠️  Some environment variables are missing");
    }
    console.log();

    console.log("=== Test Summary ===");
    console.log(
      "If all tests passed, your authentication system should be ready to use!",
    );
    console.log(
      "If any tests failed, please address the issues before proceeding.",
    );
  } catch (error) {
    console.error("❌ Test failed with error:", error.message);

    if (error.code === "ECONNREFUSED") {
      console.log(
        "Database connection refused. Make sure PostgreSQL is running.",
      );
    } else if (error.code === "42P01") {
      console.log("Table does not exist. Run the database migration first.");
    }
  } finally {
    await pool.end();
  }
}

// Handle graceful shutdown
process.on("SIGINT", async () => {
  console.log("\n\nTest interrupted by user.");
  await pool.end();
  process.exit(0);
});

// Run the tests
runTests();
