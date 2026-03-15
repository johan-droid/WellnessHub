# Quick Start Guide - Implementing Backend Improvements

## 📌 TL;DR - What You Need to Do

Your original backend had **3 critical security vulnerabilities** and was missing **12 API endpoints**. This guide covers everything needed to fix them.

**Time to implement:** 2-4 hours  
**Difficulty:** Moderate (copy-paste with understanding)  
**Breaking changes:** Yes - you'll need to update any frontend code

---

## 🚀 Implementation Steps

### Step 1: Update Dependencies (5 minutes)

```bash
cd backend
npm install zod
```

**Updated package.json:**
```json
{
  "dependencies": {
    "@types/uuid": "^10.0.0",
    "drizzle-orm": "^0.45.1",
    "hono": "^4.12.8",
    "uuid": "^13.0.0",
    "zod": "^3.22.4"
  }
}
```

### Step 2: Create New Files (30 minutes)

Replace/create these three files:

**1. `src/auth-utils.ts`** - Secure authentication utilities
- PBKDF2 password hashing
- JWT token generation/verification
- Rate limiter helper

**2. `src/db/schema.ts`** - Enhanced database schema
- 5 tables (users, trips, wellnessLogs, tripActivities, healthMetrics)
- Zod validation schemas for all endpoints
- Type-safe input/output

**3. `src/index.ts`** - Complete API application
- 15+ endpoints (replace original)
- Proper error handling
- Rate limiting
- Input validation
- CORS whitelist

All three files are provided in the outputs.

### Step 3: Update Configuration (10 minutes)

**Update `wrangler.jsonc`:**
- Add environment-specific JWT_SECRET
- Configure D1 for dev/staging/prod
- Add observability settings

```jsonc
{
  "env": {
    "development": {
      "vars": {
        "JWT_SECRET": "dev-secret-key",
        "ENVIRONMENT": "development"
      },
      "d1_databases": [...]
    }
  }
}
```

### Step 4: Test Locally (15 minutes)

```bash
npm run dev
```

Test endpoints using the provided curl examples:

```bash
# Register
curl -X POST http://localhost:8787/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test@1234"}'

# Login
curl -X POST http://localhost:8787/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test@1234"}'

# Create trip (with token)
curl -X POST http://localhost:8787/api/protected/trips \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"My Trip","destination":"Paris"}'
```

See `API_TESTING_GUIDE.md` for complete test suite.

### Step 5: Update Frontend (30 minutes - 1 hour)

Your frontend will break because response formats changed:

**Old format:**
```json
{ "message": "User created", "token": "..." }
```

**New format:**
```json
{
  "success": true,
  "data": { "userId": "...", "token": "..." },
  "timestamp": "2026-03-15T..."
}
```

Update all API calls to handle the new response structure:

```typescript
// Before
const res = await fetch('/api/auth/register', {...})
const { token } = await res.json()

// After
const res = await fetch('/api/auth/register', {...})
const { success, data, error } = await res.json()
if (!success) {
  console.error(error)
  return
}
const { token } = data
```

**API Changes Summary:**

| Endpoint | Old | New |
|----------|-----|-----|
| `POST /api/auth/register` | Returns `token` | Returns `data` with token |
| `POST /api/auth/login` | Returns `token` | Returns `data` with token |
| `GET /api/protected/me` | Returns `user` | Returns `data` with user |
| `POST /api/protected/trips` | ❌ Missing | ✅ Create trip |
| `GET /api/protected/trips` | ❌ Missing | ✅ List trips |
| `GET /api/protected/trips/:id` | ❌ Missing | ✅ Get trip + activities |
| `PUT /api/protected/trips/:id` | ❌ Missing | ✅ Update trip |
| `DELETE /api/protected/trips/:id` | ❌ Missing | ✅ Delete trip |
| `POST /api/protected/wellness-logs` | ❌ Missing | ✅ Create log |
| `GET /api/protected/wellness-logs` | ❌ Missing | ✅ List logs |
| `DELETE /api/protected/wellness-logs/:id` | ❌ Missing | ✅ Delete log |
| `POST /api/protected/health-metrics` | ❌ Missing | ✅ Record metric |
| `GET /api/protected/health-metrics` | ❌ Missing | ✅ List metrics |
| `PUT /api/protected/me` | ❌ Missing | ✅ Update profile |

