# Frontend System Design

## Stack

| Layer | Technology |
|---|---|
| Framework | React 19 |
| Build Tool | Vite 8 |
| Routing | React Router DOM v7 (BrowserRouter) |
| HTTP Client | Axios 1.15 |
| Auth | @react-oauth/google 0.13 + JWT |
| Icons | Lucide React |
| Styling | Plain CSS (single `index.css`, utility classes) |
| State | React Context API (auth only), local `useState` elsewhere |

---

## Project Structure

```
src/
├── App.jsx                  # Root: router + all route definitions
├── main.jsx                 # Entry point
├── index.css                # Global styles + utility classes
├── api/
│   ├── client.js            # Axios instance with request/response interceptors
│   └── endpoints.js         # All API calls as named functions
├── context/
│   └── AuthContext.jsx      # Auth state: user, tokens, login/logout methods
├── components/
│   ├── Navbar.jsx
│   ├── Footer.jsx
│   ├── ProtectedRoute.jsx   # Redirects unauthenticated users to /login
│   ├── AdminRoute.jsx       # Redirects non-staff users
│   ├── StarRating.jsx       # Display-only star rating
│   ├── StarInput.jsx        # Interactive star picker
│   ├── LoadingSpinner.jsx
│   └── CategoryIcon.jsx
└── pages/
    ├── Home.jsx
    ├── Login.jsx
    ├── Register.jsx
    ├── GoogleCallback.jsx
    ├── Categories.jsx
    ├── Professionals.jsx
    ├── ProfessionalDetail.jsx
    ├── BecomeProfessional.jsx
    ├── Jobs.jsx
    ├── JobDetail.jsx
    ├── JobForm.jsx
    ├── Profile.jsx
    ├── AdminDashboard.jsx
    └── FAQ.jsx
```

---

## Routing

**Router:** `BrowserRouter` — SEO-friendly URLs (`/path`).

| Route | Component | Auth |
|---|---|---|
| `/` | Home | Public |
| `/login` | Login | Public |
| `/register` | Register | Public |
| `/auth/google/callback` | GoogleCallback | Public |
| `/categories` | Categories | Public |
| `/professionals` | Professionals | Public |
| `/professionals/:id` | ProfessionalDetail | Public |
| `/become-professional` | BecomeProfessional | Protected |
| `/jobs` | Jobs | Public |
| `/jobs/:id` | JobDetail | Public |
| `/jobs/create` | JobForm | Protected |
| `/jobs/:id/edit` | JobForm | Protected |
| `/profile` | Profile | Protected |
| `/admin` | AdminDashboard | Admin (is_staff) |
| `/faq` | FAQ | Public |

**Guards:**
- `ProtectedRoute` — checks `isAuthenticated`; redirects to `/login` with `?next=` param
- `AdminRoute` — checks `user.is_staff`; redirects to `/`

---

## Auth Flow

### Email / Password Login
1. User submits email + password on `/login`
2. `AuthContext.login()` → `POST /api/auth/login/` → `{ access, refresh }`
3. `getCurrentUser()` → `GET /api/users/me/` → full user object
4. Tokens + user saved to `localStorage`
5. Redirect to home (or `?next=` param)

### Google OAuth
1. `@react-oauth/google` returns a credential token
2. `AuthContext.googleLogin(code)` → `POST /api/users/google/` → `{ access, refresh }`
3. `getCurrentUser()` → save to `localStorage`
4. Redirect to home

### Token Refresh (Axios Interceptor)
1. Response interceptor detects `401`
2. `POST /api/auth/token/refresh/` with stored refresh token → `{ access }`
3. Retry original request with new access token
4. If refresh fails: clear `localStorage`, redirect to `/login`

### Logout
1. `AuthContext.logout()` → `POST /api/auth/logout/`
2. Clear `localStorage` (tokens + user)
3. Redirect to `/login`

---

## State Management

### AuthContext (`src/context/AuthContext.jsx`)
Single source of truth for auth; persisted to `localStorage`.

