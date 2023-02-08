import { GENERAL_ACCESS, STOCK_UPDATE_MESSAGE } from "rating-tracker-commons";
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
      phone: "+123456789",
      accessRights: 255,
      subscriptions: 0,
      credentialID: "exampleCredentialID",
      credentialPublicKey: "exampleCredentialPublicKey",
      counter: 0,
    })
  );
  userRepository.set(
    "john.doe@example.com",
    new UserEntity(userSchema, "john.doe@example.com", {
      name: "John Doe",
      phone: "+234567890",
      accessRights: GENERAL_ACCESS,
      subscriptions: STOCK_UPDATE_MESSAGE,
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
 * @returns {Promise<UserEntity>} A promise that resolves to the user entity.
 */
export const fetch = (id: string): Promise<UserEntity> => {
  return Promise.resolve(userRepository.get(id));
};

/**
 * Fetch all users from the mock repository.
 *
 * @returns {Promise<UserEntity[]>} A promise that resolves to a list of all user entities.
 */
export const fetchAll = () => {
  return Promise.resolve([...userRepository.values()]);
};
/**
 * Save a user to the mock repository.
 *
 * @param {UserEntity} userEntity The user entity to save.
 * @returns {Promise<string>} A promise that resolves to the ID of the saved user.
 */
export const save = (userEntity: UserEntity): Promise<string> => {
  userRepository.set(userEntity.entityId, userEntity);
  return Promise.resolve(userEntity.entityId);
};

/**
 * Delete a user from the mock repository.
 *
 * @param {string} id The ID of the user to delete.
 */
export const remove = (id: string) => {
  userRepository.delete(id);
};
