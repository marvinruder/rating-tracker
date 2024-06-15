#!/bin/zsh
corepack enable
yarn
yarn tools
yarn sdks base
yarn build:wasm
yarn validate || :
