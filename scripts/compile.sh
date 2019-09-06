#!/bin/bash

echo npx ts-node scripts/compile-schemas.ts
npx ts-node scripts/compile-schemas.ts
echo tsc -p .
tsc -p .
echo npx ts-node scripts/copy-resources.ts
npx ts-node scripts/copy-resources.ts
