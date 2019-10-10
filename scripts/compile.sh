#!/bin/bash

# Simple compilation pipeline
#
# @author Matt Hoiland
# @date 2019-09-01
# @license GPL-3.0

echo npx ts-node scripts/compile-schemas.ts
npx ts-node scripts/compile-schemas.ts
echo tsc -p .
tsc -p .
echo npx ts-node scripts/copy-resources.ts
npx ts-node scripts/copy-resources.ts
