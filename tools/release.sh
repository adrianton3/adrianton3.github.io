#!/usr/bin/env bash

mkdir tmp
cp -r blog tmp
cp index.html tmp

git checkout master

cp -r tmp/* .

rm -rf tmp