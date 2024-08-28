import { pluralize } from "@rating-tracker/commons";

/**
 * This class provides utility methods for working with dates and times.
 */
class TimeUtils {
  /**
   * Formats the difference between a date and now in a human-readable format.
   * Currently only supports days, hours, minutes, and seconds.
   * @param date The date to compare to now.
   * @returns A human-readable string representing the difference between the date and now.
   */
  static diffToNow(date: Date | null): string {
    if (date === null) return "never";
    const then = date.getTime();
    const now = Date.now();

    const prefix = now < then ? "in " : "";
    const suffix = now < then ? "" : " ago";
    const diff = Math.abs(now - then);

    const seconds = Math.floor(diff / 1000);
    if (seconds < 60) return `${prefix}${seconds} second${pluralize(seconds)}${suffix}`;

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${prefix}${minutes} minute${pluralize(minutes)}${suffix}`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${prefix}${hours} hour${pluralize(hours)}${suffix}`;

    const days = Math.floor(hours / 24);
    return `${prefix}${days} day${pluralize(days)}${suffix}`;
  }
}

export default TimeUtils;
