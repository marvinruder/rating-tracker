import { FetchError, type FetchResponse, type User } from "@rating-tracker/commons";

import BadGatewayError from "../utils/error/api/BadGatewayError";
import GatewayTimeoutError from "../utils/error/api/GatewayTimeoutError";
import { performFetchRequest } from "../utils/fetchRequest";
import Logger from "../utils/logger";
import Singleton from "../utils/Singleton";

/**
 * This service provides methods to send messages to users via Signal.
 */
class SignalService extends Singleton {
  constructor() {
    super();
  }

  static ERROR_PREFIX = "⚠️ " as const;
  static INFO_PREFIX = "ℹ️ " as const;

  // Emojis showing whether a change is good or bad. Used in the Signal message.
  static PREFIX_BETTER = "🟢 ";
  static PREFIX_WORSE = "🔴 ";

  /**
   * Send a message to the given users.
   * @param message The message to send.
   * @param users The users to send the message to.
   */
  sendMessage(message: string, users: User[]) {
    // Only send the message if the Signal Client URL, sender and recipients are specified in the environment variables
    if (process.env.SIGNAL_URL && process.env.SIGNAL_SENDER && users.length) {
      const number = process.env.SIGNAL_SENDER;
      // Remove duplicate phone numbers (i.e. user subscribed to all updates and has a watchlist containing the stock)
      const recipients = [...new Set(users.map((user) => user.phone).filter((phone) => phone !== null))];
      performFetchRequest(`${process.env.SIGNAL_URL}/v2/send`, {
        body: { message, number, recipients },
        method: "POST",
      }).catch((e) => {
        /* c8 ignore start */ // The mocked Signal client does not return an error
        if (e.response?.data?.error) e.message = e.response.data.error;
        Logger.error(
          { component: "signal", err: e, message: { number, recipients, message } },
          "Failed to send Signal message",
        );
        /* c8 ignore stop */
      });
    }
  }

  /**
   * Checks if the Signal Client instance is configured and reachable.
   * @returns A {@link Promise} that resolves when the Signal Client instance is reachable or not configured, or rejects
   *          with an error if it is not.
   */
  getStatus(): Promise<string> {
    return process.env.SIGNAL_URL && process.env.SIGNAL_SENDER
      ? Promise.race([
          // Request all registered accounts from the Signal Client instance
          performFetchRequest(`${process.env.SIGNAL_URL}/v1/accounts`),
          // We accept a larger timeout here because the Signal Client JVM might be slow to start
          new Promise<never>((_, reject) => setTimeout(() => reject(new GatewayTimeoutError("Not reachable")), 5000)),
        ])
          .then(
            (res: FetchResponse<string[]>) =>
              /* c8 ignore start */ // We do not receive a 2XX answer during tests
              // Check if our configured Signal sender is registered
              res.ok && res.data.includes(process.env.SIGNAL_SENDER!)
                ? Promise.resolve("Connected")
                : Promise.reject(new BadGatewayError("Not ready")),
            /* c8 ignore stop */
          )
          .catch((e) => {
            if (e instanceof TypeError && e.message.match("fetch failed"))
              return Promise.reject(new BadGatewayError("Not reachable"));
            if (e instanceof FetchError) return Promise.reject(new BadGatewayError("Not ready", e));
            /* c8 ignore next */
            return Promise.reject(e);
          })
      : /* c8 ignore next */ Promise.resolve("Not configured");
  }
}

export default SignalService;
