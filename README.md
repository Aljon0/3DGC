# Double Seven — 3D Monument & Lapida Customizer System

> A full-stack SaaS platform for designing, ordering, and managing custom monuments and lapidas. Customers design their monument in a live 3D environment; the owner manages orders, inventory, and communications through a dedicated admin portal.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [Features](#features)
  - [Customer Portal](#customer-portal)
  - [Admin Portal](#admin-portal)
  - [3D Customizer](#3d-customizer)
- [Roles & Authentication](#roles--authentication)
- [State Management](#state-management)
- [Services & API](#services--api)
- [Mock Mode](#mock-mode)
- [Font Assets](#font-assets)
- [Texture Assets](#texture-assets)
- [Known Limitations](#known-limitations)
- [Backend Integration Notes](#backend-integration-notes)
- [Demo Accounts](#demo-accounts)

---

## Overview

Double Seven is a split-role SaaS platform:

- **Customers** browse a design catalog, customize monuments in a live 3D workspace, place orders, upload payment proof, and chat with the admin.
- **Admin/Owner** manages a Kanban-style order board, tracks inventory, sets pricing, manages templates and element assets, and communicates with all customers.

The frontend is built entirely with React + Vite and is currently running in **mock mode** — all API calls return simulated data locally. Switching to a real backend requires only changing `const MOCK = true` to `false` in each service file and setting the correct `VITE_API_BASE_URL`.

---

## Tech Stack

| Category | Technology |
|---|---|
| Framework | React 18 + Vite 5 |
| Language | JavaScript (ES2022+, JSX) |
| Styling | Tailwind CSS v4 (`@tailwindcss/vite` plugin) |
| 3D Rendering | React Three Fiber + `@react-three/drei` + Three.js |
| State Management | Zustand v4 (with `immer` middleware) |
| Routing | React Router v6 |
| Charts | Recharts |
| Animations | Framer Motion |
| HTTP Client | Axios |
| Notifications | React Hot Toast |
| File Uploads | React Dropzone |
| PDF Export | jsPDF |
| Date Utilities | date-fns |
| Icons | Lucide React |

---

## Project Structure

```
double-seven/
├── public/
│   ├── fonts/              # TTF font files for 3D text decals
│   └── textures/           # Stone texture images (granite, marble, etc.)
│
└── src/
    ├── assets/
    ├── components/
    │   ├── catalog/        # CatalogCard, CatalogGrid, CatalogTabs
    │   ├── chat/           # ChatInterface, ConversationList, MessageBubble, MessageInput
    │   ├── customizer/     # 3D workspace components (ThreeCanvas, StoneModel, etc.)
    │   ├── layout/         # Sidebar, TopNavbar, CustomerLayout, AdminLayout, PublicLayout
    │   ├── orders/         # KanbanBoard, OrderCard, PlaceOrderModal, WalkInOrderModal
    │   ├── shared/         # Modal, SlideOver, DataTable, StatCard, ChartWidget, etc.
    │   └── ui/             # Button, Input, Badge, Avatar, Dropdown, Tabs, etc.
    ├── hooks/
    │   ├── useAuth.js
    │   ├── useChat.js
    │   ├── useInventory.js
    │   ├── useMediaQuery.js
    │   └── useOrders.js
    ├── lib/
    │   └── utils.js        # cn(), formatPeso(), calculateOrderPrice(), etc.
    ├── pages/
    │   ├── admin/          # Dashboard, Orders, Inventory, Settings, Messages, etc.
    │   ├── customer/       # Dashboard, Catalog, Customizer, Orders, Messages, Payment
    │   └── public/         # Landing, Login, Register
    ├── services/
    │   ├── api.js          # Axios base instance with auth interceptor
    │   ├── auth.service.js
    │   ├── chat.service.js
    │   ├── designs.service.js
    │   ├── inventory.service.js
    │   ├── orders.service.js
    │   └── settings.service.js
    ├── store/
    │   ├── useAuthStore.js       # User session (persisted)
    │   ├── useCustomizerStore.js # 3D canvas state + undo/redo
    │   ├── useOrderStore.js      # Orders + Kanban state
    │   └── useUIStore.js         # Sidebar, modals, global UI
    ├── App.jsx
    ├── main.jsx
    └── index.css               # Tailwind v4 theme + @font-face declarations
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-org/double-seven.git
cd double-seven

# 2. Install dependencies
npm install immer
npm install react react-dom react-router-dom \
  @react-three/fiber @react-three/drei three \
  zustand recharts framer-motion axios \
  clsx tailwind-merge date-fns lucide-react \
  react-hot-toast react-dropzone jspdf html2canvas \
  @tanstack/react-query

npm install -D vite @vitejs/plugin-react \
  tailwindcss @tailwindcss/vite \
  autoprefixer postcss @types/three

# 3. Set up environment variables
cp .env.example .env

# 4. Start the development server
npm run dev
```

The app will open at `http://localhost:3000`.

---

## Environment Variables

Create a `.env` file in the project root:

```env
# Backend API base URL (used when MOCK mode is disabled)
VITE_API_BASE_URL=http://localhost:8000/api

# App name
VITE_APP_NAME="Double Seven"

# Set to 'true' to use local mock data instead of real API
# Note: All service files currently hardcode MOCK = true
# This variable is kept for future use
VITE_ENABLE_MOCK_API=true
```

---

## Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview
```

---

## Features

### Customer Portal

| Feature | Description |
|---|---|
| **Catalog** | Browse admin-created templates and decorative elements. Tabs for Recent Designs, Templates, and Elements. |
| **3D Customizer** | Live WebGL workspace to design a gravestone, urn, table sign, or base. |
| **Save Design** | Saves the current canvas state to `localStorage` as a Recent Design (thumbnail captured automatically). |
| **My Orders** | View order history with status, payment progress bar, and the ability to cancel or upload payment proof. |
| **Messages** | Real-time chat thread with the admin/owner. Supports text and image attachments. |
| **Payment Gateway** | View GCash and BPI QR codes, account details, and payment policies. |

### Admin Portal

| Feature | Description |
|---|---|
| **Dashboard** | KPI stat cards, monthly revenue area chart, orders per month bar chart, recent orders list. |
| **Order Management** | Kanban board (New → Processing → Finished / Cancelled). Accept/reject orders, create walk-in orders, update payment records. |
| **Inventory** | Track materials with low-stock warnings, CSV export, texture uploads for the customizer. |
| **Designs** | Manage published/draft templates. Upload decorative element assets used by both roles in the customizer. |
| **3D Customizer** | Same workspace as customers — save designs directly as global templates. |
| **Message Hub** | Searchable inbox to chat with all customers. Supports text and image messages. |
| **User Accounts** | List of registered customers with the ability to ban/unban. |
| **Reports** | Filter transaction history by status and date range. Export PDF reports with revenue breakdown. |
| **System Settings** | Size-based pricing for all stone types, payment QR code uploads, business information. |

### 3D Customizer

| Tool | Description |
|---|---|
| **Stone Types** | Gravestone (RoundedBox), Urn (CylinderGeometry), Table Sign (RoundedBox), Base (RoundedBox) |
| **Textures** | Granite, Marble, Black Granite, Sandstone — with fallback solid colors if texture files are missing |
| **Text Decals** | Add text with 17 custom fonts, font size slider, color picker with presets |
| **Image Decals** | Upload any image and place it on the stone surface |
| **Frame Decals** | Circle, oval, square, or horizontal rectangle picture frames with photo upload and color picker |
| **Elements Browser** | Browse admin-uploaded decorative assets and add them directly as decals (no download) |
| **Transform Controls** | Scale up/down, rotate CW/CCW, flip horizontal/vertical, lock, remove |
| **Undo / Redo** | Full history stack (up to 50 steps) using Zustand + immer |
| **Rotation Lock** | Toggle auto-rotation via OrbitControls |
| **Clipping Planes** | Prevents decals from showing on the back face of stones |
| **Snapshot** | Captures the canvas as a base64 PNG for order thumbnails |

---

## Roles & Authentication

Two roles are supported:

| Role | Access |
|---|---|
| `customer` | `/customer/*` routes only |
| `admin` | `/admin/*` routes only |

Route guards (`ProtectedRoute`, `GuestRoute`) in `App.jsx` handle redirects:

- Unauthenticated users → `/login`
- Wrong role → redirected to their own portal
- Authenticated users visiting `/login` or `/register` → redirected to their portal

Auth state is **persisted to `localStorage`** via Zustand's `persist` middleware. The JWT token is attached to every Axios request via the request interceptor in `src/services/api.js`. A 401 response auto-logs the user out.

---

## State Management

Four Zustand stores:

| Store | Persisted | Responsibility |
|---|---|---|
| `useAuthStore` |  Yes | User session, token, role |
| `useCustomizerStore` |  No | 3D canvas state, decals, undo/redo history |
| `useOrderStore` |  No | Order list, Kanban state, filters |
| `useUIStore` |  No | Sidebar open/collapsed, modals, page title |

`useCustomizerStore` uses **immer** middleware for safe nested state mutations and a **snapshot history stack** (up to 50 entries) for undo/redo.

---

## Services & API

All services are in `src/services/`. Each follows the same pattern:

```js
const MOCK = true  // ← change to false when connecting backend

async function someMethod(params) {
  if (MOCK) {
    // return simulated data
  }
  return api.post('/endpoint', params)  // real Axios call
}
```

| Service | Key methods |
|---|---|
| `auth.service.js` | `login()`, `register()`, `logout()`, `getProfile()` |
| `orders.service.js` | `fetch()`, `create()`, `createWalkIn()`, `updateStatus()`, `uploadPaymentProof()` |
| `designs.service.js` | `fetchTemplates()`, `fetchElements()`, `saveTemplate()`, `uploadElement()`, `saveSnapshot()` |
| `inventory.service.js` | `fetch()`, `create()`, `update()`, `delete()`, `exportCSV()`, `uploadTexture()` |
| `chat.service.js` | `getConversations()`, `getHistory()`, `sendMessage()`, `sendImage()`, `markRead()` |
| `settings.service.js` | `fetch()`, `updatePricing()`, `updatePayment()`, `updateBusiness()`, `uploadQRCode()` |

---

## Mock Mode

**All services currently have `const MOCK = true` hardcoded.**

To connect to the real backend:

1. In every `src/services/*.service.js` file, change:
   ```js
   // FROM:
   const MOCK = true

   // TO:
   const MOCK = false
   ```

2. In `src/services/api.js`, change:
   ```js
   // FROM:
   const FORCE_MOCK = true

   // TO:
   const FORCE_MOCK = false
   ```

3. Set your backend URL in `.env`:
   ```env
   VITE_API_BASE_URL=https://your-backend.com/api
   ```

---

## Font Assets

Custom `.ttf` font files must be placed in `/public/fonts/`. These are used for:

- **3D text decals** — loaded via `canvas.getContext('2d')` in `StoneModel.jsx`
- **UI font previews** — loaded via `@font-face` declarations in `src/index.css`

**Required files in `/public/fonts/`:**

```
CateneoBT_Regular.ttf
CommercialScript_Normal.ttf
EdwardianScriptITC_Regular.ttf
FuturaMdBT_Bold.ttf
GreatVibes_Regular.ttf
LavanderiaDelicate_Delicate.ttf
LavanderiaRegular_Regular.ttf
LavanderiaSturdy_Sturdy.ttf
MissionScript_Regular.ttf
ScriptMTBold_Regular.ttf
Times_BoldItalic.ttf
TimesNewRoman_Italic.ttf
TimesNewRomanCyr_Bold.ttf
TimesNewRomanCyr_Regular.ttf
TirantiSolidLET_Plain.ttf
Walnuts_Regular.ttf
ZapfinoForteLTPro_Regular.ttf
```

> These font files are **not included** in the repository due to licensing. Copy them from the original project's `public/fonts/` directory.

---

## Texture Assets

Stone texture `.jpg` files must be placed in `/public/textures/`. If missing, the 3D canvas falls back to solid colors — the app will still function.

**Required files in `/public/textures/`:**

```
granite.jpg
marble.jpg
black-granite.jpg
sandstone.jpg
```

Free 1K PBR textures can be downloaded from [ambientcg.com](https://ambientcg.com) — search for "granite", "marble", etc. and download the JPG version.

---

## Known Limitations

| Issue | Status |
|---|---|
| Chat polling (5s interval) | Production should replace with Supabase Realtime or WebSockets |
| Recent Designs in `localStorage` | Will move to backend `saved_designs` table once API is ready |
| 3D textures require actual `.jpg` files | Falls back to solid colors if files are missing — no crash |
| Urn text uses flat plane mesh | Curved text approximation; may shift when urn is rotated past 90° |
| `THREE.Clock` deprecation warning | Comes from drei internals — does not affect functionality |
| Snapshot capture | Must click Capture before Place Order — blank canvas if skipped |

---

## Backend Integration Notes

The backend is a separate Node.js/Express project with Supabase as the database and storage provider.

**Key API contracts the frontend expects:**

```
POST   /api/auth/login
POST   /api/auth/register
GET    /api/auth/me

GET    /api/orders
POST   /api/orders
POST   /api/orders/walk-in
PATCH  /api/orders/:id/status
POST   /api/orders/:id/payment-proof
PATCH  /api/orders/:id/cancel

GET    /api/designs/templates
POST   /api/designs/templates
GET    /api/designs/elements        ← must return public Supabase Storage URLs
POST   /api/designs/elements
POST   /api/designs/snapshot

GET    /api/inventory
POST   /api/inventory
PATCH  /api/inventory/:id
DELETE /api/inventory/:id

GET    /api/chat/conversations
GET    /api/chat/conversations/:id/messages
POST   /api/chat/conversations/:id/messages
POST   /api/chat/conversations/:id/images
PATCH  /api/chat/conversations/:id/read

GET    /api/settings
PATCH  /api/settings/pricing
PATCH  /api/settings/payment
PATCH  /api/settings/business
POST   /api/settings/payment/qr
```

**Supabase Storage buckets required:**

| Bucket | Public? | Used for |
|---|---|---|
| `elements` |  Public read | Decorative element images loaded in Three.js |
| `snapshots` |  Public read | Order design previews |
| `thumbnails` |  Public read | Template preview images |
| `payment-proofs` |  Auth only | Customer payment screenshots |
| `chat-images` |  Auth only | Chat image attachments |
| `qr-codes` |  Public read | GCash / BPI QR code images |

>  The `elements` bucket **must be public** — the frontend loads element URLs directly in `THREE.TextureLoader`. Signed/expiring URLs will break the 3D canvas after expiry.

---

## Demo Accounts

When running in mock mode, use these credentials:

| Role | Email | Password |
|---|---|---|
| Admin/Owner | `admin@doubleseven.com` | `password123` |
| Customer | `juan@email.com` | `password123` |

These are pre-filled as quick-fill buttons on the Login page.

---

## License

Private — Double Seven Monuments. All rights reserved.