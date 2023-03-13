import { Request, Response } from "express";
import { ADMINISTRATIVE_ACCESS } from "rating-tracker-commons";
import APIError from "../utils/apiError.js";
import { deleteUser, readAllUsers, readUser, updateUserWithCredentials } from "../db/tables/userTable.js";

/**
 * This class is responsible for providing user information.
 */
class UserManagementController {
  /**
   * Returns a list of users.
   *
   * @param {Request} req Request object
   * @param {Response} res Response object
   * @returns {Response} a response containing the user list.
   */
  async getList(req: Request, res: Response) {
    if (!res.locals.user?.hasAccessRight(ADMINISTRATIVE_ACCESS)) {
      throw new APIError(403, "This user account does not have the necessary access rights to administer users.");
    }

    // Respond with the list of users
    return res.status(200).json(await readAllUsers());
  }

  /**
   * Reads a single user from Redis.
   *
   * @param {Request} req The request.
   * @param {Response} res The response.
   * @returns {Response} a response with the user.
   */
  async get(req: Request, res: Response) {
    if (!res.locals.user?.hasAccessRight(ADMINISTRATIVE_ACCESS)) {
      throw new APIError(403, "This user account does not have the necessary access rights to administer users.");
    }
    return res.status(200).json(await readUser(req.params[0]));
  }

  /**
   * Updates a user in Redis.
   *
   * @param {Request} req The request.
   * @param {Response} res The response.
   * @returns {Response} a 204 response if the user was updated successfully
   */
  async patch(req: Request, res: Response) {
    if (!res.locals.user?.hasAccessRight(ADMINISTRATIVE_ACCESS)) {
      throw new APIError(403, "This user account does not have the necessary access rights to administer users.");
    }
    const email = req.params[0];
    const { name, phone, accessRights, subscriptions } = req.query;
    const { avatar } = req.body;
    if (
      (typeof name === "string" || typeof name === "undefined") &&
      (typeof avatar === "string" || typeof avatar === "undefined") &&
      (typeof phone === "string" || typeof phone === "undefined") &&
      (typeof accessRights === "number" || typeof accessRights === "undefined") &&
      (typeof subscriptions === "number" || typeof subscriptions === "undefined")
    ) {
      await updateUserWithCredentials(email, {
        name,
        avatar,
        phone,
        accessRights,
        subscriptions,
      });
      return res.status(204).end();
    }
  }

  /**
   * Deletes a user from Redis.
   *
   * @param {Request} req The request.
   * @param {Response} res The response.
   * @returns {Response} a 204 response if the user was deleted successfully
   */
  async delete(req: Request, res: Response) {
    if (!res.locals.user?.hasAccessRight(ADMINISTRATIVE_ACCESS)) {
      throw new APIError(403, "This user account does not have the necessary access rights to administer users.");
    }
    await deleteUser(req.params[0]);
    return res.status(204).end();
  }
}

export default new UserManagementController();
