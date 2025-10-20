# 🔐 Authentication System - YYD Platform

**Complete RBAC (Role-Based Access Control) Documentation**

---

## Overview

The YYD platform implements a **JWT-based authentication system** with **5 distinct roles** for granular access control across the Backoffice application.

### Key Features
- JWT tokens with 7-day expiry
- HTTP-only cookies (secure)
- bcrypt password hashing (10 rounds)
- Middleware protection on ALL Backoffice routes
- Role-based API access control

---

## User Roles

### 1. Admin 👑
**Full System Access**
- Manage all users
- Delete tours
- Access all financial data
- Configure system settings
- Modify Aurora IA configuration

**Permissions**: `*` (all)

### 2. Director 📊
**Business Operations**
- Create/edit tours
- View all bookings
- Manage guides
- Access reports
- Configure pricing

**Cannot**: Delete tours, manage users

### 3. Finance 💰
**Financial Data Only**
- View payments
- Access financial reports
- Manage accounts payable/receivable
- Export financial data

**Cannot**: Modify tours, bookings, or users

### 4. Guide 🚗
**Own Bookings Only**
- View assigned tours
- Update booking status
- View customer details
- Mark tours complete

**Cannot**: Access other guides' data, modify pricing

### 5. Support 💬
**Customer Service**
- View all bookings
- Create/modify bookings
- Access customer data
- Manage cancellations

**Cannot**: Access financial data, modify tours

---

## Database Schema

```typescript
model User {
  id           String    @id @default(dbgenerated("gen_random_uuid()"))
  email        String    @unique @db.VarChar(255)
  name         String    @db.VarChar(255)
  passwordHash String    @db.VarChar(255)
  role         UserRole  @default(guide)
  active       Boolean   @default(true)
  lastLoginAt  DateTime?
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
  
  @@index([email])
  @@index([role])
}

enum UserRole {
  admin
  director
  guide
  finance
  support
}
```

---

## Authentication Flow

### 1. Login Process

**Endpoint**: `POST /api/auth/login`

**Request**:
```json
{
  "email": "admin@yyd.tours",
  "password": "admin123"
}
```

