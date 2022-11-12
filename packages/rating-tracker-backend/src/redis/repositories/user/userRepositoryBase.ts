/* istanbul ignore file */
import { UserEntity, userSchema } from "../../../models/user.js";
import client from "../../Client.js";

export const userRepository = client.fetchRepository(userSchema);

export const fetch = (id: string) => {
  return userRepository.fetch(id);
};

export const save = (userEntity: UserEntity) => {
  return userRepository.save(userEntity);
};

export const remove = (id: string) => {
  return userRepository.remove(id);
};
