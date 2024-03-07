#!/bin/zsh
mkdir -p /rating-tracker/.cache
corepack enable
yarn
yarn build:wasm
yarn sdks base
yarn validate || :
