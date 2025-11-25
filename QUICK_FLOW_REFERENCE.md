# Quick Reference: Database Flow

## Simple Overview

```
User Action
    ↓
Frontend (React Native)
    ↓ HTTP Request + Token
Backend (Django REST API)
    ↓ SQL Query
Database (PostgreSQL/SQLite)
    ↓ Data Rows
Backend (Serializes to JSON)
    ↓ JSON Response
Frontend (Updates UI)
    ↓
User Sees Data
```

## Login Example

```
1. User enters: test_officer / TestOfficer123!
2. Frontend → POST /api/security/login/
3. Backend → Queries database for user
4. Database → Returns user data
5. Backend → Generates JWT tokens
6. Frontend → Stores tokens, navigates to app
```

## Fetch Data Example

```
1. User opens SOS page
2. Frontend → GET /api/security/sos/ + Bearer token
3. Backend → Validates token
4. Backend → Queries database for alerts
5. Database → Returns alert rows
6. Backend → Converts to JSON
7. Frontend → Displays alerts in UI
```

## Key Files

**Frontend:**
- `src/api/SecurityAPI.ts` - API client
- `src/screens/auth/LoginScreen.tsx` - Login UI
- `src/components/common/SOSPage.tsx` - Data display

**Backend:**
- `views/security_views.py` - API endpoints
- `models.py` - Database tables
- `serializers.py` - JSON formatting

**Database:**
- Tables: `users_user`, `security_app_sosalert`, etc.

## Important Notes

- ✅ Frontend **never** directly accesses database
- ✅ All database access goes through **backend API**
- ✅ **Tokens** authenticate requests
- ✅ **Django ORM** converts Python to SQL
- ✅ **Serializers** convert database to JSON

---

**See `DATABASE_FLOW_EXPLANATION.md` for detailed explanation!**

