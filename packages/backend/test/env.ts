process.env = {
  ...process.env,
  DATABASE_URL: `postgresql://rating-tracker-test:rating-tracker-test@${
    process.env.POSTGRES_HOST || "postgres-test"
  }:5432/rating-tracker-test`,
  NODE_ENV: "test",
  DOMAIN: "example.com",
  SUBDOMAIN: "subdomain",
  PORT: "30001",
  REDIS_URL: `redis://${process.env.REDIS_HOST || "redis-test"}:6379`,
  REDIS_USER: "",
  REDIS_PASS: "",
  POSTGRES_USER: "rating-tracker-test",
  POSTGRES_PASS: "rating-tracker-test",
  // SELENIUM_URL: "unused in tests, but needs to be set",
  SIGNAL_URL: "http://nonexisting.signal.api.host",
  SIGNAL_SENDER: "+493012345678",
};
