## 1) Product scope and core concepts

### What the app is

* A web application for **inventory management** across domains (office equipment, library books, HR documents, etc.). 
* Users can create **arbitrary “inventories” as templates** (title/description + a set of fields), and other users add **“items”** that conform to those fields. 
* Two key differentiators:

  1. **Custom inventory numbers (custom IDs) for items**, per-inventory, with formatting rules and uniqueness constraints. 
  2. **Custom fields** with type/quantity limits and table-display flags. 

### Visibility and access model (high-level)

* **Everyone** (including unauthenticated users) can **search and view all inventories and items in read-only mode**. 
* **Unauthenticated users** cannot create inventories, comment, like, or add items. 
* **Creators and admins** can fully edit inventories; creators also manage who has write access, or mark inventory public for all authenticated users. 
* **Users with write access** can add/edit/delete items (and access the discussion tab), but do not get settings/custom-id/access/fields/stats tabs in edit mode. 
* **Admins** can act as owner of any inventory and can even remove their own admin access. 

---

## 2) Information architecture (pages and major UI areas)

### Global UI requirement

* Every page must expose **full-text search via the top header**. 

### Main page

Must contain:

* Latest inventories table (name, description or image, creator). 
* Top 5 popular inventories table (by number of items). 
* Tag cloud, clickable to show related inventories using the standard search results layout. 

### User personal page

Two sortable/filterable tables:

* Inventories user owns (create/delete/edit). 
* Inventories user can write to. 

### Inventory page (tabbed)

Tabs required:

1. Items table (links to item pages) 
2. Discussion 
3. General settings (title/description/etc.) 
4. Custom inventory numbers (custom IDs) 
5. Access settings 
6. Fields editor (custom fields set) 
7. Statistics/aggregation (read-only) 

### Item page

* Editable by creator/admin and users with write access (or all authenticated users if inventory public). 
* Includes editable custom ID with validation, and like functionality.  

### Admin page

User management: view, block/unblock, delete, add/remove admin role. 

---

## 3) Functional requirements (by feature)

### A) Authentication and authorization

* Support registration/login via **at least two social providers** (Google + Facebook suggested). 
* Enforce role/access constraints for:

  * Unauthenticated read-only access + search 
  * Creator ownership permissions 
  * Write access lists and public inventories 
  * Admin omnipotent access + self-demotion capability 

### B) Inventory creation, settings, and editing

Inventory settings include:

* Title 
* Description with **Markdown** 
* Category (single value from predefined list stored in DB; no UI to manage categories)  
* Optional image uploaded to cloud 
* Tags (multi-tag input) with **autocomplete from DB** 

**Inventory page auto-save**

* Track changes; save every **7–10 seconds** (not every keystroke). 
* Use **optimistic locking**: each save updates version and returns it; otherwise fails. 

### C) Access settings (inventory-level)

* Inventory can be:

  * Public: any authenticated user can add items 
  * Private: creator maintains a list of registered users granted access 
* Access management UI rules:

  * Add users by typing username or email, **autocomplete by both**. 
  * List sortable; user-switchable sort mode by name or email. 

### D) Items CRUD + table representation

* Use a **table representation** for items and inventories. 
* Item capabilities for creator/admin/write-access users:

  * Open item in edit mode 
  * Add new items 
  * Delete items 

### E) Custom ID system (inventory-specific item numbering)

Core properties:

* Each inventory defines a **custom ID format** generating item IDs unique within that inventory. 
* Custom ID uniqueness enforced at DB level via composite uniqueness (inventory_id + custom_id). 
* Custom ID is editable as a single string input with format validation. 
* Generated on item creation; if format changes later, existing IDs remain, but **editing must enforce new rules**. 
* Custom ID tab requires **real-time example preview**. 

Supported ID elements:

* Fixed text (Unicode), random numbers (20-bit, 32-bit, 6-digit, 9-digit), GUID, datetime (at creation), sequence (max+1). 

Format editor UX:

