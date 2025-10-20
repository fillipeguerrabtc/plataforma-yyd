# 📡 API Reference - YYD Platform

**Complete REST API Documentation**

---

## Base URLs

- **Backoffice API**: `http://localhost:3001/api`
- **Client API**: `http://localhost:5000/api`
- **Production** (TBD): `https://backoffice.yesyoudeserve.tours/api`

---

## Authentication

All Backoffice API endpoints require authentication via:
- **Cookie**: `auth-token` (HTTP-only, set on login)
- **Header**: `Authorization: Bearer <jwt-token>`

**See**: [AUTHENTICATION.md](./AUTHENTICATION.md) for complete auth docs.

---

## 🔐 Authentication Endpoints

### Login

Authenticate user and receive JWT token.

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@yyd.tours",
  "password": "admin123"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "admin@yyd.tours",
    "name": "Administrator",
    "role": "admin"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Sets Cookie**:
```
auth-token=<jwt>; HttpOnly; SameSite=Lax; Max-Age=604800; Path=/
```

**Errors**:
- `400` - Missing email or password
- `401` - Invalid credentials or inactive user

---

### Logout

Clear authentication token.

```http
POST /api/auth/logout
Cookie: auth-token=<jwt>
```

**Response** (200 OK):
```json
{
  "success": true
}
```

**Action**: Clears `auth-token` cookie.

---

### Get Current User

Retrieve authenticated user details.

```http
GET /api/auth/me
Cookie: auth-token=<jwt>
```

**Response** (200 OK):
```json
{
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "admin@yyd.tours",
    "name": "Administrator",
    "role": "admin",
    "lastLoginAt": "2025-10-20T02:30:00.000Z"
  }
}
```

**Errors**:
- `401` - Unauthorized (no/invalid token)
- `404` - User not found

---

## 🗺️ Tours Endpoints

### Create Tour

Create a new tour product.

**Auth Required**: `admin` or `director` role

```http
POST /api/tours
Cookie: auth-token=<jwt>
Content-Type: application/json

{
  "titlePt": "Tour Completo de Sintra",
  "titleEn": "Full-Day Sintra Tour",
  "titleEs": "Tour Completo de Sintra",
  "descriptionPt": "Descubra Sintra em um dia completo...",
  "descriptionEn": "Discover Sintra in a full day...",
  "descriptionEs": "Descubre Sintra en un día completo...",
  "categoryPt": "Tour Privado",
  "categoryEn": "Private Tour",
  "categoryEs": "Tour Privado",
  "durationHours": 8,
  "maxGroupSize": 6,
  "slug": "sintra-full-day",
  "imageUrl": "https://...",
  "bestChoice": true,
  "active": true
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "tour": {
    "id": "clx...",
    "slug": "sintra-full-day",
    "titleEn": "Full-Day Sintra Tour",
    // ... all fields
    "createdAt": "2025-10-20T02:30:00.000Z",
    "updatedAt": "2025-10-20T02:30:00.000Z"
  }
}
```

**Errors**:
- `401` - Unauthorized
- `403` - Forbidden (insufficient role)
- `500` - Internal server error

---

### Update Tour

Update an existing tour.

**Auth Required**: `admin` or `director` role

```http
PUT /api/tours/{tourId}
Cookie: auth-token=<jwt>
Content-Type: application/json

{
  "titleEn": "Updated Tour Title",
  "active": false
  // ... any fields to update
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "tour": {
    "id": "clx...",
    // ... updated fields
    "updatedAt": "2025-10-20T03:00:00.000Z"
  }
}
```

**Errors**:
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Tour not found
- `500` - Internal server error

---

### Delete Tour

Permanently delete a tour.

**Auth Required**: `admin` role ONLY

```http
DELETE /api/tours/{tourId}
Cookie: auth-token=<jwt>
```

**Response** (200 OK):
```json
{
  "success": true
}
```

