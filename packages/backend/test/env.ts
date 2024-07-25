process.env = {
  ...process.env,
  DATABASE_URL: `postgresql://rating-tracker-test:rating-tracker-test@${
    process.env.POSTGRES_HOST || "postgres-test"
  }:5432/rating-tracker-test`,
  NODE_ENV: "test",
  DOMAIN: "example.com",
  SUBDOMAIN: "subdomain",
  PORT: "30001",
  POSTGRES_USER: "rating-tracker-test",
  POSTGRES_PASS: "rating-tracker-test",
  SIGNAL_URL: "http://nonexisting.signal.api.host",
  SIGNAL_SENDER: "+493012345678",
};
