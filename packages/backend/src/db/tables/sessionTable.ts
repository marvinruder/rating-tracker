import { pluralize, User } from "@rating-tracker/commons";

import APIError from "../../utils/APIError";
import logger from "../../utils/logger";
import client from "../client";

/**
 * The time in seconds after which a session should expire.
 */
export const SESSION_TTL = 1800;

/**
 * The time in seconds after which a session must not be extended.
 */
export const SESSION_MAX_VALIDITY = 28800;

/**
 * Encodes a session ID to a base64url string.
 * @param id The session ID to encode.
 * @returns The base64url-encoded session ID.
 */
const encodeSessionID = (id: Buffer): string => id.toString("base64url");

/**
 * Decodes a base64url string to a session ID.
 * @param id The base64url-encoded session ID to decode.
 * @returns The session ID.
 */
const decodeSessionID = (id: string): Buffer => Buffer.from(id, "base64url");

/**
 * Create a session.
 * @param email The user to create the session for.
 * @returns The base64url-encoded session ID.
 */
export const createSession = async (email: string): Promise<string> => {
  const sessionID = encodeSessionID(
    (
      await client.session.create({
        data: { email, expiresAt: new Date(Date.now() + SESSION_TTL * 1000) },
        select: { id: true },
      })
    ).id,
  );
  logger.info({ prefix: "postgres" }, `Created session for ${email} with ID ${sessionID}.`);
  return sessionID;
};

/**
 * Refresh a session and return the related user.
 * @param id The base64url-encoded ID of the session to refresh.
 * @returns The user related to the session.
 * @throws an {@link APIError} if the session is invalid or expired.
 */
export const refreshSessionAndGetUser = async (id: string): Promise<{ eol: boolean; user: User }> => {
  const sessionIDBuffer = decodeSessionID(id);
  try {
    const session = await client.session.findUniqueOrThrow({
      where: { id: sessionIDBuffer, expiresAt: { gte: new Date() } },
      select: { user: true, createdAt: true },
    });
    const user = new User(session.user);
    if (Date.now() - session.createdAt.getTime() <= (SESSION_MAX_VALIDITY - SESSION_TTL) * 1000) {
      await client.session.update({
        where: { id: sessionIDBuffer },
        data: { expiresAt: new Date(Date.now() + SESSION_TTL * 1000) },
      });
      return { eol: false, user };
    }
    /* c8 ignore start */ // Session EOL is difficult to reach during tests
    logger.warn(
      { prefix: "postgres" },
      `Session ${id} of user ${session.user.email} is nearing end-of-life and cannot be extended further.`,
    );
    return { eol: true, user };
    /* c8 ignore stop */
  } catch (e) {
    throw new APIError(404, `Session ${id} not found.`);
  }
};

/**
 * Delete a session.
 * @param id The ID of the session to delete.
 * @throws an {@link APIError} if the session does not exist.
 */
export const deleteSession = async (id: string) => {
  const sessionIDBuffer = decodeSessionID(id);
  // Attempt to find a session with the given ID
  try {
    await client.session.findUniqueOrThrow({ where: { id: sessionIDBuffer, expiresAt: { gte: new Date() } } });
    // If that worked, we can delete the existing session
    await client.session.delete({ where: { id: sessionIDBuffer } });
    logger.info({ prefix: "postgres" }, `Deleted session ${id}.`);
  } catch {
    /* c8 ignore start */ // Not reached in current tests since a user can only delete their current session
    throw new APIError(404, `Session ${id} not found.`);
  }
  /* c8 ignore stop */
};

/**
 * Delete all expired sessions.
 */
export const cleanupSessions = async () => {
  const deletedSessions = await client.session.deleteMany({ where: { expiresAt: { lt: new Date() } } });
  if (deletedSessions.count)
    logger.info(
      { prefix: "postgres" },
      `Deleted ${deletedSessions.count} expired session${pluralize(deletedSessions.count)}.`,
    );
};
