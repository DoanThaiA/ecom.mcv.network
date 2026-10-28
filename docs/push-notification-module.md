# Push Notification Module

## Overview

The Push Notification module allows CMS admins to create, schedule, send, and recall push notifications to all frontend shop users. The frontend displays a notification bell icon with real-time delivery via WebSocket.

### Key Features

- Create notifications as drafts or send immediately
- Schedule notifications for future delivery via BullMQ delayed jobs
- Recall (withdraw) sent notifications
- Real-time delivery to frontend users via WebSocket (`notification:new`, `notification:recalled`)
- Per-user read tracking with unread count badge
- Infinite-scroll notification dropdown on the frontend
- Permission-gated CMS access (`MODULE_PERMISSION_PUSH_NOTIFICATION_MANAGEMENT = 9`)

---

## Architecture

### Data Model

Two MongoDB collections:

**`push_notifications`** — The notification content and lifecycle state.

| Field | Type | Notes |
|-------|------|-------|
| `category` | Number (enum) | `NEWS = 1`, `PROMOTION = 2` |
| `title` | String | Required, max 100 chars |
| `subtitle` | String | Required, max 250 chars |
| `url` | String | Optional redirect link |
| `status` | Number (enum) | `DRAFT = 1`, `PENDING = 2`, `SENT = 3`, `RECALLED = 4` |
| `scheduledAt` | Date | For scheduled sends |
| `sentAt` | Date | Actual send time |
| `readersCount` | Number | Cached count, incremented on read |
| `createdBy` | String | CMS user ID |
| `createdAt` / `updatedAt` | Date | Timestamps |
| `deletedAt` | Date | Soft delete |

Indexes: `{ status: 1, createdAt: -1 }`, `{ status: 1, scheduledAt: 1 }`

**`user_notifications`** — Per-user delivery and read status.

| Field | Type | Notes |
|-------|------|-------|
| `userId` | String | Required |
| `notificationId` | String | Reference to `push_notifications` |
| `isRead` | Boolean | Default `false` |
| `readAt` | Date | When user read it |
| `createdAt` | Date | Timestamp |

Indexes: `{ userId: 1, createdAt: -1 }`, `{ notificationId: 1, userId: 1 }` (unique), `{ userId: 1, isRead: 1 }`

### Status Lifecycle

```
DRAFT  ──> SENT      (immediate send)
DRAFT  ──> PENDING   (scheduled send, BullMQ delayed job)
PENDING ──> SENT     (BullMQ processor fires at scheduledAt)
SENT   ──> RECALLED  (admin recall)
```

### Scheduling

- Uses **BullMQ** with Redis for delayed job processing
- Queue name: configured via `PUSH_NOTIFICATION_QUEUE_NAME` env variable
- When a notification is created/sent with a future `scheduledAt`, a delayed job is enqueued with `delay = scheduledAt - now`
- The processor verifies the notification is still `PENDING` before sending (guards against race conditions with recall)
- Redis connection includes retry strategy; job cleanup retains 100 completed and 500 failed jobs

---

## Backend

### Directory Structure

```
backend/src/push-notifications/
├── push-notifications.module.ts
├── push-notifications.service.ts
├── push-notification.processor.ts            # BullMQ worker
├── controllers/
│   ├── cms-push-notifications.controller.ts  # CMS admin endpoints
│   └── shop-push-notifications.controller.ts # Frontend user endpoints
├── domain/
│   ├── push-notification.ts                  # Domain entity
│   ├── push-notification.repository.ts       # Abstract repository
│   ├── push-notification-status.enum.ts      # DRAFT, PENDING, SENT, RECALLED
│   ├── push-notification-category.enum.ts    # NEWS, PROMOTION
│   ├── user-notification.ts                  # User notification entity
│   └── user-notification.repository.ts       # Abstract repository
├── dto/
│   ├── create-push-notification.dto.ts
│   ├── update-push-notification.dto.ts
│   └── query-push-notifications.dto.ts
└── model/
    ├── push-notification.schema.ts
    ├── push-notification.mapper.ts
    ├── push-notification-document.repository.ts
    ├── push-notification-document.module.ts
    ├── user-notification.schema.ts
    ├── user-notification.mapper.ts
    ├── user-notification-document.repository.ts
    └── user-notification-document.module.ts
```

### CMS API Endpoints

**Base path:** `/api/v1/cms/push-notifications`
**Auth:** `AuthGuard('jwt-cms')` + `ModulePermission.push_notification_management`

| Method | Path | Description |
|--------|------|-------------|
| `POST /` | Create notification (draft, immediate send, or scheduled) |
| `GET /` | List with filters (`status`, `category`, `search`) + pagination |
| `GET /:id` | Get notification detail |
| `PATCH /:id` | Update draft only (returns 400 if not DRAFT) |
| `DELETE /:id` | Soft delete draft only |
| `POST /:id/send` | Send a draft/pending notification (respects `scheduledAt`) |
| `POST /:id/recall` | Recall a sent notification |

