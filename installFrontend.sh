#!/usr/bin/env bash

cd ./backend
npm run buildprep
npm run buildApi
cd gen
npm run build
cd ../../frontend

npm install
npm run build
cd ..
