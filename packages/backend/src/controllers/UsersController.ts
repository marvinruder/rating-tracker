import type { User } from "@rating-tracker/commons";
import {
  ADMINISTRATIVE_ACCESS,
  GENERAL_ACCESS,
  baseURL,
  usersAvatarEndpointSuffix,
  usersEndpointPath,
} from "@rating-tracker/commons";
import type { Request, RequestHandler, Response } from "express";
import express from "express";

import { deleteUser, readAllUsers, readUser, readUserAvatar, updateUserWithCredentials } from "../db/tables/userTable";
import * as user from "../openapi/parameters/user";
import { forbidden, notFound, unauthorized, unsupportedMediaType } from "../openapi/responses/clientError";
import { internalServerError, notImplemented } from "../openapi/responses/serverError";
import { created, noContent, okAvatar, okUser, okUserList } from "../openapi/responses/success";
import APIError from "../utils/APIError";
import Endpoint from "../utils/Endpoint";
import Singleton from "../utils/Singleton";

/**
 * This class is responsible for handling information of other users.
 */
class UsersController extends Singleton {
  /**
   * Returns a list of users.
   * @param _ Request object
   * @param res Response object
   */
  @Endpoint({
    spec: {
      tags: ["Users API"],
      operationId: "getUsers",
      summary: "Get a list of users",
      description: "Returns a list of users.",
      responses: { "200": okUserList, "401": unauthorized, "403": forbidden },
    },
    method: "get",
    path: usersEndpointPath,
    accessRights: GENERAL_ACCESS + ADMINISTRATIVE_ACCESS,
  })
  getList: RequestHandler = async (_: Request, res: Response) => {
    const users: User[] = (await readAllUsers()).map((user: User) => {
      if (user.avatar?.startsWith("data:"))
        user.avatar = `${baseURL}${usersEndpointPath}/${encodeURIComponent(user.email)}${usersAvatarEndpointSuffix}`;
      return user;
    });
    res.status(200).json(users).end();
  };

  /**
   * Reads a single user from the database.
   * @param req The request.
   * @param res The response.
   */
  @Endpoint({
    spec: {
      tags: ["Users API"],
      operationId: "getUser",
      summary: "Get a user",
      description: "Reads a single user from the database.",
      parameters: [{ ...user.email, in: "path", required: true }],
      responses: { "200": okUser, "401": unauthorized, "403": forbidden, "404": notFound },
    },
    method: "get",
    path: usersEndpointPath + "/{email}",
    accessRights: GENERAL_ACCESS + ADMINISTRATIVE_ACCESS,
  })
  get: RequestHandler = async (req: Request, res: Response) => {
    const user: User = await readUser(req.params.email);
    if (user.avatar?.startsWith("data:"))
      user.avatar = `${baseURL}${usersEndpointPath}/${encodeURIComponent(user.email)}${usersAvatarEndpointSuffix}`;
    res.status(200).json(user).end();
  };

  /**
   * Returns the avatar of a user from the database.
   * @param req The request.
   * @param res The response.
   */
  @Endpoint({
    spec: {
      tags: ["Users API"],
      operationId: "getAvatar",
      summary: "Get the avatar of a user",
      description: "Returns the avatar of a user from the database.",
      parameters: [
        { ...user.email, in: "path", required: true },
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
        "403": forbidden,
        "404": notFound,
        "500": internalServerError,
        "501": notImplemented,
      },
    },
    method: "get",
    path: usersEndpointPath + "/{email}" + usersAvatarEndpointSuffix,
    accessRights: GENERAL_ACCESS + ADMINISTRATIVE_ACCESS,
  })
  getAvatar: RequestHandler = async (req: Request, res: Response) => {
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
  };

