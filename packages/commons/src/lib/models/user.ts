import type { MessageType } from "../MessageType";
import type { OmitFunctions } from "../OmitFunctions";

/**
 * A regular expression that matches a phone number in E.164 format or an empty string.
 */
export const REGEX_PHONE_NUMBER = "^\\+[1-9]\\d{1,14}$|^$";

// We use bitwise operators to combine several boolean access rights into a single number.

/**
 * General access to the application. May log in and view stocks.
 */
export const GENERAL_ACCESS = 1 << 0;
/**
 * Write access to stocks. May add, edit and delete stocks, as well as fetch data from providers.
 */
export const WRITE_STOCKS_ACCESS = 1 << 1;
/**
 * Administrative access to the application. May add, edit and delete users.
 */
export const ADMINISTRATIVE_ACCESS = 1 << 7;

/**
 * Wishes to receive a message when a stock is updated.
 */
export const STOCK_UPDATE_MESSAGE = 1 << 0;
/**
 * Wishes to receive a message when an error occurs while fetching data from a provider.
 */
export const FETCH_ERROR_MESSAGE = 1 << 1;
/**
 * Wishes to receive a message when the attention of an administrator is required.
 */
export const ADMINISTRATIVE_MESSAGE = 1 << 7;

/**
 * A user of the application.
 */
export class User {
  /**
   * The email address of the user, used as a unique identifier.
   */
  email: string;
  /**
   * The common name of the user.
   */
  name: string;
  /**
   * The base64-encoded avatar of the user, or a reference to it.
   */
  avatar: string | null;
  /**
   * The phone number of the user, used for Signal messages.
   */
  phone: string | null;
  /**
   * The access rights of the user, encoded as a bitfield.
   */
  accessRights: number;
  /**
   * The subscriptions of the user to different types of messages, encoded as a bitfield.
   */
  subscriptions: number | null;

  /**
   * Creates a new user from user information.
   * @param user The user information.
   */
  constructor(user: OmitFunctions<User>) {
    this.email = user.email;
    this.name = user.name;
    this.avatar = user.avatar;
    this.phone = user.phone;
    this.accessRights = user.accessRights;
    this.subscriptions = user.subscriptions;
  }

  /**
   * Checks whether the user has the given access right.
   * @param accessRight The access right to check.
   * @returns Whether the user has the given access right.
   */
  public hasAccessRight(accessRight: number): boolean {
    return (this.accessRights & accessRight) === accessRight;
  }

  /**
   * Computes the separate access rights a user has.
   * @returns A list of access rights a user has.
   */
  public getAccessRights(): number[] {
    const accessRights: number[] = [];
    Array.from(Array(8).keys()).forEach((i) => this.hasAccessRight(1 << i) && accessRights.push(1 << i));
    return accessRights;
  }

  /**
   * Checks whether the user has subscribed to the given message type, given either as a number or as a
   * {@link MessageType}.
   * @param subscription The subscription to check.
   * @returns Whether the user has subscribed to the given message type.
   */
  public hasSubscribedTo(subscription: number | MessageType): boolean {
    switch (typeof subscription) {
      case "string":
        switch (subscription) {
          case "userManagement":
            return this.hasSubscribedTo(ADMINISTRATIVE_MESSAGE);
          case "fetchError":
            return this.hasSubscribedTo(FETCH_ERROR_MESSAGE);
          case "stockUpdate":
            return this.hasSubscribedTo(STOCK_UPDATE_MESSAGE);
        }
      case "number":
        return ((this.subscriptions ?? 0) & subscription) === subscription;
    }
  }

  /**
   * Checks whether the user has the given message type enabled and the rights necessary to receive it.
   * @param messageType The message type to check.
   * @returns Whether the user shall receive a message of the given message type.
   */
  public isAllowedAndWishesToReceiveMessage(messageType: MessageType): boolean {
    return this.hasSubscribedTo(messageType) && this.isAllowedToReceiveMessage(messageType);
  }

  /**
   * Checks whether the user has the rights necessary to receive a message of the given message type.
   * @param messageType The message type to check.
   * @returns Whether the user shall receive a message of the given message type.
   */
  public isAllowedToReceiveMessage(messageType: MessageType): boolean {
    switch (messageType) {
      case "userManagement":
        return this.hasAccessRight(ADMINISTRATIVE_ACCESS);
      case "fetchError":
        return this.hasAccessRight(WRITE_STOCKS_ACCESS);
      case "stockUpdate":
        return this.hasAccessRight(GENERAL_ACCESS);
    }
  }
}

/**
 * An object containing null values for all optional attributes of a user. Can be passed to the user constructor via
 * `{ ...optionalUserValuesNull, … }`.
 */
export const optionalUserValuesNull: OmitFunctions<Omit<User, "email" | "name" | "accessRights">> = {
  avatar: null,
  phone: null,
  subscriptions: null,
};
