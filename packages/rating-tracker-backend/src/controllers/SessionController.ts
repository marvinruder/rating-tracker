import { Request, Response } from "express";
import { deleteSession } from "../redis/repositories/sessionRepository.js";

/**
 * This class is responsible for providing session information.
 */
class SessionController {
  /**
   * Deletes the current session from Redis and clears the session cookie.
   *
   * @param {Request} req The request.
   * @param {Response} res The response.
   */
  async delete(req: Request, res: Response) {
    // deepcode ignore Ssrf: This is a custom function named `fetch()`, which does not perform a request
    await deleteSession(req.cookies.authToken);
    res.clearCookie("authToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development", // allow plain HTTP in development
      sameSite: true,
    }); // Clears the session cookie.
    return res.status(204).end();
  }
}

export default new SessionController();
