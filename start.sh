#! /usr/bin/env bash

yarn start | tee >(awk '/listen on/ { system("touch is-started") }')
