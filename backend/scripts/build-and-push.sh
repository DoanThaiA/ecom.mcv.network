#!/bin/bash

# Build and Push Docker Image Script
# Usage: ./build-and-push.sh [registry] [tag]
# Example: ./build-and-push.sh docker.io/myuser 1.0.0

set -e

REGISTRY=${1:-"your-registry"}
TAG=${2:-"latest"}
IMAGE_NAME="cchat-backend"
FULL_IMAGE="$REGISTRY/$IMAGE_NAME:$TAG"

echo "======================================"
echo "Building and Pushing Docker Image"
echo "======================================"
echo "Registry: $REGISTRY"
echo "Image: $IMAGE_NAME"
echo "Tag: $TAG"
echo "Full image: $FULL_IMAGE"
echo ""

# Check if docker is installed
if ! command -v docker &> /dev/null; then
    echo "Error: docker is not installed"
    exit 1
fi

# Move to backend directory
cd "$(dirname "$0")/.."

echo "Step 1: Building Docker image..."
docker build \
  -f prod.Dockerfile \
  -t $FULL_IMAGE \
  -t $REGISTRY/$IMAGE_NAME:latest \
  .

echo ""
echo "Step 2: Tagging image..."
docker tag $FULL_IMAGE $REGISTRY/$IMAGE_NAME:latest

echo ""
echo "Step 3: Logging in to registry..."
docker login $REGISTRY

echo ""
echo "Step 4: Pushing image with tag $TAG..."
docker push $FULL_IMAGE

echo ""
echo "Step 5: Pushing latest tag..."
docker push $REGISTRY/$IMAGE_NAME:latest

echo ""
echo "======================================"
echo "Build and push completed!"
echo "======================================"

echo ""
echo "Image: $FULL_IMAGE"
echo "Also tagged as: $REGISTRY/$IMAGE_NAME:latest"

echo ""
echo "To pull this image:"
echo "  docker pull $FULL_IMAGE"

echo ""
echo "To deploy to Kubernetes, update the image in your values file:"
echo "  image:"
echo "    repository: $REGISTRY/$IMAGE_NAME"
echo "    tag: \"$TAG\""
