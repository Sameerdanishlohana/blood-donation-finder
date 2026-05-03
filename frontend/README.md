# BloodLink Frontend

React + Vite frontend for the Blood Donation API.

## Setup

```bash
cd bloodlink-frontend
npm install
cp .env.example .env
npm run dev
```

Open http://localhost:5173

## API Endpoints Used

| Page | Method | Endpoint |
|------|--------|----------|
| Register | POST | `/api/auth/donor/register` |
| Login | POST | `/api/auth/donor/login` |
| Blood Groups | GET | `/api/auth/blood-groups` |
| Cities | GET | `/api/auth/cities` |
| Search Donors | GET | `/api/donors/search?blood_type=&city_name=` |
| My Profile | GET | `/api/donors/profile` |
| Toggle Availability | PUT | `/api/donors/availability` |

## Pages

- **Home** — Landing page with stats and blood type compatibility chart
- **Register** — 2-step donor registration form (account → blood & location)
- **Login** — Donor sign-in with JWT storage
- **Search** — Public donor search by blood type + city
- **Profile** — Authenticated donor dashboard with availability toggle

## Auth

JWT token stored in `localStorage` as `bl_token`.  
All protected routes send `Authorization: Bearer <token>` header.

## Make sure your Express backend has CORS enabled:

```js
import cors from 'cors';
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
```
