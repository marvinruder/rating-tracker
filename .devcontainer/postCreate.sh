#!/bin/zsh
corepack enable
yarn
yarn tools
yarn sdks base
yarn workspace @rating-tracker/backend build:types
yarn build:wasm
yarn validate || :
