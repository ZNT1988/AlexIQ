# Vercel Frontend Configuration

## Environment Variables for Vercel

Navigate to Vercel Dashboard → Project Settings → Environment Variables and add:

### Production Environment
```bash
# API Base URL for production
VITE_API_BASE_URL=https://api.alexiq.site

# Optional: Timeout setting
VITE_API_TIMEOUT=10000

# Node environment
NODE_ENV=production
```

### Development Environment (optional)
```bash
# For local development override
VITE_API_URL=https://api.alexiq.site

# Or if running local backend for development
VITE_API_URL=http://localhost:3000
```

## Automatic Configuration

The frontend will automatically:

1. **In Development:**
   - Use Vite proxy to forward `/api` requests
   - Target: `https://api.alexiq.site` (or `VITE_API_URL` if set)

2. **In Production:**
   - Use `https://api.alexiq.site` directly
   - Override with `VITE_API_BASE_URL` if set

## Testing API Connection

After deployment, test the API connection:

```javascript
// In browser console
fetch('/health')
  .then(r => r.json())
  .then(console.log)

// Or test the API wrapper
import { healthCheck, API_BASE_URL } from './src/lib/api.ts';
console.log('API Base URL:', API_BASE_URL);
healthCheck().then(console.log);
```

## Build and Deploy Commands

### Vercel Dashboard Settings
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm ci`

### Package.json scripts should include:
```json
{
  "scripts": {
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

## Error Handling

The API wrapper includes:
- Automatic error handling with detailed messages
- Console logging for debugging
- Proper HTTP status code handling
- Fallback error messages

## CORS Configuration

Make sure the Railway backend allows Vercel domain:
```javascript
// In backend CORS config
origin: [
  "https://hustle-finder-ia.vercel.app",
  "https://alexiq-frontend.vercel.app",
  "https://your-vercel-domain.vercel.app"
]
```