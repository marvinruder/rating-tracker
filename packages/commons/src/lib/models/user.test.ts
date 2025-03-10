import { describe, expect, it } from "vitest";

import {
  GENERAL_ACCESS,
  ADMINISTRATIVE_ACCESS,
  STOCK_UPDATE_MESSAGE,
  User,
  ADMINISTRATIVE_MESSAGE,
  WRITE_STOCKS_ACCESS,
  optionalUserValuesNull,
} from "./user";

const root = new User({
  ...optionalUserValuesNull,
  email: "user@example.com",
  name: "Example User",
  accessRights: 255,
  subscriptions: 255,
  oidcIdentity: { sub: "00000000-0000-0000-0000-000000000000", preferredUsername: "root" },
});
const regularUser = new User({
  ...optionalUserValuesNull,
  email: "user@example.com",
  name: "Example User",
  accessRights: GENERAL_ACCESS,
  subscriptions: STOCK_UPDATE_MESSAGE,
});
const newUser = new User({
  ...optionalUserValuesNull,
  email: "user@example.com",
  name: "Example User",
  accessRights: 0,
});

const userWithIllegalSubscription = new User({
  ...optionalUserValuesNull,
  email: "user@example.com",
  name: "Example User",
  accessRights: GENERAL_ACCESS,
  subscriptions: ADMINISTRATIVE_MESSAGE | STOCK_UPDATE_MESSAGE,
});
const userWhoDoesNotGiveAFuckAboutAnything = new User({
  ...optionalUserValuesNull,
  email: "user@example.com",
  name: "Example User",
  accessRights: 255,
  subscriptions: 0,
});

describe.concurrent("User Access Rights", () => {
  it("has all access rights", () => {
    expect(root.hasAccessRight(GENERAL_ACCESS)).toBe(true);
    expect(root.hasAccessRight(WRITE_STOCKS_ACCESS)).toBe(true);
    expect(root.hasAccessRight(ADMINISTRATIVE_ACCESS)).toBe(true);

    expect(root.getAccessRights()).toEqual([1, 2, 4, 8, 16, 32, 64, 128]);
  });

  it("has some access rights", () => {
    expect(regularUser.hasAccessRight(GENERAL_ACCESS)).toBe(true);
    expect(regularUser.hasAccessRight(WRITE_STOCKS_ACCESS)).toBe(false);
    expect(regularUser.hasAccessRight(ADMINISTRATIVE_ACCESS)).toBe(false);

    expect(regularUser.getAccessRights()).toEqual([GENERAL_ACCESS]);
  });

  it("has no access rights", () => {
    expect(newUser.hasAccessRight(GENERAL_ACCESS)).toBe(false);
    expect(newUser.hasAccessRight(WRITE_STOCKS_ACCESS)).toBe(false);
    expect(newUser.hasAccessRight(ADMINISTRATIVE_ACCESS)).toBe(false);

    expect(newUser.getAccessRights()).toEqual([]);
  });
});

describe.concurrent("Message Subscriptions", () => {
  it("receives messages if subscribed and access rights suffice", () => {
    expect(root.isAllowedAndWishesToReceiveMessage("stockUpdate")).toBe(true);
    expect(root.isAllowedAndWishesToReceiveMessage("fetchError")).toBe(true);
    expect(root.isAllowedAndWishesToReceiveMessage("userManagement")).toBe(true);
  });

  it("must not receive message if not subscribed", () => {
    expect(userWhoDoesNotGiveAFuckAboutAnything.isAllowedAndWishesToReceiveMessage("stockUpdate")).toBe(false);
    expect(userWhoDoesNotGiveAFuckAboutAnything.isAllowedAndWishesToReceiveMessage("fetchError")).toBe(false);
    expect(userWhoDoesNotGiveAFuckAboutAnything.isAllowedAndWishesToReceiveMessage("userManagement")).toBe(false);
  });

  it("must not receive message if access rights not sufficient", () => {
    expect(userWithIllegalSubscription.isAllowedAndWishesToReceiveMessage("userManagement")).toBe(false);
    expect(userWithIllegalSubscription.isAllowedAndWishesToReceiveMessage("fetchError")).toBe(false);
    expect(userWithIllegalSubscription.isAllowedAndWishesToReceiveMessage("stockUpdate")).toBe(true);
  });

  it("may receive additional messages they opted-in for elsewhere if they have the rights for that", () => {
    expect(userWhoDoesNotGiveAFuckAboutAnything.isAllowedToReceiveMessage("stockUpdate")).toBe(true);
    expect(userWhoDoesNotGiveAFuckAboutAnything.isAllowedToReceiveMessage("fetchError")).toBe(true);
    expect(userWhoDoesNotGiveAFuckAboutAnything.isAllowedToReceiveMessage("userManagement")).toBe(true);
  });
});
