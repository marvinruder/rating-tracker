import type { User } from "@rating-tracker/commons";
import type { MessageHeaders } from "emailjs";
import { SMTPClient, SMTPError, SMTPErrorStates } from "emailjs";

import Logger from "../utils/logger";
import Singleton from "../utils/Singleton";

/**
 * An email template reference.
 */
type EmailTemplate = "welcome";

/**
 * This service provides methods to send emails.
 */
class EmailService extends Singleton {
  constructor() {
    super();
  }

  /**
   * A record of email generators for different templates.
   */
  static #templates: Record<EmailTemplate, (user: User) => Pick<MessageHeaders, "subject" | "text">> = {
    welcome: (user: User) => ({
      subject: `Welcome to Rating Tracker, ${user.name}!`,
      text:
        `Hello, ${user.name}!\n\n` +
        `Your account at https://${process.env.SUBDOMAIN ? `${process.env.SUBDOMAIN}.` : ""}${process.env.DOMAIN} ` +
        "has been activated. You can now log in using the WebAuthn credentials you created during registration.",
    }),
  } as const;

  /**
   * Returns a new SMTP client based on the configuration information available in the environment variables.
   * @returns A new SMTP client.
   */
  static #getSMTPClient = () =>
    new SMTPClient({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      user: process.env.SMTP_USER,
      password: process.env.SMTP_PASSWORD,
      ssl: process.env.SMTP_SECURITY === "ssl",
      tls: process.env.SMTP_SECURITY === "tls",
      domain: `${process.env.SUBDOMAIN ? `${process.env.SUBDOMAIN}.` : ""}${process.env.DOMAIN}`,
    });

  /**
   * Returns an error with a short descriptive error message based on the SMTP error code.
   * @param err The SMTP error.
   * @returns An error with a short descriptive error message.
   */
  static #getSMTPError = (err: SMTPError) => {
    switch (err.code) {
      case SMTPErrorStates.COULDNOTCONNECT:
        return new Error("Could not connect to SMTP server");
      case SMTPErrorStates.BADRESPONSE:
        return new Error("Bad response from SMTP server");
      case SMTPErrorStates.AUTHFAILED:
        return new Error("Authentication with SMTP server failed");
      case SMTPErrorStates.TIMEDOUT:
        return new Error("SMTP server timed out");
      case SMTPErrorStates.ERROR:
        return new Error("Error during connection with SMTP server");
      case SMTPErrorStates.NOCONNECTION:
        return new Error("No connection to SMTP server");
      case SMTPErrorStates.AUTHNOTSUPPORTED:
        return new Error("SMTP server does not support authentication");
      case SMTPErrorStates.CONNECTIONCLOSED:
        return new Error("Connection to SMTP server closed");
      case SMTPErrorStates.CONNECTIONENDED:
        return new Error("Connection to SMTP server ended");
      case SMTPErrorStates.CONNECTIONAUTH:
        return new Error("Unable to establish SSL connection with SMTP server");
      default:
        return err;
    }
  };

  /**
   * Sends an email to a user.
   */
  async sendEmail(user: User, template: EmailTemplate): Promise<void> {
    // Only send an email if an SMTP server and a sender are specified in the environment variables
    if (process.env.SMTP_HOST && process.env.SMTP_FROM) {
      const client = EmailService.#getSMTPClient();
      const content = EmailService.#templates[template](user);
      const sender = `"Rating Tracker" <${process.env.SMTP_FROM}>`;
      const recipient = `"${user.name}" <${user.email}>`;
      try {
        await client.sendAsync({ ...content, from: sender, to: recipient });
        Logger.info({ prefix: "email" }, `Email “${content.subject}” sent to recipient ${recipient}.`);
      } catch (e) {
        Logger.error(
          { prefix: "email", err: e, email: { from: sender, to: recipient, subject: content.subject } },
          "Failed to send email",
        );
      }
    }
  }

  /**
   * Checks if the email provider is reachable.
   * @returns A {@link Promise} that resolves when the email provider is reachable, or rejects with an error if it is
   *                            not.
   */
  isReadyOrUnused = (): Promise<string | void> =>
    process.env.SMTP_HOST && process.env.SMTP_FROM
      ? new Promise((resolve, reject) => {
          const rejectSMTPError = (err: Error) => {
            Logger.debug({ prefix: "email", err }, "SMTP server is unreachable.");
            reject(err instanceof SMTPError ? EmailService.#getSMTPError(err) : err);
          };

          const testClient = EmailService.#getSMTPClient();

          const callback = (err: Error) => {
            if (!err) {
              testClient.smtp.quit();
              Logger.debug({ prefix: "email" }, "SMTP server is reachable.");
              resolve();
            } else {
              rejectSMTPError(err);
            }
          };

          testClient.smtp.connect((err: Error) => {
            if (err) {
              rejectSMTPError(err);
            }
            if (!testClient.smtp.authorized()) {
              testClient.smtp.login(callback);
            } else {
              testClient.smtp.ehlo_or_helo_if_needed(callback);
            }
          });
        })
      : /* c8 ignore next */ Promise.resolve("An email provider is not configured on this instance.");
}

export default EmailService;
