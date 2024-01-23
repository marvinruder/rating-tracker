import type { User } from "@rating-tracker/commons";
import { GENERAL_ACCESS, accountEndpointPath } from "@rating-tracker/commons";
import type { Request, Response } from "express";

import { updateUserWithCredentials, deleteUser, readUser } from "../db/tables/userTable";
import { updateSession } from "../redis/repositories/sessionRepository";
import Router from "../utils/router";

/**
 * This class is responsible for handling a user’s own account information.
 */
export class AccountController {
  /**
   * Returns the current user fetched during session validation. If no user is logged in, an empty object is returned.
   *
   * @param {Request} _ The request.
   * @param {Response} res The response.
   */
  @Router({
    path: accountEndpointPath,
    method: "get",
    accessRights: 0,
  })
  get(_: Request, res: Response) {
    res
      .status(200)
      .json(res.locals.user ?? {})
      .end();
  }

  /**
   * Updates the current account in the database.
   *
   * @param {Request} req The request.
   * @param {Response} res The response.
   */
  @Router({
    path: accountEndpointPath,
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
      if (email) {
        res.locals.user = await readUser(email);
        await updateSession(req.cookies.authToken, res.locals.user.email);
      }
      res.status(204).end();
    }
  }

  /**
   * Deletes the current account from the database.
   *
   * @param {Request} _ The request.
   * @param {Response} res The response.
   */
  @Router({
    path: accountEndpointPath,
    method: "delete",
    accessRights: GENERAL_ACCESS,
  })
  async delete(_: Request, res: Response) {
    await deleteUser(res.locals.user.email);
    res.status(204).end();
  }
}
