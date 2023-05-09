import startup from "./startup.js";

const mockExit = vi.spyOn(process, "exit").mockImplementation((() => {}) as () => never);

describe("startup routine", () => {
  it("fails when mandatory environment variable is unset", () => {
    process.env.PORT = "";
    startup();
    expect(mockExit).toHaveBeenCalledWith(1);
  });
});
