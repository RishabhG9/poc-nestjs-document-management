# 📚 NestJS Backend – User & Document Management

This is the **NestJS-based backend service** that powers user authentication, document handling, and ingestion control APIs for a document-based RAG application. This service is containerized via Docker and supports API testing through Swagger.

---

## 🚀 Project Overview

This backend manages:

- 🔐 **Authentication** (JWT + Roles)
- 👥 **User Management** (Admin control over roles & permissions)
- 📄 **Document Uploads** (with Cloudinary)
- ⚙️ **Ingestion Process APIs** (simulated, no Python required)
- 🧪 **Testing** with Jest
- 🐳 **Dockerized** for deployment
- 🔎 **Swagger UI** for API documentation

---

## ⚙️ Tech Stack & Tools

| Feature                     | Description                                      |
|----------------------------|--------------------------------------------------|
| 🔧 Framework               | [NestJS](https://nestjs.com/)                    |
| 💬 Language                | TypeScript                                       |
| 🧱 Structure               | Scalable modular folders (DTOs, Entities)        |
| 🛡 Auth                    | JWT + Role-based Guarding (`admin`, `editor`, `viewer`) |
| 🧮 Database                | PostgreSQL (via **Supabase**)                   |
| ☁️ File Storage           | Cloudinary (for document uploads)               |
| 🐳 Containerization       | Dockerfile + `docker-compose.yml`               |
| 🧪 Testing                 | Jest (unit tests included)                      |
| 🔍 Docs                   | Swagger (auto-generated OpenAPI)                |

---

## 📁 Modules & API Endpoints

### 🔐 Authentication

| Method | Endpoint              | Description                |
|--------|------------------------|----------------------------|
| POST   | `/api/auth/register`   | Register a new user        |
| POST   | `/api/auth/login`      | Login & get JWT token      |
| POST   | `/api/auth/logout`     | Logout user                |

---

### 👥 Users (Admin Access Only)

| Method | Endpoint             | Description                     |
|--------|----------------------|---------------------------------|
| GET    | `/api/users`         | List all users with pagination |
| GET    | `/api/users/{id}`    | Get user by ID                 |
| PATCH  | `/api/users/{id}`    | Update user info or role       |

---

### 📄 Documents

| Method | Endpoint                    | Description                         |
|--------|-----------------------------|-------------------------------------|
| POST   | `/api/documents/upload`     | Upload document to Cloudinary      |
| GET    | `/api/documents`            | List all documents (paginated)     |
| PATCH  | `/api/documents/{id}`       | Update document filename           |
| DELETE | `/api/documents/{id}`       | Delete document by ID              |

---

### ⚙️ Ingestion Process

| Method | Endpoint                               | Description                           |
|--------|----------------------------------------|---------------------------------------|
| POST   | `/api/ingestion/trigger`               | Trigger ingestion (mocked)            |
| GET    | `/api/ingestion`                       | List ingestion jobs (paginated)       |
| GET    | `/api/ingestion/{id}`                  | Get ingestion job details             |
| DELETE | `/api/ingestion/{id}`                  | Cancel ingestion (Admin only)         |
| PATCH  | `/api/ingestion/{id}/status`           | Update ingestion status (Admin only)  |

---

## 🧪 Testing APIs via Swagger

> Swagger documentation is available at:


http://localhost:3000/api


Use the Swagger UI to explore, test, and debug all available API routes with proper request bodies and response structures.

---

## 🧰 Third-Party Packages Used

- `@nestjs/jwt`, `@nestjs/passport`, `passport-jwt`
- `@nestjs/swagger`, `swagger-ui-express`
- `typeorm` – ORM for PostgreSQL (via Supabase)
- `multer`, `multer-storage-cloudinary` – File uploads
- `cloudinary` – Cloud storage for documents
- `dotenv` – Environment configuration
- `express` – Underlying HTTP framework
- `jest`, `ts-jest` – Unit testing
- `prettier` – Code formatting
- `docker`, `docker-compose`
- `typescript`

---

## 🐳 Docker Setup

To build and run the containerized NestJS app:

```bash
# Build the container
docker build -t nestjs-backend .

# Run the container
docker run -p 3000:3000 nestjs-backend

docker-compose up --build

# Install dependencies
yarn install

# Run in dev mode
yarn start:dev

# Run tests
yarn test
