# Database Flow: Frontend → Backend → Database

## Overview

This document explains how data flows from the React Native frontend, through the Django backend API, to the database and back.

## Architecture Diagram

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│                 │         │                 │         │                 │
│  React Native   │  HTTP   │   Django REST   │  SQL    │   PostgreSQL/   │
│    Frontend     │────────▶│      API        │────────▶│   SQLite DB     │
│   (Mobile App)  │ Request │   (Backend)     │ Query   │   (Database)    │
│                 │◀────────│                 │◀────────│                 │
│                 │ Response│                 │ Results │                 │
└─────────────────┘         └─────────────────┘         └─────────────────┘
```

## Complete Flow Breakdown

### 1. Frontend Layer (React Native)

**Location:** `src/api/`, `src/screens/`, `src/components/`

**What it does:**
- Makes HTTP requests to backend API
- Handles user authentication
- Stores tokens locally
- Displays data to users

**Key Files:**
- `src/api/SecurityAPI.ts` - API client configuration
- `src/api/services/authService.ts` - Authentication service
- `src/screens/auth/LoginScreen.tsx` - Login UI
- `src/api/axios.config.ts` - HTTP client setup

### 2. Backend Layer (Django REST API)

**Location:** Django backend (separate project)

**What it does:**
- Receives HTTP requests from frontend
- Validates authentication tokens
- Queries database using Django ORM
- Returns JSON responses
- Handles business logic

**Key Components:**
- **Views/Viewsets** - Handle HTTP requests
- **Serializers** - Convert database models to JSON
- **Models** - Database table definitions
- **URLs** - Route requests to views
- **Authentication** - JWT token validation

### 3. Database Layer

**What it does:**
- Stores all data (users, alerts, cases, etc.)
- Executes SQL queries
- Returns data to backend

**Database Types:**
- **Development:** SQLite (local file)
- **Production:** PostgreSQL (cloud database)

## Detailed Flow Examples

### Example 1: Login Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ STEP 1: User Enters Credentials                                 │
└─────────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│ STEP 2: Frontend Sends Login Request                            │
│                                                                   │
│ File: src/screens/auth/LoginScreen.tsx                           │
│                                                                   │
│ loginOfficer("test_officer", "TestOfficer123!")                  │
│   ↓                                                               │
│ POST https://safetnet.onrender.com/api/security/login/          │
│ Body: {                                                          │
│   "username": "test_officer",                                    │
│   "password": "TestOfficer123!"                                  │
│ }                                                                │
└─────────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│ STEP 3: Backend Receives Request                                 │
│                                                                   │
│ File: backend/views/security_views.py (Django)                   │
│                                                                   │
│ @api_view(['POST'])                                              │
│ def login(request):                                              │
│     username = request.data.get('username')                      │
│     password = request.data.get('password')                     │
└─────────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│ STEP 4: Backend Authenticates User                               │
│                                                                   │
│ from django.contrib.auth import authenticate                     │
│                                                                   │
│ user = authenticate(username=username, password=password)        │
│                                                                   │
│ This queries the database:                                       │
│ SELECT * FROM users_user                                          │
│ WHERE username = 'test_officer'                                  │
│ AND is_active = True;                                            │
└─────────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│ STEP 5: Database Returns User Data                              │
│                                                                   │
│ Database returns:                                                │
│ {                                                                 │
│   id: 1,                                                         │
│   username: "test_officer",                                      │
│   email: "test.officer@safetnet.com",                            │
│   password_hash: "...",                                          │
│   is_active: True,                                               │
│   role: "security_officer"                                       │
│ }                                                                │
└─────────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│ STEP 6: Backend Generates JWT Tokens                             │
│                                                                   │
│ from rest_framework_simplejwt.tokens import RefreshToken          │
│                                                                   │
│ refresh = RefreshToken.for_user(user)                             │
│ access_token = refresh.access_token                               │
│                                                                   │
│ Response:                                                         │
│ {                                                                 │
│   "access": "eyJhbGci...",                                       │
│   "refresh": "eyJhbGci...",                                      │
│   "user": {                                                       │
│     "id": 1,                                                      │
│     "username": "test_officer",                                   │
│     "email": "test.officer@safetnet.com",                        │
│     "role": "security_officer"                                   │
│   }                                                               │
│ }                                                                │
└─────────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│ STEP 7: Frontend Receives Response                               │
│                                                                   │
│ File: src/api/SecurityAPI.ts                                     │
│                                                                   │
│ const responseData = res.data;                                   │
│ const accessToken = responseData.access;                          │
│                                                                   │
│ // Store tokens                                                  │
│ await AsyncStorage.setItem("token", accessToken);                │
│ await AsyncStorage.setItem("refresh_token", refreshToken);       │
└─────────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│ STEP 8: Frontend Updates UI                                      │
│                                                                   │
│ File: src/screens/auth/LoginScreen.tsx                           │
│                                                                   │
│ dispatch(loginSuccess({                                         │
│   token: accessToken,                                            │
│   officer: userData                                              │
│ }));                                                             │
│                                                                   │
│ // Navigate to SOS page                                          │
│ navigation.navigate('SOS');                                      │
└─────────────────────────────────────────────────────────────────┘
```

