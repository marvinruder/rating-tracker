import { ResourceEntity } from "../../../../models/resource.js";

let resourceRepository: Map<string, ResourceEntity>;

export const initResourceRepository = () => {
  resourceRepository = new Map<string, ResourceEntity>();
};

initResourceRepository();

export const fetch = (id: string) => {
  return resourceRepository.get(id);
};

export const save = (resourceEntity: ResourceEntity) => {
  resourceRepository.set(resourceEntity.entityId, resourceEntity);
  return resourceEntity.entityId;
};

// TODO implement when tested
export const expire = () => {
  return;
};

export const remove = (id: string) => {
  resourceRepository.delete(id);
};
