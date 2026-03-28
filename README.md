# Admin Dashboard — Next.js Frontend

A full-featured admin dashboard built with Next.js 15 App Router, connecting to a NestJS REST API backend. Includes cookie-based authentication with automatic token refresh, a user management module with CRUD operations, address picking via Google Maps, and server-side data prefetching with TanStack Query.

---

## Features

- **Authentication** — Login / logout with HTTP-only cookie sessions. Automatic silent token refresh on 401 responses (both client-side via Axios interceptor and server-side via `ClientRefresh`).
- **User Management** — Paginated, searchable, sortable user table. Create, edit, and delete users via modal forms with full validation.
- **Address Picker** — Google Places autocomplete + interactive map picker (click to place pin, reverse geocode to address fields).
- **Server-side Prefetching** — Initial data fetched on the server with `prefetchQuery` + `dehydrate`, handed off to the client via `HydrationBoundary` for zero loading flicker.
- **Form Validation** — Zod schemas + React Hook Form with field-level and server error display.
- **Error Boundary** — Global React error boundary to gracefully catch render errors.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router, Turbopack) |
| Language | TypeScript 5 (strict mode) |
| Styling | Tailwind CSS 4 |
| UI Primitives | Radix UI + shadcn/ui pattern |
| Icons | Lucide React |
| Server State | TanStack React Query v5 |
| HTTP Client | Axios (with interceptors) |
| Forms | React Hook Form + Zod |
| Date formatting | Day.js |
| Charts | Recharts |
| Maps | Google Maps API + Google Places API |

---

## Prerequisites

- Node.js 18+
- The [NestJS backend](https://github.com/your-username/your-backend-repo) running on `http://localhost:5000`
- A Google Maps API key with **Maps JavaScript API** and **Places API (New)** enabled

---

## Getting Started

### 1. Clone and install

```bash
git clone https://github.com/your-username/your-repo-name.git
cd your-repo-name
npm install
```

### 2. Configure environment variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

### 3. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Make sure the backend is also running on port 5000.

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Yes | Google Maps + Places API key for address autocomplete and map picker |

---

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Root — server prefetches data, renders dashboard
│   ├── auth/page.tsx         # Login page
│   ├── protected/page.tsx    # Example protected server component
│   ├── providers.tsx         # QueryClient + HydrationBoundary wrapper
│   └── api/me/route.ts       # Next.js API route proxying /users/me
│
├── components/
│   ├── dashboard/
│   │   ├── dashboard-layout.tsx   # Shell with sidebar + header + logout
│   │   ├── sidebar.tsx            # Navigation + logout button
│   │   ├── header.tsx             # Top bar with search and avatar
│   │   ├── users-page.tsx         # Full user management page
│   │   ├── dashboard-overview.tsx # Stats overview page
│   │   ├── orders-page.tsx        # Orders page
│   │   └── models/userForm.tsx    # Add / edit user modal form
│   ├── shared/
│   │   ├── AddressAutocomplete.tsx  # Google Places text search
│   │   └── MapPicker.tsx            # Interactive map pin picker
│   ├── ui/                    # Reusable primitives (Button, Input, Card, etc.)
│   ├── AuthWrapper.tsx        # Client-side auth refresh handler
│   ├── ClientRefresh.tsx      # Server → client token refresh bridge
│   └── ErrorBoundary.tsx      # Global render error boundary
│
├── hooks/
│   └── useUsers.tsx           # useUsers, useAddUser, useEditUser hooks
│
├── lib/
│   ├── axiosInstance.ts       # Axios client with 401 refresh interceptor
│   ├── clientAuth.ts          # Client-side token refresh function
│   ├── serverAuth.ts          # Server-side authenticated fetch helpers
│   ├── api/
│   │   ├── users.ts           # Client API functions (fetchUsers, addUser, …)
│   │   └── users.server.ts    # Server-only API functions (getAllUsers)
│   └── geoCode.ts             # Reverse geocoding (lat/lng → address)
│
└── types/
    └── index.ts               # All shared TypeScript interfaces
```

---

## Authentication Flow

```
User visits /
  └── Server prefetches data with cookie
        ├── 200 OK  → render dashboard
        ├── 401     → ClientRefresh attempts silent token refresh
        │               ├── success → reload page
        │               └── failure → redirect to /auth
        └── other error → redirect to /auth

User logs in at /auth
  └── POST /auth/login → backend sets HTTP-only access + refresh cookies
        └── redirect to /

Token expires mid-session
  └── Axios interceptor catches 401
        ├── POST /auth/refresh-token (silent)
        │     └── success → retry original request transparently
        └── failure → redirect to /auth
```

---

## Available Scripts

```bash
npm run dev      # Start dev server with Turbopack
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```
