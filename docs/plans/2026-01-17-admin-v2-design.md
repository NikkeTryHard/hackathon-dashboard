# Hackathon Dashboard V2 Design: Admin Power-Up & Settings

**Goal:** Enhance the Admin tab with full editing capabilities (users & system settings) and robust delete protection, while fixing the remote access architecture for the Models page.

**Architecture Changes:**

1. **Database:** New `SystemSetting` table for persistent configuration.
2. **API Proxying:** Move model fetching server-side to support remote access and dynamic configuration.
3. **UI Components:** New Modals for Editing and Confirmation.

---

## 1. Database Schema (`schema.prisma`)

Add a key-value store for global settings.

```prisma
model SystemSetting {
  key   String @id
  value String
}
```

_Initial Seed:_ `antigravity_url` = `http://127.0.0.1:8083`

## 2. API Routes

### System Settings

- `GET /api/settings` - Retrieve all settings (Authenticated)
- `PUT /api/settings` - Update settings (Admin only)

### User Management

- `PATCH /api/users/[id]` - Update name or admin status.
- `POST /api/users/[id]/regenerate` - Generate new API key for user.

### Models Proxy (Fixes Remote Access)

- `GET /api/models`
  - Server-side: Fetches `antigravity_url` from DB.
  - Server-side: Proxies request to that URL.
  - Returns: JSON response to frontend.
    _Why?_ Current implementation fetches `localhost:8083` from the _client's browser_. Remote users can't reach the server's localhost.

## 3. Frontend Implementation

### Admin Page (`/admin`)

**A. Settings Section (New)**

- Input field for "Antigravity Endpoint URL".
- "Save" button.

**B. User List Improvements**

- **Columns:** Name, API Key (masked), Role, Actions.
- **Actions:** Edit (Pencil), Delete (Trash).
- **Self-Protection:**
  - "Delete" button disabled/hidden for the current logged-in user.
  - "Admin" toggle disabled for self (prevent accidental lockout).

**C. Edit User Modal**

- **Inputs:** Name (Text), Is Admin (Switch/Checkbox).
- **Actions:**
  - "Regenerate API Key" button (requires confirmation).
  - "Save Changes" button.

**D. Delete Protection**

- Clicking Delete opens a Modal/Dialog.
- Text: "Are you sure you want to delete **[User Name]**? This action cannot be undone."
- Buttons: "Cancel" (Gray), "Delete User" (Red).

### Models Page (`/models`)

- Update `fetchModels` to call `/api/models` (internal) instead of the external URL.

---

## 4. Implementation Steps (Batching)

**Batch 1: Database & Settings API**

1. Update `schema.prisma` and run migration/push.
2. Create `lib/settings.ts` helper.
3. Create `/api/settings` route.
4. Create `/api/models` proxy route.

**Batch 2: User API & Backend Logic**

1. Create `PATCH /api/users/[id]`.
2. Create `POST /api/users/[id]/regenerate`.
3. Verify `DELETE` protection logic in API.

**Batch 3: Frontend - Components**

1. Create `EditUserModal` component.
2. Create `DeleteConfirmModal` component.
3. Create `SettingsSection` component.

**Batch 4: Frontend - Integration**

1. Update `AdminPage` to use new components.
2. Update `ModelsPage` to use new proxy endpoint.
