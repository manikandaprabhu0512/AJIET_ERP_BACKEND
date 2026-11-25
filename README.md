# AJIET ERP Backend

## Faculty registration and login

Faculty registration is saved in MySQL through `POST /api/auth/register-faculty`.
The account is stored in `users` with a bcrypt-hashed initial password, and all
submitted registration fields (except the password) are stored in the related
`faculty_profiles` record. Faculty login uses `POST /api/auth/login` with the
Faculty Institution ID and the initial password (the Faculty Institution ID).
On first login, the account is marked for the existing password-change flow.

The authenticated faculty registration record can be fetched from
`GET /api/auth/faculty-profile` with an `Authorization: Bearer <token>` header.

## Local setup

1. Create a MySQL database and configure the values in `.env` using
   `.env.example` as a reference. Set a private `JWT_SECRET`.
2. Apply the base schema and the faculty migration:

   ```sh
   mysql -u root -p < src/models/schema.sql
   mysql -u root -p ajiet_erp < src/models/schema_faculty.sql
   ```

3. From this directory, install dependencies if needed and start the API:

   ```sh
   npm install
   npm run dev
   ```

The API listens on port `5000` by default. Configure the frontend's
`VITE_API_URL` if the backend is hosted elsewhere.
