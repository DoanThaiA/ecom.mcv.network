# CChat Kubernetes Resources

This directory contains Kubernetes manifests for deploying CChat application.

## Directory Structure

```
infra/k8s/
├── prod/
│   ├── configmap/
│   │   └── cchat-api-prod.yaml       # Production ConfigMap for backend
│   ├── secret/
│   │   └── cchat-api-secret.yaml     # Production Secret (MongoDB, JWT, etc.)
│   └── httproute/
│       ├── cchat-api-httproute.yaml  # HTTPRoute for backend API
│       └── cchat-frontend-httproute.yaml  # HTTPRoute for frontend
└── README.md
```

## Production Environment

### Domains

- **Frontend**: https://cchat.mmenu.io
- **Backend API**: https://cchatapi.mmenu.io
- **Internal Frontend**: https://internalcchat.mmenu.io
- **Internal Backend API**: https://internalcchatapi.mmenu.io

### ConfigMap

The production ConfigMap (`cchat-api-prod.yaml`) contains non-sensitive environment variables for the backend application:

- Application settings (Node.js, API prefix, language)
- Domain configuration
- Mail server settings (Gmail SMTP)
- OAuth settings

### Secret

The production Secret (`cchat-api-secret.yaml`) contains sensitive data:

- **MongoDB URL**: MongoDB Atlas connection string for production database
- **JWT Secrets**: Tokens for authentication (access, refresh, forgot password, confirm email)
- **Mail Credentials**: Gmail SMTP username and password
- **OAuth Credentials**: Facebook, Google, Zalo app IDs and secrets (optional)
- **AWS S3 Credentials**: For file storage (optional)
- **Redis Connection**: Worker queue connection string (optional)

**⚠️ IMPORTANT**: This secret is shared between internal and production environments.

### HTTPRoute

HTTPRoute resources configure the Gateway API to route traffic to the appropriate services:

#### Backend API Routes (`cchat-api-httproute.yaml`)
- **cchatapi.mmenu.io** → `cchat-backend-internal:3000`
- **internalcchatapi.mmenu.io** → `cchat-backend-internal:3000`

#### Frontend Routes (`cchat-frontend-httproute.yaml`)
- **cchat.mmenu.io** → `cchat-frontend-internal:3000`
- **internalcchat.mmenu.io** → `cchat-frontend-internal:3000`

## Deployment

### Apply Secret (First)

**⚠️ IMPORTANT**: Update the secret values before applying!

```bash
# Edit the secret file and update:
# - MAIL_USER, MAIL_PASSWORD
# - AUTH_JWT_SECRET and other JWT secrets
# - OAuth credentials (if needed)

kubectl apply -f infra/k8s/prod/secret/cchat-api-secret.yaml
```

### Apply ConfigMap

```bash
kubectl apply -f infra/k8s/prod/configmap/cchat-api-prod.yaml
```

### Apply HTTPRoutes

```bash
# Backend API routes
kubectl apply -f infra/k8s/prod/httproute/cchat-api-httproute.yaml

# Frontend routes
kubectl apply -f infra/k8s/prod/httproute/cchat-frontend-httproute.yaml
```

### Verify Deployment

```bash
# Check Secret
kubectl get secret cchat-api-secret -n cchat

# Check ConfigMap
kubectl get configmap cchat-api-prod -n cchat

# Check HTTPRoutes
kubectl get httproute -n cchat

# Describe HTTPRoute
kubectl describe httproute cchat-api-prod -n cchat
kubectl describe httproute cchat-frontend-prod -n cchat
```

## Prerequisites

- Namespace `cchat` must exist
- Services must be deployed:
  - `cchat-backend-internal` (port 3000)
  - `cchat-frontend-internal` (port 3000)
- Gateway API must be configured with `external-http-gateway` in the cluster
- DNS records must point to the Gateway load balancer

## Notes

- All resources are deployed in the `cchat` namespace
- HTTPRoutes use the `https` section of the `external-http-gateway`
- The gateway handles SSL/TLS termination
- ConfigMap should be referenced by backend deployment using `configMapRef`
- Secret should be referenced by backend deployment using `secretRef`
- **The same secret is used for both internal and production environments**

## Security

⚠️ **IMPORTANT SECURITY NOTES**:

1. **Never commit the actual secret values** to git
2. Update all placeholder values before applying to production
3. Use strong, randomly generated secrets for JWT tokens
4. Rotate secrets regularly
5. Consider using a secret management solution like:
   - Google Secret Manager
   - HashiCorp Vault
   - Sealed Secrets

## Database

The MongoDB Atlas database is configured with:
- **Host**: mmenu-prod.zaabf.mongodb.net
- **Database**: ecommerce
- **User**: cchatapp
- **Connection**: MongoDB Atlas (SRV connection string)
