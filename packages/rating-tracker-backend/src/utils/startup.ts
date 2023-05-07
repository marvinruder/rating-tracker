import chalk from "chalk";

const logo = chalk.hex("#2971D6")(`
                                    ήΒω
                                  ;βΪΆ
                        ;       ρΪΪΓ
                        θΪΝ    ·βΪβ΅
              ;μ     ;βΪΪΪΈω ;ΪΪΡ
              ρΪΪΝ·  ώΪΪΓ
            ;βΪβώΈΪψβΪβ΅ ;φβΪΪΪβΝω
          ;ΈΪΈ   ΫΈΪΈ  ήΪΪΓ   ΅ΨΪβ
          ήΪΈ΅      ΅  ίΪΪ       ΪΪΈ
        ΅ΫΆ            ΈΪψ     ;ΪΪΓ
                        ΫΪΈΒΚββΪΪΪω
                            ΅΅΅  ΅ΨΪΈώ
                                    ΫΆ΅

          Welcome to Rating Tracker!

`);

/**
 * Mandatory environment variables. If not set, Rating Tracker cannot run.
 */
const mandatoryEnvVars: string[] = ["PORT", "DOMAIN", "DATABASE_URL", "SELENIUM_URL", "REDIS_URL"];

/**
 * The startup method prints a welcome message and checks whether all mandatory environment variables are set. If not,
 * the process is exited with code 1.
 */
export default () => {
  // Print welcome message
  console.log(logo);

  try {
    // Check whether all mandatory environment variables are set
    mandatoryEnvVars.forEach((name: string) => {
      if (!process.env[name]) {
        throw new Error(`Environment variable ${name} not set. Exiting.`);
      }
    });
  } catch (e) {
    if (e instanceof Error) {
      // Print error message and exit
      console.error("\x07" + chalk.red(` \uf658 ${e.message}`));
      process.exit(1);
    }
    throw e; // if something else than an error was thrown
  }
};
