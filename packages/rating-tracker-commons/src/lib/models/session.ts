/**
 * A session related to a user, the ID of which is stored in a cookie.
 */
export class Session {
  /**
   * The ID of the session, used as a token in session cookies.
   */
  sessionID: string;
  /**
   * The email address of the user.
   */
  email: string;
}
