# Authorization

All authorization code lives in `Common/Authorization/`.

---

## Access tiers

| Tier | Source |
|---|---|
| **Admin** | ASP.NET Identity role `"Admin"` |
| **Owner** | `Inventory.OwnerId == user.Id` |
| **Write access** | Row exists in `InventoryAccess(InventoryId, UserId)` |
| **Public write** | `Inventory.IsPublic == true` + user is authenticated |

---

## Requirements

Requirements are typed markers — they carry no logic, only a declaration of *what must be true*. ASP.NET Core uses the type to dispatch to the correct handler.

### `NotBlockedRequirement`
Signals that the user must not be blocked. Composed into every policy that targets authenticated users.

```csharp
public class NotBlockedRequirement : IAuthorizationRequirement;
```

### `InventoryOwnerOrAdminRequirement`
Signals that the user must be an admin or the owner of the target inventory. Used for settings, fields, custom-ID, and access-list endpoints.

```csharp
public class InventoryOwnerOrAdminRequirement : IAuthorizationRequirement;
```

### `InventoryWriteRequirement`
Signals that the user must have write access to the target inventory via any of the four access tiers. Used for item CRUD and discussion-post endpoints.

```csharp
public class InventoryWriteRequirement : IAuthorizationRequirement;
```

---

## Handlers

Handlers contain the logic that evaluates a requirement. A requirement is satisfied when any of its handlers calls `context.Succeed()`.

### `NotBlockedHandler`
Handles `NotBlockedRequirement`. Loads the user from `UserManager` and checks `IsBlocked`. If the user is blocked it attaches a named `AuthorizationFailureReason` (`"auth.blocked"`) so the result handler can return a specific error response.

**DB queries:** 1 (`FindByIdAsync`)

```csharp
public class NotBlockedHandler(UserManager<AppUser> userManager)
    : AuthorizationHandler<NotBlockedRequirement>
{
    protected override async Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        NotBlockedRequirement requirement)
    {
        var userId = userManager.GetUserId(context.User);
        if (userId is null) { context.Fail(); return; }

        var user = await userManager.FindByIdAsync(userId);
        if (user is null) { context.Fail(); return; }

        if (user.IsBlocked)
        {
            context.Fail(new AuthorizationFailureReason(this, "auth.blocked"));
            return;
        }

        context.Succeed(requirement);
    }
}
```

### `InventoryOwnerOrAdminHandler`
Handles `InventoryOwnerOrAdminRequirement` against an `Inventory` resource. Succeeds when the user is in the `"Admin"` role or their ID matches `Inventory.OwnerId`. Information comes entirely from claims and the already-loaded resource object.

**DB queries:** 0

```csharp
public class InventoryOwnerOrAdminHandler(UserManager<AppUser> userManager)
    : AuthorizationHandler<InventoryOwnerOrAdminRequirement, Inventory>
{
    protected override Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        InventoryOwnerOrAdminRequirement requirement,
        Inventory resource)
    {
        var userId = userManager.GetUserId(context.User);
        if (userId is null) return Task.CompletedTask;

        if (context.User.IsInRole("Admin") || userId == resource.OwnerId)
            context.Succeed(requirement);

        return Task.CompletedTask;
    }
}
```

### `InventoryWriteHandler`
Handles `InventoryWriteRequirement` against an `Inventory` resource. Checks the four access tiers in order, short-circuiting as early as possible to avoid unnecessary DB queries.

**DB queries:** 0 when admin or owner; 1 (`AnyAsync` on `InventoryAccesses`) otherwise.

```csharp
public class InventoryWriteHandler(UserManager<AppUser> userManager, AppDbContext db)
    : AuthorizationHandler<InventoryWriteRequirement, Inventory>
{
    protected override async Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        InventoryWriteRequirement requirement,
        Inventory resource)
    {
        var userId = userManager.GetUserId(context.User);
        if (userId is null) return;

        // 1. Admin or owner — no extra DB call.
        if (context.User.IsInRole("Admin") || userId == resource.OwnerId)
        {
            context.Succeed(requirement);
            return;
        }

        // 2. Explicit write-access grant.
        var hasAccess = await db.InventoryAccesses
            .AnyAsync(a => a.InventoryId == resource.Id && a.UserId == userId);
        if (hasAccess) { context.Succeed(requirement); return; }

        // 3. Public inventory — any authenticated user may write.
        if (resource.IsPublic)
            context.Succeed(requirement);
    }
}
```

