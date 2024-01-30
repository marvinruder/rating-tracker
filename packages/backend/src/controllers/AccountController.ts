import type { User } from "@rating-tracker/commons";
import { GENERAL_ACCESS, accountAvatarEndpointSuffix, accountEndpointPath, baseURL } from "@rating-tracker/commons";
import type { Request, Response } from "express";
import express from "express";

import { updateUserWithCredentials, deleteUser, readUser, readUserAvatar } from "../db/tables/userTable";
import { updateSession } from "../redis/repositories/sessionRepository";
import APIError from "../utils/APIError";
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
    const user: User = { ...res.locals.user };
    if (user?.avatar?.startsWith("data:"))
      user.avatar = `${baseURL}${accountEndpointPath}${accountAvatarEndpointSuffix}`;
    res.status(200).json(user).end();
  }

  /**
   * Returns the avatar of the current user fetched during session validation.
   *
   * @param {Request} _ The request.
   * @param {Response} res The response.
   */
  @Router({
    path: accountEndpointPath + accountAvatarEndpointSuffix,
    method: "get",
    accessRights: GENERAL_ACCESS,
  })
  async getAvatar(_: Request, res: Response) {
    const avatar = await readUserAvatar(res.locals.user.email);
    switch (avatar.mimeType) {
      case "image/jpeg":
      case "image/avif":
        res.setHeader("content-type", avatar.mimeType);
        res.status(200).send(avatar.buffer).end();
        break;
      default: // Other types cannot exist in the database.
        /* c8 ignore next */ throw new APIError(501, `Avatars of type “${avatar.mimeType}” are not supported.`);
    }
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
    if (
      (typeof email === "string" || typeof email === "undefined") &&
      (typeof name === "string" || typeof name === "undefined") &&
      (typeof phone === "string" || typeof phone === "undefined") &&
      (typeof subscriptions === "number" || typeof subscriptions === "undefined")
    ) {
      await updateUserWithCredentials(user.email, { email, name, phone, subscriptions });
      if (email) {
        // If the user’s email changed, the session needs to be updated.
        res.locals.user = await readUser(email);
        await updateSession(req.cookies.authToken, res.locals.user.email);
      }
      res.status(204).end();
    }
  }

  /**
   * Creates an avatar for the current account in the database.
   *
   * @param {Request} req The request.
   * @param {Response} res The response.
   */
  @Router({
    path: accountEndpointPath + accountAvatarEndpointSuffix,
    method: "put",
    accessRights: GENERAL_ACCESS,
    bodyParser: express.raw({ type: ["image/avif"], limit: "1mb" }),
  })
  async putAvatar(req: Request, res: Response) {
    const avatarBody = (req.body as Buffer)?.toString("base64");
    if (avatarBody) {
      switch (req.headers["content-type"]) {
        case "image/avif":
          await updateUserWithCredentials(res.locals.user.email, {
            avatar: `data:${req.headers["content-type"]};base64,${avatarBody}`,
          });
          res.status(201).end();
          break;
        default: // This is caught by the OpenAPI validator.
          /* c8 ignore next */
          throw new APIError(415, `Avatars of type “${req.headers["content-type"]}” are unsupported.`);
      }
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

  /**
   * Deletes the avatar of the current account from the database.
   *
   * @param {Request} _ The request.
   * @param {Response} res The response.
   */
  @Router({
    path: accountEndpointPath + accountAvatarEndpointSuffix,
    method: "delete",
    accessRights: GENERAL_ACCESS,
  })
  async deleteAvatar(_: Request, res: Response) {
    await updateUserWithCredentials(res.locals.user.email, { avatar: null });
    res.status(204).end();
  }
}