### Step 6: Deploy (5 minutes)

```bash
npm run deploy
```

Set production JWT_SECRET:

```bash
wrangler secret put JWT_SECRET --env production
# Paste your strong secret (32+ characters, mix of cases, numbers, symbols)
```

---

## 📋 Validation Checklist

### Security Validation
- [ ] Password hashing uses PBKDF2 with 100k iterations
- [ ] JWT secret is in environment variables (not hardcoded)
- [ ] All inputs validated with Zod schemas
- [ ] Rate limiting enabled (5 register/hr, 10 login/15min)
- [ ] CORS whitelist configured (not permissive)

### API Validation
- [ ] All 15+ endpoints tested locally
- [ ] Error responses follow standard format
- [ ] Timestamps included in all responses
- [ ] Protected routes require Bearer token
- [ ] Rate limiting returns 429 status

### Database Validation
- [ ] All 5 tables created
- [ ] Foreign keys properly configured
- [ ] Cascade deletes work (delete trip → delete activities)
- [ ] Unique constraints enforced (email)

### Frontend Validation
- [ ] Login/register working
- [ ] Bearer token properly sent in Authorization header
- [ ] Response parsing handles new format
- [ ] Error messages display correctly
- [ ] All new endpoints integrated

---

## 🆘 Troubleshooting

### "JWT_SECRET environment variable is required"
**Problem:** JWT_SECRET not set in environment  
**Solution:** Add to wrangler.jsonc vars section or use `wrangler secret put`

### "Too many registration attempts"
**Problem:** Hit rate limit (5 per hour per IP)  
**Solution:** Wait 1 hour or change IP, or modify rate limit constants in `auth-utils.ts`

### "Email already registered"
**Problem:** Database has duplicate emails  
**Solution:** This is correct behavior - email is unique. Use different email for testing.

### "Validation failed: password: ..."
**Problem:** Password doesn't meet requirements  
**Solution:** Password must be 8+ chars with uppercase, lowercase, number, and special char. Example: `Test@1234`

### "Invalid email or password"
**Problem:** Wrong credentials on login  
**Solution:** Make sure you registered first, and credentials match exactly

### Frontend getting "success: false" on login
**Problem:** Response format mismatch  
**Solution:** Check that you're accessing `data.token`, not just `token`

---

## 📊 Before & After Comparison

### Password Security
| Aspect | Before | After |
|--------|--------|-------|
| Algorithm | SHA-256 | PBKDF2 |
| Salt | None | 16-byte random |
| Iterations | 1 | 100,000 |
| Crack time (GPU) | Seconds | Hours |

### Input Validation
| Type | Before | After |
|------|--------|-------|
| Email | Null check only | RFC 5322 format |
| Password | Null check only | 8+ chars, mixed case, number, symbol |
| Trip title | Null check only | 1-200 chars |
| All inputs | 0 schemas | 10+ Zod schemas |

### API Coverage
| Feature | Before | After |
|---------|--------|-------|
| Endpoints | 3 | 15+ |
| Tables | 3 | 5 |
| Error handling | Ad-hoc | Standardized |
| Rate limiting | None | Yes |
| CORS | Permissive | Whitelist |

---

## 🔄 Migration Guide (If You Have Existing Data)

### From Old Database to New

If you have production data in the old schema:

**Option 1: Fresh Start (Recommended for development)**
```bash
# Clear D1
wrangler d1 delete wellness-hub-db --env production

# Re-initialize
npm run dev  # Creates new empty DB with migrations
```

