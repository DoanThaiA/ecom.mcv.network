#!/bin/bash

# Step 1: Clean up old generated files
echo "Cleaning up old generated files..."
rm -rf ./src/types/gen

# Step 2: Create gen folders
mkdir -p ./src/types/gen/cms
mkdir -p ./src/types/gen/shared

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
  --ts_proto_out=./src/types/gen/shared \
  --ts_proto_opt=outputServices=generic-definitions,useExactTypes=false \
  --proto_path=../proto \
  $(find ../proto/shared -name "*.proto")

# Step 5: Generate CMS types
echo "Generating CMS TypeScript types..."
npx @protobuf-ts/protoc \
  --plugin=$PLUGIN_PATH \
  --ts_proto_out=./src/types/gen/cms \
  --ts_proto_opt=outputServices=generic-definitions,useExactTypes=false \
  --proto_path=../proto \
  $(find ../proto/cms -name "*.proto")

echo "Proto files generated successfully!"
echo "  - Shared types: ./src/types/gen/shared/"
echo "  - CMS types: ./src/types/gen/cms/"