**Query params for list:** `page`, `limit`, `filters` (JSON string with `status`, `category`, `search`)

### Shop API Endpoints

**Base path:** `/api/v1/shop/notifications`
**Auth:** `AuthGuard('jwt')`

| Method | Path | Description |
|--------|------|-------------|
| `GET /` | List user's notifications (paginated, excludes recalled) |
| `GET /unread-count` | Get unread count (`{ count: number }`) |
| `PATCH /:id/read` | Mark one notification as read |
| `PATCH /read-all` | Mark all notifications as read |

### Service Logic

- **create():** If `status=SENT` → sends immediately. If `status=PENDING` + future `scheduledAt` → enqueues BullMQ delayed job. If `status=DRAFT` → just saves.
- **send():** If `scheduledAt` is in the future → sets status to PENDING + enqueues job. Otherwise → sends immediately.
- **sendNotification():** Updates status to SENT, sets `sentAt`. Fetches all active user IDs, bulk inserts `user_notifications` in batches of 1000. Broadcasts via WebSocket.
- **recall():** Updates status to RECALLED. Broadcasts `notification:recalled` via WebSocket.
- **markAsRead():** Sets `isRead=true` on user_notification. Atomically increments `readersCount` on push_notification.

### WebSocket Events

Added to `backend/src/socket/socket.events.ts` and `socket.service.ts`:

| Event | Direction | Payload |
|-------|-----------|---------|
| `notification:new` | Server → All clients | `{ id, category, title, subtitle, url?, sentAt }` |
| `notification:recalled` | Server → All clients | `{ id }` |

### i18n

Files: `backend/src/i18n/{en,vi}/push-notification.json`

### Permission

- Proto: `MODULE_PERMISSION_PUSH_NOTIFICATION_MANAGEMENT = 9` in `proto/cms/cms-users/cms-user.proto`
- Backend enum: `backend/src/cms-users/permissions/module-permission.enum.ts`

---

## CMS

### Files

```
cms/src/
├── types/push-notification.ts                          # Types & enums
├── repositories/push-notification.repository.ts        # API client
├── redux/store/pushNotificationSlice.ts                # Redux slice
├── redux/saga/pushNotificationSaga.ts                  # Redux saga
├── pages/
│   ├── push-notification.tsx                           # List page
│   ├── push-notification-create.tsx                    # Create page
│   ├── push-notification-edit.tsx                      # Edit page
│   └── push-notification-detail.tsx                    # Detail page
└── sections/push-notification/
    ├── push-notification-view.tsx                       # List table view
    ├── push-notification-create-view.tsx                # Create view
    ├── push-notification-edit-view.tsx                  # Edit view
    ├── push-notification-detail-view.tsx                # Detail view
    └── push-notification-form.tsx                       # Shared form component
```

### Routes

| Path | Page |
|------|------|
| `/push-notification` | List with search, filters, TanStack Table |
| `/push-notification/create` | Create form |
| `/push-notification/edit/:id` | Edit form (drafts only) |
| `/push-notification/:id` | Detail view (sent and recalled) |

### Navigation

Added under dashboard nav with icon `ic-analytics`, gated by `MODULE_PERMISSION_PUSH_NOTIFICATION_MANAGEMENT`.

### Redux Flow

- **Slice:** `pushNotificationSlice` with state for `list`, `current`, loading flags per action, `pagination`
- **Saga actions:** `getListRequest`, `getByIdRequest`, `createRequest`, `updateRequest`, `deleteRequest`, `sendRequest`, `recallRequest`
- **Registered in:** `redux/store/store.ts` and `redux/saga/rootSaga.ts`

### UI Components

**List View:**
- SearchBar with search input + "Add" button
- TanStack Table columns: #, Category (Chip), Title, Subtitle, Readers Count, Send Time, Status (colored Chip), Actions
- Status colors: Draft=default, Pending=warning, Sent=success, Recalled=error
- Actions: View (eye icon, SENT + RECALLED), Edit (pencil, DRAFT + PENDING), Delete (trash, DRAFT only)

**Form (shared between create and edit):**
- Select: Category (News / Promotion) — required
- TextField: Title (max 100, with counter) — required
- TextField multiline: Subtitle (max 250, with counter) — required
- TextField: URL — optional
- DateTimePicker: Scheduled time — optional (uses local timezone, converts to ISO on submit)
- Buttons: Cancel, Save Draft, Send
- Validation: uses `fieldRequired` i18n key for empty field errors

**Edit View — Send behavior:**
- "Save Draft" → PATCH update only
- "Send" → PATCH update fields, then POST `/:id/send` (backend respects `scheduledAt` for scheduling)

