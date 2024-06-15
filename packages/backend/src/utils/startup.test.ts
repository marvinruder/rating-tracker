import { startup } from "./startup";

vi.hoisted(() => {
  // Hide console messages
  vi.spyOn(console, "log").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
});

const mockExit = vi.spyOn(process, "exit").mockImplementation((() => {}) as () => never);

describe("startup routine", () => {
  it("fails when mandatory environment variable is unset", () => {
    process.env.PORT = "";
    startup();
    expect(mockExit).toHaveBeenCalledWith(1);
  });

  it("fails when port is out of range", () => {
    process.env.PORT = "65536";
    startup();
    expect(mockExit).toHaveBeenCalledWith(1);
  });

  it("fails when port is not an integer", () => {
    process.env.PORT = "30.01";
    startup();
    expect(mockExit).toHaveBeenCalledWith(1);
  });

  it("fails when port is not a number", () => {
    process.env.PORT = "port";
    startup();
    expect(mockExit).toHaveBeenCalledWith(1);
  });

  it("fails when Cron schedule is invalid", () => {
    process.env.AUTO_FETCH_SCHEDULE = "* * * * * * *";
    startup();
    expect(mockExit).toHaveBeenCalledWith(1);
  });
});
