#!/bin/bash

dist=$1

location=$dist
rm -rf build/$location

mkdir -p build/$location

rm -rf dist/apps/standalone

echo "Building...for TARGET::: $location"
yarn build

echo "Creating binaries..."

nexe airdrop.js -o build/$location/trondrop -t $dist-x64-14.15.2
cp package.json build/$location/package.json

echo "Done"
