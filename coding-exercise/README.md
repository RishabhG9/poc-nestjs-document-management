# 📚 NestJS Backend – User & Document Management

This is the **NestJS-based backend service** that powers user authentication, document handling, and ingestion control APIs for a document-based RAG application. This service is containerized via Docker and supports API testing through Swagger.

✅ This backend is now fully **Dockerized** and **deployed using Render.com (open-source free tier)**.

🔗 API base URL: [https://poc-nestjs-document-management.onrender.com/api](https://poc-nestjs-document-management.onrender.com/api)

🌐 Live Swagger UI: [https://poc-nestjs-document-management.onrender.com/api/docs](https://poc-nestjs-document-management.onrender.com/api/docs)

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
- ☁️ **Live deployment via Render**

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

Swagger documentation is available at:

👉 [https://poc-nestjs-document-management.onrender.com/api/docs](https://poc-nestjs-document-management.onrender.com/api/docs)

Use the Swagger UI to explore, test, and debug all available API routes with proper request bodies and response structures.

---

## 💻 How to Run the Project

### 🐳 Docker Setup

To build and run the containerized NestJS app:

```bash
# Build app first
yarn build
or
npm run build

# Build the container
docker build --no-cache -t nestjs-backend .

# Run the container
docker run -p 3000:3000 --env-file .env nestjs-backend

docker-compose up --build
```

### 🔧 Run code locally
```bash
# Install dependencies
yarn or npm i install

# Start dev server
yarn start:dev or npm run start:dev
```

### Run Test locally
```bash
yarn test or npm run test
```