**Detail View:**
- Read-only display of all fields with status badge
- "Go Back" button always visible
- "Recall" button visible only when status is SENT

### i18n Keys

Added to `cms/src/i18n/{en,vi}/common.json`:
- `pushNotificationManagement`, `pushNotificationList`, `pushNotificationDetail`
- `pushNotificationCategory`, `pushNotificationCategoryNews`, `pushNotificationCategoryPromotion`
- `pushNotificationTitle`, `pushNotificationSubtitle`, `pushNotificationUrl`
- `pushNotificationSendTime`, `pushNotificationScheduledTime`, `pushNotificationStatus`
- `pushNotificationReadersCount`
- `pushNotificationStatusDraft`, `pushNotificationStatusPending`, `pushNotificationStatusSent`, `pushNotificationStatusRecalled`
- `pushNotificationTitleMaxLength`, `pushNotificationSubtitleMaxLength`
- `addPushNotification`, `createPushNotification`, `editPushNotification`
- `saveDraft`, `sendNotification`, `recallNotification`, `goBack`
- Success/error messages for CRUD operations

---

## Frontend

### Files

```
frontend/
├── lib/repositories/notification.repository.ts     # API client
├── components/navigation/
│   ├── NotificationBell.tsx                         # Bell icon + dropdown toggle
│   ├── NotificationDropdown.tsx                     # Dropdown with infinite scroll
│   └── NotificationItem.tsx                         # Single notification row
├── public/assets/svg/bell.svg                       # Bell icon SVG
├── types/websocket.ts                               # WebSocket event types
└── messages/{en,vi}.json                            # i18n keys
```

### Repository

| Method | Endpoint | Description |
|--------|----------|-------------|
| `getNotifications(page, limit)` | `GET /shop/notifications` | Paginated list |
| `getUnreadCount()` | `GET /shop/notifications/unread-count` | Returns `{ count }` |
| `markAsRead(notificationId)` | `PATCH /shop/notifications/:id/read` | Mark one as read |
| `markAllAsRead()` | `PATCH /shop/notifications/read-all` | Mark all as read |

### NotificationBell Component

- Renders bell SVG icon with red unread count badge (same pattern as `CartIconWithBadge`)
- Positioned between search and user icon in both `DesktopNavHeader` and `MobileNavHeader`
- Only visible when authenticated
- On mount: fetches unread count
- On click: toggles dropdown, fetches page 1 of notifications
- WebSocket: listens for `notification:new` (prepends to list, increments count) and `notification:recalled` (removes from list)

### NotificationDropdown — Infinite Scroll

- Displays notification list in a scrollable container (max-height 400px)
- Header with title + "Mark all as read" link
- Detects scroll position: when within 100px of bottom, triggers `onLoadMore`
- Fetches next page (20 items per page) and appends to list
- Shows loading indicator at bottom while fetching
- Stops loading when `hasNextPage` is `false`

### NotificationItem

- Shows title (truncated), subtitle (2-line clamp), relative time ("Just now", "5 minutes ago")
- Unread indicator: red dot on left, light blue background
- Click: marks as read + navigates to URL (internal via `router.push`, external via `window.open`)

### i18n Keys (notification namespace)

- `title`, `markAllAsRead`, `noNotifications`
- `justNow`, `minutesAgo`, `hoursAgo`, `daysAgo`

---

## Environment Variables

| Variable | Used By | Purpose |
|----------|---------|---------|
| `PUSH_NOTIFICATION_QUEUE_NAME` | Backend | BullMQ queue name |
| `REDIS_HOST` / `REDIS_PORT` | Backend | Redis connection for BullMQ |

---

## Testing Checklist

### CMS
- [ ] Create draft → verify saved with DRAFT status
- [ ] Edit draft → update fields → verify changes saved
- [ ] Send draft (no scheduled time) → verify status changes to SENT immediately
- [ ] Send draft (with future scheduled time) → verify status changes to PENDING
- [ ] Scheduled notification fires at correct time → verify status changes to SENT
- [ ] Recall sent notification → verify status changes to RECALLED
- [ ] View recalled notification detail → verify still accessible
- [ ] Delete draft → verify soft deleted
- [ ] Cannot edit/delete non-draft notifications
- [ ] Permission check → users without push_notification_management cannot access

### Frontend
- [ ] Notification bell shows unread count badge
- [ ] Click bell → dropdown opens with notification list
- [ ] Scroll to bottom → loads next page (infinite scroll)
- [ ] Click notification → marks as read, navigates to URL
- [ ] "Mark all as read" → clears all unread, count resets to 0
- [ ] Real-time: send from CMS → notification appears in frontend dropdown instantly
- [ ] Real-time: recall from CMS → notification removed from frontend list
- [ ] Bell only visible when authenticated
