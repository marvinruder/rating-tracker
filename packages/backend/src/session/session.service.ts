import { pluralize, User } from "@rating-tracker/commons";

import type DBService from "../db/db.service";
import NotFoundError from "../utils/error/api/NotFoundError";
import Logger from "../utils/logger";

/**
 * This service provides methods to interact with sessions.
 */
class SessionService {
  constructor(dbService: DBService) {
    const { session } = dbService;
    this.db = { session };
  }

  /**
   * A service that provides access to the database.
   */
  private db: Pick<DBService, "session">;

  /**
   * The time in seconds after which a session should expire.
   */
  static SESSION_TTL = 1800;

  /**
   * The time in seconds after which a session must not be extended.
   */
  static SESSION_MAX_VALIDITY = 28800;

  /**
   * Encodes a session ID to a base64url string.
   * @param id The session ID to encode.
   * @returns The base64url-encoded session ID.
   */
  #encodeSessionID(id: Buffer): string {
    return id.toString("base64url");
  }

  /**
   * Decodes a base64url string to a session ID.
   * @param id The base64url-encoded session ID to decode.
   * @returns The session ID.
   */
  #decodeSessionID(id: string): Buffer {
    return Buffer.from(id, "base64url");
  }

  /**
   * Create a session.
   * @param email The user to create the session for.
   * @returns The base64url-encoded session ID.
   */
  async create(email: string): Promise<string> {
    const sessionID = this.#encodeSessionID(
      (
        await this.db.session.create({
          data: { email, expiresAt: new Date(Date.now() + SessionService.SESSION_TTL * 1000) },
          select: { id: true },
        })
      ).id,
    );
    Logger.info({ prefix: "postgres" }, `Created session for ${email} with ID ${sessionID}.`);
    return sessionID;
  }

  /**
   * Refresh a session and return the related user.
   * @param id The base64url-encoded ID of the session to refresh.
   * @returns The user related to the session.
   * @throws an {@link APIError} if the session is invalid or expired.
   */
  async refreshAndGetUser(id: string): Promise<{ eol: boolean; user: User }> {
    const sessionIDBuffer = this.#decodeSessionID(id);
    try {
      const session = await this.db.session.findUniqueOrThrow({
        where: { id: sessionIDBuffer, expiresAt: { gte: new Date() } },
        select: { user: true, createdAt: true },
      });
      const user = new User(session.user);
      if (
        Date.now() - session.createdAt.getTime() <=
        (SessionService.SESSION_MAX_VALIDITY - SessionService.SESSION_TTL) * 1000
      ) {
        await this.db.session.update({
          where: { id: sessionIDBuffer },
          data: { expiresAt: new Date(Date.now() + SessionService.SESSION_TTL * 1000) },
        });
        return { eol: false, user };
      }
      Logger.warn(
        { prefix: "postgres" },
        `Session ${id} of user ${session.user.email} is nearing end-of-life and cannot be extended further.`,
      );
      return { eol: true, user };
    } catch (e) {
      throw new NotFoundError(`Session ${id} not found.`);
    }
  }

  /**
   * Delete a session.
   * @param id The ID of the session to delete.
   * @throws an {@link APIError} if the session does not exist.
   */
  async delete(id: string) {
    const sessionIDBuffer = this.#decodeSessionID(id);
    // Attempt to find a session with the given ID
    try {
      await this.db.session.findUniqueOrThrow({ where: { id: sessionIDBuffer, expiresAt: { gte: new Date() } } });
      // If that worked, we can delete the existing session
      await this.db.session.delete({ where: { id: sessionIDBuffer } });
      Logger.info({ prefix: "postgres" }, `Deleted session ${id}.`);
    } catch {
      /* c8 ignore next 2 */ // Not reached in current tests since a user can only delete their current session
      throw new NotFoundError(`Session ${id} not found.`);
    }
  }

  /**
   * Delete all expired sessions.
   */
  async cleanup() {
    const deletedSessions = await this.db.session.deleteMany({ where: { expiresAt: { lt: new Date() } } });
    if (deletedSessions.count)
      Logger.info(
        { prefix: "postgres" },
        `Deleted ${deletedSessions.count} expired session${pluralize(deletedSessions.count)}.`,
      );
  }
}

export default SessionService;
