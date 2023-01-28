/* istanbul ignore file */ // This file is mocked since tests must not depend on a running Redis instance
import { ResourceEntity, resourceSchema } from "../../../models/resource.js";
import client from "../../Client.js";

/**
 * The resource repository.
 */
export const resourceRepository = client.fetchRepository(resourceSchema);

/**
 * Fetch a resource from the repository.
 *
 * @param {string} id The ID of the resource to fetch.
 * @returns {ResourceEntity} The resource entity.
 */
export const fetch = (id: string) => {
  return resourceRepository.fetch(id);
};

/**
 * Save a resource to the repository.
 *
 * @param {ResourceEntity} resourceEntity The resource entity to save.
 * @returns {string} The ID of the saved resource.
 */
export const save = (resourceEntity: ResourceEntity) => {
  return resourceRepository.save(resourceEntity);
};

/**
 * Have the repository expire a resource.
 *
 * @param {string} id The ID of the resource to expire.
 * @param {number} ttlInSeconds The time in seconds after which the resource should expire.
 * @returns {void}
 */
export const expire = (id: string, ttlInSeconds: number) => {
  return resourceRepository.expire(id, ttlInSeconds);
};

/**
 * Delete a resource from the repository.
 *
 * @param {string} id The ID of the resource to delete.
 * @returns {void}
 */
export const remove = (id: string) => {
  return resourceRepository.remove(id);
};
