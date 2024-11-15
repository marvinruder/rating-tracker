import type { User } from "@rating-tracker/commons";
import { accountAPIPath, basePath, usersAPIPath, usersAvatarEndpointSuffix } from "@rating-tracker/commons";

import type UserService from "../user/user.service";

/**
 * This service provides methods to interact with a user’s own account.
 */
class AccountService {
  constructor(private userService: UserService) {}

  /**
   * Replace the avatar URL with a URL pointing to the account avatar endpoint.
   * @param user The user whose avatar URL to replace.
   * @returns The user with the avatar URL replaced.
   */
  #replaceAvatarURL(user: User): User {
    if (user.avatar === `${basePath}${usersAPIPath}/${encodeURIComponent(user.email)}${usersAvatarEndpointSuffix}`)
      user.avatar = `${basePath}${accountAPIPath}${usersAvatarEndpointSuffix}`;
    return user;
  }

  /**
   * Read the user and replace the avatar URL with a URL pointing to the user avatar endpoint.
   * @param email The email address of the user.
   * @returns The user.
   * @throws an {@link APIError} if the user does not exist.
   */
  async read(email: string): Promise<User> {
    return this.#replaceAvatarURL(await this.userService.read(email));
  }

  /**
   * Read the avatar of the user.
   * @param email The email address of the user.
   * @returns The avatar of the user.
   * @throws an {@link APIError} if the user does not exist or does not have an avatar.
   */
  async readAvatar(email: string): Promise<{ mimeType: string; buffer: Buffer }> {
    return await this.userService.readAvatar(email);
  }

  /**
   * Update the user.
   * @param email The email address of the user.
   * @param newValues The new values for the user.
   * @throws an {@link APIError} if the user does not exist.
   */
  async update(email: string, newValues: Partial<User>) {
    await this.userService.update(email, newValues);
  }

  /**
   * Removes an OpenID Connect identity from the user.
   * @param email The email address of the user.
   * @throws an {@link APIError} if the user does not exist.
   */
  async removeOIDCIdentity(email: string) {
    await this.userService.removeOIDCIdentity(email);
  }

  /**
   * Delete the user.
   * @param email The email address of the user to delete.
   * @throws an {@link APIError} if the user does not exist.
   */
  async delete(email: string) {
    await this.userService.delete(email);
  }
}

export default AccountService;
