# AURA Guide Backend

Modular Go backend for AURA Guide, featuring JWT-based authentication and a clean architectural structure.

## Architecture

The project is divided into modules, each with `api`, `service`, and `dao` layers:

- **auth-module**: Handles user registration and login (JWT).
- **user-module**: Manages user profiles and academic data.
- **skill-module & goal-module**: Manages skills, categories, and career goals.
- **common**: Shared database connection pool and authentication middleware.

## Project Structure & Layers

To maintain a clean and scalable codebase, each module (User, Auth, Skill, Goal) follows a strict layered architecture:

### 1. Global Infrastructure
- **`main.go`**: The entry point. Initializes the database, applies global middleware (logging, recovery), and wires up all module routes.
- **`common/db/db.go`**: Manages the PostgreSQL connection pool (`pgxpool`). Centralizing this ensures efficient resource usage across the app.
- **`common/middleware/auth.go`**: Implements JWT verification. It secures protected routes by validating tokens in cookies or `Authorization` headers.

### 2. Modular Layers (DAO-Service-API)
- **`api/handler.go` (API Layer)**: Handles HTTP requests/responses. It's responsible for JSON decoding, calling the service layer, and returning the correct HTTP status codes.
- **`service/service.go` (Service Layer)**: Contains the **Business Logic**. It handles rules, orchestrates DAO calls, and processes data before it reaches the API.
- **`dao/dao.go` (DAO Layer)**: Data Access Object. This layer is strictly for **SQL queries**. It interacts directly with the database and maps rows to Go structs.
- **`types.go`**: Defines the data models (structs) used throughout the module to ensure type safety and consistency.

## Setup

1. **Database**: Initialize PostgreSQL and run `psql -d aura -f schema.sql`.
2. **Environment Variables**:
   ```bash
   export DATABASE_URL="postgres://username:password@localhost:5432/aura"
   export JWT_SECRET="your_secure_secret_key"
   ```
3. **Run**:
   ```bash
   go mod tidy
   go run main.go
   ```

## APIs & Sample Curls

### 1. Signup
Create a new user profile.

- **URL**: `POST /signup`
- **Fields**: `email`, `password`, `first_name`, `last_name`, `degree_program`, `university`, `goal_id`, `study_year`

```bash
curl -X POST http://localhost:8080/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@university.edu",
    "password": "secure_password_123",
    "first_name": "John",
    "last_name": "Doe",
    "degree_program": "Software Engineering",
    "university": "University of Technology",
    "goal_id": 1,
    "study_year": 3
  }'
```

### 2. Login
Authenticate and receive a JWT in a cookie.

- **URL**: `POST /login`
- **Fields**: `email`, `password`

```bash
curl -i -X POST http://localhost:8080/login \
  -H "Content-Type: application/json" \
  -d '{"email": "john.doe@university.edu", "password": "secure_password_123"}'
```

### 3. Get User Profile
Retrieve authenticated user profile. Requires the JWT token from login.

- **URL**: `GET /user`
- **Auth**: JWT in Cookie (`token=...`) or Bearer Header

```bash
# Using Header
curl -X GET http://localhost:8080/user \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

### 4. Update Profile
Update academic or personal details.

- **URL**: `PUT /user`
- **Auth**: JWT required

```bash
curl -X PUT http://localhost:8080/user \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Johnny",
    "study_year": 4
  }'
```

### 5. Get All Skills
Retrieve a list of available skills.

- **URL**: `GET /skills`
- **Auth**: JWT required

```bash
curl -X GET http://localhost:8080/skills \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

### 6. Get Skill Categories
Retrieve a list of skill categories.

- **URL**: `GET /skill/categories`
- **Auth**: JWT required

```bash
curl -X GET http://localhost:8080/skill/categories \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

### 7. Get All Goals
Retrieve a list of career goals.

- **URL**: `GET /goals`
- **Auth**: JWT required

```bash
curl -X GET http://localhost:8080/goals \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```