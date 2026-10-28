#!/bin/bash

# Step 1: Clean up old generated files
echo "Cleaning up old generated files..."
rm -rf ./types/gen

# Step 2: Create gen folders
mkdir -p ./types/gen/shop
mkdir -p ./types/gen/shared

# Step 3: Detect OS and set plugin path
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" || "$OSTYPE" == "cygwin" ]]; then
  PLUGIN_PATH="./node_modules/.bin/protoc-gen-ts_proto.ps1"
  echo "Detected Windows environment"
else
  PLUGIN_PATH="./node_modules/.bin/protoc-gen-ts_proto"
  echo "Detected Unix-like environment"
fi

# Step 4: Generate shared types
echo "Generating shared TypeScript types..."
npx @protobuf-ts/protoc \
  --plugin=$PLUGIN_PATH \
  --ts_proto_out=./types/gen/shared \
  --ts_proto_opt=outputServices=generic-definitions,useExactTypes=false \
  --proto_path=../proto \
  $(find ../proto/shared -name "*.proto")

# Step 5: Generate Shop types
echo "Generating Shop TypeScript types..."
npx @protobuf-ts/protoc \
  --plugin=$PLUGIN_PATH \
  --ts_proto_out=./types/gen/shop \
  --ts_proto_opt=outputServices=generic-definitions,useExactTypes=false \
  --proto_path=../proto \
  $(find ../proto/shop -name "*.proto")

echo "Proto files generated successfully!"
echo "  - Shared types: ./types/gen/shared/"
echo "  - Shop types: ./types/gen/shop/"
