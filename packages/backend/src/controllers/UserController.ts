import { Request, Response } from "express";
import { GENERAL_ACCESS, User, userEndpointPath } from "@rating-tracker/commons";
import { updateUserWithCredentials, deleteUser, readUser } from "../db/tables/userTable.js";
import Router from "../utils/router.js";
import { updateSession } from "../redis/repositories/sessionRepository.js";

/**
 * This class is responsible for handling user information.
 */
export class UserController {
  /**
   * Returns the current user fetched during session validation.
   *
   * @param {Request} _ The request.
   * @param {Response} res The response.
   */
  @Router({
    path: userEndpointPath,
    method: "get",
    accessRights: GENERAL_ACCESS,
  })
  get(_: Request, res: Response) {
    res.status(200).json(res.locals.user).end();
  }

  /**
   * Updates the current user in the database.
   *
   * @param {Request} req The request.
   * @param {Response} res The response.
   */
  @Router({
    path: userEndpointPath,
    method: "patch",
    accessRights: GENERAL_ACCESS,
  })
  async patch(req: Request, res: Response) {
    const user: User = res.locals.user;
    const { email, name, phone, subscriptions } = req.query;
    const { avatar } = req.body;
    if (
      (typeof email === "string" || typeof email === "undefined") &&
      (typeof name === "string" || typeof name === "undefined") &&
      (typeof avatar === "string" || typeof avatar === "undefined") &&
      (typeof phone === "string" || typeof phone === "undefined") &&
      (typeof subscriptions === "number" || typeof subscriptions === "undefined")
    ) {
      await updateUserWithCredentials(user.email, {
        email,
        name,
        avatar,
        phone,
        subscriptions,
      });
      res.locals.user = await readUser(email);
      await updateSession(req.cookies.authToken, res.locals.user.email);
      res.status(204).end();
    }
  }

  /**
   * Deletes the current user from the database.
   *
   * @param {Request} _ The request.
   * @param {Response} res The response.
   */
  @Router({
    path: userEndpointPath,
    method: "delete",
    accessRights: GENERAL_ACCESS,
  })
  async delete(_: Request, res: Response) {
    await deleteUser(res.locals.user.email);
    res.status(204).end();
  }
}
