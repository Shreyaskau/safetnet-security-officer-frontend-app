# Testing the Application with Security Officer Credentials

## ✅ You've Created a Security Officer!

Now let's test the app with your credentials.

## Step 1: Get Your Credentials

From Django Admin, you created:
- **Username**: (the username you set)
- **Email**: (the email you set)  
- **Password**: (the password you set)

**Note**: The login accepts either **username** OR **email** in the same field.

## Step 2: Test Login in the App

1. **Open the app** on your device/emulator

2. **On the Login Screen:**
   - The field says "Badge ID or Email" but it accepts:
     - ✅ Username (e.g., `SecurityOfficer1`)
     - ✅ Email (if you have one)
     - ✅ Badge ID (if you have one)
   - Enter your **username** `SecurityOfficer1` in the "Badge ID or Email" field
   - Enter your **password** in the "Password" field
   - Tap **LOGIN**

3. **What Should Happen:**
   - ✅ Login button shows "LOGGING IN..."
   - ✅ If successful: Automatically navigates to **SOS Page**
   - ✅ Token is saved and attached to all future API calls
   - ❌ If failed: Shows error message

## Step 3: Verify Login Success

After successful login, you should:
- ✅ See the **SOS Page** (first page after login)
- ✅ Be able to navigate using bottom navigation bar
- ✅ See your user data in Profile page
- ✅ All API calls should work with authentication

## Step 4: Test API Connection

You can verify the backend connection:

1. Go to **Settings** (⚙️ icon on home page)
2. Scroll to **"CONNECTION"** section
3. Tap **"Test Backend Connection"**
4. Should show:
   - ✅ Backend API: Connected
   - ✅ Database: Connected

## Troubleshooting

### Issue: "Invalid Credentials"
- **Check**: Username/email and password are correct
- **Check**: User exists in Django admin
- **Check**: User is active (not disabled)
- **Check**: Backend server is running

### Issue: "Service Unavailable (503)"
- **Solution**: Backend server may be spinning up (Render.com free tier)
- **Wait**: 2-3 minutes and try again
- **Check**: `https://safetnet.onrender.com/api/security/login/` is accessible

### Issue: "Network Error"
- **Check**: Your device has internet connection
- **Check**: Backend URL is correct: `https://safetnet.onrender.com/api/security/`

### Issue: Login succeeds but no data shows
- **Normal**: If you haven't created sample data yet
- **Next Step**: Create sample data (see BACKEND_SETUP_GUIDE.md)

## Quick Test with curl

Test login from command line:

```bash
curl -X POST "https://safetnet.onrender.com/api/security/login/" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "YOUR_USERNAME",
    "password": "YOUR_PASSWORD"
  }'
```

**Expected Response:**
```json
{
  "token": "eyJhbGci...xyz",
  "user": {
    "id": 1,
    "username": "your_username",
    "role": "security_officer"
  }
}
```

## What to Test After Login

1. ✅ **SOS Page** - Should load (may be empty if no data)
2. ✅ **Home/Dashboard** - Should show
3. ✅ **Profile Page** - Should show your user info
4. ✅ **Settings** - Should work
5. ✅ **Navigation** - Bottom tabs should work

## Next Steps

After successful login:
1. Create sample data (if needed) - See BACKEND_SETUP_GUIDE.md
2. Test all pages
3. Verify data loads from backend

---

**Ready to test!** 🚀

Enter your credentials in the app and login!