**Errors**:
- `401` - Unauthorized
- `403` - Forbidden (must be admin)
- `404` - Tour not found
- `500` - Internal server error

**⚠️ Warning**: This permanently deletes the tour and all related data.

---

## 📄 Vouchers Endpoints

### Download Voucher PDF

Generate and download booking voucher as PDF.

**Auth Required**: Customer authentication (TODO) or booking verification

```http
GET /api/voucher/{bookingId}
```

**Response** (200 OK):
```
Content-Type: application/pdf
Content-Disposition: attachment; filename="YYD-Voucher-{bookingNumber}.pdf"

<PDF binary data>
```

**PDF Contents**:
- YYD branding and logo
- Booking number
- Customer information
- Tour details (name, date, time, people)
- QR code for check-in
- Important information
- Contact details

**Errors**:
- `404` - Booking not found
- `500` - PDF generation failed

**Security TODO**: Add customer authentication check

---

## 💳 Payment Endpoints (Stripe)

### Create Payment Intent

Create Stripe checkout session for booking.

```http
POST /api/checkout
Content-Type: application/json

{
  "tourId": "clx...",
  "date": "2025-12-25",
  "numberOfPeople": 4,
  "startTime": "09:00",
  "customerName": "John Doe",
  "customerEmail": "john@example.com",
  "customerPhone": "+351 XXX XXX XXX",
  "specialRequests": "Vegetarian lunch"
}
```

**Response** (200 OK):
```json
{
  "sessionId": "cs_test_...",
  "url": "https://checkout.stripe.com/c/pay/cs_test_..."
}
```

**Errors**:
- `400` - Invalid data
- `500` - Stripe error

---

### Stripe Webhook

Handle Stripe payment events (internal use).

```http
POST /api/webhooks/stripe
Stripe-Signature: t=...,v1=...
Content-Type: application/json

{
  "type": "checkout.session.completed",
  "data": {
    "object": {
      // Stripe checkout session data
    }
  }
}
```

**Response** (200 OK):
```json
{
  "received": true
}
```

**Actions** (on `checkout.session.completed`):
- Create booking in database
- Create payment record
- Create calendar event
- Update customer record
- Send confirmation email (TODO)

**Errors**:
- `400` - Invalid signature
- `500` - Processing error

---

## 🤖 Aurora IA Endpoints

### WhatsApp Webhook (Verification)

Verify WhatsApp webhook.

```http
GET /api/webhooks/whatsapp?hub.mode=subscribe&hub.verify_token={token}&hub.challenge={challenge}
```

**Response** (200 OK):
```
{challenge}
```

---

### WhatsApp Webhook (Messages)

Receive and process WhatsApp messages.

```http
POST /api/webhooks/whatsapp
Content-Type: application/json

{
  "entry": [{
    "changes": [{
      "value": {
        "messages": [{
          "from": "+351XXXXXXXXX",
          "text": {
            "body": "I want to book a tour"
          }
        }]
      }
    }]
  }]
}
```

**Response** (200 OK):
```json
{
  "status": "success"
}
```

**Actions**:
- Process message with Aurora IA
- Generate response
- Send reply via WhatsApp
- Save conversation to database

---

### Facebook Messenger Webhook (Verification)

Verify Facebook Messenger webhook.

```http
GET /api/webhooks/facebook?hub.mode=subscribe&hub.verify_token={token}&hub.challenge={challenge}
```

**Response** (200 OK):
```
{challenge}
```

---

### Facebook Messenger Webhook (Messages)

Receive and process Facebook messages.

```http
POST /api/webhooks/facebook
Content-Type: application/json

{
  "entry": [{
    "messaging": [{
      "sender": {
        "id": "123456789"
      },
      "message": {
        "text": "Hello, I need information"
      }
    }]
  }]
}
```

**Response** (200 OK):
```json
{
  "status": "success"
}
```

**Actions**:
- Process message with Aurora IA
- Generate response
- Send reply via Facebook
- Save conversation to database

---

## 📊 Analytics Endpoints (TODO)

