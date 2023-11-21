#!/bin/zsh
corepack enable
yarn
yarn build:wasm
yarn prisma:generate
yarn sdks base
