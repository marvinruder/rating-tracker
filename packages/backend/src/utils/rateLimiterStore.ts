import type { Env, Input } from "hono";
import type { ClientRateLimitInfo, ConfigType, Store } from "hono-rate-limiter";

import type DBService from "../db/db.service";

/**
 * A rate limiter store that writes rate limit events to the database.
 */
class RateLimiterStore implements Store {
  constructor(dbService: DBService) {
    const { rateLimitHitCount } = dbService;
    this.db = { rateLimitHitCount };
  }

  /**
   * A service that provides access to the database.
   */
  private db: Pick<DBService, "rateLimitHitCount">;

  /**
   * The duration of time before which all hit counts are reset (in milliseconds).
   */
  #windowMs!: number;

  init(options: ConfigType<Env, string, Input>): void {
    this.#windowMs = options.windowMs;
  }

  /* c8 ignore start */ // Not called in tests
  async get(key: string): Promise<ClientRateLimitInfo | undefined> {
    const hitCount = await this.db.rateLimitHitCount.findUnique({ where: { key, expiresAt: { gte: new Date() } } });
    return hitCount ? { totalHits: hitCount.count, resetTime: hitCount.expiresAt } : undefined;
  }

  private async rowExists(key: string): Promise<boolean> {
    return !!(await this.db.rateLimitHitCount.findUnique({ where: { key } }));
  }
  /* c8 ignore stop */

  private async rowExpired(key: string): Promise<boolean> {
    return !!(await this.db.rateLimitHitCount.findUnique({ where: { key, expiresAt: { lt: new Date() } } }));
  }

  async increment(key: string): Promise<ClientRateLimitInfo> {
    if (await this.rowExpired(key)) await this.resetKey(key);
    const hitCount = await this.db.rateLimitHitCount.upsert({
      where: { key },
      create: { key, count: 1, expiresAt: new Date(Date.now() + this.#windowMs) },
      update: { count: { increment: 1 }, expiresAt: new Date(Date.now() + this.#windowMs) },
    });
    return { totalHits: hitCount.count, resetTime: hitCount.expiresAt };
  }

  /* c8 ignore start */ // Not called in tests
  async decrement(key: string): Promise<void> {
    if (await this.get(key))
      await this.db.rateLimitHitCount.update({
        where: { key },
        data: { count: { decrement: 1 } },
      });
  }

  async resetKey(key: string): Promise<void> {
    if (await this.rowExists(key)) await this.db.rateLimitHitCount.delete({ where: { key } });
  }

  async resetAll(): Promise<void> {
    await this.db.rateLimitHitCount.deleteMany();
  }
  /* c8 ignore stop */

  localKeys = false;
}

export default RateLimiterStore;
