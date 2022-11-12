/* istanbul ignore file */
import { UserEntity, userSchema } from "../../../../models/user.js";

let userRepository: Map<string, UserEntity>;

export const initUserRepository = () => {
  userRepository = new Map<string, UserEntity>();
  userRepository.set(
    "jane.doe@example.com",
    new UserEntity(userSchema, "jane.doe@example.com", {
      name: "Jane Doe",
      accessRights: 1,
      credentialID: "exampleCredentialID",
      credentialPublicKey: "exampleCredentialPublicKey",
      counter: 0,
    })
  );
};

export const fetch = (id: string) => {
  return userRepository.get(id);
};

export const save = (userEntity: UserEntity) => {
  userRepository.set(userEntity.entityId, userEntity);
  return userEntity.entityId;
};

export const remove = (id: string) => {
  return userRepository.delete(id);
};
