import {
  GENERAL_ACCESS,
  ADMINISTRATIVE_ACCESS,
  STOCK_UPDATE_MESSAGE,
  User,
  ADMINISTRATIVE_MESSAGE,
  WRITE_STOCKS_ACCESS,
} from "./user";

const root = new User({ accessRights: 255, subscriptions: 255 });
const regularUser = new User({ accessRights: GENERAL_ACCESS, subscriptions: STOCK_UPDATE_MESSAGE });
const newUser = new User({ accessRights: 0, subscriptions: 0 });

const userWithIllegalSubscription = new User({
  accessRights: GENERAL_ACCESS,
  subscriptions: ADMINISTRATIVE_MESSAGE | STOCK_UPDATE_MESSAGE,
});
const userWhoDoesNotGiveAFuckAboutAnything = new User({ accessRights: 255, subscriptions: 0 });

describe("User Access Rights", () => {
  it("has all access rights", () => {
    expect(root.hasAccessRight(WRITE_STOCKS_ACCESS)).toBe(true);
    expect(root.hasAccessRight(GENERAL_ACCESS)).toBe(true);
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

describe("Message Subscriptions", () => {
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
});
