# API Response Convention

All endpoints return a consistent JSON envelope defined in `Common/ApiResponse.cs`. Clients can always branch on `success` without inspecting HTTP status codes.

---

## Success Response

```json
{
  "success": true,
  "status": 200,
  "data": { ... }
}
```

### Usage in a controller

```csharp
return Ok(ApiResponse.Ok(dto));          // 200
return Ok(ApiResponse.Ok(dto, 201));     // 201 Created
```

---

## Error Response

```json
{
  "success": false,
  "status": 404,
  "message": "Inventory not found.",
  "errorCode": "inventory.not_found"
}
```

Error responses are **never returned manually from controllers**. Instead, throw an `AppException` anywhere — the global exception handler produces the error response automatically.

### Throwing errors

All error codes are defined as constants in `Common/Errors/ErrorCodes.cs`. Always use the constant rather than the raw string.

```csharp
// With an error code constant (preferred)
throw new AppException(404, "Inventory not found.", ErrorCodes.InventoryNotFound);

// Without an error code (defaults to ErrorCodes.Fallback = "error")
throw new AppException(409, "Custom ID already exists.");
```

When adding a new error, register the constant in `ErrorCodes.cs` first:

```csharp
// In ErrorCodes.cs
public const string InventoryNotFound = "inventory.not_found";

// Then at the throw site
throw new AppException(404, "Inventory not found.", ErrorCodes.InventoryNotFound);
```

### Built-in automatic mappings

These are handled without any manual throwing:

| Source | Status | `ErrorCodes` constant |
|---|---|---|
| `DbUpdateConcurrencyException` | 409 | `ErrorCodes.OptimisticLock` |
| `OperationCanceledException` | — | (swallowed silently) |
| Any other unhandled exception | 500 | `ErrorCodes.ServerError` |
| Unauthenticated request to `[Authorize]` endpoint | 401 | `ErrorCodes.Unauthorized` |
| Authenticated but access denied | 403 | `ErrorCodes.Forbidden` |
| Authenticated but account is blocked | 403 | `ErrorCodes.Blocked` |

---

## Development vs Production

In the **development** environment, error responses include two extra fields to aid debugging:

```json
{
  "success": false,
  "status": 500,
  "message": "An unexpected error occurred.",
  "errorCode": "server_error",
  "exceptionType": "InvalidOperationException",
  "stackTrace": "..."
}
```

These fields are **never present in production**.

---

## Frontend i18n Integration

`errorCode` is a dot-namespaced slug defined in `ErrorCodes.cs` and intended as the lookup key in the frontend translation files. `message` is the English fallback used when no translation key exists.

Translation file (`en.json`):
```json
{
  "errors": {
    "inventory.not_found": "Inventory not found.",
    "conflict.optimistic_lock": "Someone else edited this — please reload.",
    "server_error": "Something went wrong. Please try again."
  }
}
```

Frontend usage:
```ts
t("errors." + error.errorCode) ?? error.message
```

### `errorCode` naming convention

Use dotted namespacing: `<resource>.<condition>`.

| Constant | Value | When to use |
|---|---|---|
| `ErrorCodes.Unauthorized` | `auth.unauthorized` | Unauthenticated request (automatic) |
| `ErrorCodes.Forbidden` | `auth.forbidden` | Access denied (automatic) |
| `ErrorCodes.Blocked` | `auth.blocked` | User account is blocked (automatic) |
| `ErrorCodes.OptimisticLock` | `conflict.optimistic_lock` | Concurrent edit conflict (automatic) |
| `ErrorCodes.CustomIdDuplicate` | `item.custom_id_duplicate` | Custom ID unique constraint violation |
| `ErrorCodes.AuthProviderFailed` | `auth.provider_failed` | OAuth provider returned no usable login info |
| `ErrorCodes.UserNotFound` | `user.not_found` | Admin lookup by ID found no user |
| `ErrorCodes.CannotDeleteSelf` | `admin.cannot_delete_self` | Admin attempted to delete their own account |
| `ErrorCodes.ServerError` | `server_error` | Unexpected 500 (automatic) |
| `ErrorCodes.Fallback` | `error` | Generic fallback — omit the third argument to `AppException` |

---

## Relevant Files

| File | Purpose |
|---|---|
| `Common/ApiResponse.cs` | `ApiResponse.Ok(data)` and `ApiResponse.Fail(...)` factory |
| `Common/Errors/ErrorCodes.cs` | Central registry of all error code constants |
| `Common/Errors/AppException.cs` | Exception to throw from anywhere |
| `Common/Errors/GlobalExceptionHandler.cs` | Catches all exceptions and writes the error response |
| `Common/Authorization/AuthorizationResultHandler.cs` | Produces JSON 401/403 responses for authorization failures |
| `Common/Authorization/NotBlockedHandler.cs` | Authorization requirement handler that checks the blocked flag |
