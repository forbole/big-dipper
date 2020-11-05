#!/bin/bash

echo "Generating version file"
export TAG=$(git describe --tag)
echo $TAG | tee private/version
git add private/version
git commit -am "add version $TAG"
