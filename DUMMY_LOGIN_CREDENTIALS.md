# Dummy Login Credentials for Security Officers

## ✅ Mock Mode Enabled

**The app is now configured to use MOCK DATA - no backend required!**

All login credentials below are pre-configured and will work immediately without any backend setup.

---

## Test Account Credentials

### Officer Account 1 (Badge ID) - Guard
```
Badge ID or Email: BADGE001
Password: officer123
```
**Officer Details:**
- Name: John Smith
- Role: Guard
- Badge: BADGE001
- Shift: Morning Shift (6 AM - 2 PM)
- Stats: 45 responses, 4.8 rating

### Officer Account 2 (Email) - Supervisor
```
Badge ID or Email: officer@safetnet.com
Password: securepass456
```
**Officer Details:**
- Name: Sarah Johnson
- Role: Supervisor
- Badge: BADGE002
- Shift: Evening Shift (2 PM - 10 PM)
- Stats: 128 responses, 4.9 rating

### Officer Account 3 (Badge ID) - Guard
```
Badge ID or Email: SO-2024-001
Password: test1234
```
**Officer Details:**
- Name: Michael Brown
- Role: Guard
- Badge: SO-2024-001
- Shift: Night Shift (10 PM - 6 AM)
- Stats: 67 responses, 4.6 rating

### Officer Account 4 (Email) - Admin
```
Badge ID or Email: security.officer@safetnet.com
Password: password123
```
**Officer Details:**
- Name: Emily Davis
- Role: Admin
- Badge: BADGE003
- Shift: Day Shift (8 AM - 4 PM)
- Stats: 203 responses, 5.0 rating

### Officer Account 5 (Badge ID - Short Format) - Guard
```
Badge ID or Email: 12345
Password: demo2024
```
**Officer Details:**
- Name: David Wilson
- Role: Guard
- Badge: 12345
- Shift: Flexible Shift
- Stats: 32 responses, 4.5 rating

---

## Quick Reference

**Most Common Test Account:**
- **Badge ID**: `BADGE001`
- **Password**: `officer123`

**Alternative (Email):**
- **Email**: `officer@safetnet.com`
- **Password**: `securepass456`

---

## 🎯 How to Use

1. **Open the app** on your device
2. **Enter credentials** from the list above
3. **Tap LOGIN** - it will work immediately!
4. **No backend required** - all data is mocked locally

---

## ⚙️ Switching Between Mock and Real Backend

To switch between mock data and real backend:

1. Open `src/api/services/authService.ts`
2. Change `USE_MOCK_DATA` from `true` to `false`
3. Open `src/hooks/useAuth.ts`
4. Change `USE_MOCK_DATA` from `true` to `false`
5. Reload the app

---

## Notes

- ✅ **Mock mode is currently ENABLED** - no backend needed
- The login accepts either **Badge ID** or **Email** in the same field
- All passwords are case-sensitive
- All officer data is pre-configured with realistic mock data
- Each officer has different roles, stats, and shift schedules for testing

---

## Testing Tips

1. Try logging in with Badge ID: `BADGE001` / `officer123`
2. Try different roles: Guard, Supervisor, Admin
3. Each account has different stats and data for testing
4. All features work with mock data - no API calls needed!

