import type { DataProvider } from "@rating-tracker/commons";
import { dataProviderName } from "@rating-tracker/commons";
import cron from "node-cron";

import type FetchService from "../fetch/fetch.service";
import type { FetchOptions } from "../fetch/fetch.service";
import type ResourceService from "../resource/resource.service";
import type SessionService from "../session/session.service";
import SignalService from "../signal/signal.service";
import type UserService from "../user/user.service";

import ErrorHelper from "./error/errorHelper";
import Logger from "./logger";
import Singleton from "./Singleton";

/**
 * This class sets up Cron jobs for regular fetching from data providers.
 */
class CronScheduler extends Singleton {
  constructor(
    private fetchService: FetchService,
    private resourceService: ResourceService,
    private sessionService: SessionService,
    private signalService: SignalService,
    private userService: UserService,
  ) {
    super();
    if (CronScheduler.schedules.length) return;

    // Clean up resources and sessions every minute
    CronScheduler.schedules.push(
      cron.schedule(
        "* * * * *",
        () => void Promise.all([this.resourceService.cleanup(), this.sessionService.cleanup()]),
        { runOnInit: true },
      ),
    );

    // Rotate log file every day
    CronScheduler.schedules.push(cron.schedule("0 0 * * *", () => Logger.rotateFile()));

    // Fetch data from data providers if requested
    if (process.env.AUTO_FETCH_SCHEDULE) {
      CronScheduler.schedules.push(
        cron.schedule(process.env.AUTO_FETCH_SCHEDULE, async () => {
          for (const dataProvider of [
            "msci",
            "lseg",
            "sp",
            "sustainalytics",
            // Fetch data from Yahoo first
            "yahoo",
            "morningstar",
            // Fetch data from Marketscreener after Yahoo, so Market Screener can use the up-to-date Last Close price
            // to calculate the analyst target price properly
            "marketScreener",
          ] as const) {
            try {
              await this.fetchService.fetchFromDataProvider(dataProvider, CronScheduler.fetchOptions[dataProvider]);
            } catch (e) {
              Logger.error(
                { component: "cron", dataProvider, err: e },
                "An error occurred during the data provider Cron Job",
              );
              this.signalService.sendMessage(
                `${
                  SignalService.ERROR_PREFIX
                }An error occurred during the ${dataProviderName[dataProvider]} Cron Job: ${ErrorHelper.getSummary(e)}`,
                await this.userService.readMessageRecipients("fetchError"),
              );
            }
          }
        }),
      );

      // If we have an auto fetch schedule, log a message
      Logger.info(
        { component: "cron" },
        "Auto Fetch activated: " +
          "This instance will periodically fetch information from data providers for all known stocks.",
      );
    }
  }

  private static schedules: cron.ScheduledTask[] = [];

  /**
   * A record of options for each data provider.
   */
  private static fetchOptions: Record<DataProvider, FetchOptions> = {
    yahoo: { concurrency: Number(process.env.MAX_FETCH_CONCURRENCY) },
    morningstar: { concurrency: Number(process.env.MAX_FETCH_CONCURRENCY) },
    marketScreener: { concurrency: Number(process.env.MAX_FETCH_CONCURRENCY) },
    // Fetch data from MSCI with only two instances to avoid being rate-limited
    msci: { concurrency: 2 },
    lseg: { concurrency: Number(process.env.MAX_FETCH_CONCURRENCY) },
    sp: { concurrency: Number(process.env.MAX_FETCH_CONCURRENCY) },
    sustainalytics: {},
  } as const;
}

export default CronScheduler;
