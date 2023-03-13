import { Request, Response } from "express";
import { User } from "rating-tracker-commons";
import { updateUserWithCredentials, deleteUser } from "../db/tables/userTable.js";

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
    return res.status(200).json(res.locals.user);
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
    const { name, phone, subscriptions } = req.query;
    const { avatar } = req.body;
    if (
      (typeof name === "string" || typeof name === "undefined") &&
      (typeof avatar === "string" || typeof avatar === "undefined") &&
      (typeof phone === "string" || typeof phone === "undefined") &&
      (typeof subscriptions === "number" || typeof subscriptions === "undefined")
    ) {
      await updateUserWithCredentials(user.email, {
        name,
        avatar,
        phone,
        subscriptions,
      });
      return res.status(204).end();
    }
  }

  /**
   * Deletes the current user from Redis.
   *
   * @param {Request} _ The request.
   * @param {Response} res The response.
   */
  async delete(_: Request, res: Response) {
    await deleteUser(res.locals.user.email);
    return res.status(204).end();
  }
}

export default new UserController();
