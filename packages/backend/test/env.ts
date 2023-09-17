process.env = {
  ...process.env,
  DATABASE_URL:
    "postgresql://rating-tracker-test:rating-tracker-test@127.0.0.1:54321/rating-tracker-test?sslmode=disable",
  NODE_ENV: "test",
  DOMAIN: "example.com",
  SUBDOMAIN: "subdomain",
  PORT: "30001",
  REDIS_URL: "redis://127.0.0.1:63791",
  REDIS_USER: "",
  REDIS_PASS: "",
  POSTGRES_USER: "rating-tracker-test",
  POSTGRES_PASS: "rating-tracker-test",
  SELENIUM_URL: "unused",
  SIGNAL_URL: "unused",
  SIGNAL_SENDER: "+493012345678",
};
