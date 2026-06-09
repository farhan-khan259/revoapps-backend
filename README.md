# Creative Imprints Backend

## Setup

1. Copy `.env.example` to `.env` and fill in values.
2. Install dependencies:
   ```bash
   cd revoapps-backend
   npm install
   ```
3. Start the backend:
   ```bash
   npm run dev
   ```
4. Seed the default admin user and website settings:
   ```bash
   npm run seed
   ```

## API endpoints

- `POST /api/auth/login`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`
- `POST /api/auth/change-password`
- `GET /api/auth/profile`
- `GET /api/content/page/:page`
- `POST /api/content`
- `PUT /api/content/:id`
- `GET /api/settings`
- `POST /api/settings`
- `GET /api/media`
- `POST /api/media/upload`
- `GET /api/forms`
- `POST /api/forms/contact`
- `GET /api/seo`

## Notes

Use the seeded admin credentials from `.env` for first login.
# revoapps-backend-
# revoapps-backend
# revoapps-backend