---

## Policies

Policies are registered in `Program.cs` via `AddAuthorizationBuilder()`. Each policy composes requirements; all requirements must be satisfied for the policy to pass.

```csharp
builder.Services.AddAuthorizationBuilder()
    .AddPolicy("Admin", p => p
        .RequireRole("Admin"))
    .AddPolicy("Authenticated", p => p
        .RequireAuthenticatedUser()
        .AddRequirements(new NotBlockedRequirement()))
    .AddPolicy("OwnerOrAdmin", p => p
        .RequireAuthenticatedUser()
        .AddRequirements(
            new NotBlockedRequirement(),
            new InventoryOwnerOrAdminRequirement()))
    .AddPolicy("InventoryWrite", p => p
        .RequireAuthenticatedUser()
        .AddRequirements(
            new NotBlockedRequirement(),
            new InventoryWriteRequirement()));
```

---

## Failure responses — `AuthorizationResultHandler`

By default, ASP.NET Core returns an empty 401/403 with no body. `AuthorizationResultHandler` replaces that behavior so every failure returns a consistent `ApiErrorResponse` JSON body.

It inspects `AuthorizationFailure.FailureReasons` to distinguish a blocked-user failure from a generic access-denied failure.

```csharp
// 401 — not authenticated
{ "success": false, "status": 401, "message": "Unauthorized.", "errorCode": "auth.unauthorized" }

// 403 — blocked user
{ "success": false, "status": 403, "message": "Your account has been blocked.", "errorCode": "auth.blocked" }

// 403 — wrong role / no access
{ "success": false, "status": 403, "message": "Access denied.", "errorCode": "auth.forbidden" }
```

The frontend switches on `errorCode`:
- `"auth.unauthorized"` → redirect to login
- `"auth.blocked"` → dedicated blocked-account screen
- `"auth.forbidden"` → generic access-denied message

---

## Usage in controllers

### Attribute — no resource needed

```csharp
[Authorize(Roles = "Admin")]               // admin panel controllers
[Authorize(Policy = "Authenticated")]      // POST /inventories, likes
```

### Resource-based — load inventory first, then authorize

```csharp
// OwnerOrAdmin — e.g. PUT /inventories/{id}/settings
var inventory = await db.Inventories.FindAsync(id);
if (inventory is null) return NotFound();

var auth = await _authService.AuthorizeAsync(User, inventory, "OwnerOrAdmin");
if (!auth.Succeeded) return Forbid();

// InventoryWrite — e.g. POST /inventories/{id}/items
var auth = await _authService.AuthorizeAsync(User, inventory, "InventoryWrite");
if (!auth.Succeeded) return Forbid();
```

> `Forbid()` on a controller returns 403, which is picked up by `AuthorizationResultHandler`
> and formatted as `ApiErrorResponse`. Do not throw manually.

---

## Endpoint-to-policy map

| Endpoint group | Policy |
|---|---|
| `GET /inventories/*`, `GET /items/*` | None (anonymous) |
| `GET /auth/login/{provider}` | None (anonymous) |
| `GET /auth/external-callback` | None (anonymous — OAuth middleware redirect) |
| `POST /auth/logout` | `"Authenticated"` (attribute) |
| `GET /auth/me` | `"Authenticated"` (attribute) |
| `POST /inventories` | `"Authenticated"` (attribute) |
| `PUT /inventories/{id}/settings\|fields\|custom-id\|access` | `"OwnerOrAdmin"` (resource-based) |
| `DELETE /inventories/{id}` | `"OwnerOrAdmin"` (resource-based) |
| `POST /inventories/{id}/items` | `"InventoryWrite"` (resource-based) |
| `PUT /items/{id}`, `DELETE /items/{id}` | `"InventoryWrite"` (resource-based) |
| `POST /inventories/{id}/posts` | `"InventoryWrite"` (resource-based) |
| `POST /items/{id}/like`, `DELETE /items/{id}/like` | `"Authenticated"` (attribute) |
| All `/admin/*` endpoints | `"Admin"` (attribute) |
