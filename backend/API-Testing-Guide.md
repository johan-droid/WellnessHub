# API Testing Guide - Wellness Travel Hub

## Base URL
```
Development: http://localhost:8787
Production: https://your-api-domain.com
```

## Authorization
All protected endpoints require:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## 🟢 PUBLIC ENDPOINTS

### Health Check
```bash
curl -X GET http://localhost:8787/api/health
```

**Response (200):**
```json
{
  "success": true,
  "status": "operational",
  "timestamp": "2026-03-15T10:30:00.000Z"
}
```

---

## 🔵 AUTHENTICATION ENDPOINTS

### Register User
```bash
curl -X POST http://localhost:8787/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "Test@1234",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

**Request Validation:**
- Email: Valid email format
- Password: Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
- FirstName/LastName: Optional

**Response (201):**
```json
{
  "success": true,
  "data": {
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 86400
  },
  "timestamp": "2026-03-15T10:30:00.000Z"
}
```

**Error Cases:**

Email already registered (409):
```json
{
  "success": false,
  "error": "Email already registered",
  "timestamp": "2026-03-15T10:30:00.000Z"
}
```

Validation failed (400):
```json
{
  "success": false,
  "error": "Validation failed: password: Password must be at least 8 characters",
  "timestamp": "2026-03-15T10:30:00.000Z"
}
```

Rate limited (429):
```json
{
  "success": false,
  "error": "Too many registration attempts. Please try again later.",
  "timestamp": "2026-03-15T10:30:00.000Z"
}
```

---

### Login
```bash
curl -X POST http://localhost:8787/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "Test@1234"
  }'
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 86400
  },
  "timestamp": "2026-03-15T10:30:00.000Z"
}
```

**Error Cases:**

Invalid credentials (401):
```json
{
  "success": false,
  "error": "Invalid email or password",
  "timestamp": "2026-03-15T10:30:00.000Z"
}
```

Rate limited (429):
```json
{
  "success": false,
  "error": "Too many login attempts. Please try again later.",
  "timestamp": "2026-03-15T10:30:00.000Z"
}
```

---

## 👤 USER PROFILE ENDPOINTS

### Get Profile
```bash
curl -X GET http://localhost:8787/api/protected/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "bio": "Travel enthusiast and wellness advocate",
    "profilePicture": "https://example.com/avatar.jpg",
    "createdAt": 1710496200000
  },
  "timestamp": "2026-03-15T10:30:00.000Z"
}
```

---

### Update Profile
```bash
curl -X PUT http://localhost:8787/api/protected/me \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Jonathan",
    "bio": "Updated bio",
    "profilePicture": "https://example.com/new-avatar.jpg"
  }'
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "firstName": "Jonathan",
    "lastName": "Doe",
    "bio": "Updated bio",
    "profilePicture": "https://example.com/new-avatar.jpg",
    "createdAt": 1710496200000,
    "updatedAt": 1710500000000
  },
  "timestamp": "2026-03-15T10:30:00.000Z"
}
```

---

## ✈️ TRIPS ENDPOINTS

### Get All Trips
```bash
# All trips
curl -X GET http://localhost:8787/api/protected/trips \
  -H "Authorization: Bearer YOUR_TOKEN"

