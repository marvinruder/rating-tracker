import { timeDiffToNow } from "./time";

describe("Time Formatting", () => {
  it("formats time differences", () => {
    expect(timeDiffToNow(new Date(Date.now()))).toBe("0 seconds ago");
    expect(timeDiffToNow(new Date(Date.now() - 1000))).toBe("1 second ago");
    expect(timeDiffToNow(new Date(Date.now() + 1000))).toBe("in 1 second");
    expect(timeDiffToNow(new Date(Date.now() - 2000))).toBe("2 seconds ago");
    expect(timeDiffToNow(new Date(Date.now() + 2000))).toBe("in 2 seconds");
    expect(timeDiffToNow(new Date(Date.now() - 59900))).toBe("59 seconds ago");
    expect(timeDiffToNow(new Date(Date.now() + 59900))).toBe("in 59 seconds");

    expect(timeDiffToNow(new Date(Date.now() - 60000))).toBe("1 minute ago");
    expect(timeDiffToNow(new Date(Date.now() + 60000))).toBe("in 1 minute");
    expect(timeDiffToNow(new Date(Date.now() - 120000))).toBe("2 minutes ago");
    expect(timeDiffToNow(new Date(Date.now() + 120000))).toBe("in 2 minutes");
    expect(timeDiffToNow(new Date(Date.now() - 3599900))).toBe("59 minutes ago");
    expect(timeDiffToNow(new Date(Date.now() + 3599900))).toBe("in 59 minutes");

    expect(timeDiffToNow(new Date(Date.now() - 3600000))).toBe("1 hour ago");
    expect(timeDiffToNow(new Date(Date.now() + 3600000))).toBe("in 1 hour");
    expect(timeDiffToNow(new Date(Date.now() - 7200000))).toBe("2 hours ago");
    expect(timeDiffToNow(new Date(Date.now() + 7200000))).toBe("in 2 hours");
    expect(timeDiffToNow(new Date(Date.now() - 86399900))).toBe("23 hours ago");
    expect(timeDiffToNow(new Date(Date.now() + 86399900))).toBe("in 23 hours");

    expect(timeDiffToNow(new Date(Date.now() - 86400000))).toBe("1 day ago");
    expect(timeDiffToNow(new Date(Date.now() + 86400000))).toBe("in 1 day");
    expect(timeDiffToNow(new Date(Date.now() - 172800000))).toBe("2 days ago");
    expect(timeDiffToNow(new Date(Date.now() + 172800000))).toBe("in 2 days");

    const days = 86400000;
    expect(timeDiffToNow(new Date(Date.now() - 366 * days))).toBe("366 days ago");
    expect(timeDiffToNow(new Date(Date.now() + 366 * days))).toBe("in 366 days");
    expect(timeDiffToNow(new Date(Date.now() - 1000 * days))).toBe("1000 days ago");
    expect(timeDiffToNow(new Date(Date.now() + 1000 * days))).toBe("in 1000 days");
  });
});
