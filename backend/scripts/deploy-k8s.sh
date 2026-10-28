#!/bin/bash

# Kubernetes Deployment Script
# Usage: ./deploy-k8s.sh [environment]
# Example: ./deploy-k8s.sh production

set -e

ENVIRONMENT=${1:-development}
NAMESPACE="cchat-ecommerce"
K8S_DIR="../k8s"

echo "======================================"
echo "Deploying to Kubernetes ($ENVIRONMENT)"
echo "======================================"

# Check if kubectl is installed
if ! command -v kubectl &> /dev/null; then
    echo "Error: kubectl is not installed"
    exit 1
fi

# Check if connected to cluster
if ! kubectl cluster-info &> /dev/null; then
    echo "Error: Not connected to a Kubernetes cluster"
    exit 1
fi

echo ""
echo "Step 1: Creating namespace..."
kubectl apply -f $K8S_DIR/namespace.yaml

echo ""
echo "Step 2: Creating ConfigMap..."
kubectl apply -f $K8S_DIR/configmap.yaml

echo ""
echo "Step 3: Creating Secrets..."
echo "IMPORTANT: Make sure you've updated secret.yaml with your credentials!"
read -p "Have you updated secret.yaml? (yes/no): " confirm
if [ "$confirm" != "yes" ]; then
    echo "Please update secret.yaml and try again"
    exit 1
fi
kubectl apply -f $K8S_DIR/secret.yaml

echo ""
echo "Step 4: Deploying application..."
kubectl apply -f $K8S_DIR/deployment.yaml

echo ""
echo "Step 5: Creating service..."
kubectl apply -f $K8S_DIR/service.yaml

echo ""
echo "Step 6: Setting up autoscaling..."
kubectl apply -f $K8S_DIR/hpa.yaml

echo ""
echo "Step 7: Creating ingress..."
kubectl apply -f $K8S_DIR/ingress.yaml

echo ""
echo "======================================"
echo "Deployment Status"
echo "======================================"

echo ""
echo "Pods:"
kubectl get pods -n $NAMESPACE

echo ""
echo "Services:"
kubectl get services -n $NAMESPACE

echo ""
echo "Ingress:"
kubectl get ingress -n $NAMESPACE

echo ""
echo "HPA:"
kubectl get hpa -n $NAMESPACE

echo ""
echo "======================================"
echo "Deployment completed!"
echo "======================================"

echo ""
echo "To view logs:"
echo "  kubectl logs -n $NAMESPACE -l app=cchat-backend -f"

echo ""
echo "To check pod status:"
echo "  kubectl get pods -n $NAMESPACE"

echo ""
echo "To describe a pod:"
echo "  kubectl describe pod -n $NAMESPACE <pod-name>"