| State | Type | Description |
|---|---|---|
| `user` | Object | Full user from `/api/users/me/` |
| `tokens` | `{ access, refresh }` | JWT tokens |
| `loading` | Boolean | True during initial auth check |
| `isAuthenticated` | Boolean | Derived from tokens presence |

**Methods:** `login`, `register`, `googleLogin`, `logout`, `fetchUser`

### Page-level State
All other state (professional list, filters, job details) lives in local `useState` + `useEffect` within each page component. No Redux, no Zustand.

---

## API Layer

### Axios Client (`src/api/client.js`)
- Base URL: `VITE_API_BASE_URL` env var (default: `http://localhost:8000/api`)
- **Request interceptor:** attaches `Authorization: Bearer <access>` if token exists
- **Response interceptor:** handles 401 with silent token refresh + retry

### Endpoints (`src/api/endpoints.js`)
All HTTP calls go through named functions — never call `api` (Axios) directly from components.

```
Auth:          login, register, logout, refreshToken
Users:         getCurrentUser, getPublicUser, updateCurrentUser,
               uploadAvatar, getSocialLinks, createSocialLink, deleteSocialLink
Categories:    getCategories, getCategoryBySlug
Professionals: getProfessionals, getProfessional, createProfessionalProfile,
               updateProfessionalProfile, revealContact,
               addPortfolioImage, deletePortfolioImage
Jobs:          getJobs, getJob, getMyJobs, createJob, updateJob, deleteJob
Reviews:       getReviews, createReview, updateReview, deleteReview,
               getMyGivenReviews, getMyReceivedReviews
Contact:       submitFeedback
```

File uploads use `multipart/form-data` (avatar, portfolio images, review images).

---

## Key Features

### Professional Discovery (`Professionals.jsx`)
- URL-synced filters: `category` (slug), `city`, `is_verified`
- Full-text search across name, headline, bio
- Sort: newest / highest rated
- Paginated list (20 per page)

### Contact Reveal (`ProfessionalDetail.jsx`)
- `POST /api/professionals/<id>/contact/` → returns `{ email, phone }`
- Backend enforces 5 reveals per day per user
- Creates a `ContactReveal` record server-side

### Portfolio (`BecomeProfessional.jsx` + `ProfessionalDetail.jsx`)
- Upload up to 10 images per professional profile
- Delete individual images
- Displayed in a grid on the detail page

### Job Board (`Jobs.jsx`, `JobForm.jsx`)
- Create/edit/delete own jobs
- Filter by category, city, status
- Status toggle: open / closed

### Reviews (`ProfessionalDetail.jsx`)
- 1–5 stars + optional comment + optional image
- Anonymous option
- One review per (reviewer, reviewed_user) pair — enforced server-side
- Email notification sent to reviewed professional

### Admin Dashboard (`AdminDashboard.jsx`)
- Create professional profiles directly
- Verify / unverify professionals
- Manage categories
- View site-wide stats
- Only accessible to `user.is_staff === true`

---

## Styling

- Single `index.css` with utility classes: `.btn`, `.btn-primary`, `.btn-secondary`, `.card`, `.container`, `.avatar`, `.avatar-sm`, `.avatar-lg`
- No Tailwind, no CSS modules, no styled-components
- Inline styles only as last resort

---

## Environment Variables

| Variable | Purpose |
|---|---|
| `VITE_API_BASE_URL` | Backend API base URL |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth client ID |

---

## Build & Dev

```bash
npm run dev       # Vite dev server at http://localhost:5173
npm run build     # Production build → dist/
npm run preview   # Preview production build locally
npm run lint      # ESLint
```

---

## Data Flow (Typical Page)

```
Component mounts
  → useEffect calls endpoint function from endpoints.js
  → Axios client attaches Bearer token
  → Backend returns data (paginated JSON)
  → useState stores data
  → Component renders
```

For mutations (create/update/delete):
```
User submits form
  → call endpoint function with payload
  → on success: update local state or redirect
  → on 401: interceptor refreshes token + retries silently
  → on other error: show inline error message
```
