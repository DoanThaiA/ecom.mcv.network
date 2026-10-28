#!/bin/bash

# Helm Deployment Script
# Usage: ./deploy-helm.sh [environment] [action]
# Example: ./deploy-helm.sh production install
# Example: ./deploy-helm.sh production upgrade

set -e

ENVIRONMENT=${1:-development}
ACTION=${2:-install}
RELEASE_NAME="cchat-backend"
NAMESPACE="cchat-ecommerce"
CHART_DIR="../helm/cchat-backend"
VALUES_FILE="$CHART_DIR/values-$ENVIRONMENT.yaml"

echo "======================================"
echo "Helm Deployment - $ENVIRONMENT"
echo "Action: $ACTION"
echo "======================================"

# Check if helm is installed
if ! command -v helm &> /dev/null; then
    echo "Error: helm is not installed"
    exit 1
fi

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

# Check if values file exists
if [ ! -f "$VALUES_FILE" ]; then
    echo "Error: Values file not found: $VALUES_FILE"
    echo "Using default values.yaml"
    VALUES_FILE="$CHART_DIR/values.yaml"
fi

echo ""
echo "Using values file: $VALUES_FILE"
echo ""

# Create namespace if it doesn't exist
kubectl create namespace $NAMESPACE --dry-run=client -o yaml | kubectl apply -f -

case $ACTION in
  install)
    echo "Installing Helm chart..."
    helm install $RELEASE_NAME $CHART_DIR \
      -f $VALUES_FILE \
      -n $NAMESPACE \
      --wait \
      --timeout 5m
    ;;

  upgrade)
    echo "Upgrading Helm chart..."
    helm upgrade $RELEASE_NAME $CHART_DIR \
      -f $VALUES_FILE \
      -n $NAMESPACE \
      --wait \
      --timeout 5m
    ;;

  install-or-upgrade)
    echo "Installing or upgrading Helm chart..."
    helm upgrade --install $RELEASE_NAME $CHART_DIR \
      -f $VALUES_FILE \
      -n $NAMESPACE \
      --wait \
      --timeout 5m
    ;;

  uninstall)
    echo "Uninstalling Helm chart..."
    helm uninstall $RELEASE_NAME -n $NAMESPACE
    exit 0
    ;;

  dry-run)
    echo "Performing dry-run..."
    helm install $RELEASE_NAME $CHART_DIR \
      -f $VALUES_FILE \
      -n $NAMESPACE \
      --dry-run \
      --debug
    exit 0
    ;;

  template)
    echo "Rendering templates..."
    helm template $RELEASE_NAME $CHART_DIR \
      -f $VALUES_FILE \
      -n $NAMESPACE
    exit 0
    ;;

  *)
    echo "Error: Invalid action: $ACTION"
    echo "Valid actions: install, upgrade, install-or-upgrade, uninstall, dry-run, template"
    exit 1
    ;;
esac

echo ""
echo "======================================"
echo "Deployment Status"
echo "======================================"

echo ""
echo "Release Status:"
helm status $RELEASE_NAME -n $NAMESPACE

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
echo "======================================"
echo "Deployment completed!"
echo "======================================"

echo ""
echo "Useful commands:"
echo "  View logs:     kubectl logs -n $NAMESPACE -l app.kubernetes.io/name=cchat-backend -f"
echo "  Get pods:      kubectl get pods -n $NAMESPACE"
echo "  Helm history:  helm history $RELEASE_NAME -n $NAMESPACE"
echo "  Helm rollback: helm rollback $RELEASE_NAME -n $NAMESPACE"
