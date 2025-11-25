# Local Development Setup

## The Issue

Your backend is running on `127.0.0.1:8000` (localhost), but the frontend is trying to connect to production URL.

## Solution

I've updated the code to use localhost. Here's how to configure it:

### For Android Emulator / iOS Simulator

The code is now set to:
```typescript
baseURL: "http://127.0.0.1:8000/api/security/"
```

This should work for emulator/simulator.

### For Physical Device

If you're testing on a **physical device**, you need to use your **computer's IP address** instead of `127.0.0.1`.

**Step 1: Find your computer's IP address**

**Windows:**
```bash
ipconfig
```
Look for "IPv4 Address" (e.g., `192.168.1.100`)

**Mac/Linux:**
```bash
ifconfig
```
Look for "inet" address (e.g., `192.168.1.100`)

**Step 2: Update the code**

In `src/api/SecurityAPI.ts`, change:
```typescript
return "http://127.0.0.1:8000/api/security/";
```

To:
```typescript
return "http://192.168.1.100:8000/api/security/";  // Use your actual IP
```

**Step 3: Make sure backend allows connections**

In your Django `settings.py`, make sure:
```python
ALLOWED_HOSTS = ['127.0.0.1', 'localhost', '192.168.1.100']  # Add your IP
```

Or for development:
```python
ALLOWED_HOSTS = ['*']  # Allows all (only for development!)
```

**Step 4: Start Django with 0.0.0.0**

Run Django on all interfaces:
```bash
python manage.py runserver 0.0.0.0:8000
```

Not just:
```bash
python manage.py runserver  # Only listens on 127.0.0.1
```

## Quick Test

### Test 1: Check if backend is accessible

From your computer:
```bash
curl http://127.0.0.1:8000/api/security/login/
```

Should return an error (expected - needs POST), but shows server is reachable.

### Test 2: Test login

```bash
curl -X POST "http://127.0.0.1:8000/api/security/login/" \
  -H "Content-Type: application/json" \
  -d '{"username":"test_officer","password":"TestOfficer123!"}'
```

### Test 3: From device/emulator

If using physical device, test with your computer's IP:
```bash
curl -X POST "http://192.168.1.100:8000/api/security/login/" \
  -H "Content-Type: application/json" \
  -d '{"username":"test_officer","password":"TestOfficer123!"}'
```

## Current Configuration

The code is now set to use:
```
http://127.0.0.1:8000/api/security/
```

This works for:
- ✅ Android Emulator
- ✅ iOS Simulator
- ❌ Physical Device (need to use computer's IP)

## Switch Between Local and Production

To easily switch, you can use environment variables or a simple flag:

```typescript
const USE_LOCAL = true;  // Set to false for production

const baseURL = USE_LOCAL 
  ? "http://127.0.0.1:8000/api/security/"
  : "https://safetnet.onrender.com/api/security/";
```

## Troubleshooting

### "Network Error" on Emulator
- ✅ Backend is running on `127.0.0.1:8000`
- ✅ Frontend uses `http://127.0.0.1:8000/api/security/`
- ✅ Try `http://10.0.2.2:8000` for Android emulator (special IP)

### "Network Error" on Physical Device
- ✅ Backend running on `0.0.0.0:8000` (not just 127.0.0.1)
- ✅ Frontend uses your computer's IP (e.g., `192.168.1.100`)
- ✅ Both device and computer on same WiFi network
- ✅ Firewall allows port 8000

### Android Emulator Special Case

Android emulator uses `10.0.2.2` to refer to host machine's `127.0.0.1`.

Try:
```typescript
return "http://10.0.2.2:8000/api/security/";  // Android emulator
```

---

**The code is now configured for local development!** 🚀