### Get Dashboard Stats

Retrieve key metrics for dashboard.

**Auth Required**: Any authenticated user

```http
GET /api/analytics/dashboard
Cookie: auth-token=<jwt>
```

**Response** (200 OK):
```json
{
  "totalRevenue": 12500.00,
  "monthlyRevenue": 3200.00,
  "totalBookings": 45,
  "activeBookings": 12,
  "totalCustomers": 38,
  "averageRating": 4.9
}
```

---

### Get Revenue Forecast

Get AI-powered revenue forecast.

**Auth Required**: `admin`, `director`, or `finance` role

```http
GET /api/analytics/forecast?months=6
Cookie: auth-token=<jwt>
```

**Response** (200 OK):
```json
{
  "forecast": [
    {
      "month": "2025-11",
      "predicted": 5200.00,
      "confidence": 0.85
    },
    // ... 6 months
  ]
}
```

**Status**: Not implemented (TODO)

---

## Error Responses

All endpoints return consistent error format:

```json
{
  "error": "Error message here",
  "code": "ERROR_CODE" // optional
}
```

### Common HTTP Status Codes

- `200` - Success
- `400` - Bad Request (invalid data)
- `401` - Unauthorized (not logged in)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

---

## Rate Limiting (TODO)

**Status**: Not yet implemented

**Planned**:
- 100 requests/minute per IP
- 10 login attempts/hour per email
- Separate limits for webhooks

---

## Versioning

**Current Version**: v1 (implicit)

**Future**: `/api/v2/...` when breaking changes needed

---

## CORS Policy

**Backoffice**: Same-origin only  
**Client**: Same-origin + configured domains  
**Webhooks**: Verified via signatures

---

## Webhooks Security

### Stripe
- Verify `Stripe-Signature` header
- Use `stripe.webhooks.constructEvent()`
- Secret: `STRIPE_WEBHOOK_SECRET`

### WhatsApp
- Verify `hub.verify_token` matches `WHATSAPP_VERIFY_TOKEN`
- Validate request origin

### Facebook
- Verify `hub.verify_token` matches `FACEBOOK_VERIFY_TOKEN`
- Validate app secret (TODO)

---

## SDK / Client Libraries

### TypeScript/JavaScript

```typescript
// Example usage with fetch
const response = await fetch('/api/tours', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include', // Include cookies
  body: JSON.stringify(tourData),
});

const data = await response.json();
```

---

## Testing

### cURL Examples

```bash
# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@yyd.tours","password":"admin123"}' \
  -c cookies.txt

# Create Tour (with cookie)
curl -X POST http://localhost:3001/api/tours \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d @tour.json

# Download Voucher
curl http://localhost:5000/api/voucher/clx... \
  -o voucher.pdf
```

---

## Future Endpoints (Planned)

### Bookings Management
- `GET /api/bookings` - List bookings with filters
- `GET /api/bookings/{id}` - Get booking details
- `PATCH /api/bookings/{id}` - Update booking status
- `DELETE /api/bookings/{id}` - Cancel booking

### Customer Portal
- `POST /api/customer/auth/signup` - Customer registration
- `POST /api/customer/auth/login` - Customer login
- `GET /api/customer/bookings` - My bookings

### Fleet Management
- `GET /api/fleet` - List vehicles
- `POST /api/fleet` - Add vehicle
- `PUT /api/fleet/{id}` - Update vehicle
- `DELETE /api/fleet/{id}` - Remove vehicle

### Monument Tickets
- `GET /api/tickets/availability` - Check ticket availability
- `POST /api/tickets/purchase` - Purchase tickets
- `GET /api/bookings/{id}/tickets` - Get booking tickets

---

**File Location**: `/yyd/docs/API-REFERENCE.md`  
**Last Updated**: 2025-10-20  
**Related**: [AUTHENTICATION.md](./AUTHENTICATION.md), [ARCHITECTURE.md](./ARCHITECTURE.md)
