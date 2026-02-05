# Student Management System

This is my internship selection task.

A production-style Student Management System built with Next.js App Router, TypeScript, Tailwind CSS, React Hook Form, Zod, and MongoDB.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Configure environment variables:

```bash
cp .env.example .env.local
```

Update `MONGODB_URI` in `.env.local`.

3. Run the app:

```bash
npm run dev
```

Visit `http://localhost:3000`.

## Environment Variables

- `MONGODB_URI` - MongoDB connection string.

## API Endpoints

- `GET /api/students` - List students with search, filters, and pagination.
- `POST /api/students` - Create a student.
- `GET /api/students/[id]` - Get a student by ID.
- `PATCH /api/students/[id]` - Update a student.
- `DELETE /api/students/[id]` - Soft delete a student.

All responses use a consistent envelope:

- Success: `{ ok: true, ... }`
- Error: `{ ok: false, error: { code, message, fields? } }`

## Validation Rules Summary

- Student Code: generated server-side (STU_0001, STU_0002, ...).
- First Name: required, alphabets only, min 2, max 50.
- Middle Name: optional, alphabets only if provided.
- Last Name: required, alphabets only, min 2, max 50.
- Birth Date: must be a past date.
- Address Line 1: required, min 5.
- Address Line 2: optional.
- City: required, alphabets only, min 2.
- District: required dropdown (predefined list).
- Contact Number: exactly 10 digits.
- Email: optional, unique if provided, stored lowercase + trimmed.

## Implementation Details

### Atomic Student Code

A `counters` collection stores `{ _id: "student", seq: Number }`. The server uses `findOneAndUpdate` with `$inc` and `upsert` to atomically generate the next sequence and formats it as `STU_0001`, `STU_0002`, etc.

### Soft Delete

Records include `deletedAt: Date | null`. The DELETE endpoint sets `deletedAt` to the current timestamp. List and get endpoints exclude deleted records unless `includeDeleted=true` is provided.

### Age Calculation (as of 01/01/2025)

Age is computed on the client from `birthDate` using a fixed reference date of **01/01/2025**. Age is not stored as the source of truth in the database.

## Sample cURL Commands

Create a student:

```bash
curl -X POST http://localhost:3000/api/students \
  -H "Content-Type: application/json" \
  -d '{
    "name": { "first": "Avery", "middle": "", "last": "Lee" },
    "birthDate": "2006-03-18",
    "address": {
      "line1": "12 River Street",
      "line2": "",
      "city": "Austin",
      "district": "Central"
    },
    "contactNumber": "0123456789",
    "email": "avery.lee@example.com"
  }'
```

List students:

```bash
curl "http://localhost:3000/api/students?q=avery&district=Central&page=1&limit=8"
```

Update a student:

```bash
curl -X PATCH http://localhost:3000/api/students/REPLACE_ID \
  -H "Content-Type: application/json" \
  -d '{ "contactNumber": "0987654321" }'
```

Soft delete a student:

```bash
curl -X DELETE http://localhost:3000/api/students/REPLACE_ID
```
