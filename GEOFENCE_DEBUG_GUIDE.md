# Geofence Display Debugging Guide

## Problem
Geofence area is not showing on the map for the assigned security officer.

## Current Status
- ✅ Geofence service updated to handle `assigned_geofence.polygon_json` format
- ✅ Map rendering updated to display geofence polygon
- ✅ Enhanced logging added throughout the flow
- ❌ Geofence still not displaying (logs show `hasGeofence: false`)

## Debugging Steps

### Step 1: Check Officer Data After Login
**Location:** Console logs when opening Geofence Map screen

**Look for:**
```
[GeofenceMap] useEffect triggered - Officer data: { ... }
```

**Check:**
- ✅ `hasOfficer: true`
- ✅ `geofence_id` exists and has a value (e.g., "4" or 4)
- ✅ `geofence_idEmpty: false`

**If geofence_id is missing:**
- Check login response in `authService.ts`
- Verify backend includes `geofence_id` in login response
- Check if geofence_id needs to be fetched from profile endpoint

### Step 2: Check API Call
**Location:** Console logs when geofence fetch is triggered

**Look for:**
```
[GeofenceMap] Fetching geofence for officer: [name] geofence_id: [id]
[Geofence] Fetching geofence details for ID: [id]
```

**If you DON'T see these logs:**
- `geofence_id` is missing or empty
- Fix: Ensure officer has geofence_id assigned in backend

### Step 3: Check API Response
**Location:** Console logs after API call

**Look for:**
```
[Geofence] API Response: { ... }
```

**Check the response structure:**
- Does it have `assigned_geofence` object?
- Does `assigned_geofence.polygon_json` exist?
- Does `assigned_geofence.center_point` exist?

**Expected format:**
```json
{
  "assigned_geofence": {
    "id": 4,
    "name": "Pune PCMC Area",
    "polygon_json": "[[lat1,lng1], [lat2,lng2], ...]",
    "center_point": "{\"latitude\": 18.5204, \"longitude\": 73.8567}",
    ...
  }
}
```

### Step 4: Check Parsed Data
**Location:** Console logs after parsing

**Look for:**
```
[Geofence] Parsed polygon_json: [ ... ]
[Geofence] Parsed center_point: { latitude: ..., longitude: ... }
[Geofence] Mapped geofence data: { coordinatesCount: 4, ... }
```

**If coordinatesCount is 0:**
- `polygon_json` parsing failed
- Check if `polygon_json` is in correct format
- Check if coordinates are valid

### Step 5: Check Map Rendering
**Location:** Console logs when map HTML is generated

**Look for:**
```
[GeofenceMap] Generating map HTML: { hasGeofence: true, coordinatesCount: 4, ... }
```

**If hasGeofence is false:**
- Geofence state is not being set correctly
- Check if `setGeofence(data)` is being called
- Check if geofence data passes validation

## Common Issues & Solutions

### Issue 1: geofence_id Missing from Login
**Solution:**
- Fetch geofence_id from profile endpoint after login
- Or ensure backend includes geofence_id in login response

### Issue 2: API Endpoint Method Wrong
**Solution:**
- Current: POST `/api/security/geofence/`
- Try: GET `/api/security/geofence/{id}/` or GET with query params
- Code already handles 405 error and tries GET automatically

### Issue 3: polygon_json Format Mismatch
**Solution:**
- Code handles both string and array formats
- Check console logs to see actual format
- Update parsing logic if format differs

### Issue 4: Coordinates Empty After Parsing
**Solution:**
- Check if `polygon_json` contains valid coordinates
- Verify coordinate format (should be [lat, lng] or {latitude, longitude})
- Add fallback to use other coordinate fields if polygon_json fails

## Next Actions

1. **Check console logs** - Follow steps 1-5 above
2. **Verify backend response** - Check what `/api/security/geofence/` actually returns
3. **Test API endpoint** - Try calling the endpoint directly with geofence_id=4
4. **Check backend assignment** - Verify officer is assigned to geofence_id 4 in backend

## Testing Checklist

- [ ] Officer logs in successfully
- [ ] Officer has geofence_id in Redux state
- [ ] API call to fetch geofence is made
- [ ] API returns geofence data with polygon_json
- [ ] polygon_json is parsed correctly
- [ ] Coordinates array has length > 0
- [ ] Geofence state is set in component
- [ ] Map HTML includes geofence polygon
- [ ] Polygon displays on map

