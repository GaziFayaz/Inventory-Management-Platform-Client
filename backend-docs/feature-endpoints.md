# Feature Endpoints

All endpoints follow the [API Response Convention](api-response-convention.md). All authorization rules are described in [Authorization](authorization.md).

---

## Auth (`/auth`)

Authentication is social-only — no local accounts exist. All flows are cookie-based via ASP.NET Identity.

### Architecture

| Layer | File | Responsibility |
|---|---|---|
| Controller | `Features/Auth/AuthController.cs` | HTTP binding, `Challenge()` / `Redirect()` results |
| Service interface | `Features/Auth/IAuthService.cs` | Contract |
| Service impl | `Features/Auth/AuthService.cs` | Provider validation, OAuth properties, user find-or-create, admin bootstrap, DTO mapping |
| DTO | `Contracts/Auth/UserDto.cs` | Shared user shape returned by auth and admin endpoints |

---

### `GET /auth/login/{provider}`

Initiates the OAuth flow. Returns an HTTP 302 redirect to the external provider's authorization page.

**Auth policy:** none (anonymous)

**Path parameters**

| Name | Type | Description |
|---|---|---|
| `provider` | `string` | Case-insensitive. Accepted values: `Google`, `Facebook` |

**Success response:** `302 Found` — browser follows the redirect to the provider.

**Error responses**

| Condition | Status | `errorCode` |
|---|---|---|
| Unknown provider | 400 | `error` |

**Notes**
- The redirect URI registered with both providers must point to `/auth/external-callback`.
- After provider authorization the browser lands at `/auth/callback/{provider}` (handled by the OAuth middleware), which then forwards to `/auth/external-callback`.

---

### `GET /auth/external-callback`

OAuth middleware redirect target. Receives the validated external login info, finds or creates the `AppUser`, drops an identity cookie, and redirects the browser back to the frontend.

**Auth policy:** none (anonymous — this is called by the OAuth middleware, not a user agent directly)

**Success response:** `302 Found` → `{FrontendUrl}` (configured via `FrontendUrl` app setting)

**Error response:** `302 Found` → `{FrontendUrl}?error={errorCode}` (browser redirect, not JSON)

| Condition | `errorCode` query param |
|---|---|
| Provider returned no login info | `auth.provider_failed` |
| Email claim absent from provider token | `auth.provider_failed` |
| Failed to create `AppUser` | `auth.provider_failed` |
| Failed to add external login link | `auth.provider_failed` |
| User is locked out or sign-in not allowed | `auth.blocked` |

**Admin bootstrap**
On first-ever login, if the user's email matches `AdminSeed:Email` (config key / user secret), the user is automatically added to the `"Admin"` role before the redirect. This fires only once — subsequent logins take the fast path via `ExternalLoginSignInAsync`.

**User creation logic (first login only)**

1. `SignInManager.ExternalLoginSignInAsync` — attempts to match an existing `AspNetUserLogins` row.
2. On failure: reads `ClaimTypes.Email` from the provider principal. If absent → error redirect.
3. Creates `AppUser { UserName = email, Email = email, DisplayName = ClaimTypes.Name ?? emailPrefix }`.
4. Calls `UserManager.CreateAsync(user)` then `UserManager.AddLoginAsync(user, info)`.
5. Optionally promotes to Admin, then calls `SignInManager.SignInAsync`.

---

### `POST /auth/logout`

Signs out the current user by clearing the identity cookie.

**Auth policy:** `"Authenticated"` (must be signed in and not blocked)

**Request body:** none

**Success response**

```json
{ "success": true, "status": 200, "data": null }
```

---

### `GET /auth/me`

Returns the profile of the currently signed-in user.

**Auth policy:** `"Authenticated"` (must be signed in and not blocked)

**Success response**

```json
{
  "success": true,
  "status": 200,
  "data": {
    "id": "string",
    "displayName": "string",
    "email": "string",
    "isAdmin": true,
    "isBlocked": false,
    "createdAt": "2026-03-11T00:00:00Z"
  }
}
```

**Error responses**

| Condition | Status | `errorCode` |
|---|---|---|
| Not authenticated | 401 | `auth.unauthorized` |
| Blocked account | 403 | `auth.blocked` |

---

## Admin — Users (`/admin/users`)

All endpoints in this group require the `"Admin"` policy (role `"Admin"`). Non-admins receive `403 auth.forbidden`.

