# CChat Backend Helm Chart

This Helm chart deploys the CChat Backend API to Kubernetes.

## Prerequisites

Before deploying, ensure the following resources exist in the `cchat` namespace:

1. **ConfigMap**: `cchat-api-prod`
   ```bash
   kubectl get configmap cchat-api-prod -n cchat
   ```

2. **Secret**: `cchat-api-secret`
   ```bash
   kubectl get secret cchat-api-secret -n cchat
   ```

These resources should be created from `infra/k8s/prod/`:
```bash
kubectl apply -f infra/k8s/prod/configmap/cchat-api-prod.yaml
kubectl apply -f infra/k8s/prod/secret/cchat-api-secret.yaml
```

## Values

### Key Configuration

| Parameter | Description | Default |
|-----------|-------------|---------|
| `configEnv` | Name of ConfigMap to load environment variables from | `cchat-api-prod` |
| `secretEnv` | Name of Secret to load sensitive environment variables from | `cchat-api-secret` |
| `image.repository` | Docker image repository | `asia-southeast1-docker.pkg.dev/mmenu-api-prod/docker/cchat-backend` |
| `image.tag` | Docker image tag | `internal` |
| `service.port` | Service port | `3000` |

### Resources

Default resource limits:
- CPU: 1 core limit, 100m request
- Memory: 2Gi limit, 512Mi request

## Deployment

### Install

```bash
helm install cchat-backend-internal ./infra/charts/cchat-backend \
  --namespace cchat \
  --create-namespace
```

### Upgrade

```bash
helm upgrade cchat-backend-internal ./infra/charts/cchat-backend \
  --namespace cchat
```

### Uninstall

```bash
helm uninstall cchat-backend-internal --namespace cchat
```

## Environment Variables

The deployment automatically loads environment variables from:

1. **ConfigMap** (`cchat-api-prod`):
   - NODE_ENV
   - APP_PORT
   - FRONTEND_DOMAIN
   - BACKEND_DOMAIN
   - Mail settings
   - etc.

2. **Secret** (`cchat-api-secret`):
   - MONGODB_URL
   - JWT secrets
   - Mail credentials
   - OAuth credentials
   - AWS credentials

## Verification

After deployment, verify the pod is running:

```bash
# Check pods
kubectl get pods -n cchat -l app.kubernetes.io/name=cchat-backend

# Check logs
kubectl logs -f -n cchat -l app.kubernetes.io/name=cchat-backend

# Check environment variables are loaded
kubectl exec -it -n cchat <pod-name> -- env | grep -E "MONGODB_URL|NODE_ENV|FRONTEND_DOMAIN"
```

## Health Checks

The deployment includes:
- **Liveness Probe**: HTTP GET `/health` on port 3000
- **Readiness Probe**: HTTP GET `/health` on port 3000
- Initial delay: 30 seconds
- Period: 10 seconds

## Service

A ClusterIP service is created:
- **Name**: `cchat-backend-internal`
- **Port**: 3000
- **Type**: ClusterIP

Access via HTTPRoute at:
- Production: https://cchatapi.mmenu.io
- Internal: https://internalcchatapi.mmenu.io
