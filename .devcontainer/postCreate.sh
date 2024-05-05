#!/bin/zsh
corepack enable
yarn
yarn sdks base
yarn build:wasm
yarn validate || :
