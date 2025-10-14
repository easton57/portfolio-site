# Docker Setup for Portfolio Site

This Docker setup uses a multi-stage build to create a containerized application with:
- **Frontend**: Vite-built static files served by the Node.js backend
- **Backend**: Node.js/Express server with PostgreSQL database
- **Proxy**: Nginx Proxy Manager for SSL termination and reverse proxy

## Environment Variables

### .env File Location
Place your `.env` file in the **project root directory** (same level as `package.json`):

```
/home/eseidel/Extra/Nextcloud/Code/Portfolio Site/eastonseidel.com/
├── .env                    ← Place your .env file here
├── package.json
├── server/
├── src/
├── docker/
│   ├── docker-compose.yml
│   └── Dockerfile
└── ...
```

### Required Environment Variables

Copy `docker/env.example` to `.env` in the project root and fill in your values:

```bash
# Database Configuration
DB_NAME=portfolio
DB_USER=portfolio_user
DB_PASSWORD=your_secure_database_password_here

# reCAPTCHA Configuration
RECAPTCHA_SECRET_KEY=your_recaptcha_secret_key_here
RECAPTCHA_VERIFY_URL=https://www.google.com/recaptcha/api/siteverify

# EmailJS Configuration
EMAILJS_SERVICE_ID=your_emailjs_service_id
EMAILJS_TEMPLATE_ID=your_emailjs_template_id
EMAILJS_PUBLIC_KEY=your_emailjs_public_key
EMAILJS_PRIVATE_KEY=your_emailjs_private_key

# JWT Secret for authentication (generate a secure random string)
JWT_SECRET=your_jwt_secret_key_here

# Optional: Customize these if needed
# PORT=3000
# DB_PORT=5432
```

## How It Works

### Multi-Stage Docker Build

1. **Frontend Stage**: 
   - Installs Vite and frontend dependencies
   - Builds the static frontend files using `npm run build`
   - Outputs to `/app/dist`

2. **Backend Stage**:
   - Installs Node.js backend dependencies
   - Copies the built frontend files to `/usr/src/app/public`
   - Sets up the Express server to serve both API endpoints and static files

### Services

- **postgres**: PostgreSQL 15 database
- **app**: Node.js application serving both API and frontend
- **npm**: Nginx Proxy Manager for SSL and reverse proxy

## Usage

### Build and Start
```bash
cd docker
docker-compose up --build
```

### Development
For development, you can run the frontend and backend separately:

```bash
# Terminal 1: Frontend (Vite dev server)
npm run dev

# Terminal 2: Backend (Node.js server)
cd server
npm install
node index.js
```

### Production
The Docker setup is optimized for production with:
- Multi-stage build for smaller image size
- Non-root user for security
- Health checks
- Proper volume mounts for persistent data

## File Structure in Container

```
/usr/src/app/
├── index.js              # Main server file
├── package.json          # Backend dependencies
├── public/               # Built frontend files (from Vite)
│   ├── index.html
│   ├── assets/
│   └── rss/              # RSS feed directory (mounted volume)
└── node_modules/         # Backend dependencies
```

## Environment Variable Access

Both the frontend build process and backend runtime have access to environment variables:

- **Backend**: Direct access via `process.env` (Node.js)
- **Frontend**: Environment variables are available during build time and can be accessed in your JavaScript code

The `.env` file in the project root is automatically loaded by the Docker build process and made available to both stages.
