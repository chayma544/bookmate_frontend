# BookMate

BookMate is a modern book borrowing and exchange platform built with a React + Tailwind frontend and a Next.js + Prisma backend.

## Structure

- `src/` - React frontend
- `backend/` - Next.js API routes, Prisma schema, and auth services

## Run

Frontend:

```bash
npm install
npm run dev
```

Backend:

```bash
cd backend
npm install
npm run dev
```

## Environment

Frontend: set `VITE_API_URL` to the backend API base URL.
If you want book covers to upload directly from the frontend, also set `VITE_CLOUDINARY_CLOUD_NAME` and `VITE_CLOUDINARY_UPLOAD_PRESET` for an unsigned Cloudinary upload.
Backend: set `DATABASE_URL` and `JWT_SECRET`.
