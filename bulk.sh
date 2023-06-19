#!/usr/bin/env bash
# pack install for electron
cd ./backend
npm $1 $2
cd ..

# pack install for electron
cd ./frontend
npm $1 $2
cd ..
