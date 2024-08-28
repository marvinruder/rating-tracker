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
                .string({ description: `The ${key} service status, present only when ${key} is unhealthy.` })
                .openapi({ examples: [["Database is not reachable", "Signal is not ready"][index]] }),
            }),
            {},
          ) as Record<Service, z.ZodString>,
          { description: "The status of the unhealthy services Rating Tracker depends on." },
        )
        .partial()
        .openapi({ description: "The status of the unhealthy services Rating Tracker depends on." }),
    },
    { description: "A status report of the backend API and the services it depends on." },
  )
  .openapi("Status");