**Response** (Success):
```json
{
  "success": true,
  "user": {
    "id": "uuid-here",
    "email": "admin@yyd.tours",
    "name": "Administrator",
    "role": "admin"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Sets Cookie**:
```
auth-token=eyJhbGciOi...; HttpOnly; SameSite=Lax; Max-Age=604800
```

### 2. Token Verification

**JWT Payload**:
```typescript
interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  iat: number;  // Issued at
  exp: number;  // Expires at (iat + 7 days)
}
```

**Verification**:
- Extract token from `Authorization: Bearer <token>` header OR `auth-token` cookie
- Verify signature with `JWT_SECRET_KEY`
- Check expiry
- Return payload or null

### 3. Logout Process

**Endpoint**: `POST /api/auth/logout`

**Response**:
```json
{ "success": true }
```

**Action**: Clears `auth-token` cookie

---

## Middleware Protection

**File**: `yyd/apps/backoffice/middleware.ts`

### Protected Routes
ALL routes **except**:
- `/login`
- `/api/auth/login`
- Static assets (`/_next/*`, `/logo.png`, etc.)

### Flow
1. Extract token from cookie
2. Verify token validity
3. If invalid → Redirect to `/login`
4. If valid → Add user headers and continue

**Headers Added**:
```
x-user-id: <userId>
x-user-email: <email>
x-user-role: <role>
```

---

## API Authorization

### Helper Functions

#### `requireAuth(request, allowedRoles?)`

Throws error if unauthorized or insufficient permissions.

**Example**:
```typescript
import { requireAuth } from '@/lib/auth';

export async function POST(request: Request) {
  // Require admin or director role
  const user = requireAuth(request, ['admin', 'director']);
  
  // user.userId, user.email, user.role available
  // Proceed with authorized action
}
```

#### `getUserFromRequest(request)`

Returns user payload or null (non-throwing).

**Example**:
```typescript
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request: Request) {
  const user = getUserFromRequest(request);
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // Use user data
}
```

---

## Password Security

### Hashing
**Algorithm**: bcrypt  
**Rounds**: 10  
**Library**: `bcryptjs`

**Hash Function**:
```typescript
import bcrypt from 'bcryptjs';

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}
```

**Comparison**:
```typescript
export async function comparePassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
```

### Password Requirements
- Minimum 8 characters (recommended)
- Mix of letters, numbers, symbols (recommended)
- No dictionary words (recommended)

**Note**: Currently no frontend validation - TODO for production

---

## Default Credentials

**Admin User**:
```
Email: admin@yyd.tours
Password: admin123
```

**Created via**: `npx tsx prisma/seed-admin.ts`

**⚠️ SECURITY WARNING**: Change default password in production!

---

## Role-Based Route Access

### Example: Tours Management

```typescript
// POST /api/tours - Create tour
requireAuth(request, ['admin', 'director']);

// PUT /api/tours/[id] - Update tour  
requireAuth(request, ['admin', 'director']);

// DELETE /api/tours/[id] - Delete tour
requireAuth(request, ['admin']); // Admin ONLY
```

### Example: Financial Data

```typescript
// GET /api/financial/reports
requireAuth(request, ['admin', 'director', 'finance']);

// POST /api/financial/accounts-payable
requireAuth(request, ['admin', 'finance']);
```

---

## Client-Side Auth

### Login Page
**Location**: `/yyd/apps/backoffice/app/login/page.tsx`

**Features**:
- Email/password form
- Error display
- Loading states
- YYD branding
- Remember credentials (localStorage)

### Auth Context (TODO)
Create React Context for:
- Current user state
- Login/logout functions
- Permission checks
- Auto-redirect on 401

---

## Session Management

### Token Expiry
**Duration**: 7 days  
**Refresh**: Manual login required (TODO: implement refresh tokens)

### Logout Triggers
- Manual logout button
- Token expiry
- Invalid token
- User deactivation

### Security Best Practices
1. **Never log tokens** to console or logs
2. **HTTPS only** in production
3. **Rotate JWT_SECRET** periodically
4. **Monitor failed login attempts**
5. **Implement rate limiting** (TODO)

---

## API Endpoints Reference

### Auth Endpoints

#### Login
```
POST /api/auth/login
Body: { email, password }
Response: { success, user, token }
Cookie: auth-token (HttpOnly)
```

#### Logout
```
POST /api/auth/logout
Response: { success }
Cookie: auth-token cleared
```

#### Get Current User
```
GET /api/auth/me
Headers: Authorization: Bearer <token> OR Cookie: auth-token
Response: { user: { id, email, name, role, lastLoginAt } }
```

---

## Environment Variables

```env
# JWT Secret (CHANGE IN PRODUCTION!)
JWT_SECRET_KEY=yyd-secret-2025-change-in-production

# Token Expiry (optional, defaults to 7d)
JWT_EXPIRES_IN=7d
```

---

## Error Handling

### Common Errors

**401 Unauthorized**:
```json
{ "error": "Unauthorized" }
```

**403 Forbidden**:
```json
{ "error": "Forbidden" }
```

**Invalid Credentials**:
```json
{ "error": "Invalid credentials" }
```

**Inactive User**:
```json
{ "error": "Invalid credentials" }
```
(Same message for security)

---

## Testing Authentication

### Manual Testing

```bash
# 1. Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@yyd.tours","password":"admin123"}' \
  -c cookies.txt

# 2. Get current user (with cookie)
curl http://localhost:3001/api/auth/me \
  -b cookies.txt

# 3. Access protected route
curl http://localhost:3001/api/tours \
  -b cookies.txt

# 4. Logout
curl -X POST http://localhost:3001/api/auth/logout \
  -b cookies.txt
```

---

## Future Enhancements

### Planned Features
1. **Refresh Tokens** - Automatic session renewal
2. **Multi-Factor Authentication (MFA)** - TOTP via authenticator app
3. **Social Login** - Google, Microsoft OAuth
4. **Password Reset** - Email-based flow
5. **Rate Limiting** - Prevent brute force
6. **Audit Logs** - Track all auth events
7. **Session Management** - View active sessions
8. **IP Whitelisting** - Restrict admin access

---

## Troubleshooting

### "Unauthorized" on all requests
- Check cookie is being sent
- Verify JWT_SECRET matches
- Check token hasn't expired
- Inspect middleware.ts matcher

### Login successful but redirect fails
- Clear browser cookies
- Check middleware redirect logic
- Verify `/login` is in PUBLIC_ROUTES

### Role permissions not working
- Verify role in JWT payload
- Check `requireAuth` allowed roles
- Inspect user role in database

---

**File Location**: `/yyd/docs/AUTHENTICATION.md`  
**Last Updated**: 2025-10-20  
**Related**: [API-REFERENCE.md](./API-REFERENCE.md), [ARCHITECTURE.md](./ARCHITECTURE.md)
