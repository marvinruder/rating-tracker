#!/bin/zsh
corepack enable
yarn
yarn build:wasm
yarn workspace @rating-tracker/backend prisma:generate
