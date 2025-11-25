# Quick Fix: Connect to Local Backend

## The Problem

Backend works on `127.0.0.1:8000` but frontend can't reach it.

## Solution

The code is now set to use `http://127.0.0.1:8000/api/security/`

## Important: Choose the Right URL

### If Using Android Emulator

Android emulator can't access `127.0.0.1` directly. Use `10.0.2.2` instead:

In `src/api/SecurityAPI.ts`, change:
```typescript
return "http://127.0.0.1:8000/api/security/";
```

To:
```typescript
return "http://10.0.2.2:8000/api/security/";
```

### If Using iOS Simulator

`127.0.0.1` should work fine. Keep:
```typescript
return "http://127.0.0.1:8000/api/security/";
```

### If Using Physical Device

You need your **computer's IP address**:

1. **Find your IP:**
   - Windows: `ipconfig` → Look for "IPv4 Address"
   - Mac/Linux: `ifconfig` → Look for "inet"

2. **Update code:**
   ```typescript
   return "http://192.168.1.100:8000/api/security/";  // Use your actual IP
   ```

3. **Update Django settings:**
   In `settings.py`:
   ```python
   ALLOWED_HOSTS = ['127.0.0.1', 'localhost', '192.168.1.100']
   ```

4. **Start Django on all interfaces:**
   ```bash
   python manage.py runserver 0.0.0.0:8000
   ```

## Test Backend is Reachable

### From Computer:
```bash
curl http://127.0.0.1:8000/api/security/login/
```

### From Android Emulator (if using 10.0.2.2):
```bash
adb shell
curl http://10.0.2.2:8000/api/security/login/
```

## Current Setting

The code is set to:
```typescript
return "http://127.0.0.1:8000/api/security/";
```

**If you're using Android Emulator, change it to `10.0.2.2`!**

---

**Try the app again - it should connect to your local backend!** 🚀

