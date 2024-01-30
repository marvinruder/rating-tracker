import type { User } from "@rating-tracker/commons";
import {
  ADMINISTRATIVE_ACCESS,
  GENERAL_ACCESS,
  baseURL,
  usersAvatarEndpointSuffix,
  usersEndpointPath,
} from "@rating-tracker/commons";
import type { Request, Response } from "express";
import express from "express";

import { deleteUser, readAllUsers, readUser, readUserAvatar, updateUserWithCredentials } from "../db/tables/userTable";
import APIError from "../utils/APIError";
import Router from "../utils/router";

/**
 * This class is responsible for handling information of other users.
 */
export class UsersController {
  /**
   * Returns a list of users.
   *
   * @param {Request} _ Request object
   * @param {Response} res Response object
   */
  @Router({
    path: usersEndpointPath,
    method: "get",
    accessRights: GENERAL_ACCESS + ADMINISTRATIVE_ACCESS,
  })
  async getList(_: Request, res: Response) {
    const users: User[] = (await readAllUsers()).map((user: User) => {
      if (user.avatar?.startsWith("data:"))
        user.avatar = `${baseURL}${usersEndpointPath}/${encodeURIComponent(user.email)}${usersAvatarEndpointSuffix}`;
      return user;
    });
    res.status(200).json(users).end();
  }

  /**
   * Reads a single user from the database.
   *
   * @param {Request} req The request.
   * @param {Response} res The response.
   */
  @Router({
    path: usersEndpointPath + "/:email",
    method: "get",
    accessRights: GENERAL_ACCESS + ADMINISTRATIVE_ACCESS,
  })
  async get(req: Request, res: Response) {
    const user: User = await readUser(req.params.email);
    if (user.avatar?.startsWith("data:"))
      user.avatar = `${baseURL}${usersEndpointPath}/${encodeURIComponent(user.email)}${usersAvatarEndpointSuffix}`;
    res.status(200).json(user).end();
  }

  /**
   * Returns the avatar of a user from the database.
   *
   * @param {Request} req The request.
   * @param {Response} res The response.
   */
  @Router({
    path: usersEndpointPath + "/:email" + usersAvatarEndpointSuffix,
    method: "get",
    accessRights: GENERAL_ACCESS + ADMINISTRATIVE_ACCESS,
  })
  async getAvatar(req: Request, res: Response) {
    const avatar = await readUserAvatar(req.params.email);
    switch (avatar.mimeType) {
      case "image/jpeg":
      case "image/avif":
        res.setHeader("content-type", avatar.mimeType);
        res.status(200).send(avatar.buffer).end();
        break;
      default: // Other types cannot exist in the database.
        /* c8 ignore next */
        throw new APIError(501, `Avatars of type “${avatar.mimeType}” are not supported.`);
    }
  }

  /**
   * Updates a user in the database.
   *
   * @param {Request} req The request.
   * @param {Response} res The response.
   */
  @Router({
    path: usersEndpointPath + "/:email",
    method: "patch",
    accessRights: GENERAL_ACCESS + ADMINISTRATIVE_ACCESS,
  })
  async patch(req: Request, res: Response) {
    const { email } = req.params;
    const { name, phone, accessRights, subscriptions } = req.query;
    const newEmail = req.query.email;
    if (
      (typeof newEmail === "string" || typeof newEmail === "undefined") &&
      (typeof name === "string" || typeof name === "undefined") &&
      (typeof phone === "string" || typeof phone === "undefined") &&
      (typeof accessRights === "number" || typeof accessRights === "undefined") &&
      (typeof subscriptions === "number" || typeof subscriptions === "undefined")
    ) {
      await updateUserWithCredentials(email, { email: newEmail, name, phone, accessRights, subscriptions });
      res.status(204).end();
    }
  }

  /**
   * Creates an avatar for a user in the database.
   *
   * @param {Request} req The request.
   * @param {Response} res The response.
   */
  @Router({
    path: usersEndpointPath + "/:email" + usersAvatarEndpointSuffix,
    method: "put",
    accessRights: GENERAL_ACCESS + ADMINISTRATIVE_ACCESS,
    bodyParser: express.raw({ type: ["image/avif"], limit: "1mb" }),
  })
  async putAvatar(req: Request, res: Response) {
    const avatarBody = (req.body as Buffer)?.toString("base64");
    if (avatarBody) {
      switch (req.headers["content-type"]) {
        case "image/avif":
          await updateUserWithCredentials(req.params.email, {
            avatar: `data:${req.headers["content-type"]};base64,${avatarBody}`,
          });
          res.status(201).end();
          break;
        default: // This is caught by the OpenAPI validator.
          /* c8 ignore next */
          throw new APIError(415, `Avatars of type “${req.headers["content-type"]}” are not supported.`);
      }
    }
  }

  /**
   * Deletes a user from the database.
   *
   * @param {Request} req The request.
   * @param {Response} res The response.
   */
  @Router({
    path: usersEndpointPath + "/:email",
    method: "delete",
    accessRights: GENERAL_ACCESS + ADMINISTRATIVE_ACCESS,
  })
  async delete(req: Request, res: Response) {
    await deleteUser(req.params.email);
    res.status(204).end();
  }

  /**
   * Deletes the avatar of a user from the database.
   *
   * @param {Request} req The request.
   * @param {Response} res The response.
   */
  @Router({
    path: usersEndpointPath + "/:email" + usersAvatarEndpointSuffix,
    method: "delete",
    accessRights: GENERAL_ACCESS + ADMINISTRATIVE_ACCESS,
  })
  async deleteAvatar(req: Request, res: Response) {
    await updateUserWithCredentials(req.params.email, { avatar: null });
    res.status(204).end();
  }
}
