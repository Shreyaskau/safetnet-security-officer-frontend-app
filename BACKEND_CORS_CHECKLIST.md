# 🔒 Backend CORS Configuration Checklist

## For Your Backend Team / Django Settings

### Required CORS Settings in `settings.py`:

```python
# Install django-cors-headers if not already installed
# pip install django-cors-headers

INSTALLED_APPS = [
    ...
    'corsheaders',  # Add this
    ...
]

MIDDLEWARE = [
    ...
    'corsheaders.middleware.CorsMiddleware',  # Add this BEFORE CommonMiddleware
    'django.middleware.common.CommonMiddleware',
    ...
]

# CORS Settings
CORS_ALLOWED_ORIGINS = [
    "https://your-frontend-domain.com",  # Your deployed frontend URL
    "http://localhost:3000",  # For local development
    "http://localhost:8081",  # React Native Metro bundler
]

# Or for development (less secure):
# CORS_ALLOW_ALL_ORIGINS = True  # Only for testing!

# Allow credentials (if using cookies/sessions)
CORS_ALLOW_CREDENTIALS = True

# Allowed headers
CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]
```

### Important Notes:
1. **Replace `your-frontend-domain.com`** with your actual deployed frontend URL
2. **Exact match required** - URLs must match exactly (including http/https, trailing slashes)
3. **Test CORS** - Use browser console or Postman to verify CORS headers

### How to Verify CORS is Working:
1. Make a test request from frontend
2. Check response headers for:
   - `Access-Control-Allow-Origin: https://your-frontend-domain.com`
   - `Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS`
   - `Access-Control-Allow-Headers: Content-Type, Authorization`

---

## 🔍 Quick CORS Test

### Using curl:
```bash
curl -H "Origin: https://your-frontend-domain.com" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     https://safetnet.onrender.com/api/security/login/
```

### Expected Response Headers:
```
Access-Control-Allow-Origin: https://your-frontend-domain.com
Access-Control-Allow-Methods: POST, GET, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

