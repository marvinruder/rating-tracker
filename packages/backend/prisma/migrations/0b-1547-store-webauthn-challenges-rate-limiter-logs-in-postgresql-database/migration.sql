-- CreateTable
CREATE TABLE "webauthn_challenges" (
    "challenge" BYTEA NOT NULL DEFAULT gen_random_bytes(32),
    "email" TEXT,
    "expires_at" TIMESTAMPTZ NOT NULL DEFAULT date_add(now(), '60 seconds'),

    CONSTRAINT "webauthn_challenges_pkey" PRIMARY KEY ("challenge")
);

-- CreateTable
CREATE TABLE "rate_limit_hit_counts" (
    "key" TEXT NOT NULL,
    "count" INTEGER NOT NULL,
    "expires_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "rate_limit_hit_counts_pkey" PRIMARY KEY ("key")
);
