import { Request, Response } from "express";
import { User } from "../models/user.js";
import { updateUser, deleteUser } from "../redis/repositories/user/userRepository.js";

/**
 * This class is responsible for providing user information.
 */
class UserController {
  /**
   * Returns the current user fetched during session validation.
   *
   * @param {Request} _ The request.
   * @param {Response} res The response.
   * @returns {Response} a response with the user.
   */
  get(_: Request, res: Response) {
    const user: Partial<User> = res.locals.user;
    // Remove information required for authentication.
    delete user.credentialID;
    delete user.credentialPublicKey;
    delete user.counter;
    return res.status(200).json(user);
  }

  /**
   * Updates the current user in Redis.
   *
   * @param {Request} req The request.
   * @param {Response} res The response.
   * @returns {Response} a 204 response if the user was updated successfully
   */
  async patch(req: Request, res: Response) {
    const user: User = res.locals.user;
    const { name, phone } = req.query;
    const { avatar } = req.body;
    if (
      (typeof name === "string" || typeof name === "undefined") &&
      (typeof avatar === "string" || typeof avatar === "undefined") &&
      (typeof phone === "string" || typeof phone === "undefined")
    ) {
      await updateUser(user.email, {
        name,
        avatar,
        phone,
      });
      return res.sendStatus(204).end();
    }
  }

  /**
   * Deletes the current user from Redis.
   *
   * @param {Request} _ The request.
   * @param {Response} res The response.
   */
  async delete(_: Request, res: Response) {
    const user: User = res.locals.user;
    await deleteUser(user.email);
    return res.sendStatus(204).end();
  }
}

export default new UserController();
