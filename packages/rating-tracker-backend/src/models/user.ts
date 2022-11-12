import { Entity, Schema } from "redis-om";

export class User {
  email: string;
  name: string;
  accessRights: number;
  credentialID: string;
  credentialPublicKey: string;
  counter: number;
  constructor(userEntity: UserEntity) {
    this.email = userEntity.entityId;
    this.name = userEntity.name;
    this.accessRights = userEntity.accessRights;
    this.credentialID = userEntity.credentialID;
    this.credentialPublicKey = userEntity.credentialPublicKey;
    this.counter = userEntity.counter;
  }
}

export interface UserEntity {
  email: string;
  name: string;
  accessRights: number;
  credentialID: string;
  credentialPublicKey: string;
  counter: number;
}

export class UserEntity extends Entity {}

export const userSchema = new Schema(UserEntity, {
  name: { type: "string" },
  accessRights: { type: "number" },
  credentialID: { type: "string" },
  credentialPublicKey: { type: "string" },
  counter: { type: "number" },
});
