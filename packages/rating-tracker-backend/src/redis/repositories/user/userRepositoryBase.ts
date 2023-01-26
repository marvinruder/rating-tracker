/* istanbul ignore file */
import { UserEntity, userSchema } from "../../../models/user.js";
import client from "../../Client.js";

/**
 * The user repository.
 */
export const userRepository = client.fetchRepository(userSchema);

/**
 * Fetch a user from the repository.
 *
 * @param {string} id The ID of the user to fetch.
 * @return {UserEntity} The user entity.
 */
export const fetch = (id: string) => {
  return userRepository.fetch(id);
};

/**
 * Save a user to the repository.
 *
 * @param {UserEntity} userEntity The user entity to save.
 * @return {string} The ID of the saved user.
 */
export const save = (userEntity: UserEntity) => {
  return userRepository.save(userEntity);
};

/**
 * Delete a user from the repository.
 *
 * @param {string} id The ID of the user to delete.
 * @return {void}
 */
export const remove = (id: string) => {
  return userRepository.remove(id);
};
