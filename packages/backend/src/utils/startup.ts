import chalk from "chalk";

import packageInfo from "../../package.json" with { type: "json" };

/**
 * The color to style the logo in.
 */
let ratingTrackerColor: string;

/* c8 ignore start */ // The color depends on the environment, which is fixed to `test` in tests
switch (process.env.NODE_ENV) {
  case "production":
    ratingTrackerColor = "#2971D6";
    break;
  case "development":
    ratingTrackerColor = "#D68E29";
    break;
  case "test":
    ratingTrackerColor = "#6E9F18";
    break;
  default:
    ratingTrackerColor = "#808080";
}
/* c8 ignore stop */

/**
 * An ASCII art logo, shown as a welcome message.
 */
const logo = chalk.bold(
  chalk.hex(ratingTrackerColor)(`
                                    ήΒω
                                  ;βΪΆ
                        ;       ρΪΪΓε
                        θΪΝ    ·βΪβ΅
              ;μ     ;βΪΪΪΈωι;ΪΪΡ
              ρΪΪΝ·  ώΪΪΓ
            ;βΪβώΈΪψβΪβ΅ ;φβΪΪΪβΝω
          ;ΈΪΈ   ΫΈΪΈ  ήΪΪΓ   ΅ΨΪβλ
          ήΪΈ΅      ΅  ίΪΪ       ΪΪΈ
        ΅ΫΆρ           ΈΪψ     ;ΪΪΓ
                        ΫΪΈΒΚββΪΪΪω
                            ΅΅΅  ΅ΨΪΈώ
                                    ΫΆ΅

 Welcome to Rating Tracker v${packageInfo.version} (${process.env.NODE_ENV ?? "no specific"} environment)!

`),
);

/**
 * Mandatory environment variables. If not set, Rating Tracker cannot run.
 */
const mandatoryEnvVars: readonly string[] = [
  "PORT",
  "DOMAIN",
  "DATABASE_URL",
  /* "SELENIUM_URL", */
  "REDIS_URL",
] as const;

/**
 * The startup method prints a welcome message and checks whether all mandatory environment variables are set. If not,
 * the process is exited with code 1.
 */
export const startup = () => {
  // Print welcome message
  console.log(logo);

  try {
    // Check whether all mandatory environment variables are set
    mandatoryEnvVars.forEach((name: string) => {
      if (!process.env[name]) {
        throw new Error(`Environment variable ${name} not set. Exiting.`);
      }
    });
    if (
      Number(process.env.PORT) < 1 ||
      Number(process.env.PORT) > 65535 ||
      !Number.isInteger(Number(process.env.PORT))
    ) {
      throw new Error(`Invalid PORT number: ${process.env.PORT}. Exiting.`);
    }
  } catch (e) {
    if (e instanceof Error) {
      // Print error message and exit
      console.error("\x07" + chalk.red(` \uf658 ${e.message}`));
      process.exit(1);
      /* c8 ignore next */ // This should never occur, since always Errors are thrown.
    } else throw e; // if something else than an error was thrown
  }
};

// Run the startup method, so it is executed before all other imports.
startup();
