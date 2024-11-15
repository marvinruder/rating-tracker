-- AlterTable
ALTER TABLE "Session" ADD COLUMN "oidcIDToken" TEXT;

-- CreateTable
CREATE TABLE "OIDCUser" (
    "sub" TEXT NOT NULL,
    "preferredUsername" TEXT NOT NULL,
    "email" VARCHAR(255) NOT NULL,

    CONSTRAINT "OIDCUser_pkey" PRIMARY KEY ("sub")
);

-- CreateIndex
CREATE UNIQUE INDEX "OIDCUser_email_key" ON "OIDCUser"("email");

-- AddForeignKey
ALTER TABLE "OIDCUser" ADD CONSTRAINT "OIDCUser_email_fkey" FOREIGN KEY ("email") REFERENCES "User"("email") ON DELETE CASCADE ON UPDATE CASCADE;
