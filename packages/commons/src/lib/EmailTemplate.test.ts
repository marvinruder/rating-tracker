import { describe, expect, it } from "vitest";

import { isEmailTemplate } from "./EmailTemplate";

describe.concurrent("Email Template", () => {
  it("is an email template", () => {
    expect(isEmailTemplate("Welcome")).toBe(true);
  });

  it("is not an email template", () => {
    expect(isEmailTemplate("Hello")).toBe(false);
  });
});