* Reorder elements via drag-and-drop 
* Remove by dragging outside form 
* Add new elements (recommended upper limit ≥10) 
* Change element formatting rules (e.g., leading zeros) 
* Detailed help via popovers 

Conflict handling:

* DB may reject duplicates due to parallel creates or random collisions; user must manually edit custom ID on failure. 

### F) Custom fields (inventory template fields)

Limits:

* Up to 3: single-line text, multi-line text, numeric, document/image link, boolean. 

Per-field metadata:

* Title, description (tooltip/hint), display-in-table flag, reorder via drag-and-drop. 

### G) Discussion tab (near real-time)

* Linear posts only; new posts appended at end. 
* Auto-update so new posts appear for all viewers within **2–5 seconds**. 
* Each post shows Markdown text, username (links to personal page), and date/time. 

### H) Likes

* Each item can be liked; max **one like per user per item**. 

### I) Statistics/aggregation tab

* Show inventory stats such as item count, numeric averages/ranges, most frequent string values; owner does not edit. 

### J) Internationalization + theming

* Two UI languages: English + one more; user selection saved; user-generated content not translated. 
* Two themes: light/dark; user selection saved. 

---

## 4) Data/DB design implications (must-haves)

### Tables / entities you will need (conceptual)

* Users (with roles, blocked flag, social provider identities)
* Inventories (owner_id, title, description_md, category_id, image_url, is_public, version for optimistic locking, etc.)
* InventoryFields (inventory_id, type, title, description, show_in_table, order_index)
* Items (internal PK; inventory_id FK; custom_id; field values; version for optimistic locking; created_by; timestamps)
* ItemFieldValues (or JSON column strategy, but must still support indexing/validation as needed)
* Tags + InventoryTags (tag cloud + autocomplete needs a normalized tag store)  
* AccessList (inventory_id, user_id) for non-public inventories  
* Discussions/Posts (inventory_id, user_id, markdown, created_at)
* Likes (item_id, user_id unique composite)

### Hard DB constraints

* Composite unique index: (inventory_id, custom_id) for item custom IDs. 
* Optimistic locking fields for inventories and items.  
* Cascade deletion in database. 

---

## 5) Non-functional requirements + explicit DON’Ts

### Required implementation choices

* Use a CSS framework; responsive design for mobile. 
* Use an ORM (any acceptable). 
* Use a full-text search engine via library or native DB features. 

### DON’Ts (must enforce in code review)

* Don’t do full DB scans with raw `SELECT *`. 
* Don’t upload images to your web server or database (use cloud storage). 
* Don’t execute DB queries inside loops. 
* Don’t add buttons in table rows. Use multi-selection (checkboxes) and a unified action toolbar for operations on selected items.
* Use ready-made components (Markdown renderer, drag-drop uploader, tag input, tag cloud). 

---

## 6) Layered TODO list (frontend / backend / data / infra / QA)

### Frontend (UI/UX) TODO

**Foundation**

* Implement app shell with:

  * top header containing global search entry visible on all pages 
  * language selector (persist choice) 
  * theme switch (persist choice) 
* Choose CSS framework + responsive layout baseline 

**Public/read-only flows**

* Main page:

  * latest inventories table 
  * top 5 popular inventories table 
  * tag cloud with click → search results layout 
* Inventory page in read-only mode for non-auth users:

  * items table + item detail view  

**Authenticated user flows**

* Social login UI for at least two providers 
* Personal page:

  * Owned inventories sortable/filterable table + create/edit/delete actions 
  * “Write access” inventories sortable/filterable table 

**Inventory page (tabs + permissions)**

* Tabs scaffold with permission gating:

  * Owners/admins: all tabs editable where relevant  
  * Write-access users: only Items + Discussion in edit mode 
* Items tab:

  * table representation, no row buttons (use multi-selection + action toolbar instead)
  * add/edit/delete item flows (based on access)  
* Discussion tab:

  * Markdown rendering 
  * near real-time updates within 2–5 seconds 
* General settings tab:

  * title, markdown description, category select (values from backend), image uploader to cloud, tags input with autocomplete 
  * autosave changes every 7–10 seconds + optimistic-lock conflict UI 
