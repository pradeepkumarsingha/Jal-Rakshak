# 🌊 Jal Rakshak Backend API

> **AI-Powered Flood Intelligence & Emergency Response Platform for India**

Production-ready backend service built with **Express.js**, **MongoDB & Mongoose (with GeoJSON 2dsphere indexing)**, **JWT Authentication**, **Multer/Cloudinary Storage**, **Winston Logging**, **Redis Caching**, and **FastAPI AI Integration**.

---

## 🏗️ Architecture & Tech Stack

- **Runtime**: Node.js v18+ & Express.js v4
- **Database**: MongoDB v6+ with Mongoose ODM & Geospatial 2dsphere Indexing
- **Authentication**: JWT (JSON Web Tokens) with 15-min Access Tokens & 30-day Refresh Tokens
- **Password Security**: `bcryptjs` salted hashing
- **File Uploads**: `multer` with Cloudinary cloud storage
- **AI Microservice**: Axios client integrating with Python FastAPI (XGBoost, YOLOv8, LangChain RAG)
- **Validation**: `express-validator` v7
- **Security**: `helmet`, `cors`, `express-rate-limit`
- **Logging**: Structured `winston` file & console logging with `morgan` HTTP stream
- **Testing**: `jest` & `supertest` with in-memory MongoDB

---

## 📁 Folder Structure

```
jal-rakshak-backend/
├── src/
│   ├── config/
│   │   ├── database.js          # MongoDB connection with auto-retry
│   │   ├── redis.js             # Redis client with in-memory fallback
│   │   ├── cloudinary.js        # Cloudinary SDK & Multer storage
│   │   └── index.js
│   │
│   ├── models/
│   │   ├── User.js              # User schema with GeoJSON point & bcrypt
│   │   ├── FloodPrediction.js   # Flood risk score & hydrograph forecast
│   │   ├── Shelter.js           # Relief shelter with capacity & facilities
│   │   ├── EmergencyRequest.js  # SOS distress beacon with triage scoring
│   │   ├── CitizenReport.js     # Crowd hazard reports & AI image depth
│   │   ├── RescueTeam.js        # Tactical rescue squads (NDRF/ODRAF/SDRF)
│   │   ├── Alert.js             # Multilingual emergency alerts (EN/HI/OR)
│   │   ├── ChatSession.js       # AI chat history & session records
│   │   └── index.js
│   │
│   ├── controllers/
│   │   ├── authController.js    # Register, login, refresh, profile, logout
│   │   ├── floodController.js   # Predict risk, 24h forecast, telemetry
│   │   ├── gisController.js     # Risk zones, safe route pathfinder
│   │   ├── shelterController.js # Relief shelter locator & capacity update
│   │   ├── reportController.js  # Citizen reports & AI photo depth analysis
│   │   ├── emergencyController.js # SOS triage, team dispatch, mission status
│   │   ├── rescueController.js  # Tactical team status & assignments
│   │   ├── assistantController.js # AI advisor chat endpoint
│   │   ├── adminController.js   # Command center KPIs, broadcast alerts
│   │   └── index.js
│   │
│   ├── routes/
│   │   ├── auth.js              # /api/v1/auth/*
│   │   ├── flood.js             # /api/v1/flood/*
│   │   ├── gis.js               # /api/v1/gis/*
│   │   ├── shelters.js          # /api/v1/shelters/*
│   │   ├── reports.js           # /api/v1/reports/*
│   │   ├── emergency.js         # /api/v1/emergency/*
│   │   ├── rescue.js            # /api/v1/rescue/*
│   │   ├── assistant.js         # /api/v1/assistant/* & /api/chat
│   │   ├── admin.js             # /api/v1/admin/*
│   │   └── index.js
│   │
│   ├── middleware/
│   │   ├── auth.js              # JWT verification middleware
│   │   ├── roleCheck.js         # Multi-role access control (citizen, admin, rescue)
│   │   ├── validation.js        # express-validator result handler
│   │   ├── errorHandler.js      # Global error handler & ErrorResponse class
│   │   ├── rateLimiter.js       # API & Auth rate limiters
│   │   ├── upload.js            # Multer image upload handler (5MB limit)
│   │   └── index.js
│   │
│   ├── services/
│   │   ├── aiService.js         # FastAPI client + heuristic fallback
│   │   ├── priorityService.js   # Triage scoring algorithm (0-100)
│   │   ├── geospatialService.js # Haversine formula & safe route generator
│   │   ├── emailService.js      # Nodemailer alert dispatch
│   │   ├── smsService.js        # Emergency SMS gateway
│   │   ├── notificationService.js # Multi-channel broadcast dispatcher
│   │   └── index.js
│   │
│   ├── utils/
│   │   ├── jwt.js               # Sign & verify access/refresh tokens
│   │   ├── password.js          # bcryptjs hashing and comparison
│   │   ├── helpers.js           # Standardized API responses
│   │   ├── constants.js         # Enums, roles, severities, river gauges
│   │   ├── validators.js        # Input validation helpers
│   │   ├── logger.js            # Winston structured logger
│   │   └── index.js
│   │
│   ├── scripts/
│   │   ├── seedAll.js           # Master database seeder
│   │   ├── seedAdmin.js         # Seed admin persona
│   │   ├── seedUsers.js         # Seed citizen & rescue personas
│   │   ├── seedShelters.js      # Seed verified relief shelters
│   │   └── clearDatabase.js     # Reset database utility
│   │
│   └── server.js                # Express app initialization & server entry
│
├── tests/
│   ├── auth.test.js             # Authentication tests
│   ├── flood.test.js            # Flood prediction & GIS tests
│   ├── emergency.test.js        # Emergency SOS tests
│   └── setup.js                 # MongoMemoryServer test setup
│
├── .env.example
├── Dockerfile
├── docker-compose.yml
└── package.json
```