**Option 2: Data Migration (For production)**
```bash
# Export old data
sqlite3 old-db.db ".dump" > export.sql

# Create mapping between old and new schema
# (You'll need to adjust field names: passwordHash → password_hash, etc.)

# Import to new D1
wrangler d1 execute wellness-hub-db --remote < export.sql
```

---

## 📚 File Reference

### New/Modified Files
- `src/index.ts` (250+ lines) - Complete API
- `src/db/schema.ts` (200+ lines) - Schema + validation
- `src/auth-utils.ts` (150+ lines) - Authentication
- `package.json` - Add Zod dependency
- `wrangler.jsonc` - Environment configuration

### Documentation Files
- `IMPROVEMENTS_GUIDE.md` - Detailed walkthrough (40+ pages)
- `API_TESTING_GUIDE.md` - Complete API examples (15+ endpoints)
- This file - Quick implementation guide

---

## 🎯 Next Steps After Implementation

### Immediate (Day 1-2)
- [ ] Implement all files
- [ ] Run tests locally
- [ ] Update frontend code
- [ ] Deploy to staging

### Short-term (Week 1-2)
- [ ] Monitor production logs
- [ ] Test with real frontend
- [ ] Gather user feedback
- [ ] Fix any issues

### Medium-term (Month 1-2)
- [ ] Move rate limiter to Redis (for distributed systems)
- [ ] Add API documentation (Swagger/OpenAPI)
- [ ] Add unit tests
- [ ] Add integration tests
- [ ] Set up monitoring/alerting

### Long-term (Month 3+)
- [ ] Add OAuth integration
- [ ] Add email verification
- [ ] Add password reset flow
- [ ] Add two-factor authentication
- [ ] Add analytics dashboard

---

## 💡 Pro Tips

### Development
- Use `wrangler tail --env development` to see live logs
- Test with `curl` before integrating with frontend
- Use `API_TESTING_GUIDE.md` as reference for all endpoints

### Production
- Set strong JWT_SECRET (use `openssl rand -base64 32`)
- Configure CORS whitelist to your actual domain
- Monitor rate limit hit rates
- Keep database backups
- Review logs daily

### Security
- Rotate JWT_SECRET every 90 days
- Update Node.js and dependencies regularly
- Monitor for Zod/Hono updates
- Test password strength in staging before prod
- Consider migrating to Auth0/Clerk for production

---

## 📞 Support & Questions

### Common Questions

**Q: Do I need to re-deploy to change JWT_SECRET?**  
A: No - use `wrangler secret put JWT_SECRET --env production` to update without redeploying.

**Q: Can I migrate existing users without re-registration?**  
A: Yes, but you'll need to re-hash their passwords using the new PBKDF2 algorithm. Migrate their hashes to the new format when they log in.

**Q: How do I test rate limiting?**  
A: Use this script to make 11 requests:
```bash
for i in {1..11}; do
  curl -X POST http://localhost:8787/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"wrong"}'
done
```
The 11th should return 429 status.

**Q: Can I customize rate limits?**  
A: Yes - edit constants in `auth-utils.ts`:
```typescript
if (!rateLimiter.isAllowed(`login:${clientIp}`, 10, 900000)) {
  // ↑ 10 requests per 900000ms (15 minutes)
}
```

---

## ✅ Final Checklist Before Going Live

- [ ] All files copied and tested locally
- [ ] Dependencies installed (`npm install`)
- [ ] `npm run dev` starts without errors
- [ ] All 15+ endpoints working with curl
- [ ] Frontend updated to handle new response format
- [ ] Rate limiting tested (limits trigger correctly)
- [ ] Password hashing tested (passwords not stored plaintext)
- [ ] JWT token tested (tokens validate/expire correctly)
- [ ] CORS whitelist configured for your domain
- [ ] JWT_SECRET set in production environment
- [ ] Staged deployment tested
- [ ] Production deployment successful
- [ ] Logs monitored for 24 hours
- [ ] Frontend fully integrated and tested in production

---

**Status:** Ready for implementation ✅  
**Last updated:** March 15, 2026  
**Version:** 1.0.0 quick impletation guide
