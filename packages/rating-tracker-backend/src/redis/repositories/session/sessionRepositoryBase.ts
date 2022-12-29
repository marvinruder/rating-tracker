/* istanbul ignore file */
import { SessionEntity, sessionSchema } from "../../../models/session.js";
import client from "../../Client.js";

export const sessionTTLInSeconds = 1800;

export const sessionRepository = client.fetchRepository(sessionSchema);

export const fetch = (id: string) => {
  return sessionRepository.fetch(id);
};

export const refresh = (id: string) => {
  return sessionRepository.expire(id, sessionTTLInSeconds);
};

export const save = (sessionEntity: SessionEntity) => {
  return sessionRepository.save(sessionEntity);
};

export const remove = (id: string) => {
  return sessionRepository.remove(id);
};
