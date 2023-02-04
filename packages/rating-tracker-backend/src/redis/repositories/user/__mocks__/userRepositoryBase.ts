import { UserEntity, userSchema } from "../../../../models/user.js";

/**
 * A mock repository for testing purposes.
 */
let userRepository: Map<string, UserEntity>;

/**
 * Initializes the mock repository with one exemplary user.
 */
export const initUserRepository = () => {
  userRepository = new Map<string, UserEntity>();
  userRepository.set(
    "jane.doe@example.com",
    new UserEntity(userSchema, "jane.doe@example.com", {
      name: "Jane Doe",
      avatar: "data:image/jpeg;base64,U29tZSBmYW5jeSBhdmF0YXIgaW1hZ2U=",
      phone: "123456789",
      accessRights: 255,
      credentialID: "exampleCredentialID",
      credentialPublicKey: "exampleCredentialPublicKey",
      counter: 0,
    })
  );
  userRepository.set(
    "john.doe@example.com",
    new UserEntity(userSchema, "john.doe@example.com", {
      name: "John Doe",
      accessRights: 1,
      credentialID: "anotherExampleCredentialID",
      credentialPublicKey: "anotherExampleCredentialPublicKey",
      counter: 0,
    })
  );
};

/**
 * Fetch a user from the mock repository.
 *
 * @param {string} id The ID of the user to fetch.
 * @returns {UserEntity} The user entity.
 */
export const fetch = (id: string) => {
  return userRepository.get(id);
};

/**
 * Save a user to the mock repository.
 *
 * @param {UserEntity} userEntity The user entity to save.
 * @returns {string} The ID of the saved user.
 */
export const save = (userEntity: UserEntity) => {
  userRepository.set(userEntity.entityId, userEntity);
  return userEntity.entityId;
};

/**
 * Delete a user from the mock repository.
 *
 * @param {string} id The ID of the user to delete.
 * @returns {void}
 */
export const remove = (id: string) => {
  return userRepository.delete(id);
};