### Architecture

| Layer | File | Responsibility |
|---|---|---|
| Controller | `Features/Admin/AdminUsersController.cs` | HTTP binding, passes caller ID where needed |
| Service interface | `Features/Admin/IAdminUserService.cs` | Contract |
| Service impl | `Features/Admin/AdminUserService.cs` | Pagination, guards, role operations, DTO mapping |
| Response DTO | `Contracts/Admin/UserListResponse.cs` | Paginated list envelope |

---

### `GET /admin/users`

Returns a paginated, optionally filtered list of all users. Admin role membership is batch-loaded (no per-user DB queries).

**Auth policy:** `"Admin"`

**Query parameters**

| Name | Type | Default | Description |
|---|---|---|---|
| `page` | `int` | `1` | 1-based page number |
| `pageSize` | `int` | `20` | Clamped to `[1, 100]` |
| `search` | `string?` | — | Case-insensitive substring match on `DisplayName` or `Email` |

**Success response**

```json
{
  "success": true,
  "status": 200,
  "data": {
    "items": [
      {
        "id": "string",
        "displayName": "string",
        "email": "string",
        "isAdmin": false,
        "isBlocked": false,
        "createdAt": "2026-03-11T00:00:00Z"
      }
    ],
    "page": 1,
    "pageSize": 20,
    "totalCount": 42
  }
}
```

---

### `PUT /admin/users/block`

Sets `IsBlocked = true` on the target users. The acting admin cannot block themselves.

**Auth policy:** `"Admin"`

**Request body:**
```json
[
  "string",
  "string"
]
```

**Success response:** Collection of updated `UserDto`s (same shape as `GET /auth/me` data).

**Error responses**

| Condition | Status | `errorCode` |
|---|---|---|
| One or more target users not found | 404 | `user.not_found` |
| Attempting to block self | 400 | `auth.forbidden` |

---

### `PUT /admin/users/unblock`

Sets `IsBlocked = false` on the target users.

**Auth policy:** `"Admin"`

**Request body:**
```json
[
  "string",
  "string"
]
```

**Success response:** Collection of updated `UserDto`s.

**Error responses**

| Condition | Status | `errorCode` |
|---|---|---|
| One or more target users not found | 404 | `user.not_found` |

---

### `DELETE /admin/users`

Permanently deletes the target users. Additional data owned by these users (inventories, items, posts) is handled by database cascade rules. The acting admin cannot delete themselves.

**Auth policy:** `"Admin"`

**Request body:**
```json
[
  "string"
]
```

**Success response**

```json
{ "success": true, "status": 200, "data": null }
```

**Error responses**

| Condition | Status | `errorCode` |
|---|---|---|
| One or more target users not found | 404 | `user.not_found` |
| Attempting to delete self | 400 | `admin.cannot_delete_self` |

---

### `POST /admin/users/roles/admin`

Adds the target users to the `"Admin"` role. Idempotent — no error if the user is already an admin.

**Auth policy:** `"Admin"`

**Request body:**
```json
[
  "string"
]
```

**Success response:** Collection of updated `UserDto`s with `isAdmin: true`.

**Error responses**

| Condition | Status | `errorCode` |
|---|---|---|
| One or more target users not found | 404 | `user.not_found` |

---

### `DELETE /admin/users/roles/admin`

Removes the target users from the `"Admin"` role. Self-demotion is explicitly allowed — an admin can remove their own admin role. Idempotent.

**Auth policy:** `"Admin"`

**Request body:**
```json
[
  "string",
  "string"
]
```

**Success response:** Collection of updated `UserDto`s with `isAdmin: false`.

**Error responses**

| Condition | Status | `errorCode` |
|---|---|---|
| One or more target users not found | 404 | `user.not_found` |

---

## Configuration reference

| Key | Source | Description |
|---|---|---|
| `FrontendUrl` | `appsettings.json` / env | Browser redirect destination after OAuth login or error |
| `AdminSeed:Email` | User secrets / env | Email address auto-promoted to Admin on first OAuth login |
| `Authentication:Google:ClientId` | User secrets / env | Google OAuth client ID |
| `Authentication:Google:ClientSecret` | User secrets / env | Google OAuth client secret |
| `Authentication:Facebook:AppId` | User secrets / env | Facebook OAuth app ID |
| `Authentication:Facebook:AppSecret` | User secrets / env | Facebook OAuth app secret |