  /**
   * Updates a user in the database.
   * @param req The request.
   * @param res The response.
   */
  @Endpoint({
    spec: {
      tags: ["Users API"],
      operationId: "patchUser",
      summary: "Update a user",
      description: "Updates a user in the database.",
      parameters: [
        { ...user.email, in: "path", required: true },
        { ...user.email, allowEmptyValue: true },
        { ...user.name, allowEmptyValue: true },
        { ...user.phone, allowEmptyValue: true },
        user.accessRights,
        user.subscriptions,
      ],
      responses: { "204": noContent, "401": unauthorized, "403": forbidden, "404": notFound },
    },
    method: "patch",
    path: usersEndpointPath + "/{email}",
    accessRights: GENERAL_ACCESS + ADMINISTRATIVE_ACCESS,
  })
  patch: RequestHandler = async (req: Request, res: Response) => {
    const { email } = req.params;
    const { name, phone, accessRights, subscriptions } = req.query;
    const newEmail = req.query.email;
    if (
      (typeof newEmail !== "string" && typeof newEmail !== "undefined") ||
      (typeof name !== "string" && typeof name !== "undefined") ||
      (typeof phone !== "string" && typeof phone !== "undefined") ||
      (typeof accessRights !== "number" && typeof accessRights !== "undefined") ||
      (typeof subscriptions !== "number" && typeof subscriptions !== "undefined")
    )
      throw new APIError(400, "Invalid query parameters.");
    await updateUserWithCredentials(email, { email: newEmail, name, phone, accessRights, subscriptions });
    res.status(204).end();
  };

  /**
   * Creates an avatar for a user in the database.
   * @param req The request.
   * @param res The response.
   */
  @Endpoint({
    spec: {
      tags: ["Users API"],
      operationId: "createAvatar",
      summary: "Create an avatar for a user",
      description: "Creates an avatar for a user in the database.",
      parameters: [{ ...user.email, in: "path", required: true }],
      requestBody: {
        required: true,
        content: {
          "image/avif": { schema: { type: "string", format: "binary" } },
          "image/jpeg": { schema: { type: "string", format: "binary" } },
        },
      },
      responses: { "201": created, "401": unauthorized, "403": forbidden, "404": notFound },
    },
    method: "put",
    path: usersEndpointPath + "/{email}" + usersAvatarEndpointSuffix,
    accessRights: GENERAL_ACCESS + ADMINISTRATIVE_ACCESS,
    bodyParser: express.raw({ type: ["image/avif"], limit: "1mb" }),
  })
  putAvatar: RequestHandler = async (req: Request, res: Response) => {
    const avatarBody = (req.body as Buffer)?.toString("base64");
    if (!avatarBody) throw new APIError(400, "Invalid request body.");
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
  };

  /**
   * Deletes a user from the database.
   * @param req The request.
   * @param res The response.
   */
  @Endpoint({
    spec: {
      tags: ["Users API"],
      operationId: "deleteUser",
      summary: "Delete a user",
      description: "Deletes a user from the database.",
      parameters: [{ ...user.email, in: "path", required: true }],
      responses: { "204": noContent, "401": unauthorized, "403": forbidden, "404": notFound },
    },
    method: "delete",
    path: usersEndpointPath + "/{email}",
    accessRights: GENERAL_ACCESS + ADMINISTRATIVE_ACCESS,
  })
  delete: RequestHandler = async (req: Request, res: Response) => {
    await deleteUser(req.params.email);
    res.status(204).end();
  };

  /**
   * Deletes the avatar of a user from the database.
   * @param req The request.
   * @param res The response.
   */
  @Endpoint({
    spec: {
      tags: ["Users API"],
      operationId: "deleteAvatar",
      summary: "Delete the avatar of a user",
      description: "Deletes the avatar of a user from the database.",
      parameters: [{ ...user.email, in: "path", required: true }],
      responses: {
        "204": noContent,
        "401": unauthorized,
        "403": forbidden,
        "404": notFound,
        "415": unsupportedMediaType,
      },
    },
    method: "delete",
    path: usersEndpointPath + "/{email}" + usersAvatarEndpointSuffix,
    accessRights: GENERAL_ACCESS + ADMINISTRATIVE_ACCESS,
  })
  deleteAvatar: RequestHandler = async (req: Request, res: Response) => {
    await updateUserWithCredentials(req.params.email, { avatar: null });
    res.status(204).end();
  };
}

export default new UsersController();