# Filter by status
curl -X GET "http://localhost:8787/api/protected/trips?status=planning" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Status Options:** `planning`, `ongoing`, `completed`, `archived`

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "trip-123",
      "userId": "user-456",
      "title": "Europe Summer Vacation",
      "destination": "Paris, France",
      "description": "Two weeks exploring Europe",
      "startDate": 1720000000000,
      "endDate": 1721814400000,
      "status": "planning",
      "budget": 5000,
      "createdAt": 1710496200000,
      "updatedAt": 1710496200000
    }
  ],
  "timestamp": "2026-03-15T10:30:00.000Z"
}
```

---

### Get Single Trip with Activities
```bash
curl -X GET http://localhost:8787/api/protected/trips/trip-123 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "trip-123",
    "userId": "user-456",
    "title": "Europe Summer Vacation",
    "destination": "Paris, France",
    "description": "Two weeks exploring Europe",
    "startDate": 1720000000000,
    "endDate": 1721814400000,
    "status": "planning",
    "budget": 5000,
    "createdAt": 1710496200000,
    "updatedAt": 1710496200000,
    "activities": [
      {
        "id": "activity-1",
        "tripId": "trip-123",
        "title": "Visit Eiffel Tower",
        "description": "Classic Paris attraction",
        "location": "Eiffel Tower, Paris",
        "scheduledDate": 1720086400000,
        "estimatedDuration": 120,
        "category": "sightseeing",
        "completed": 0,
        "createdAt": 1710496200000,
        "updatedAt": 1710496200000
      }
    ]
  },
  "timestamp": "2026-03-15T10:30:00.000Z"
}
```

---

### Create Trip
```bash
curl -X POST http://localhost:8787/api/protected/trips \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Japan Winter 2026",
    "destination": "Tokyo, Japan",
    "description": "Skiing and hot springs",
    "startDate": 1735689600000,
    "endDate": 1736294400000,
    "budget": 8000
  }'
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "trip-new",
    "userId": "user-456",
    "title": "Japan Winter 2026",
    "destination": "Tokyo, Japan",
    "description": "Skiing and hot springs",
    "startDate": 1735689600000,
    "endDate": 1736294400000,
    "status": "planning",
    "budget": 8000,
    "createdAt": 1710496200000,
    "updatedAt": 1710496200000
  },
  "timestamp": "2026-03-15T10:30:00.000Z"
}
```

---

### Update Trip
```bash
curl -X PUT http://localhost:8787/api/protected/trips/trip-123 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "ongoing",
    "budget": 5500
  }'
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "trip-123",
    "userId": "user-456",
    "title": "Europe Summer Vacation",
    "destination": "Paris, France",
    "status": "ongoing",
    "budget": 5500,
    "updatedAt": 1710500000000
  },
  "timestamp": "2026-03-15T10:30:00.000Z"
}
```

---

### Delete Trip
```bash
curl -X DELETE http://localhost:8787/api/protected/trips/trip-123 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "trip-123",
    "deleted": true
  },
  "timestamp": "2026-03-15T10:30:00.000Z"
}
```

---

## 💚 WELLNESS LOGS ENDPOINTS

### Get Wellness Logs
```bash
# All logs (last 30 days)
curl -X GET http://localhost:8787/api/protected/wellness-logs \
  -H "Authorization: Bearer YOUR_TOKEN"

# Filter by type
curl -X GET "http://localhost:8787/api/protected/wellness-logs?type=mood&days=7" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Filter by trip
curl -X GET "http://localhost:8787/api/protected/wellness-logs?tripId=trip-123" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Type Options:** `symptom`, `period`, `mood`, `sleep`, `exercise`, `nutrition`, `meditation`, `vitals`

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "log-1",
      "userId": "user-456",
      "tripId": "trip-123",
      "type": "mood",
      "value": null,
      "rating": 8,
      "duration": null,
      "notes": "Feeling great in Paris!",
      "loggedAt": 1720086400000,
      "createdAt": 1710496200000,
      "updatedAt": 1710496200000
    },
    {
      "id": "log-2",
      "userId": "user-456",
      "tripId": "trip-123",
      "type": "exercise",
      "value": null,
      "rating": null,
      "duration": 45,
      "notes": "Morning jog along the Seine",
      "loggedAt": 1720172800000,
      "createdAt": 1710496200000,
      "updatedAt": 1710496200000
    }
  ],
  "timestamp": "2026-03-15T10:30:00.000Z"
}
```

---

### Create Wellness Log
```bash
# Mood log
curl -X POST http://localhost:8787/api/protected/wellness-logs \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "mood",
    "rating": 9,
    "notes": "Amazing day at the beach!",
    "tripId": "trip-123"
  }'

# Exercise log
curl -X POST http://localhost:8787/api/protected/wellness-logs \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "exercise",
    "duration": 60,
    "notes": "Yoga and meditation",
    "tripId": "trip-123"
  }'

# Nutrition log
curl -X POST http://localhost:8787/api/protected/wellness-logs \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "nutrition",
    "notes": "Had local healthy cuisine",
    "rating": 8
  }'
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "log-new",
    "userId": "user-456",
    "tripId": "trip-123",
    "type": "mood",
    "rating": 9,
    "notes": "Amazing day at the beach!",
    "loggedAt": 1710500000000,
    "createdAt": 1710500000000,
    "updatedAt": 1710500000000
  },
  "timestamp": "2026-03-15T10:30:00.000Z"
}
```

---

### Delete Wellness Log
```bash
curl -X DELETE http://localhost:8787/api/protected/wellness-logs/log-1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "log-1",
    "deleted": true
  },
  "timestamp": "2026-03-15T10:30:00.000Z"
}
```

---

## 📊 HEALTH METRICS ENDPOINTS

### Get Health Metrics
```bash
# All metrics (last 30 days)
curl -X GET http://localhost:8787/api/protected/health-metrics \
  -H "Authorization: Bearer YOUR_TOKEN"

