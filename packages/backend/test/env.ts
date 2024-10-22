// @ts-ignore
process.env = {
  ...process.env,
  DATABASE_URL: `postgresql://postgres:postgres@${process.env.POSTGRES_HOST ?? "postgres-test"}:5432/postgres`,
  NODE_ENV: "test",
  DOMAIN: "example.com",
  SUBDOMAIN: "subdomain",
  PORT: 30001,
  TRUSTWORTHY_PROXY_COUNT: 1,
  LOG_FILE: "/dev/null",
  SIGNAL_URL: "http://signal",
  SIGNAL_SENDER: "+493012345678",
  SMTP_HOST: "localhost",
  SMTP_PORT: 587,
  SMTP_SECURITY: "tls",
  SMTP_USER: "ratingtracker",
  SMTP_PASSWORD: "ratingtracker",
  SMTP_FROM: "ratingtracker@example.com",
};
