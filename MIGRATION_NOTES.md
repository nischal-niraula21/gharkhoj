# Migration Notes

## Replaced
- TypeScript/TSX -> JavaScript/JSX
- Supabase Auth -> Express + MongoDB + JWT + bcrypt
- Supabase PostgreSQL rooms -> MongoDB/Mongoose Room model
- Supabase Storage -> Cloudinary support with local development fallback
- Supabase owner/admin roles -> separate Owner and Admin MongoDB models
- Supabase reset-link flow -> Resend 6-digit verification code flow
- Public admin-signup pattern -> private seeded admin account
- Combined address/landmark field -> separate address, landmark and distance fields
- Maximum-five-photo behavior -> minimum 5 photos, maximum 10 photos

## Added
- Owner email verification with 6-digit code
- Owner forgot-password OTP flow
- Admin forgot-password OTP flow
- One-time reset tokens after OTP verification
- OTP expiry, retry limit and resend cooldown
- Owner dashboard and listing management
- Expanded room schema and filters
- Contact messages stored in MongoDB
- Listing reports stored in MongoDB
- Admin listing moderation, owner management, messages and reports
- Axios REST API client

## Preserved
- Existing GharKhoj visual theme
- React + Tailwind public pages
- Home/About/Contact/Favourites experience
- Tenant browsing without login
- Browser-local favourites
- English/Nepali toggle and existing translations, with added translations for the new owner flow
