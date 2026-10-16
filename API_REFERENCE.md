# SafeID API Reference

## Authentication

Mobile clients authenticate via `POST /api/mobile-auth/login` with `{ email, password }` and receive a bearer token. All guarded endpoints require `Authorization: Bearer <token>` header.

| Method | Path | operationId | Auth | Description |
|--------|------|-------------|------|-------------|
| GET | `/api/personal-info` | listPersonalInfo | ✅ | List all personal info items for the authenticated user |
| POST | `/api/personal-info` | createPersonalInfo | ✅ | Create a new personal info item |
| PUT | `/api/personal-info/{id}` | updatePersonalInfo | ✅ | Update a personal info item |
| DELETE | `/api/personal-info/{id}` | deletePersonalInfo | ✅ | Delete a personal info item |
| GET | `/api/audit` | listAuditLogs | ✅ | List audit/access logs (max 100) |
| GET | `/api/user/lost-mode` | getLostModeStatus | ✅ | Get lost mode and lock screen message status |
| PUT | `/api/user/lost-mode` | updateLostModeStatus | ✅ | Update lost mode and/or lock screen message |
| GET | `/api/public-profile/{userId}` | getPublicProfile | ❌ | Get public profile data (query param: `level`) |
| POST | `/api/signup` | signup | ❌ | Register a new user account |
| POST | `/api/auth/login` | authLoginRedirect | ❌ | Placeholder (use mobile-auth for mobile) |

### Mobile-Auth Endpoints (auto-managed)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/mobile-auth/login` | Login and receive bearer token |
| POST | `/api/mobile-auth/signup` | Register and receive bearer token |
| GET | `/api/mobile-auth/me` | Get current user from token |
| GET | `/api/mobile-auth/google` | Initiate Google OAuth for mobile |
| GET | `/api/mobile-auth/google/callback` | Google OAuth callback |
