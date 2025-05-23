/* eslint-disable max-len */
import type { Prisma } from "../../prisma/client";
import DBService from "../../src/db/db.service";
import SessionService from "../../src/session/session.service";
import {
  portfolioExamples,
  resourceExamples,
  stockExamples,
  userExamples,
  watchlistExamples,
  webAuthnCredentialExamples,
} from "../../src/utils/examples";

const dbService: DBService = new DBService();

/**
 * Writes example stock data into the stock table in the database. Must only be used in tests.
 */
const applyStockSeed = async (): Promise<void> => {
  await dbService.stock.createMany({ data: stockExamples as Prisma.StockCreateManyInput[] });
};

/**
 * Writes example user data into the user table in the database. Must only be used in tests.
 */
const applyUserSeed = async (): Promise<void> => {
  await Promise.all(
    userExamples.map(
      async (user, index) =>
        await dbService.user.create({
          data: {
            ...user,
            oidcIdentity: { create: user.oidcIdentity ?? undefined },
            webAuthnCredentials: {
              create: {
                ...webAuthnCredentialExamples[index],
                id: webAuthnCredentialExamples[index].id,
                publicKey: webAuthnCredentialExamples[index].publicKey,
              },
            },
          },
        }),
    ),
  );
};

/**
 * Writes example watchlist data into the watchlist table in the database. Must only be used in tests.
 */
const applyWatchlistSeed = async (): Promise<void> => {
  for (const watchlist of watchlistExamples) {
    await dbService.watchlist.create({
      data: {
        ...watchlist,
        id: undefined,
        email: "jane.doe@example.com",
        stocks: {
          create: watchlist.stocks.map((stock) => ({ stock: { connect: { ticker: stock.ticker } } })),
        },
      },
    });
  }
};

/**
 * Writes example portfolio data into the portfolio table in the database. Must only be used in tests.
 */
const applyPortfolioSeed = async (): Promise<void> => {
  for (const portfolio of portfolioExamples) {
    await dbService.portfolio.create({
      data: {
        ...portfolio,
        id: undefined,
        email: "jane.doe@example.com",
        stocks: {
          create: portfolio.stocks.map((stock) => ({
            amount: stock.amount,
            stock: { connect: { ticker: stock.ticker } },
          })),
        },
      },
    });
  }
};

/**
 * Writes example resource data into the resource table in the database. Must only be used in tests.
 */
const applyResourceSeed = async (): Promise<void> => {
  await dbService.resource.createMany({
    data: resourceExamples.map((resource) => ({
      ...resource,
      content: resource.content,
      ...(resource.uri.startsWith("expired") && { expiresAt: new Date(Date.now() - 1000) }),
    })),
  });
};

/**
 * Writes example session data into the session table in the database. Must only be used in tests.
 */
const applySessionSeed = async (): Promise<void> => {
  await dbService.session.createMany({
    data: [
      {
        id: Buffer.from("exampleSessionID", "base64url"),
        email: "jane.doe@example.com",
        oidcIDToken: "exampleIDToken",
      },
      { id: Buffer.from("anotherExampleSessionID", "base64url"), email: "john.doe@example.com" },
      {
        id: Buffer.from("expiredSessionID", "base64url"),
        email: "jane.doe@example.com",
        expiresAt: new Date(Date.now() - 1000),
      },
      {
        id: Buffer.from("eolSessionID", "base64url"),
        email: "jane.doe@example.com",
        createdAt: new Date(Date.now() - 1000 * (SessionService.SESSION_MAX_VALIDITY - SessionService.SESSION_TTL + 1)),
      },
    ],
  });
};

/**
 * Writes example data into the WebAuthn Challenge table in the database. Must only be used in tests.
 */
const applyWebAuthnChallengeSeed = async (): Promise<void> => {
  await dbService.webAuthnChallenge.createMany({
    data: [
      { expiresAt: new Date(Date.now() - 1) },
      { email: "jane.doe@example.com", expiresAt: new Date(Date.now() - 1) },
    ],
  });
};

/**
 * Writes example data into the Rate Limit Hit Count table in the database. Must only be used in tests.
 */
const applyRateLimitHitCountSeed = async (): Promise<void> => {
  await dbService.rateLimitHitCount.create({ data: { key: "::1", count: 3, expiresAt: new Date(Date.now() - 1) } });
};

/**
 * Clears and writes example data into the tables in the database. Must only be used in tests.
 */
const applyPostgresSeeds = async (): Promise<void> => {
  if (process.env.NODE_ENV !== "test") throw new Error("Refusing to apply seed when not in a test environment");

  await dbService.$queryRaw`TRUNCATE TABLE "stocks", "users", "webauthn_credentials", "watchlists", "stocks_in_watchlists", "portfolios", "stocks_in_portfolios", "sessions", "resources", "webauthn_challenges", "rate_limit_hit_counts" RESTART IDENTITY CASCADE`;

  await Promise.all([
    applyStockSeed(),
    applyUserSeed(),
    applyResourceSeed(),
    applyWebAuthnChallengeSeed(),
    applyRateLimitHitCountSeed(),
  ]);
  await Promise.all([applyWatchlistSeed(), applyPortfolioSeed(), applySessionSeed()]);
  await dbService.cleanup();
};

export default applyPostgresSeeds;
