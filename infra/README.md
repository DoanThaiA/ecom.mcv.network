# CChat Infrastructure

This directory contains Helm charts and Kubernetes configurations for deploying CChat application to GKE (Google Kubernetes Engine).

## Table of Contents

- [Overview](#overview)
- [Directory Structure](#directory-structure)
- [Prerequisites](#prerequisites)
- [Charts](#charts)
  - [cchat-backend](#cchat-backend)
  - [cchat-frontend](#cchat-frontend)
- [Deployment](#deployment)
- [Configuration](#configuration)
- [Troubleshooting](#troubleshooting)

## Overview

The CChat application consists of two main components:
- **Backend**: NestJS API server
- **Frontend**: Next.js web application

Both components are deployed to the `cchat` namespace in Kubernetes.

## Directory Structure

```
infra/
├── charts/
│   ├── cchat-backend/
│   │   ├── Chart.yaml
│   │   ├── values.yaml
│   │   ├── values/
│   │   │   ├── internal.yaml
│   │   │   └── prod.yaml
│   │   └── templates/
│   │       ├── deployment.yaml
│   │       ├── service.yaml
│   │       ├── hpa.yaml
│   │       ├── ingress.yaml
│   │       ├── backendconfig.yaml
│   │       └── ...
│   └── cchat-frontend/
│       ├── Chart.yaml
│       ├── values.yaml
│       ├── values/
│       │   ├── internal.yaml
│       │   └── prod.yaml
│       └── templates/
│           ├── deployment.yaml
│           ├── service.yaml
│           ├── hpa.yaml
│           ├── ingress.yaml
│           └── ...
└── README.md
```

## Prerequisites

- Kubernetes cluster (GKE recommended)
- `kubectl` configured to access your cluster
- `helm` 3.x installed
- Docker images built and pushed to GCP Artifact Registry

## Charts

### cchat-backend

Backend API service built with NestJS.

**Specifications:**
- **Namespace**: `cchat`
- **Docker Image**: `asia-southeast1-docker.pkg.dev/mmenu-api-prod/docker/cchat-backend`
- **Port**: 3000
- **Health Check**: `/health`
- **Resources**:
  - Limits: 2Gi memory, 1 CPU
  - Requests: 512Mi memory, 100m CPU
- **Features**:
  - GCP BackendConfig for Load Balancer health checks
  - Support for ConfigMap and Secret environment variables
  - HPA (Horizontal Pod Autoscaling) support

### cchat-frontend

Frontend web application built with Next.js.

**Specifications:**
- **Namespace**: `cchat`
- **Docker Image**: `asia-southeast1-docker.pkg.dev/mmenu-api-prod/docker/cchat-frontend`
- **Port**: 3000
- **Health Check**: `/` (root path)
- **Resources**:
  - Limits: 1Gi memory
  - Requests: 512Mi memory, 100m CPU
- **Features**:
  - Static asset serving
  - HPA support for production environment

## Deployment

### Create Namespace

First, create the `cchat` namespace if it doesn't exist:

```bash
kubectl create namespace cchat
```

### Deploy to Internal Environment

Deploy backend:
```bash
helm upgrade --install cchat-backend-internal ./infra/charts/cchat-backend \
  -f ./infra/charts/cchat-backend/values/internal.yaml \
  --namespace cchat
```

Deploy frontend:
```bash
helm upgrade --install cchat-frontend-internal ./infra/charts/cchat-frontend \
  -f ./infra/charts/cchat-frontend/values/internal.yaml \
  --namespace cchat
```

### Deploy to Production Environment

Deploy backend:
```bash
helm upgrade --install cchat-backend-prod ./infra/charts/cchat-backend \
  -f ./infra/charts/cchat-backend/values/prod.yaml \
  --namespace cchat
```

Deploy frontend:
```bash
helm upgrade --install cchat-frontend-prod ./infra/charts/cchat-frontend \
  -f ./infra/charts/cchat-frontend/values/prod.yaml \
  --namespace cchat
```

### Verify Deployment

Check pod status:
```bash
kubectl get pods -n cchat
```

Check services:
```bash
kubectl get svc -n cchat
```

Check deployments:
```bash
kubectl get deployments -n cchat
```

## Configuration

### Environment-Specific Values

Each chart has environment-specific value files:

**Internal Environment** (`values/internal.yaml`):
- Image tag: `internal`
- Autoscaling: Disabled
- Single replica
- Secret reference: `cchat-{backend|frontend}-internal`

**Production Environment** (`values/prod.yaml`):
- Image tag: `prod`
- Autoscaling: Enabled
- Min replicas: 1, Max replicas: 3
- Secret reference: `cchat-{backend|frontend}-prod`

### Secrets Management

Create secrets for environment variables:

```bash
# For backend internal
kubectl create secret generic cchat-backend-internal \
  --from-literal=DATABASE_URL=postgresql://... \
  --from-literal=JWT_SECRET=... \
  --namespace cchat

# For frontend internal
kubectl create secret generic cchat-frontend-internal \
  --from-literal=NEXT_PUBLIC_API_URL=... \
  --namespace cchat
```

### Updating Image Tags

To update the image tag without changing values files:

```bash
helm upgrade cchat-backend-internal ./infra/charts/cchat-backend \
  -f ./infra/charts/cchat-backend/values/internal.yaml \
  --set image.tag=internal-1.0.1 \
  --namespace cchat
```

## Troubleshooting

### Check Pod Logs

```bash
kubectl logs -f <pod-name> -n cchat
```

### Describe Pod for Events

```bash
kubectl describe pod <pod-name> -n cchat
```

### Check Health Endpoints

Port-forward to test health checks:
```bash
# Backend
kubectl port-forward svc/cchat-backend-internal 3000:3000 -n cchat
curl http://localhost:3000/health

# Frontend
kubectl port-forward svc/cchat-frontend-internal 3000:3000 -n cchat
curl http://localhost:3000/
```

### Rollback Deployment

```bash
helm rollback cchat-backend-internal -n cchat
```

### Delete Deployment

```bash
helm uninstall cchat-backend-internal -n cchat
helm uninstall cchat-frontend-internal -n cchat
```

## CI/CD Integration

The deployments are automated through GitHub Actions workflows:
- Backend: `.github/workflows/backend-build-gke.yml`
- Frontend: `.github/workflows/frontend-build-gke.yml`

Deployments are triggered when `version.json` files are updated in the respective directories on the `internal` branch.
