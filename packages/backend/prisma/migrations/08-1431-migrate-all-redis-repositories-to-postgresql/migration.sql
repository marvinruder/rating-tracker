-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- CreateTable
CREATE TABLE "WebAuthnCredential" (
    "id" BYTEA NOT NULL,
    "publicKey" BYTEA NOT NULL,
    "counter" INTEGER NOT NULL DEFAULT 0,
    "email" VARCHAR(255) NOT NULL,

    CONSTRAINT "WebAuthnCredential_pkey" PRIMARY KEY ("id")
);

-- Migrate WebAuthn credentials from User table to dedicated table
INSERT INTO "WebAuthnCredential" ("id", "publicKey", "counter", "email") SELECT decode("credentialID", 'base64'), decode("credentialPublicKey", 'base64'), "counter", "email" FROM "User";

-- DropIndex
DROP INDEX "User_credentialID_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "counter",
DROP COLUMN "credentialID",
DROP COLUMN "credentialPublicKey";

-- CreateTable
CREATE UNLOGGED TABLE "Session" (
    "id" BYTEA NOT NULL DEFAULT gen_random_bytes(32),
    "email" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(6) NOT NULL DEFAULT date_add(now(), '1 hour'),

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE UNLOGGED TABLE "Resource" (
    "uri" TEXT NOT NULL,
    "content" BYTEA NOT NULL,
    "contentType" VARCHAR(255) NOT NULL,
    "lastModifiedAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(6) NOT NULL DEFAULT date_add(now(), '1 day'),

    CONSTRAINT "Resource_pkey" PRIMARY KEY ("uri")
);

-- AddForeignKey
ALTER TABLE "WebAuthnCredential" ADD CONSTRAINT "WebAuthnCredential_email_fkey" FOREIGN KEY ("email") REFERENCES "User"("email") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_email_fkey" FOREIGN KEY ("email") REFERENCES "User"("email") ON DELETE CASCADE ON UPDATE CASCADE;
