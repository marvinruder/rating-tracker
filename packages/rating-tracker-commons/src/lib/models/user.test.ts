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
    expect(root.hasAccessTo(WRITE_STOCKS_ACCESS)).toBe(true);
    expect(root.hasAccessTo(GENERAL_ACCESS)).toBe(true);
    expect(root.hasAccessTo(ADMINISTRATIVE_ACCESS)).toBe(true);
  });

  it("has some access rights", () => {
    expect(regularUser.hasAccessTo(GENERAL_ACCESS)).toBe(true);
    expect(regularUser.hasAccessTo(WRITE_STOCKS_ACCESS)).toBe(false);
    expect(regularUser.hasAccessTo(ADMINISTRATIVE_ACCESS)).toBe(false);
  });

  it("has no access rights", () => {
    expect(newUser.hasAccessTo(GENERAL_ACCESS)).toBe(false);
    expect(newUser.hasAccessTo(WRITE_STOCKS_ACCESS)).toBe(false);
    expect(newUser.hasAccessTo(ADMINISTRATIVE_ACCESS)).toBe(false);
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
