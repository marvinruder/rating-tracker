import {
  basePath,
  REGEX_PHONE_NUMBER,
  User,
  usersAPIPath,
  usersAvatarEndpointSuffix,
  type MessageType,
  type Stock,
  type WebAuthnCredential,
} from "@rating-tracker/commons";

import type DBService from "../db/db.service";
import type SignalService from "../signal/signal.service";
import BadRequestError from "../utils/error/api/BadRequestError";
import InternalServerError from "../utils/error/api/InternalServerError";
import NotFoundError from "../utils/error/api/NotFoundError";
import Logger from "../utils/logger";

/**
 * This service provides methods to interact with users.
 */
class UserService {
  constructor(
    dbService: DBService,
    private signalService: SignalService,
  ) {
    const { user } = dbService;
    this.db = { user };
  }

  /**
   * A service that provides access to the database.
   */
  private db: Pick<DBService, "user">;

  /**
   * Replace the avatar data URL with a URL pointing to the user avatar endpoint.
   * @param user The user whose avatar data URL to replace.
   * @returns The user with the avatar data URL replaced.
   */
  #replaceAvatarDataURL(user: User): User {
    if (user.avatar?.startsWith("data:"))
      user.avatar = `${basePath}${usersAPIPath}/${encodeURIComponent(user.email)}${usersAvatarEndpointSuffix}`;
    return user;
  }

  /**
   * Create a user with WebAuthn credentials.
   * @param user The user to create.
   * @param credential The WebAuthn credential of the user.
   * @returns Whether the user was created or existed already.
   */
  async create(user: User, credential: WebAuthnCredential): Promise<boolean> {
    // Attempt to find an existing user with the same email address
    try {
      const existingUser = await this.db.user.findUniqueOrThrow({ where: { email: user.email } });
      // If that worked, a user with the same email address already exists
      Logger.warn(
        { prefix: "postgres" },
        `Skipping user “${user.name}” – existing already (email address ${existingUser.email}).`,
      );
      return false;
    } catch {
      const isFirstUser = (await this.db.user.count()) === 0;
      await this.db.user.create({
        data: {
          ...user,
          accessRights: isFirstUser ? 255 : user.accessRights,
          webAuthnCredentials: {
            create: {
              id: Buffer.from(credential.id),
              publicKey: Buffer.from(credential.publicKey),
              counter: credential.counter,
            },
          },
        },
      });
      Logger.info({ prefix: "postgres" }, `Created user “${user.name}” with email address ${user.email}.`);
      // Inform the admin of the new user via Signal messenger
      this.signalService.sendMessage(
        `🆕👤 New user “${user.name}” (email ${user.email}) registered.`,
        await this.readMessageRecipients("userManagement"),
      );
      return true;
    }
  }

  /**
   * Read a user. This method does not perform modifications on the user and is to be used internally only.
   * @param email The email address of the user.
   * @returns The user.
   * @throws an {@link APIError} if the user does not exist.
   */
  async #read(email: string): Promise<User> {
    try {
      return new User(await this.db.user.findUniqueOrThrow({ where: { email } }));
    } catch {
      throw new NotFoundError(`User ${email} not found.`);
    }
  }

  /**
   * Read a user and replace the avatar data URL with a URL pointing to the user avatar endpoint.
   * @param email The email address of the user.
   * @returns The user.
   * @throws an {@link APIError} if the user does not exist.
   */
  async read(email: string): Promise<User> {
    return this.#replaceAvatarDataURL(await this.#read(email));
  }

  /**
   * Read all users and replace the avatar data URLs with a URL pointing to the user avatar endpoint.
   * @returns A list of all users.
   */
  async readAll(): Promise<User[]> {
    return (await this.db.user.findMany({ orderBy: [{ accessRights: "desc" }, { name: "asc" }] })).map((user) =>
      this.#replaceAvatarDataURL(new User(user)),
    );
  }

  /**
   * Check whether a user exists.
   * @param email The email address of the user.
   * @returns Whether the user exists.
   */
  async exists(email: string): Promise<boolean> {
    try {
      await this.db.user.findUniqueOrThrow({ where: { email } });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Read the avatar of a user.
   * @param email The email address of the user.
   * @returns The avatar of the user.
   * @throws an {@link APIError} if the user does not exist or does not have an avatar.
   */
  async readAvatar(email: string): Promise<{ mimeType: string; buffer: Buffer }> {
    const user = await this.#read(email);
    if (user.avatar) {
      const dataURLMatcher = /^data:(?<mimeType>\w+\/\w+)(;charset=.+)?;base64,(?<data>.*)$/;
      const match = user.avatar.match(dataURLMatcher);
      if (match?.groups?.mimeType && match.groups.data)
        return { mimeType: match.groups.mimeType, buffer: Buffer.from(match.groups.data, "base64") };
      /* c8 ignore next 2 */ // We do not expect data of any other format to be stored in the database
      throw new InternalServerError(`Error while reading avatar of user ${email}.`);
    }
    throw new NotFoundError(`User ${email} does not have an avatar.`);
  }

  /**
   * Returns all users who shall receive a message of the given type.
   * @param messageType The type of message to send.
   * @param stock The stock of which to identify subscribers.
   * @returns The users who shall receive a message of the given type.
   */
  async readMessageRecipients(messageType: MessageType, stock?: Pick<Stock, "ticker">): Promise<User[]> {
    let users = (await this.db.user.findMany({ where: { phone: { not: null } } }))
      .map((user) => new User(user))
      .filter((user) => user.phone?.match(REGEX_PHONE_NUMBER) && user.isAllowedAndWishesToReceiveMessage(messageType));

    // If a stock is specified, also send the message to users subscribed to a watchlist containing the stock
    if (stock)
      users = users.concat(
        (
          await this.db.user.findMany({
            where: { watchlists: { some: { subscribed: true, stocks: { some: { ticker: stock.ticker } } } } },
          })
        )
          .map((user) => new User(user))
          .filter((user) => user.isAllowedToReceiveMessage(messageType)),
      );

    return users;
  }

  /**
   * Update a user.
   * @param email The email address of the user.
   * @param newValues The new values for the user.
   * @throws an {@link APIError} if the user does not exist.
   */
  async update(email: string, newValues: Partial<User>) {
    let k: keyof typeof newValues; // all keys of new values
    const user = await this.#read(email); // Read the user from the database
    let isNewData = false;
    // deepcode ignore NonLocalLoopVar: The left-hand side of a 'for...in' statement cannot use a type annotation.
    for (k in newValues) {
      if (newValues[k] !== undefined) {
        /* c8 ignore next */ // Those properties are always caught by OpenAPI validation
        if (user[k] === undefined) throw new BadRequestError(`Invalid property ${k} for user ${user.email}.`);
        if (newValues[k] === user[k]) {
          delete newValues[k];
          continue;
        }

        // New data is different from old data
        isNewData = true;
      }
    }

    if (isNewData) {
      await this.db.user.update({ where: { email: user.email }, data: { ...newValues } });
      Logger.info(
        {
          prefix: "postgres",
          newValues: {
            ...newValues,
            ...("avatar" in newValues
              ? { avatar: newValues.avatar?.substring(0, 64).concat("…") ?? newValues.avatar }
              : {}),
          },
        },
        `Updated user ${email}`,
      );
    } else {
      // No new data was provided
      Logger.info({ prefix: "postgres" }, `No updates for user ${email}.`);
    }
  }

  /**
   * Delete a user.
   * @param email The email address of the user to delete.
   * @throws an {@link APIError} if the user does not exist.
   */
  async delete(email: string) {
    try {
      // Attempt to delete a user with the given email address
      await this.db.user.delete({ where: { email } });
      Logger.info({ prefix: "postgres" }, `Deleted user ${email}.`);
    } catch {
      // If deletion failed, the user does not exist
      Logger.warn({ prefix: "postgres" }, `User ${email} does not exist.`);
    }
  }
}

export default UserService;
