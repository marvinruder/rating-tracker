process.env = {
  ...process.env,
  DATABASE_URL: `postgresql://postgres:postgres@${process.env.POSTGRES_HOST ?? "postgres-test"}:5432/postgres`,
  NODE_ENV: "test",
  DOMAIN: "example.com",
  SUBDOMAIN: "subdomain",
  PORT: "30001",
  SIGNAL_URL: "http://nonexisting.signal.api.host",
  SIGNAL_SENDER: "+493012345678",
};
