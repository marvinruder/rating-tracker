import { ResourceEntity } from "../../../../models/resource.js";

/**
 * A mock repository for testing purposes.
 */
let resourceRepository: Map<string, ResourceEntity>;

/**
 * Initializes the mock repository.
 */
export const initResourceRepository = () => {
  resourceRepository = new Map<string, ResourceEntity>();
};

initResourceRepository();

/**
 * Fetch a resource from the mock repository.
 *
 * @param {string} id The ID of the resource to fetch.
 * @return {ResourceEntity} The resource entity.
 */
export const fetch = (id: string) => {
  return resourceRepository.get(id);
};

/**
 * Save a resource to the mock repository.
 *
 * @param {ResourceEntity} resourceEntity The resource entity to save.
 * @return {string} The ID of the saved resource.
 */
export const save = (resourceEntity: ResourceEntity) => {
  resourceRepository.set(resourceEntity.entityId, resourceEntity);
  return resourceEntity.entityId;
};

/**
 * Have the mock repository expire a resource.
 *
 * @return {void}
 */
// TODO implement when tested
export const expire = () => {
  return;
};

/**
 * Delete a resource from the mock repository.
 *
 * @param {string} id The ID of the resource to delete.
 * @return {void}
 */
export const remove = (id: string) => {
  return resourceRepository.delete(id);
};
