# GharKhoj — MERN Room Rental Platform

This project is the migrated GharKhoj codebase. The original Lovable/Supabase implementation has been replaced with the stack required for the college project.

## Technology stack

### Frontend
- HTML5
- CSS3
- JavaScript
- React.js
- Vite
- Tailwind CSS
- Axios
- React Router

### Backend
- Node.js
- Express.js
- REST API
- JWT authentication
- bcrypt password hashing

### Database
- MongoDB
- Mongoose

### Email
- Resend for 6-digit owner verification and forgot-password codes

### Images
- Cloudinary is supported for production image storage.
- If Cloudinary variables are not set, local development stores room images in `server/uploads`.

## Important business rules implemented

- Tenants can browse rooms and contact owners without registration.
- Only property owners create accounts.
- Owner signup requires a 6-digit email verification code.
- Owners must verify their email before logging in.
- Owners can add, edit, delete, submit and mark listings as rented.
- A listing requires at least 5 room photos and supports up to 10.
- Nearest Landmark and landmark distance are separate room fields.
- New/edited listings go through admin review.
- Only approved listings are public.
- Admin has a separate private login with no public admin registration.
- Admin forgot-password also uses a 6-digit Resend verification code.
- Forgot password sends a 6-digit code by email, then issues a one-time reset token.
- OTPs expire in 10 minutes, are hashed in MongoDB, and are rate limited.
- Favourites remain tenant-account-free and are stored in the browser.
- Contact messages and listing reports are saved to MongoDB and visible to admin.

## Folder structure

```text
src/                    React + Tailwind frontend
server/
  config/               MongoDB connection
  controllers/          API business logic
  middleware/           JWT, rate limits, image upload
  models/               Owner, Admin, Room, ContactMessage, Report
  routes/                Express routes
  services/             Resend + image storage
  scripts/              Admin seed script
```

## Setup

1. Copy `.env.example` to `.env`.
2. Add your MongoDB Atlas connection string to `MONGODB_URI`.
3. Add a long random `JWT_SECRET`.
4. Add your Resend API key and verified sender when your Resend domain is ready.
5. Optionally add Cloudinary credentials for production image storage.
6. Install dependencies:

```bash
npm install
```

7. Create the private admin account:

```bash
npm run seed:admin
```

8. Start the backend in one terminal:

```bash
npm run dev:server
```

9. Start the frontend in another terminal:

```bash
npm run dev
```

Frontend: `http://localhost:8080`
Backend: `http://localhost:5000`
Health endpoint: `http://localhost:5000/api/health`

## Main API routes

### Owner authentication
- `POST /api/auth/register`
- `POST /api/auth/verify-email`
- `POST /api/auth/resend-verification`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/forgot-password`
- `POST /api/auth/verify-reset-code`
- `POST /api/auth/resend-reset-code`
- `POST /api/auth/reset-password`

### Rooms
- `GET /api/rooms`
- `GET /api/rooms/:id`
- `GET /api/rooms/owner/mine`
- `POST /api/rooms`
- `PATCH /api/rooms/:id`
- `PATCH /api/rooms/:id/status`
- `DELETE /api/rooms/:id`

### Admin
- `POST /api/admin/login`
- `POST /api/admin/forgot-password`
- `POST /api/admin/verify-reset-code`
- `POST /api/admin/resend-reset-code`
- `POST /api/admin/reset-password`
- `GET /api/admin/stats`
- `GET /api/admin/rooms`
- `PATCH /api/admin/rooms/:id`
- `DELETE /api/admin/rooms/:id`
- `GET /api/admin/owners`
- `PATCH /api/admin/owners/:id/status`
- `GET /api/admin/messages`
- `GET /api/admin/reports`

## Resend

The code is already integrated. When your domain is verified, add:

```env
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL="GharKhoj <no-reply@gharkhoj.nischal-niraula.com.np>"
```

The Resend API key is backend-only. It is never exposed to React.

## Production image note

The local `server/uploads` fallback is for development only. Serverless hosts do not provide persistent local disk storage, so configure Cloudinary before production deployment.

## Original Lovable/Supabase code

Supabase client code, Supabase migrations, Lovable tagging, TypeScript configs and Lovable Cloud dependencies have been removed from this migrated copy. Keep your original Lovable ZIP as a backup/reference.