* Custom ID tab:

  * drag-and-drop element ordering + remove by dragging out 
  * add element controls (support at least 10) 
  * formatting options + popover help 
  * real-time ID preview 
* Access settings tab:

  * public toggle vs user list 
  * add user via username/email autocomplete; sortable list with switchable sort mode 
* Fields tab:

  * create/edit custom fields with type limits + show-in-table + drag reorder 
* Stats tab:

  * read-only aggregation view 

**Item page**

* Custom ID single-input edit + validation based on inventory rules 
* Like button enforcing one-like-per-user 

**Admin UI**

* User list with view/block/unblock/delete + add/remove admin role; ensure self-demotion is possible (must use multi-selection checkboxes and an action toolbar, no row buttons)

---

### Backend (API + business logic) TODO

**AuthN/AuthZ**

* Implement social auth for ≥2 providers 
* Role model: user, admin; user states include blocked 
* Authorization rules:

  * Read access to inventories/items for everyone  
  * Inventory edit restricted to creator/admin 
  * Item write access: creator/admin + write-access list + authenticated if public  
  * Admin can act as owner for all inventories 

**Inventories**

* CRUD endpoints for inventories (create requires auth) 
* Update endpoints support optimistic locking via version 
* Settings:

  * title, markdown description, category_id (from lookup table)  
  * image upload flow via cloud (signed upload URL pattern)  
  * tags: create/reuse tags; support prefix search for autocomplete 
* Access list endpoints:

  * search users by name/email for autocomplete 
  * add/remove access list membership 

**Items**

* Item list endpoint for inventory tab (paged, sortable/filterable as needed; avoid row buttons in UI but backend can support actions)  
* Create item:

  * generate custom_id using current inventory format rules 
  * enforce uniqueness via DB composite index 
  * handle collisions/rejections and return a user-fixable error 
* Update item:

  * optimistic locking on items 
  * validate custom_id against **latest** format rules during editing 
* Delete item with cascade-safe referential cleanup 

**Custom ID format system**

* Represent format as an ordered list of elements (type + formatting params) 
* Support element set enumerated in requirements 
* Preview endpoint that takes a format definition and returns an example 
* Sequence element logic: compute “largest existing sequence + 1” at creation-time 

**Custom fields**

* Field definition CRUD for inventory with hard limits by type (max 3 each) 
* Field ordering persistence (drag-drop order_index) 
* Item value validation per field type; store tooltip descriptions 

**Discussion**

* Post creation endpoint (append-only ordering) 
* Near real-time update mechanism:

  * polling, SSE, or websockets to deliver new posts within 2–5 seconds 
* Posts store markdown, author link data, timestamp 

**Likes**

* Like/unlike endpoint with unique (item_id, user_id) constraint 

**Search**

* Implement full-text search over inventories/items/tags as required (top-header global search)  

**Admin**

* User management endpoints: list, block/unblock, delete, add/remove admin role; allow self-demotion 

**Performance/quality constraints**

* Prevent “queries inside loops” patterns (batch fetch; include relations via ORM) 
* Avoid full scans and raw `SELECT *`; use indexed queries, pagination, explicit selects 

---

### Data layer (DB + ORM + indexing) TODO

* Model tables and relationships; enable cascade deletion 
* Add constraints:

  * unique (inventory_id, custom_id) on items 
  * unique (item_id, user_id) for likes 
* Add version columns for optimistic locking on inventories + items  
* Category lookup table (seed values; no admin UI required) 
* Full-text search:

  * choose DB-native FTS or external search engine; index the right columns 
* Tagging:

  * tags table + join table for inventories; add prefix index or appropriate search support for autocomplete 

---

### Infrastructure / platform TODO

* Cloud storage for images (do not store images on server/DB) 
* Real-time channel for discussion updates (SSE/websocket) to meet 2–5 sec requirement 
* i18n resource pipeline for UI-only translation 
* Secure configuration for social auth providers (secrets, redirect URLs) 

---