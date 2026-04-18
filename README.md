# Contact Hub Frontend

A React/Vite frontend for the Contact Hub professional services marketplace. This frontend consumes the Contact Hub Django REST Framework API to provide a modern web interface for discovering verified professionals, posting jobs, and leaving reviews.

## Features

- **User Authentication** — Email/password login with Google OAuth integration
- **Professional Discovery** — Browse and search verified professionals by category and location
- **Job Posting** — Clients can create and manage job postings
- **Review System** — Leave and read 1-5 star reviews for professionals
- **Profile Management** — Users can manage their professional or client profiles
- **Admin Dashboard** — Administrative interface for managing users, categories, and content
- **Responsive Design** — Works on mobile, tablet, and desktop devices

## Tech Stack

| Layer | Library |
|---|---|
| Framework | React 19 |
| Build Tool | Vite |
| State Management | React Context API |
| Routing | React Router DOM v7 |
| HTTP Client | Axios |
| UI Icons | Lucide React |
| Styling | CSS with responsive design |
| Authentication | @react-oauth/google + JWT |

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# 1. Clone the repo
git clone <repo-url>
cd professionals_frontend

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env to add your VITE_GOOGLE_CLIENT_ID

# 4. Start the development server
npm run dev
```

The frontend will be available at `http://localhost:5173` and will proxy API requests to the backend running on `http://localhost:8000`.

### Environment Variables

| Variable | Description |
|---|---|
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth client ID for authentication |

## API Integration

This frontend communicates with the Contact Hub Django REST Framework API. Make sure the backend is running and accessible at `http://localhost:8000/api/` for full functionality.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build
