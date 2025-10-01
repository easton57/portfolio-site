services:
  # React front end
  app_test:
    container_name: test-portfolio_app
    build: 
      context: ../
      target: development
    command: npm start
    networks:
      - internal
    ports:
      - "3080:3080"
    stdin_open: true
    volumes '../node_modules'

  # Node.js Application
  server_test:
    build: ../server
    container_name: test-portfolio_server
    restart: unless-stopped
    user: root
    environment:
      NODE_ENV: production
      PORT: 3001
      DB_HOST: postgres
      DB_PORT: 5432
      DB_NAME: ${DB_NAME:-portfolio}
      DB_USER: ${DB_USER:-portfolio_user}
      DB_PASSWORD: ${DB_PASSWORD}
      JWT_SECRET: ${JWT_SECRET}
      RECAPTCHA_SECRET_KEY: ${RECAPTCHA_SECRET_KEY}
      RECAPTCHA_VERIFY_URL: ${RECAPTCHA_VERIFY_URL}
      EMAILJS_SERVICE_ID: ${EMAILJS_SERVICE_ID}
      EMAILJS_TEMPLATE_ID: ${EMAILJS_TEMPLATE_ID}
      EMAILJS_PUBLIC_KEY: ${EMAILJS_PUBLIC_KEY}
      EMAILJS_PRIVATE_KEY: ${EMAILJS_PRIVATE_KEY}
    networks:
      - internal
      - npm_network
    ports:
      - "3001:3000"
    volumes:
      - ./server/public:/usr/src/app/public:ro
      - ./server/public/rss:/usr/src/app/public/rss:rw

volumes:
  postgres_data:
    driver: local
  npm_data:
    driver: local
  npm_letsencrypt:
    driver: local

networks:
  internal:
    driver: bridge
    internal: true
  npm_network:
    driver: bridge
    external: true
