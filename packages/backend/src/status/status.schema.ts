import type { Service } from "@rating-tracker/commons";
import { serviceArray } from "@rating-tracker/commons";
import { z } from "zod";

/**
 * A status report of the backend API and the services it depends on.
 */
export const StatusSchema = z
  .object(
    {
      status: z
        .enum(["healthy", "unhealthy"], { description: "The overall status of the API." })
        .openapi({ examples: ["healthy", "unhealthy"] }),
      services: z
        .object(
          serviceArray.reduce(
            (object, key, index) => ({
              ...object,
              [key]: z
                .string({
                  description:
                    `The ${key} service status. ` +
                    "Can be “Operational” or “Configured” when the service is considered healthy, " +
                    "“Not configured” when no configuration for the service exists, " +
                    "or an error message when the service is considered unhealthy.",
                })
                .openapi({ examples: [["Operational", "Configured", "Not configured"][index]] }),
            }),
            {},
          ) as Record<Service, z.ZodString>,
          { description: "The status of the services Rating Tracker depends on." },
        )
        .partial()
        .openapi({ description: "The status of the services Rating Tracker depends on." }),
    },
    { description: "A status report of the backend API and the services it depends on." },
  )
  .openapi("Status");
