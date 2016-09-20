#!/bin/sh

# Run this script by calling `npm run build` from repo root directory

cd src
crx pack -o ../dist/subscribe-with-feedbin.crx