### Example 2: Fetching SOS Alerts Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ STEP 1: User Opens SOS Page                                     │
└─────────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│ STEP 2: Frontend Makes API Request                               │
│                                                                   │
│ File: src/components/common/SOSPage.tsx                          │
│                                                                   │
│ const response = await listSOS();                                 │
│   ↓                                                               │
│ GET https://safetnet.onrender.com/api/security/sos/              │
│ Headers: {                                                        │
│   Authorization: "Bearer eyJhbGci..."                            │
│ }                                                                │
└─────────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│ STEP 3: Backend Validates Token                                  │
│                                                                   │
│ File: backend/middleware/auth.py (Django)                        │
│                                                                   │
│ 1. Extract token from Authorization header                        │
│ 2. Verify token signature                                        │
│ 3. Check token expiration                                        │
│ 4. Get user from token                                           │
│                                                                   │
│ If invalid → Return 401 Unauthorized                             │
│ If valid → Continue to view                                     │
└─────────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│ STEP 4: Backend Queries Database                                 │
│                                                                   │
│ File: backend/views/sos_views.py                                 │
│                                                                   │
│ from security_app.models import SOSAlert                          │
│                                                                   │
│ alerts = SOSAlert.objects.filter(                                │
│     created_by=request.user                                       │
│ ).order_by('-created_at')                                        │
│                                                                   │
│ Django ORM converts to SQL:                                       │
│ SELECT * FROM security_app_sosalert                               │
│ WHERE created_by_id = 1                                          │
│ ORDER BY created_at DESC;                                        │
└─────────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│ STEP 5: Database Returns Results                                │
│                                                                   │
│ Database returns rows:                                           │
│ [                                                                 │
│   { id: 1, description: "Emergency...", is_resolved: false },   │
│   { id: 2, description: "Medical...", is_resolved: true },      │
│   ...                                                             │
│ ]                                                                │
└─────────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│ STEP 6: Backend Serializes Data                                  │
│                                                                   │
│ File: backend/serializers/sos_serializer.py                      │
│                                                                   │
│ class SOSAlertSerializer(serializers.ModelSerializer):           │
│     class Meta:                                                  │
│         model = SOSAlert                                         │
│         fields = ['id', 'description', 'is_resolved', ...]      │
│                                                                   │
│ Response:                                                         │
│ [                                                                 │
│   {                                                               │
│     "id": 1,                                                      │
│     "description": "Emergency situation...",                      │
│     "is_resolved": false,                                        │
│     "created_at": "2024-01-15T10:30:00Z"                        │
│   },                                                              │
│   ...                                                             │
│ ]                                                                │
└─────────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│ STEP 7: Frontend Receives and Displays Data                      │
│                                                                   │
│ File: src/components/common/SOSPage.tsx                          │
│                                                                   │
│ const sosList = response.data;                                    │
│                                                                   │
│ // Render in UI                                                   │
│ {sosList.map(alert => (                                           │
│   <View key={alert.id}>                                           │
│     <Text>{alert.description}</Text>                              │
│   </View>                                                         │
│ ))}                                                               │
└─────────────────────────────────────────────────────────────────┘
```

## Key Components Explained

### 1. Frontend API Client

**File:** `src/api/SecurityAPI.ts`

```typescript
// Creates axios instance with base URL
const apiClient = axios.create({
  baseURL: "https://safetnet.onrender.com/api/security/",
});

// Automatically adds token to requests
apiClient.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Login function
export const loginOfficer = async (username: string, password: string) => {
  const res = await apiClient.post("/login/", { username, password });
  const accessToken = res.data.access;
  await AsyncStorage.setItem("token", accessToken);
  return res.data;
};
```

**What it does:**
- Configures HTTP client
- Automatically attaches authentication tokens
- Handles errors
- Makes API calls to backend

### 2. Backend API View

**File:** `backend/views/security_views.py` (Django)

```python
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken

@api_view(['POST'])
def login(request):
    username = request.data.get('username')
    password = request.data.get('password')
    
    # Authenticate user (queries database)
    user = authenticate(username=username, password=password)
    
    if user:
        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'role': user.role
            }
        })
    else:
        return Response(
            {'non_field_errors': ['Invalid credentials.']},
            status=400
        )
