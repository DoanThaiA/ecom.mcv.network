#!/bin/bash

# Initial Cluster Setup Script
# Sets up ingress controller and cert-manager

set -e

echo "======================================"
echo "Kubernetes Cluster Initial Setup"
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
echo "Current cluster:"
kubectl cluster-info
echo ""

read -p "Is this the correct cluster? (yes/no): " confirm
if [ "$confirm" != "yes" ]; then
    echo "Setup cancelled"
    exit 1
fi

# Install NGINX Ingress Controller
echo ""
echo "======================================"
echo "Installing NGINX Ingress Controller"
echo "======================================"
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.1/deploy/static/provider/cloud/deploy.yaml

echo ""
echo "Waiting for ingress controller to be ready..."
kubectl wait --namespace ingress-nginx \
  --for=condition=ready pod \
  --selector=app.kubernetes.io/component=controller \
  --timeout=120s

echo ""
echo "NGINX Ingress Controller installed!"

# Install cert-manager
echo ""
echo "======================================"
echo "Installing cert-manager"
echo "======================================"
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml

echo ""
echo "Waiting for cert-manager to be ready..."
sleep 30
kubectl wait --namespace cert-manager \
  --for=condition=ready pod \
  --selector=app.kubernetes.io/instance=cert-manager \
  --timeout=120s

echo ""
echo "cert-manager installed!"

# Create ClusterIssuer
echo ""
echo "======================================"
echo "Creating Let's Encrypt ClusterIssuer"
echo "======================================"

read -p "Enter your email for Let's Encrypt notifications: " email

cat <<EOF | kubectl apply -f -
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: $email
    privateKeySecretRef:
      name: letsencrypt-prod
    solvers:
    - http01:
        ingress:
          class: nginx
EOF

echo ""
echo "ClusterIssuer created!"

# Get LoadBalancer IP
echo ""
echo "======================================"
echo "Getting LoadBalancer IP"
echo "======================================"

echo ""
echo "Waiting for LoadBalancer IP..."
sleep 10

LOAD_BALANCER_IP=""
for i in {1..30}; do
    LOAD_BALANCER_IP=$(kubectl get svc -n ingress-nginx ingress-nginx-controller -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
    if [ -n "$LOAD_BALANCER_IP" ]; then
        break
    fi
    echo "Waiting for IP... ($i/30)"
    sleep 5
done

if [ -z "$LOAD_BALANCER_IP" ]; then
    echo "Warning: Could not get LoadBalancer IP automatically"
    echo "Run this command to get it later:"
    echo "  kubectl get svc -n ingress-nginx ingress-nginx-controller"
else
    echo ""
    echo "======================================"
    echo "LoadBalancer IP: $LOAD_BALANCER_IP"
    echo "======================================"
    echo ""
    echo "Configure your DNS with this IP:"
    echo "  Type: A"
    echo "  Name: api (or your subdomain)"
    echo "  Value: $LOAD_BALANCER_IP"
fi

echo ""
echo "======================================"
echo "Cluster Setup Complete!"
echo "======================================"

echo ""
echo "Next steps:"
echo "1. Configure DNS to point to LoadBalancer IP"
echo "2. Update your configuration files with domain names"
echo "3. Deploy your application"
echo ""
echo "To deploy with Helm:"
echo "  cd scripts && ./deploy-helm.sh production install-or-upgrade"
echo ""
echo "To deploy with kubectl:"
echo "  cd scripts && ./deploy-k8s.sh production"
