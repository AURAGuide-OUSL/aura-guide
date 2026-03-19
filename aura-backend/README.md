# AURA Guide Backend

This is the Go backend for the AURA Guide application. It provides an API to fetch student details from a PostgreSQL database.

## Prerequisites

- [Go](https://go.dev/doc/install) (v1.21 or later)
- [PostgreSQL](https://www.postgresql.org/download/)

## Setup

1. **Database Setup**:
   - Create a PostgreSQL database named `aura`.
   - Run the schema and seed data from `schema.sql`:
     ```bash
     psql -d aura -f schema.sql
     ```

2. **Configuration**:
   - Set the `DATABASE_URL` environment variable if your database credentials differ from the default (`postgres://postgres:postgres@localhost:5432/aura`).
     ```bash
     export DATABASE_URL="postgres://username:password@localhost:5432/aura"
     ```

3. **Install Dependencies**:
   ```bash
   go mod tidy
   ```

## Running the Application

To start the server:
```bash
go run main.go
```
The server will start on port `8080` by default.

## API Documentation

### Get User Details
Fetches details for a specific user by email.

- **URL**: `/user`
- **Method**: `GET`
- **Query Parameters**:
  - `email`: The email address of the student.
- **Success Response**:
  - **Code**: 200 OK
  - **Content**:
    ```json
    {
      "id": 1,
      "goal_id": 1,
      "email": "testuser@example.com",
      "first_name": "Nimal",
      "last_name": "Perera",
      "degree_program": "Computer Science",
      "study_year": 3,
      "university": "University of Colombo",
      "current_score": 50,
      "recommendation": "Focus on improving debugging and communication skills"
    }
    ```

### Example Request
```bash
curl "http://localhost:8080/user?email=testuser@example.com"
```