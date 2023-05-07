[![License](https://img.shields.io/github/license/marvinruder/rating-tracker)](https://github.com/marvinruder/rating-tracker/blob/main/LICENSE)
[![Codacy Quality Badge](https://app.codacy.com/project/badge/Grade/6a7a7b68631a42ef88fc478a709141ea)](https://www.codacy.com/gh/marvinruder/rating-tracker/dashboard)
[![Codacy Coverage Badge](https://app.codacy.com/project/badge/Coverage/6a7a7b68631a42ef88fc478a709141ea)](https://www.codacy.com/gh/marvinruder/rating-tracker/dashboard)
[![Jenkins Badge](https://jenkins.mruder.dev/buildStatus/icon?job=rating-tracker-multibranch%2Fmain)](https://jenkins.mruder.dev/job/rating-tracker-multibranch)

---

<img style="height:48px;"/>
<p align="center">
  <img src="https://raw.githubusercontent.com/marvinruder/rating-tracker/main/packages/rating-tracker-frontend/public/assets/images/favicon/favicon-192.png" alt="Rating Tracker Logo" style="height:96px; width:96px;"/>
</p>

# Rating Tracker

A web service fetching and providing financial and ESG ratings for stocks.

## Features

#### Stock List with sorting and filtering

Stocks and their information are presented in a paginated table which offers comprehensive and in-depth sorting and filtering by many of the available attributes.

![Rating Tracker Stock List](https://raw.githubusercontent.com/marvinruder/rating-tracker/150-add-readmes/docs/images/stocklist.png)

#### Automatic and scheduled data fetching from several providers

By providing identifiers for stocks from [Morningstar](https://www.morningstar.it/it/), [MarketScreener](https://www.marketscreener.com), [MSCI](https://www.msci.com/our-solutions/esg-investing/esg-ratings-climate-search-tool), [Refinitiv](https://www.refinitiv.com/en/sustainable-finance/esg-scores), [Standard & Poor’s](https://www.spglobal.com/esg/solutions/data-intelligence-esg-scores) and [Sustainalytics](https://www.sustainalytics.com/esg-ratings) in the “Add Stock” dialog, Rating Tracker can automatically fetch financial data as well as financial and ESG ratings. Information is fetched by a [Selenium](https://www.selenium.dev)-automated Chrome browser. The identifiers to use can be found in the provider’s URL for the stock as shown in the following examples:

- Morningstar: `https://tools.morningstar.it/it/stockreport/default.aspx?Site=it&id=`**`0P000000GY`**`&LanguageId=it-IT&SecurityToken=`**`0P000000GY`**`]3]0]E0WWE$$ALL`
- MarketScreener: `https://www.marketscreener.com/quote/stock/`**`APPLE-INC-4849`**
- MSCI: `https://www.msci.com/our-solutions/esg-investing/esg-ratings-climate-search-tool/issuer/`**`apple-inc/IID000000002157615`**
- Refinitiv: `https://www.refinitiv.com/bin/esg/esgsearchresult?ricCode=`**`AAPL.O`** (see also [Refinitiv Identification Code](https://en.wikipedia.org/wiki/Refinitiv_Identification_Code))
- Standard & Poor’s: `https://www.spglobal.com/esg/scores/results?cid=`**`4004205`**
- Sustainalytics: `https://www.sustainalytics.com/esg-rating/`**`apple-inc/1007903183`**

The fetching can be scheduled by providing a Cron-like specifier in an environment variable. See below for details.

#### Stock Logos

When providing an ISIN for a stock, its logo is automatically fetched and cached from TradeRepublic.

#### Rating Scores

The fetched ratings of a stock are aggregated to both a financial and ESG score using the average values of all ratings, such that a score of 0 is assigned to an average stock and a score of 100 is assigned to a stock with perfect scores in all underlying ratings.

The financial and ESG score are used to compute a total score using the harmonic mean of both numbers, so that a stock has to perform well in both financial and ESG ratings to obtain a good total score.

#### User Management

The Rating Tracker supports multiple users, who can self-register via WebAuthn and access the application after being granted fine-grained access by an administrator, for whom a “User Management” web interface is provided.

![Rating Tracker User Management](https://raw.githubusercontent.com/marvinruder/rating-tracker/150-add-readmes/docs/images/usermanagement.png)

#### Notification Messages via Signal

Based on their access rights, users can subscribe to updates of stock ratings, fetch error reports, or new user registrations by providing a phone number capable of receiving messages via the instant messenger [Signal](https://signal.org).

<img src="https://raw.githubusercontent.com/marvinruder/rating-tracker/150-add-readmes/docs/images/profile.png" alt="Rating Tracker Profile Settings" style="margin: auto; margin-bottom: 15px; display: block; max-width: 50%;" />

![Rating Tracker Signal Notifications](https://raw.githubusercontent.com/marvinruder/rating-tracker/150-add-readmes/docs/images/signal.png)

#### Error reports with screenshots

When fetching a stock fails, a screenshot of the page the fetch was attempted from is stored and a link to them is sent to stock maintainers who subscribed to error reports, so they can analyze and fix the issue.

#### Logging

Logs are printed to `stdout` as well as rotating log files with [`pino-pretty`](https://yarnpkg.com/package/pino-pretty). While the `stdout` log output is already rendered with beautiful colors and icons in a [p10k](https://github.com/romkatv/powerlevel10k)-like fashion (for which a [font supporting all characters](https://github.com/romkatv/powerlevel10k/blob/master/font.md) may be required), the log files are JSON-formatted and can be pretty-printed using [`pino-pretty`](https://yarnpkg.com/package/pino-pretty). A minimal containerized setup can be added to your `.zshrc` or `.bashrc` like this:

```shell
# ~/.zshrc
alias pino-pretty="{ (echo -e \"FROM node:alpine\nRUN yarn global add pino-pretty\nENTRYPOINT [ \\\"pino-pretty\\\" ]\" | docker build -q - -t pino-pretty > /dev/null) && docker run -i --rm pino-pretty -c; }"

# To view a log file:
cat logs/rating-tracker.log | pino-pretty | less
```

#### …and more to come!

Planned features are documented [here](https://github.com/marvinruder/rating-tracker/issues?q=is%3Aopen+is%3Aissue+label%3Afeature). If you feel that something is missing, feel free to [request a feature](https://github.com/marvinruder/rating-tracker/issues/new?assignees=marvinruder&labels=feature&template=feature_request.md&title=)!

## Demo

An instance of the Rating Tracker is publicly available at https://ratingtracker.mruder.dev, for which access is granted at request.

## Deployment

Rating Tracker is built to be deployed using Docker or a similar container platform.

### Prerequisites

To run Rating Tracker, the following services must be available:

* [PostgreSQL](https://hub.docker.com/_/postgres), storing information related to stocks and users
* [Redis](https://hub.docker.com/_/redis), caching session IDs, stock logos and other resources
* [Selenium (Chrome Standalone)](https://hub.docker.com/r/selenium/standalone-chrome), fetching stock information from websites (a [Grid setup](https://www.selenium.dev/documentation/grid/getting_started/#hub-and-node) with a [hub](https://hub.docker.com/r/selenium/hub) and [Chrome-based nodes](https://hub.docker.com/r/selenium/node-chrome) can also be used)
* [Signal Messenger REST API](https://hub.docker.com/r/bbernhard/signal-cli-rest-api), sending notifications via the Signal messenger
* [nginx](https://hub.docker.com/_/nginx), set up as a reverse proxy to provide SSL encryption (required for most WebAuthn clients)

### Minimal Example Setup using Docker Compose

Docker Compose is the preferred way to run Rating Tracker together with all the services it depends on. The following configuration file shows an exemplary setup.

<details>
<summary>View Docker Compose configuration</summary>

```yml
version: "3.8"

services:
  postgres:
    image: postgres:alpine
    ports:
      - "127.0.0.1:5432:5432"
    environment:
      POSTGRES_DB: "rating-tracker"
      POSTGRES_USER: "rating-tracker"
      POSTGRES_PASSWORD: "********"
      PGDATA: /var/lib/postgresql/data
    volumes:
      - ./postgresql/data:/var/lib/postgresql/data
    shm_size: '256mb'

  redis:
    image: redis:alpine
    ports:
      - "127.0.0.1:6379:6379"
    command: redis-server --save 60 1 --activedefrag yes --aclfile /etc/redis/users.acl
    volumes:
      - ./redis/data:/data
      - ./redis/config:/etc/redis # the ACL file with the user and password must be created in this folder

  selenium:
    image: selenium/standalone-chrome
    environment:
      - SE_NODE_MAX_SESSIONS=4 # adjust to your CPU
    ports:
      - "127.0.0.1:4444:4444"
    shm_size: '2gb'

  signal:
    image: bbernhard/signal-cli-rest-api
    environment:
      - MODE=native
      - AUTO_RECEIVE_SCHEDULE=0 * * * *
    ports:
      - "127.0.0.1:8080:8080"
    volumes:
      - ./signal-cli:/home/.local/share/signal-cli

  rating-tracker:
    image: marvinruder/rating-tracker
    tty: true # required for colored output to stdout
    environment:
      PORT: 21076
      DOMAIN: "example.com"
      SUBDOMAIN: "ratingtracker"
      LOG_FILE: "/app/logs/rating-tracker-log-(DATE).log" # (DATE) is replaced by the current date to support log rotation
      DATABASE_URL: "postgresql://rating-tracker:********@postgres:5432/rating-tracker?schema=rating-tracker"
      REDIS_URL: "redis://redis:6379"
      REDIS_USER: "rating-tracker"
      REDIS_PASS: "********"
      SELENIUM_URL: "http://selenium:4444"
      SELENIUM_MAX_CONCURRENCY: 4 # must be ≤ SE_NODE_MAX_SESSIONS of Selenium container
      AUTO_FETCH_SCHEDULE: "0 0 0 * * *" # this format includes seconds
      SIGNAL_URL: "http://signal:8080"
      SIGNAL_SENDER: "+12345678900"
    ports:
      - "127.0.0.1:443:21076" # optional if nginx runs in same Docker Compose setup
    volumes:
      - ./logs/rating-tracker:/app/logs
    depends_on:
      - postgres
      - redis
      - selenium
      - signal
    restart: unless-stopped
```
</details>

The port bindings are optional but helpful to connect to the services from the host, e.g. for debugging purposes. 

### Setup steps

#### Initialize database setup

Rating Tracker uses Prisma to interact with a PostgreSQL database. Although not officially recommended, a quick, easy and fairly safe way to initialize a new database with the required tables, constraints and indexes is to 

1. Clone the repository and run `yarn` from within the [`packages/rating-tracker-backend`](https://github.com/marvinruder/rating-tracker/tree/main/packages/rating-tracker-backend) folder.
2. Store the database URL (e.g. `postgresql://rating-tracker:********@127.0.0.1:5432/rating-tracker?schema=rating-tracker`) in the shell environment variable `DATABASE_URL`.
3. Run `yarn pnpify prisma migrate deploy`.

<div id="ACL">

#### Create Redis user and password

Create the file `users.acl`  with the following content: 

```
user default off
user rating-tracker allcommands allkeys allchannels on >********
```

Refer to the exemplary Docker Compose setup for information on where to place the ACL file.

To use a password hash, first create the file above and start up Redis, then connect, authenticate and run `ACL GETUSER rating-tracker`. The output shows the hash of the password, which can then be used in the ACL file:

```
user default off
user rating-tracker allcommands allkeys allchannels on #07ab59f4[…]072e07fb
```

More info on ACL files in Redis can be found [here](https://redis.io/docs/management/security/acl/).

#### Create Signal account

Run a shell in the Signal REST API container and proceed with [this excellent documentation](https://github.com/AsamK/signal-cli/wiki/Quickstart#set-up-an-account).

#### Configure webserver as reverse proxy

After setting up NGINX as a webserver with SSL, the following virtual host configuration can be used to run a reverse proxy which also adds security- and privacy-related HTTP headers compatible with Rating Tracker.

<details>
<summary>View NGINX configuration</summary>

```
add_header "Content-Security-Policy" "default-src 'self'; img-src 'self' data:; style-src-elem 'self' 'unsafe-inline'; frame-ancestors 'none'; form-action 'self'; base-uri 'none';";
add_header "Strict-Transport-Security" "max-age=31536000; includeSubDomains" always;
add_header "X-Frame-Options" "DENY";
add_header "X-Content-Type-Options" "nosniff";
add_header "Referrer-Policy" "same-origin";
add_header "Cross-Origin-Opener-Policy" "same-origin";
add_header "Cross-Origin-Resource-Policy" "same-site";
add_header "Cross-Origin-Embedder-Policy" "require-corp";
add_header "Permissions-Policy" "interest-cohort=();";

resolver 127.0.0.11 valid=15s; # DNS resolver from Docker to resolve Docker Compose container names

location / {
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    set $target_host rating-tracker; # use 127.0.0.1 here if nginx runs outside of Docker Compose setup
    proxy_pass http://$target_host:21076;
}
```
</details>

#### Initial admin registration and activation

After setting up your Rating Tracker instance, navigate to its URL and register, creating WebAuthn credentials. Then manually connect to the database and set the new user’s `accessRights` value to `255`, granting ultimate access. After that, you can log in using your credentials. This is a one-time setup step, all other users can be granted access via the User Management web interface.

### Supported environment variables

Variables in bold font are mandatory.

<details>
<summary>View complete list of environment variables</summary>

Variable | Example Value | Explanation
---------|---------------|------------
**`PORT`** | `21076` | The TCP port Rating Tracker is served on.
**`DOMAIN`** | `example.com` | The domain Rating Tracker will be available at. This is especially important for WebAuthn, since credentials will only be offered to the user by their client when the domain provided as part of the registration or authentication challence matches the domain of the URL the user navigated to.
`SUBDOMAIN` | `ratingtracker` | An optional subdomain. Credentials created for one domain can be used to authenticate to different Rating Tracker instances served on all subdomains of that domain, making it easy to use multiple deployment stages, development servers etc.
**`DATABASE_URL`** | `postgresql://rating-tracker:********@127.0.0.1:5432/rating-tracker?schema=rating-tracker` | The connection URL of the PostgreSQL instance, specifying username, password, host, port, database and schema. Can also use the PostgreSQL service name as hostname if set up within the same Docker Compose file.
**`SELENIUM_URL`** | `http://127.0.0.1:4444` | The URL of the Selenium instance. Can also use the Selenium service name as hostname if set up within the same Docker Compose file.
**`REDIS_URL`** | `redis://127.0.0.1:6379` | The URL of the Redis instance. Can also use the Redis service name as hostname if set up within the same Docker Compose file.
`REDIS_USER`, `REDIS_PASS`,  | `rating-tracker`, `********` | The username and password to connect to the Redis instance. Read more [here](#ACL) on how to set up a password-protected Redis user. If unset, the Redis instance must grant write access to the default user.
`LOG_FILE` | `/var/log/rating-tracker-(DATE).log` | A file path for storing Rating Tracker log files. The string `(DATE)` will be replaced by the current date. If unset, logs are stored in the `/tmp` directory.
`LOG_LEVEL` | `debug` | The level for the log outputs to `stdout`. Can be one of `fatal`, `error`, `warn`, `info`, `debug`, `trace`. If unset, `info` will be used. 
`AUTO_FETCH_SCHEDULE` | `0 30 2 * * *` | A Cron-like specification of a schedule for when to fetch all stocks from all providers. The format in use includes seconds, so the example value resolves to “every day at 2:30:00 AM”. If unset, no automatic fetching will happen.
`SELENIUM_MAX_CONCURRENCY` | `4` | The number of Selenium WebDrivers used concurrently when fetching information for multiple stocks. The Selenium instance should be set up to allow for the creation of at least that many sessions. If unset, no concurrent fetches will be performed.
`SIGNAL_URL` | `http://127.0.0.1:8080` | The URL of the Signal REST API. Can also use the Signal REST API service name as hostname if set up within the same Docker Compose file. If unset, no Signal notification messages will be sent.
`SIGNAL_SENDER` | `+12345678900` | The phone number of the Signal account registered with the Signal CLI service, which will be used to send notification messages. If unset, no Signal notification messages will be sent.

</details>

## API Reference

Any Rating Tracker instance’s API is self-documented, its OpenAPI web interface is hosted at [`/api-docs`](https://ratingtracker.mruder.dev/api-docs/). The complete OpenAPI specification document can be downloaded at [`/api-spec/v3`](https://ratingtracker.mruder.dev/api-spec/v3).

## Development

### Create an environment for developing

An environment with services for development purposes can quickly be created using the Docker Compose file in the [`dev`](https://github.com/marvinruder/rating-tracker/tree/main/packages/rating-tracker-backend/dev) folder. The `scripts` section in the [`package.json`](https://github.com/marvinruder/rating-tracker/blob/main/package.json) provides helpful commands:

* Run `yarn dev:tools` to start NGINX, PostgreSQL, Redis, Selenium and the Signal REST API. SSL Certificates and the Redis ACL file must be provided beforehand, and a Signal account must be created before starting the server. The NGINX configuration might require adjustment to your situation.
* Run `yarn prisma:migrate:dev` to initialize the PostgreSQL database and generate the Prisma client.
* Run `yarn dev:server` to start the backend server as well as the Vite frontend development server.

NB: The `dev:tools` command sometimes fails because multiple Docker networks with the same name are created concurrently. In that case, manually delete all but one using `docker network ls` and `docker network rm …` and try again.

Environment variables in development can easily be defined in an `.env` file:

<details>
<summary>See all development environment variables</summary>

```bash
# .env
DATABASE_URL="postgresql://rating-tracker:********@127.0.0.1:5432/rating-tracker?schema=rating-tracker"
REDIS_URL=redis://127.0.0.1:6379
SELENIUM_URL=http://127.0.0.1:4444
SELENIUM_MAX_CONCURRENCY=2
SIGNAL_URL=http://127.0.0.1:8080

NODE_ENV=development
DOMAIN=example.com
SUBDOMAIN=ratingtracker
PORT=3001
REDIS_USER="rating-tracker"
REDIS_PASS="********"
POSTGRES_USER="rating-tracker"
POSTGRES_PASS="********"
SIGNAL_SENDER="+12345678900"
# AUTO_FETCH_SCHEDULE=" 0 * * * * *" # runs every minute, activate for debugging only
LOG_LEVEL=trace
```
</details>

### Run tests

A test environment with separate PostgreSQL and Redis instances can be created using the Docker Compose file in the [`test`](https://github.com/marvinruder/rating-tracker/tree/main/packages/rating-tracker-backend/test) folder. The `scripts` section in the [`package.json`](https://github.com/marvinruder/rating-tracker/blob/main/package.json) provides helpful commands:

* Run `yarn test:tools` to start PostgreSQL and Redis.
* Run `yarn test:prisma:migrate:init` to initialize the PostgreSQL database.
* Run `yarn test` to run all tests from all packages. Additionally, the packages’ `package.json` configurations contain a `test:watch` script to run tests in watch mode.

NB: The `test:tools` command sometimes fails because multiple Docker networks with the same name are created concurrently. In that case, manually delete all but one using `docker network ls` and `docker network rm …` and try again.

### Contribute

Contributions are welcome!

## Disclaimer

This software is provided under the conditions of the [MIT License](https://github.com/marvinruder/rating-tracker/blob/main/LICENSE). Use this tool at your own risk. Excessive data fetching from providers, publishing or selling the information obtained by fetching is not recommended. Your actions may have consequences… 🦋

## Authors

- [Marvin A. Ruder (he/him)](https://github.com/marvinruder)