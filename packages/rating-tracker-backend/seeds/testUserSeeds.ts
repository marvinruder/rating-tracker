import { GENERAL_ACCESS, STOCK_UPDATE_MESSAGE } from "rating-tracker-commons";
import client from "../src/db/client.js";

/**
 * Clears and writes example user data into the user table in the database. Must only be used in tests.
 *
 * @returns {Promise<void>} a Promise that resolves after the operation is complete.
 */
export const applyUserSeed = async () => {
  if (process.env.NODE_ENV !== "test") {
    throw new Error("Refusing to apply seed when not in a test environment: " + process.env.DATABASE_URL);
  }

  await client.user.deleteMany();

  await client.user.createMany({
    data: [
      {
        email: "jane.doe@example.com",
        name: "Jane Doe",
        avatar: "data:image/jpeg;base64,U29tZSBmYW5jeSBhdmF0YXIgaW1hZ2U=",
        phone: "+123456789",
        accessRights: 255,
        subscriptions: 0,
        credentialID: "exampleCredentialID",
        credentialPublicKey: "exampleCredentialPublicKey",
        counter: 0,
      },

      {
        email: "john.doe@example.com",
        name: "John Doe",
        phone: "+234567890",
        accessRights: GENERAL_ACCESS,
        subscriptions: STOCK_UPDATE_MESSAGE,
        credentialID: "anotherExampleCredentialID",
        credentialPublicKey: "anotherExampleCredentialPublicKey",
        counter: 0,
      },
    ],
  });
};
