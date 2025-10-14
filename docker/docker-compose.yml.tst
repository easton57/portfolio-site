services:
  # PostgreSQL Database (same as production)
  postgres:
    image: postgres:15-alpine
    container_name: test-portfolio_postgres
    restart: unless-stopped
    environment:
      POSTGRES_DB: ${DB_NAME:-portfolio_test}
      POSTGRES_USER: ${DB_USER:-portfolio_user}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_INITDB_ARGS: "--encoding=UTF-8 --lc-collate=C --lc-ctype=C"
    volumes:
      - postgres_test_data:/var/lib/postgresql/data
      - ./SQL:/docker-entrypoint-initdb.d
    networks:
      - internal
    healthcheck:
      test:
        [
          "CMD-SHELL",
          "pg_isready -U ${DB_USER:-portfolio_user} -d ${DB_NAME:-portfolio_test}",
        ]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  # React frontend (development mode)
  app_test:
    container_name: test-portfolio_app
    build: 
      context: ../
      dockerfile: docker/Dockerfile.dev
    command: npm run dev -- --host 0.0.0.0 --port 3080
    networks:
      - internal
    ports:
      - "3080:3080"
    stdin_open: true
    tty: true
    volumes:
      - ../src:/app/src:ro
      - ../public:/app/public:ro
      - ../index.html:/app/index.html:ro
      - ../vite.config.js:/app/vite.config.js:ro
      - ../img:/app/img:rw
      - /app/node_modules

  # Node.js Application (backend only)
  server_test:
    build: 
      context: ../
      dockerfile: docker/Dockerfile.server
    container_name: test-portfolio_server
    restart: unless-stopped
    user: root
    environment:
      NODE_ENV: development
      PORT: 3000
      DB_HOST: postgres
      DB_PORT: 5432
      DB_NAME: ${DB_NAME:-portfolio_test}
      DB_USER: ${DB_USER:-portfolio_user}
      DB_PASSWORD: ${DB_PASSWORD}
      JWT_SECRET: ${JWT_SECRET}
      RECAPTCHA_SECRET_KEY: ${RECAPTCHA_SECRET_KEY}
      RECAPTCHA_VERIFY_URL: ${RECAPTCHA_VERIFY_URL}
      EMAILJS_SERVICE_ID: ${EMAILJS_SERVICE_ID}
      EMAILJS_TEMPLATE_ID: ${EMAILJS_TEMPLATE_ID}
      EMAILJS_PUBLIC_KEY: ${EMAILJS_PUBLIC_KEY}
      EMAILJS_PRIVATE_KEY: ${EMAILJS_PRIVATE_KEY}
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - internal
    ports:
      - "3001:3000"
    volumes:
      - ../server:/usr/src/app:ro
      - ../server/public/rss:/usr/src/app/public/rss:rw

volumes:
  postgres_test_data:
    driver: local

networks:
  internal:
    driver: bridge
    internal: true
