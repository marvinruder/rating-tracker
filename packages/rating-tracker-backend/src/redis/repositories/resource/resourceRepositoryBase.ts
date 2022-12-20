/* istanbul ignore file */
import { ResourceEntity, resourceSchema } from "../../../models/resource.js";
import client from "../../Client.js";

export const resourceRepository = client.fetchRepository(resourceSchema);

export const fetch = (id: string) => {
  return resourceRepository.fetch(id);
};

export const save = (resourceEntity: ResourceEntity) => {
  return resourceRepository.save(resourceEntity);
};

export const expire = (id: string, ttlInSeconds: number) => {
  return resourceRepository.expire(id, ttlInSeconds);
};

export const remove = (id: string) => {
  return resourceRepository.remove(id);
};
