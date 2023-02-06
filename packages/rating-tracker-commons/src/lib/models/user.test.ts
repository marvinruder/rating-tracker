import { GENERAL_ACCESS, MANAGE_USERS, User, WRITE_STOCKS } from "./user";

describe("User Access Rights", () => {
  it("has all access rights", () => {
    const root = new User({ accessRights: 255 });
    expect(root.hasAccessRight(WRITE_STOCKS)).toBe(true);
    expect(root.hasAccessRight(GENERAL_ACCESS)).toBe(true);
    expect(root.hasAccessRight(MANAGE_USERS)).toBe(true);
  });

  it("has some access rights", () => {
    const regularUser = new User({ accessRights: 1 });
    expect(regularUser.hasAccessRight(GENERAL_ACCESS)).toBe(true);
    expect(regularUser.hasAccessRight(WRITE_STOCKS)).toBe(false);
    expect(regularUser.hasAccessRight(MANAGE_USERS)).toBe(false);
  });

  it("has no access rights", () => {
    const newUser = new User({ accessRights: 0 });
    expect(newUser.hasAccessRight(GENERAL_ACCESS)).toBe(false);
    expect(newUser.hasAccessRight(WRITE_STOCKS)).toBe(false);
    expect(newUser.hasAccessRight(MANAGE_USERS)).toBe(false);
  });
});