# Filter by type
curl -X GET "http://localhost:8787/api/protected/health-metrics?type=heart_rate&days=7" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Metric Types:** `heart_rate`, `blood_pressure`, `weight`, `water_intake`, `steps`

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "metric-1",
      "userId": "user-456",
      "metricType": "heart_rate",
      "value": 72,
      "unit": "bpm",
      "recordedAt": 1710500000000,
      "createdAt": 1710500000000
    },
    {
      "id": "metric-2",
      "userId": "user-456",
      "metricType": "steps",
      "value": 8234,
      "unit": "steps",
      "recordedAt": 1710500000000,
      "createdAt": 1710500000000
    }
  ],
  "timestamp": "2026-03-15T10:30:00.000Z"
}
```

---

### Record Health Metric
```bash
# Heart rate
curl -X POST http://localhost:8787/api/protected/health-metrics \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "metricType": "heart_rate",
    "value": 72,
    "unit": "bpm"
  }'

# Weight
curl -X POST http://localhost:8787/api/protected/health-metrics \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "metricType": "weight",
    "value": 75.5,
    "unit": "kg"
  }'

# Water intake
curl -X POST http://localhost:8787/api/protected/health-metrics \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "metricType": "water_intake",
    "value": 2500,
    "unit": "ml"
  }'
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "metric-new",
    "userId": "user-456",
    "metricType": "heart_rate",
    "value": 72,
    "unit": "bpm",
    "recordedAt": 1710500000000,
    "createdAt": 1710500000000
  },
  "timestamp": "2026-03-15T10:30:00.000Z"
}
```

---

## 🔴 ERROR HANDLING

### Common Error Codes

**400 - Bad Request**
```json
{
  "success": false,
  "error": "Validation failed: email: Invalid email format",
  "timestamp": "2026-03-15T10:30:00.000Z"
}
```

**401 - Unauthorized**
```json
{
  "success": false,
  "error": "Unauthorized: Invalid or expired token",
  "timestamp": "2026-03-15T10:30:00.000Z"
}
```

**404 - Not Found**
```json
{
  "success": false,
  "error": "Trip not found",
  "timestamp": "2026-03-15T10:30:00.000Z"
}
```

**409 - Conflict**
```json
{
  "success": false,
  "error": "Email already registered",
  "timestamp": "2026-03-15T10:30:00.000Z"
}
```

**429 - Too Many Requests**
```json
{
  "success": false,
  "error": "Too many login attempts. Please try again later.",
  "timestamp": "2026-03-15T10:30:00.000Z"
}
```

**500 - Internal Server Error**
```json
{
  "success": false,
  "error": "Internal server error",
  "timestamp": "2026-03-15T10:30:00.000Z"
}
```

---

## 📱 Test Script

Save as `test-api.sh`:

```bash
#!/bin/bash

BASE_URL="http://localhost:8787"

# Register
REGISTER=$(curl -s -X POST $BASE_URL/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test@1234",
    "firstName": "Test",
    "lastName": "User"
  }')

TOKEN=$(echo $REGISTER | grep -o '"token":"[^"*' | cut -d'"' -f4)
echo "Token: $TOKEN"

# Get profile
curl -X GET $BASE_URL/api/protected/me \
  -H "Authorization: Bearer $TOKEN"

# Create trip
TRIP=$(curl -s -X POST $BASE_URL/api/protected/trips \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Trip",
    "destination": "Test Location",
    "budget": 1000
  }')

TRIP_ID=$(echo $TRIP | grep -o '"id":"[^"*' | cut -d'"' -f4 | head -1)
echo "Trip ID: $TRIP_ID"

# Create wellness log
curl -X POST $BASE_URL/api/protected/wellness-logs \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"type\": \"mood\",
    \"rating\": 8,
    \"tripId\": \"$TRIP_ID\"
  }"
```

Run with:
```bash
chmod +x test-api.sh
./test-api.sh
```

---

**Last Updated:** March 15, 2026
