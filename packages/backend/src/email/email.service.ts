import type { EmailTemplate, User } from "@rating-tracker/commons";
import type { MessageHeaders } from "emailjs";
import { SMTPClient, SMTPError, SMTPErrorStates } from "emailjs";

import BadGatewayError from "../utils/error/api/BadGatewayError";
import GatewayTimeoutError from "../utils/error/api/GatewayTimeoutError";
import NotImplementedError from "../utils/error/api/NotImplementedError";
import Logger from "../utils/logger";
import Singleton from "../utils/Singleton";

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
  #templates: Record<EmailTemplate, (user: User) => Pick<MessageHeaders, "subject" | "text">> = {
    Test: (user: User) => ({
      subject: "Rating Tracker Test email",
      text: `Hello ${user.name}!\n\nThis is a test email from Rating Tracker at https://${process.env.FQDN}.`,
    }),
    Welcome: (user: User) => ({
      subject: `Welcome to Rating Tracker, ${user.name}!`,
      text:
        `Hello ${user.name}!\n\n` +
        `Your account at https://${process.env.FQDN} has been activated. ` +
        "You can now log in using the WebAuthn credentials you created during registration.",
    }),
  } as const;

  /**
   * Composes a message for a user based on a template.
   * @param user The user to compose the message for.
   * @param template A reference of the template to use.
   * @returns The composed message.
   * @throws an {@link APIError} if no SMTP server is configured.
   */
  getMessage(
    user: User,
    template: EmailTemplate,
  ): Pick<MessageHeaders, "subject" | "text"> & { from: string; to: string } {
    if (!(process.env.SMTP_HOST && process.env.SMTP_FROM))
      throw new NotImplementedError("No SMTP server is configured.");

    return {
      from: `"Rating Tracker" <${process.env.SMTP_FROM}>`,
      to: `"${user.name.replaceAll('"', "")}" <${user.email}>`,
      ...this.#templates[template](user),
    };
  }

  /**
   * Sends an email to a user.
   * @param user The user to send the email to.
   * @param template A reference of the template to use.
   * @throws an {@link APIError} if no SMTP server is configured or if an error occurs while sending the email.
   */
  async sendEmail(user: User, template: EmailTemplate): Promise<void> {
    if (!(process.env.SMTP_HOST && process.env.SMTP_FROM))
      throw new NotImplementedError("No SMTP server is configured.");

    const client = new SMTPClient({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      user: process.env.SMTP_USER,
      password: process.env.SMTP_PASSWORD,
      ssl: process.env.SMTP_SECURITY === "ssl",
      tls: process.env.SMTP_SECURITY === "tls",
      domain: process.env.FQDN,
    });
    const message = this.getMessage(user, template);

    try {
      await client.sendAsync(message);
      Logger.info({ prefix: "email" }, `Email “${message.subject}” sent to recipient ${message.to}.`);
    } catch (e) {
      if (e instanceof SMTPError && e.code === SMTPErrorStates.TIMEDOUT)
        throw new GatewayTimeoutError("A timeout occurred while sending the email.", e);
      throw new BadGatewayError("An error occurred while sending the email.", e instanceof Error ? e : undefined);
    }
  }

  /**
   * Checks if the email provider is configured.
   * @returns A {@link Promise} that resolves with the configuration status of the email provider.
   */
  getStatus(): Promise<string> {
    return Promise.resolve(process.env.SMTP_HOST && process.env.SMTP_FROM ? "Configured" : "Not configured");
  }
}

export default EmailService;
