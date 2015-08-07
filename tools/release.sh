#!/usr/bin/env bash

mkdir tmp
cp -r blog tmp

git checkout master

cp -r tmp/* .

rm -rf tmp