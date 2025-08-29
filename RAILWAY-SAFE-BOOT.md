# Railway Safe Boot Configuration

## Environment Variables to Set in Railway Dashboard

Navigate to your Railway project → Settings → Environment Variables and add:

### Core Safe Boot Settings
```bash
# Safe boot mode - prevents OOM crashes
ALEX_BOOT_MODE=minimal
ALEX_ENABLE_NEUROCORE=false
ALEX_ENABLE_EVOLUTION=false
ALEX_ENABLE_BACKGROUND=false

# Node.js memory and performance
NODE_ENV=production
NODE_OPTIONS=--max-old-space-size=1024 --trace-gc
LOG_LEVEL=info

# Network configuration
PORT=3000
API_BASE_URL=https://api.alexiq.site
```

### Optional Production Settings
```bash
# For debugging memory issues (optional)
NODE_OPTIONS=--max-old-space-size=1024 --trace-gc --heapsnapshot-signal=SIGUSR2

# Enable components selectively after stabilization
ALEX_ENABLE_NEUROCORE=true   # Enable only after confirming memory is stable
```

## Railway Start Command

Set in Railway Dashboard → Settings → Deploy:

**Start Command:**
```bash
node server.mjs
```

Or create a `Procfile`:
```
web: node server.mjs
```

## Health Check URLs

After deployment, these endpoints should respond immediately:

- `https://api.alexiq.site/health` - Primary health check
- `https://api.alexiq.site/version` - Version info
- `https://api.alexiq.site/api/health` - API health check
- `https://api.alexiq.site/admin/memory` - Memory stats

## Progressive Module Activation

After the safe boot is stable:

1. **Test minimal boot first:**
   ```bash
   curl https://api.alexiq.site/health
   # Should return 200 OK immediately
   ```

2. **Enable NeuroCore selectively:**
   - Set `ALEX_ENABLE_NEUROCORE=true` in Railway
   - Redeploy and monitor memory usage
   - Check `/admin/memory` endpoint

3. **Enable other modules:**
   - Only after NeuroCore is stable
   - Set `ALEX_ENABLE_EVOLUTION=true`
   - Set `ALEX_ENABLE_BACKGROUND=true`

## Memory Monitoring

The safe boot server includes automatic memory monitoring:

- Logs warnings when heap usage > 400MB
- Forces garbage collection when available
- Provides `/admin/memory` endpoint for monitoring

## Rollback Plan

If deployment fails:
1. Set `ALEX_BOOT_MODE=minimal`
2. Set all `ALEX_ENABLE_*=false`
3. Redeploy → API responds immediately

## Debug Commands

```bash
# Check if API is responding
curl -i https://api.alexiq.site/health

# Check memory usage
curl https://api.alexiq.site/admin/memory

# Enable heavy modules (after safe boot is stable)
curl -X POST https://api.alexiq.site/admin/enable-neuro
```