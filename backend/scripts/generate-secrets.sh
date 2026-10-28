#!/bin/bash

# Generate Secrets Script
# Generates strong random secrets for JWT tokens

echo "======================================"
echo "Generating Secrets for Kubernetes"
echo "======================================"
echo ""
echo "Use these secrets in your Kubernetes secret.yaml or Helm values file:"
echo ""

echo "AUTH_JWT_SECRET:"
openssl rand -base64 32
echo ""

echo "AUTH_REFRESH_SECRET:"
openssl rand -base64 32
echo ""

echo "AUTH_FORGOT_SECRET:"
openssl rand -base64 32
echo ""

echo "AUTH_CONFIRM_EMAIL_SECRET:"
openssl rand -base64 32
echo ""

echo "======================================"
echo ""
echo "IMPORTANT: Save these secrets securely!"
echo "Do not commit them to version control."
echo ""
