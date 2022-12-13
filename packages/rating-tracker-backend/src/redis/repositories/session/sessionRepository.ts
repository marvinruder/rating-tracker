import APIError from "../../../lib/apiError.js";
import {
  Session,
  SessionEntity,
  sessionSchema,
} from "../../../models/session.js";
import { refresh, fetch, save } from "./sessionRepositoryBase.js";
import chalk from "chalk";
import { User } from "../../../models/user.js";
import { readUser } from "../user/userRepository.js";
import logger from "../../../lib/logger.js";

/* istanbul ignore next */
export const createSession = async (session: Session): Promise<boolean> => {
  const existingSession = await fetch(session.sessionID);
  if (existingSession && existingSession.email) {
    logger.warn(
      chalk.yellowBright(
        `Skipping session ${existingSession.entityId} – existing already.`
      )
    );
    return false;
  }
  const sessionEntity = new SessionEntity(sessionSchema, session.sessionID, {
    ...session,
  });
  logger.info(
    chalk.greenBright(
      `Created session for “${session.email}” with entity ID ${await save(
        sessionEntity
      )}.`
    )
  );
  await refresh(session.sessionID);
  return true;
};

export const refreshSessionAndFetchUser = async (
  sessionID: string
): Promise<User> => {
  const sessionEntity = await fetch(sessionID);
  if (sessionEntity && sessionEntity.email) {
    refresh(sessionID);
    return await readUser(sessionEntity.email);
  }
  throw new APIError(404, `Session ${sessionID} not found.`);
};

// export const readSession = async (sessionID: string) => {
//   const sessionEntity = await fetch(sessionID);
//   if (sessionEntity && sessionEntity.email) {
//     return new Session(sessionEntity);
//   } else {
//     throw new APIError(404, `Session ${sessionID} not found.`);
//   }
// };

// export const deleteSession = async (sessionID: string) => {
//   const sessionEntity = await fetch(sessionID);
//   if (sessionEntity && sessionEntity.email) {
//     const email = new Session(sessionEntity).email;
//     await remove(sessionEntity.entityId);
//     logger.info(
//       chalk.greenBright(`Deleted session “${email}” (sessionID ${sessionID}).`)
//     );
//   } else {
//     throw new APIError(404, `Session ${sessionID} not found.`);
//   }
// };
