#!/bin/bash

echo "Generating version file"
echo $(git describe --tag) | tee private/version
git add private/version
git commit --amend -C HEAD --no-verify
