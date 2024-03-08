#!/bin/zsh
corepack enable
yarn
yarn build:wasm
yarn sdks base
yarn validate || :