---

## ⚡ Quick Start

### 1. Install Dependencies
```bash
cd jal-rakshak-backend
npm install
```

### 2. Configure Environment
Copy `.env.example` to `.env` and adjust variables as needed:
```bash
cp .env.example .env
```

### 3. Seed Database
Populate demo users, shelters, rescue squads, SOS emergencies, and alerts:
```bash
npm run seed
```

### 4. Start Development Server
```bash
npm run dev
```
The server will start at `http://localhost:5000`.

---

## 🔑 Demo Personas

| Role | Email | Password | Description |
|------|-------|----------|-------------|
| **Citizen** | `ramesh.citizen@jalrakshak.org` | `password123` | Resident of Bidanasi, Cuttack |
| **Admin** | `anita.src@odisha.gov.in` | `password123` | Special Relief Commissioner (SRC) |
| **Rescue** | `vikram.ndrf@gov.in` | `password123` | Commander, 03rd NDRF Battalion |

---

## 📡 API Reference Summary

### Authentication (`/api/v1/auth`)
- `POST /register` - Register a new citizen/rescue user
- `POST /login` - User login (returns JWT token & refresh token)
- `POST /refresh` - Refresh access token
- `GET /me` - Get logged-in user profile (`Bearer <token>`)
- `PUT /profile` - Update user profile
- `POST /logout` - Log out and invalidate refresh token

### Flood Prediction & Telemetry (`/api/v1/flood`)
- `POST /predict` - Calculate flood risk index for given coordinates
- `GET /forecast` - 24-hour predictive inundation timeline
- `GET /risk/:location` - Get risk score by location name (e.g. `Cuttack`)
- `GET /rivers` - Live telemetry for Mahanadi, Brahmani, Baitarani, Ganga, Yamuna
- `GET /history` - Historical flood risk records

### GIS & Safe Route (`/api/v1/gis`)
- `GET /risk-map` - Multi-tier risk polygon geo-coordinates
- `GET /shelters` - Shelters geo-points
- `POST /safe-route` - AI pathfinder avoiding submerged roads
- `GET /distance` - Haversine distance calculator

### Relief Shelters (`/api/v1/shelters`)
- `GET /` - List shelters with vacancy & facility filters
- `GET /nearby` - Find nearest shelters sorted by distance
- `GET /:id` - Get shelter details
- `POST /` - Add shelter (*Admin*)
- `PATCH /:id` - Update current occupancy & status (*Admin/Rescue*)
- `DELETE /:id` - Delete shelter (*Admin*)

### Citizen Reports (`/api/v1/reports`)
- `POST /` - Submit crowd-sourced flood hazard report with photo
- `GET /` - List all reports
- `GET /:id` - Get report details
- `POST /:id/verify` - Approve / Reject / Escalate report (*Admin/Rescue*)
- `POST /analyze-image` - Computer vision image depth analysis

### Emergency SOS (`/api/v1/emergency`)
- `POST /request` - Dispatch SOS distress beacon with automated priority score
- `GET /requests` - Master triage queue
- `GET /:id` - Get SOS incident details
- `POST /:id/assign` - Dispatch tactical rescue team (*Admin/Rescue*)
- `PATCH /:id/status` - Transition status (`DISPATCHED` → `ON_SCENE` → `RESCUED` → `CLOSED`)

### Rescue Operations (`/api/v1/rescue`)
- `GET /teams` - List tactical rescue units and readiness
- `POST /teams` - Register new rescue squad (*Admin*)
- `PUT /teams/:id` - Update squad location & mission
- `GET /assignments` - List active rescue missions

### AI Assistant (`/api/v1/assistant` & `/api/chat`)
- `POST /chat` - Multilingual conversational flood advisor (NDMA/CWC citations)
- `GET /sessions` - Retrieve past conversation sessions

### Admin Command Center (`/api/v1/admin`)
- `GET /dashboard` - Master KPI metrics
- `GET /analytics` - Hydrographs & response time analytics
- `POST /alerts/broadcast` - Broadcast emergency alert (Siren / Push / SMS / Email)
- `GET /users` - User management table
- `GET /reports/pending` - Pending report triage queue

---

## 🧪 Testing

Run test suite:
```bash
npm test
```

---

## 🐳 Docker Deployment

Run complete stack (Backend + MongoDB + Redis):
```bash
docker-compose up -d --build
```
