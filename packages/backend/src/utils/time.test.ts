import TimeUtils from "./time";

describe.concurrent("Time Formatting", () => {
  it("formats time differences", () => {
    expect(TimeUtils.diffToNow(new Date(Date.now()))).toBe("0 seconds ago");
    expect(TimeUtils.diffToNow(new Date(Date.now() - 1000))).toBe("1 second ago");
    expect(TimeUtils.diffToNow(new Date(Date.now() + 1000))).toBe("in 1 second");
    expect(TimeUtils.diffToNow(new Date(Date.now() - 2000))).toBe("2 seconds ago");
    expect(TimeUtils.diffToNow(new Date(Date.now() + 2000))).toBe("in 2 seconds");
    expect(TimeUtils.diffToNow(new Date(Date.now() - 59900))).toBe("59 seconds ago");
    expect(TimeUtils.diffToNow(new Date(Date.now() + 59900))).toBe("in 59 seconds");

    expect(TimeUtils.diffToNow(new Date(Date.now() - 60000))).toBe("1 minute ago");
    expect(TimeUtils.diffToNow(new Date(Date.now() + 60000))).toBe("in 1 minute");
    expect(TimeUtils.diffToNow(new Date(Date.now() - 120000))).toBe("2 minutes ago");
    expect(TimeUtils.diffToNow(new Date(Date.now() + 120000))).toBe("in 2 minutes");
    expect(TimeUtils.diffToNow(new Date(Date.now() - 3599900))).toBe("59 minutes ago");
    expect(TimeUtils.diffToNow(new Date(Date.now() + 3599900))).toBe("in 59 minutes");

    expect(TimeUtils.diffToNow(new Date(Date.now() - 3600000))).toBe("1 hour ago");
    expect(TimeUtils.diffToNow(new Date(Date.now() + 3600000))).toBe("in 1 hour");
    expect(TimeUtils.diffToNow(new Date(Date.now() - 7200000))).toBe("2 hours ago");
    expect(TimeUtils.diffToNow(new Date(Date.now() + 7200000))).toBe("in 2 hours");
    expect(TimeUtils.diffToNow(new Date(Date.now() - 86399900))).toBe("23 hours ago");
    expect(TimeUtils.diffToNow(new Date(Date.now() + 86399900))).toBe("in 23 hours");

    expect(TimeUtils.diffToNow(new Date(Date.now() - 86400000))).toBe("1 day ago");
    expect(TimeUtils.diffToNow(new Date(Date.now() + 86400000))).toBe("in 1 day");
    expect(TimeUtils.diffToNow(new Date(Date.now() - 172800000))).toBe("2 days ago");
    expect(TimeUtils.diffToNow(new Date(Date.now() + 172800000))).toBe("in 2 days");

    const days = 86400000;
    expect(TimeUtils.diffToNow(new Date(Date.now() - 366 * days))).toBe("366 days ago");
    expect(TimeUtils.diffToNow(new Date(Date.now() + 366 * days))).toBe("in 366 days");
    expect(TimeUtils.diffToNow(new Date(Date.now() - 1000 * days))).toBe("1000 days ago");
    expect(TimeUtils.diffToNow(new Date(Date.now() + 1000 * days))).toBe("in 1000 days");
  });
});
