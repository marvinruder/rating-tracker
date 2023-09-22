import {
  ADMINISTRATIVE_ACCESS,
  GENERAL_ACCESS,
  userListEndpointPath,
  userManagementEndpointPath,
} from "@rating-tracker/commons";
import { Request, Response } from "express";

import { deleteUser, readAllUsers, readUser, updateUserWithCredentials } from "../db/tables/userTable";
import Router from "../utils/router";

/**
 * This class is responsible for handling information of other users.
 */
export class UserManagementController {
  /**
   * Returns a list of users.
   *
   * @param {Request} _ Request object
   * @param {Response} res Response object
   */
  @Router({
    path: userListEndpointPath,
    method: "get",
    accessRights: GENERAL_ACCESS + ADMINISTRATIVE_ACCESS,
  })
  async getList(_: Request, res: Response) {
    res
      .status(200)
      .json(await readAllUsers())
      .end();
  }

  /**
   * Reads a single user from the database.
   *
   * @param {Request} req The request.
   * @param {Response} res The response.
   */
  @Router({
    path: userManagementEndpointPath + "/*",
    method: "get",
    accessRights: GENERAL_ACCESS + ADMINISTRATIVE_ACCESS,
  })
  async get(req: Request, res: Response) {
    res
      .status(200)
      .json(await readUser(req.params[0]))
      .end();
  }

  /**
   * Updates a user in the database.
   *
   * @param {Request} req The request.
   * @param {Response} res The response.
   */
  @Router({
    path: userManagementEndpointPath + "/*",
    method: "patch",
    accessRights: GENERAL_ACCESS + ADMINISTRATIVE_ACCESS,
  })
  async patch(req: Request, res: Response) {
    const email = req.params[0];
    const { name, phone, accessRights, subscriptions } = req.query;
    const newEmail = req.query.email;
    const { avatar } = req.body;
    if (
      (typeof newEmail === "string" || typeof newEmail === "undefined") &&
      (typeof name === "string" || typeof name === "undefined") &&
      (typeof avatar === "string" || typeof avatar === "undefined") &&
      (typeof phone === "string" || typeof phone === "undefined") &&
      (typeof accessRights === "number" || typeof accessRights === "undefined") &&
      (typeof subscriptions === "number" || typeof subscriptions === "undefined")
    ) {
      await updateUserWithCredentials(email, {
        email: newEmail,
        name,
        avatar,
        phone,
        accessRights,
        subscriptions,
      });
      res.status(204).end();
    }
  }

  /**
   * Deletes a user from the database.
   *
   * @param {Request} req The request.
   * @param {Response} res The response.
   */
  @Router({
    path: userManagementEndpointPath + "/*",
    method: "delete",
    accessRights: GENERAL_ACCESS + ADMINISTRATIVE_ACCESS,
  })
  async delete(req: Request, res: Response) {
    await deleteUser(req.params[0]);
    res.status(204).end();
  }
}
