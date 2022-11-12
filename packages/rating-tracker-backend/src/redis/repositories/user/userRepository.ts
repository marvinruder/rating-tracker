import APIError from "../../../apiError.js";
import { User, UserEntity, userSchema } from "../../../models/user.js";
import { fetch, save } from "./userRepositoryBase.js";
import chalk from "chalk";
import { sendMessage } from "../../../signal/signal.js";

/* istanbul ignore next */
export const createUser = async (user: User): Promise<boolean> => {
  const existingUser = await fetch(user.email);
  if (existingUser && existingUser.name) {
    console.warn(
      chalk.yellowBright(
        `Skipping user “${user.name}” – existing already (entity ID ${existingUser.entityId}).`
      )
    );
    return false;
  }
  const userEntity = new UserEntity(userSchema, user.email, {
    ...user,
  });
  console.log(
    chalk.greenBright(
      `Created user “${user.name}” with entity ID ${await save(userEntity)}.`
    )
  );
  sendMessage(`New user “${user.name}” (email ${user.email}) registered.`);
  return true;
};

export const readUser = async (email: string) => {
  const userEntity = await fetch(email);
  if (userEntity && userEntity.name) {
    return new User(userEntity);
  }
  /* istanbul ignore next */
  throw new APIError(404, `User ${email} not found.`);
};

export const userExists = async (email: string): Promise<boolean> => {
  const userEntity = await fetch(email);
  if (userEntity && userEntity.name) {
    return true;
  }
  return false;
};

/* istanbul ignore next */
export const updateUser = async (
  email: string,
  newValues: Partial<Omit<User, "email">>
) => {
  let k: keyof typeof newValues;
  const userEntity = await fetch(email);
  if (userEntity && userEntity.name) {
    console.log(chalk.greenBright(`Updating user ${email}…`));
    let isNewData = false;
    for (k in newValues) {
      if (k in newValues && newValues[k]) {
        if (newValues[k] !== userEntity[k]) {
          isNewData = true;
          console.log(
            chalk.greenBright(
              `    Property ${k} updated from ${userEntity[k]} to ${newValues[k]}`
            )
          );
          switch (k) {
            case "name":
            case "credentialID":
            case "credentialPublicKey":
              userEntity[k] = newValues[k];
              break;
            case "accessRights":
            case "counter":
              userEntity[k] = newValues[k];
              break;
            // default:
            //   userEntity[k] = newValues[k];
            //   break;
          }
        }
      }
    }
    if (isNewData) {
      await save(userEntity);
    } else {
      console.log(chalk.grey(`No updates for user ${email}.`));
    }
  } else {
    throw new APIError(404, `User ${email} not found.`);
  }
};

// export const deleteUser = async (email: string) => {
//   const userEntity = await fetch(email);
//   if (userEntity && userEntity.name) {
//     const name = new User(userEntity).name;
//     await remove(userEntity.entityId);
//     console.log(chalk.greenBright(`Deleted user “${name}” (email ${email}).`));
//   } else {
//     throw new APIError(404, `User ${email} not found.`);
//   }
// };
