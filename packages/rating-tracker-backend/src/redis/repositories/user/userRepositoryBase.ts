/* istanbul ignore file */ // This file is mocked since tests must not depend on a running Redis instance
import { UserEntity, userSchema } from "../../../models/user.js";
import client from "../../Client.js";

/**
 * The user repository.
 */
export const userRepository = client.fetchRepository(userSchema);
await userRepository.createIndex();

/**
 * Fetch a user from the repository.
 *
 * @param {string} id The ID of the user to fetch.
 * @returns {Promise<UserEntity>} A promise that resolves to the user entity.
 */
export const fetch = (id: string): Promise<UserEntity> => {
  return userRepository.fetch(id);
};

/**
 * Fetch all users from the repository.
 *
 * @returns {Promise<UserEntity[]>} A promise that resolves to a list of all user entities.
 */
export const fetchAll = (): Promise<UserEntity[]> => {
  return userRepository.search().return.all();
};

/**
 * Save a user to the repository.
 *
 * @param {UserEntity} userEntity The user entity to save.
 * @returns {Promise<string>} A promise that resolves to the ID of the saved user.
 */
export const save = (userEntity: UserEntity): Promise<string> => {
  return userRepository.save(userEntity);
};

/**
 * Delete a user from the repository.
 *
 * @param {string} id The ID of the user to delete.
 */
export const remove = (id: string) => {
  userRepository.remove(id);
};
