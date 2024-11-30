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
  #encodeSessionID(id: Uint8Array): string {
    return Buffer.from(id).toString("base64url");
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
   * @param oidcIDToken An ID token from the OpenID Connect provider.
   * @returns The base64url-encoded session ID.
   */
  async create(email: string, oidcIDToken?: string): Promise<string> {
    const sessionID = this.#encodeSessionID(
      (
        await this.db.session.create({
          data: { email, oidcIDToken, expiresAt: new Date(Date.now() + SessionService.SESSION_TTL * 1000) },
          select: { id: true },
        })
      ).id,
    );
    Logger.info(
      { component: "postgres", session: sessionID, user: email },
      `Created ${oidcIDToken ? "OpenID Connect " : ""}session for user`,
    );
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
        select: { user: { include: { oidcIdentity: true } }, createdAt: true },
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
        { component: "postgres", session: id, user: session.user.email },
        "Session of user is nearing end-of-life and cannot be extended further.",
      );
      return { eol: true, user };
    } catch (e) {
      throw new NotFoundError(`Session ${id} not found.`);
    }
  }

  /**
   * Delete a session.
   * @param id The ID of the session to delete.
   * @returns the session’s OpenID Connect ID token, or `null` if the session had no OpenID Connect ID token.
   * @throws an {@link APIError} if the session does not exist.
   */
  async delete(id: string): Promise<string | null> {
    const sessionIDBuffer = this.#decodeSessionID(id);
    // Attempt to find a session with the given ID
    try {
      const session = await this.db.session.findUniqueOrThrow({
        where: { id: sessionIDBuffer, expiresAt: { gte: new Date() } },
      });
      // If that worked, we can delete the existing session
      await this.db.session.delete({ where: { id: sessionIDBuffer } });
      Logger.info({ component: "postgres", session: id }, "Deleted session");
      return session.oidcIDToken;
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
        { component: "postgres", count: deletedSessions.count },
        `Deleted expired session${pluralize(deletedSessions.count)}.`,
      );
  }
}

export default SessionService;
