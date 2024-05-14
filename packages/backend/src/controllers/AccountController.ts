import type { User } from "@rating-tracker/commons";
import { GENERAL_ACCESS, accountAvatarEndpointSuffix, accountAPIPath, baseURL } from "@rating-tracker/commons";
import type { Request, RequestHandler, Response } from "express";
import express from "express";

import { updateUserWithCredentials, deleteUser, readUser, readUserAvatar } from "../db/tables/userTable";
import * as user from "../openapi/parameters/user";
import { notFound, unauthorized, unsupportedMediaType } from "../openapi/responses/clientError";
import { internalServerError, notImplemented } from "../openapi/responses/serverError";
import { created, noContent, okAvatar, okUser } from "../openapi/responses/success";
import { updateSession } from "../redis/repositories/sessionRepository";
import APIError from "../utils/APIError";
import Endpoint from "../utils/Endpoint";

import SingletonController from "./SingletonController";

/**
 * This class is responsible for handling a user’s own account information.
 */
class AccountController extends SingletonController {
  path = accountAPIPath;
  tags = ["Account API"];

  /**
   * Returns the current user fetched during session validation. If no user is logged in, an empty object is returned.
   * @param _ The request.
   * @param res The response.
   */
  @Endpoint({
    spec: {
      summary: "Get the current user",
      description:
        "Returns the current user fetched during session validation. " +
        "If no user is logged in, an empty object is returned.",
      responses: { "200": okUser },
    },
    method: "get",
    path: "",
    accessRights: 0,
  })
  get: RequestHandler = (_: Request, res: Response) => {
    const user: User = { ...res.locals.user };
    if (user?.avatar?.startsWith("data:")) user.avatar = `${baseURL}${accountAPIPath}${accountAvatarEndpointSuffix}`;
    res.status(200).json(user).end();
  };

  /**
   * Returns the avatar of the current user fetched during session validation.
   * @param _ The request.
   * @param res The response.
   */
  @Endpoint({
    spec: {
      summary: "Get the avatar of the current user",
      description: "Returns the avatar of the current user fetched during session validation.",
      parameters: [
        {
          name: "v",
          in: "query",
          description: "A timestamp used to invalidate the client cache. Will not be processed by the server.",
          required: false,
          schema: { type: "integer" },
        },
      ],
      responses: {
        "200": okAvatar,
        "401": unauthorized,
        "404": notFound,
        "500": internalServerError,
        "501": notImplemented,
      },
    },
    method: "get",
    path: accountAvatarEndpointSuffix,
    accessRights: GENERAL_ACCESS,
  })
  getAvatar: RequestHandler = async (_: Request, res: Response) => {
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
  };

  /**
   * Updates the current user in the database.
   * @param req The request.
   * @param res The response.
   */
  @Endpoint({
    spec: {
      summary: "Update the current user",
      description: "Updates the current user in the database.",
      parameters: [
        { ...user.email, allowEmptyValue: true },
        { ...user.name, allowEmptyValue: true },
        { ...user.phone, allowEmptyValue: true },
        user.subscriptions,
      ],
      responses: { "204": noContent, "401": unauthorized },
    },
    method: "patch",
    path: "",
    accessRights: GENERAL_ACCESS,
  })
  patch: RequestHandler = async (req: Request, res: Response) => {
    const user: User = res.locals.user;
    const { email, name, phone, subscriptions } = req.query;
    if (
      (typeof email !== "string" && typeof email !== "undefined") ||
      (typeof name !== "string" && typeof name !== "undefined") ||
      (typeof phone !== "string" && typeof phone !== "undefined") ||
      (typeof subscriptions !== "number" && typeof subscriptions !== "undefined")
    )
      throw new APIError(400, "Invalid query parameters.");
    await updateUserWithCredentials(user.email, { email, name, phone, subscriptions });
    if (email) {
      // If the user’s email changed, the session needs to be updated.
      res.locals.user = await readUser(email);
      await updateSession(req.cookies.authToken, res.locals.user.email);
    }
    res.status(204).end();
  };

  /**
   * Creates an avatar for the current user in the database.
   * @param req The request.
   * @param res The response.
   */
  @Endpoint({
    spec: {
      summary: "Create an avatar for the current user",
      description: "Creates an avatar for the current user in the database.",
      requestBody: { required: true, content: { "image/avif": { schema: { type: "string", format: "binary" } } } },
      responses: { "201": created, "401": unauthorized, "415": unsupportedMediaType },
    },
    method: "put",
    path: accountAvatarEndpointSuffix,
    accessRights: GENERAL_ACCESS,
    bodyParser: express.raw({ type: ["image/avif"], limit: "1mb" }),
  })
  putAvatar: RequestHandler = async (req: Request, res: Response) => {
    const avatarBody = (req.body as Buffer)?.toString("base64");
    if (!avatarBody) throw new APIError(400, "Invalid request body.");
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
  };

  /**
   * Deletes the current user from the database.
   * @param _ The request.
   * @param res The response.
   */
  @Endpoint({
    spec: {
      summary: "Delete the current user",
      description: "Deletes the current user from the database.",
      responses: { "204": noContent, "401": unauthorized },
    },
    method: "delete",
    path: "",
    accessRights: GENERAL_ACCESS,
  })
  delete: RequestHandler = async (_: Request, res: Response) => {
    await deleteUser(res.locals.user.email);
    res.status(204).end();
  };

  /**
   * Deletes the avatar of the current user from the database.
   * @param _ The request.
   * @param res The response.
   */
  @Endpoint({
    spec: {
      summary: "Delete the avatar of the current user",
      description: "Deletes the avatar of the current user from the database.",
      responses: { "204": noContent, "401": unauthorized },
    },
    method: "delete",
    path: accountAvatarEndpointSuffix,
    accessRights: GENERAL_ACCESS,
  })
  deleteAvatar: RequestHandler = async (_: Request, res: Response) => {
    await updateUserWithCredentials(res.locals.user.email, { avatar: null });
    res.status(204).end();
  };
}

export default new AccountController();