```

**What it does:**
- Receives HTTP requests
- Validates data
- Queries database
- Returns JSON responses

### 3. Database Model

**File:** `backend/models.py` (Django)

```python
from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    role = models.CharField(max_length=50, default='USER')
    mobile = models.CharField(max_length=20, blank=True)
    
class SOSAlert(models.Model):
    description = models.TextField()
    is_resolved = models.BooleanField(default=False)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
```

**What it does:**
- Defines database tables
- Django ORM converts to SQL
- Creates relationships between tables

## Data Flow Summary

### Request Flow (Frontend → Database)

1. **User Action** → User taps button/opens screen
2. **Frontend** → Makes HTTP request with token
3. **Backend** → Validates token, extracts user
4. **Backend** → Builds database query (Django ORM)
5. **Database** → Executes SQL query
6. **Database** → Returns data rows

### Response Flow (Database → Frontend)

1. **Database** → Returns raw data
2. **Backend** → Serializes to JSON
3. **Backend** → Sends HTTP response
4. **Frontend** → Receives JSON data
5. **Frontend** → Updates Redux store
6. **Frontend** → Renders UI with data

## Authentication Flow

```
┌──────────────┐
│   User       │
│  Enters      │
│ Credentials  │
└──────┬───────┘
       │
       ▼
┌─────────────────────────────────────┐
│ Frontend: LoginScreen.tsx           │
│ - Collects username/password        │
│ - Calls loginOfficer()               │
└──────┬──────────────────────────────┘
       │
       ▼ HTTP POST /api/security/login/
┌─────────────────────────────────────┐
│ Backend: security_views.py          │
│ - Receives credentials              │
│ - Calls authenticate()              │
└──────┬──────────────────────────────┘
       │
       ▼ SQL Query
┌─────────────────────────────────────┐
│ Database: users_user table          │
│ - Checks username                   │
│ - Verifies password hash            │
│ - Returns user if valid             │
└──────┬──────────────────────────────┘
       │
       ▼ User Object
┌─────────────────────────────────────┐
│ Backend: Generates JWT tokens        │
│ - Creates access token               │
│ - Creates refresh token              │
│ - Returns tokens + user data         │
└──────┬──────────────────────────────┘
       │
       ▼ JSON Response
┌─────────────────────────────────────┐
│ Frontend: Stores tokens             │
│ - Saves access token                │
│ - Saves refresh token               │
│ - Updates Redux state               │
│ - Navigates to app                  │
└─────────────────────────────────────┘
```

## Token Usage in Subsequent Requests

```
┌─────────────────────────────────────┐
│ Frontend: Makes API Request         │
│ GET /api/security/sos/              │
│ Headers:                            │
│   Authorization: Bearer <token>     │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│ Backend: Validates Token             │
│ - Extracts token from header         │
│ - Verifies signature                 │
│ - Checks expiration                 │
│ - Gets user from token               │
└──────┬──────────────────────────────┘
       │
       ▼ Valid User
┌─────────────────────────────────────┐
│ Backend: Processes Request           │
│ - Uses request.user in query         │
│ - Returns user-specific data         │
└─────────────────────────────────────┘
```

## Error Handling Flow

```
┌─────────────────────────────────────┐
│ Database Error                       │
│ (Connection failed, query error)    │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│ Backend: Catches Error               │
│ - Logs error                         │
│ - Returns 500 status                │
│ - JSON: {"error": "Database error"} │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│ Frontend: Handles Error              │
│ - Checks response status             │
│ - Shows error message                │
│ - Logs to console                    │
└─────────────────────────────────────┘
```

## Key Technologies

### Frontend
- **React Native** - Mobile app framework
- **Axios** - HTTP client
- **AsyncStorage** - Local token storage
- **Redux** - State management

### Backend
- **Django** - Web framework
- **Django REST Framework** - API framework
- **Django ORM** - Database abstraction
- **JWT** - Token authentication

### Database
- **PostgreSQL** - Production database
- **SQLite** - Development database
- **SQL** - Query language

## Important Points

1. **Frontend never directly accesses database** - All database access goes through backend API
2. **Backend validates everything** - Authentication, authorization, data validation
3. **Tokens are stateless** - JWT tokens contain user info, no database lookup needed for validation
4. **Django ORM converts to SQL** - You write Python, Django generates SQL
5. **Serializers format data** - Convert database models to JSON for frontend

## Security Flow

1. **Login** → User authenticates, gets tokens
2. **Token Storage** → Tokens stored securely in AsyncStorage
3. **Request** → Token sent in Authorization header
4. **Validation** → Backend validates token (no database lookup needed)
5. **Authorization** → Backend checks user permissions
6. **Data Access** → Only returns data user is allowed to see

---

**This is how data flows from your mobile app, through the Django backend, to the database and back!** 🔄

