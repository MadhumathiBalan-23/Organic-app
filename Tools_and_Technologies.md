# CHAPTER 4: TOOLS AND TECHNOLOGIES

## Project Title: AgriFlow AI
### AI-Powered Organic Produce Management & Subscription Platform

---

> **Document Type:** Technology Stack Reference  
> **Version:** 1.0  
> **Platform:** Cross-Platform (Mobile · Web · Backend · Cloud Services)

---

## Table of Contents

1. [Overview](#1-overview)
2. [Frontend Technologies](#2-frontend-technologies)
   - 2.1 Mobile Application (React Native / Expo)
   - 2.2 Web Admin Dashboard (React / Vite)
3. [Backend Technologies](#3-backend-technologies)
4. [Database & ORM](#4-database--orm)
5. [Authentication & Security](#5-authentication--security)
6. [Payment Integration](#6-payment-integration)
7. [Communication & Messaging](#7-communication--messaging)
8. [AI & Machine Learning](#8-ai--machine-learning)
9. [Task Scheduling & Automation](#9-task-scheduling--automation)
10. [State Management](#10-state-management)
11. [Development & DevOps Tools](#11-development--devops-tools)
12. [Testing Tools](#12-testing-tools)
13. [Hardware Requirements](#13-hardware-requirements)
14. [Technology Stack Summary Table](#14-technology-stack-summary-table)

---

## 1. Overview

The **AgriFlow AI Platform** is a full-stack, multi-role software ecosystem built using a carefully curated set of modern technologies. Each technology was selected to address specific challenges in the organic produce supply chain — ranging from real-time mobile delivery tracking to AI-powered customer communication and automated subscription billing.

The platform is structured as an **npm workspace monorepo** consisting of three independently deployable packages:

| Package | Directory | Technology |
|---------|-----------|------------|
| Mobile App (Customer + Driver) | `/agriapp` | React Native / Expo |
| Web Admin Dashboard | `/agriadmin` | React + Vite |
| Backend API Service | `/api` | Node.js + Express + TypeScript |

---

## 2. Frontend Technologies

### 2.1 Mobile Application — React Native & Expo

#### React Native
- **What it is:** An open-source JavaScript framework by Meta for building native mobile applications using React.
- **Version Used:** Compatible with Expo SDK 51+
- **Why Chosen:**
  - Write once, deploy on both **Android** and **iOS** platforms.
  - Native performance with actual platform UI components (not WebViews).
  - Extensive ecosystem of community libraries.
- **Key Usage in AgriFlow AI:**
  - Customer product browsing, subscription management, wallet views.
  - Driver delivery route listing and drop-off confirmation workflow.

#### Expo SDK
- **What it is:** A framework and platform built on top of React Native that simplifies development with managed workflows.
- **Version Used:** SDK 51+
- **Why Chosen:**
  - Eliminates native iOS/Android build environment complexities.
  - Provides `expo-secure-store` for encrypted JWT token storage.
  - OTA (Over-the-Air) updates without Play Store / App Store resubmission.
- **Key Modules Used:**
  - `expo-secure-store` — Secure credential storage
  - `expo-location` — Driver GPS geolocation for delivery confirmation
  - `expo-notifications` — Local and push notification support

#### React Navigation
- **What it is:** The standard routing and navigation library for React Native apps.
- **Version Used:** v6.x
- **Usage:** Role-based navigation stacks (Customer Stack, Driver Stack) with authenticated screen guarding.

---

### 2.2 Web Admin Dashboard — React & Vite

#### React
- **What it is:** A declarative, component-based JavaScript UI library by Meta.
- **Version Used:** React 19.x
- **Why Chosen:**
  - Component reusability for analytics cards, tables, and charts.
  - Rich ecosystem of UI libraries.
  - Virtual DOM efficiently handles frequent data updates (live metrics).
- **Key Usage in AgriFlow AI:**
  - Revenue dashboards with interactive charts.
  - Inventory management tables with real-time stock editing.
  - Active subscription monitoring panels.

#### Vite
- **What it is:** A next-generation frontend build tool providing extremely fast development server and optimized production builds.
- **Version Used:** Vite 5.x
- **Why Chosen:**
  - Near-instant Hot Module Replacement (HMR) during development.
  - Native ES Module support for faster browser parsing.
  - Significantly faster build times compared to Webpack-based tooling.

#### Recharts / Chart.js
- **What it is:** React-compatible charting libraries for data visualization.
- **Usage:** Revenue trend graphs, subscription breakdown pie charts, daily order volume bar charts on the Admin Dashboard.

---

## 3. Backend Technologies

### Node.js
- **What it is:** A server-side JavaScript runtime built on Chrome's V8 engine.
- **Version Used:** Node.js v18+ (LTS)
- **Why Chosen:**
  - Non-blocking, event-driven I/O — ideal for handling multiple concurrent API requests.
  - Shares the JavaScript language with the frontend for unified codebase language.
  - Massive npm ecosystem covering all required integrations.
- **Key Usage:** Hosts the Express API server, runs cron daemons, and manages all third-party SDK clients.

### Express.js
- **What it is:** A minimal and flexible Node.js web application framework providing APIs for routing and middleware.
- **Version Used:** Express v4.x
- **Why Chosen:**
  - Lightweight and unopinionated — allows tailored architecture.
  - Middleware-first design perfectly supports JWT authentication guards and role validation.
  - Fast route registration and HTTP method handling.
- **Key Middleware Used:**
  - `express-json` — Request body parsing
  - `cors` — Cross-Origin Resource Sharing configuration
  - Custom `authorizeRole()` middleware — RBAC enforcement

### TypeScript
- **What it is:** A strongly-typed superset of JavaScript developed by Microsoft.
- **Version Used:** TypeScript v5.x
- **Why Chosen:**
  - Catches type mismatches at compile time, preventing runtime errors.
  - Auto-complete and IntelliSense improve developer productivity.
  - Critical for defining strict API request/response contracts.
- **Key Usage:** Used across both `/api` backend and `/agriadmin` frontend packages.

### Zod
- **What it is:** A TypeScript-first schema declaration and runtime validation library.
- **Usage:** Validates all incoming HTTP request bodies before processing, preventing malformed or malicious payloads.

### Axios
- **What it is:** A promise-based HTTP client for Node.js and browsers.
- **Usage:** Outbound API calls to WhatsApp Graph API, Razorpay, Twilio, and OpenAI endpoints from the server.

---

## 4. Database & ORM

### PostgreSQL
- **What it is:** A powerful, open-source object-relational database system renowned for ACID compliance.
- **Version Used:** PostgreSQL v15+
- **Why Chosen:**
  - ACID transactions guarantee financial data integrity (wallet debits, orders).
  - Advanced support for complex joins (subscriptions ↔ customers ↔ products ↔ wallets).
  - Proven reliability and scalability for production workloads.
- **Key Tables:** `User`, `Product`, `Subscription`, `Order`, `Wallet`, `Transaction`, `Delivery`

### Prisma ORM
- **What it is:** A next-generation, type-safe ORM for Node.js and TypeScript.
- **Version Used:** Prisma v5.x
- **Why Chosen:**
  - Auto-generates fully typed database client — eliminates raw SQL errors.
  - Declarative `schema.prisma` file manages all table definitions and relations.
  - `prisma.$transaction()` provides atomic multi-operation database transactions essential for financial operations.
  - Built-in migration tooling (`prisma migrate dev`) for reproducible schema versioning.
- **Key Features Used:**
  ```bash
  npx prisma generate          # Generate type-safe client
  npx prisma migrate dev       # Apply schema migrations to PostgreSQL
  npx prisma studio            # Visual database browser
  ```

---

## 5. Authentication & Security

### JSON Web Tokens (JWT)
- **Library:** `jsonwebtoken` (npm)
- **What it is:** An open standard (RFC 7519) for securely transmitting information as a digitally signed JSON object.
- **Implementation:**
  - Server signs a token containing `{ userId, role }` using `HMAC-SHA256` with a server-side secret.
  - Token expires after **24 hours**.
  - Client stores token in `expo-secure-store` (mobile) or `localStorage` (web).
  - All protected API requests include the token in the `Authorization: Bearer <token>` header.

### Bcrypt
- **Library:** `bcrypt` (npm)
- **What it is:** A password hashing function designed to be computationally expensive to resist brute-force attacks.
- **Implementation:**
  - Password hash cost factor: **10 rounds**
  - Dynamic salting ensures identical passwords produce unique hashes.
  - Used at registration (hashing) and login (comparison) only — raw passwords never stored.

### Crypto (Node.js Built-in)
- **Usage:** HMAC-SHA256 signature generation and verification for Razorpay payment callback validation — prevents payment forgery.

---

## 6. Payment Integration

### Razorpay
- **What it is:** India's leading payment gateway supporting UPI, Google Pay, PhonePe, Net Banking, and Cards.
- **SDK:** `razorpay` (Node.js npm package) + Razorpay Checkout (client-side)
- **Why Chosen:**
  - Native support for Indian payment methods (UPI, RuPay).
  - Robust Sandbox environment for development testing with no real transactions.
  - Webhook support with HMAC signature verification for secure server-side validation.
- **Integration Flow in AgriFlow AI:**
  1. Server creates an order via Razorpay API → returns `order_id`
  2. Client presents Razorpay Checkout modal
  3. Customer completes payment → Razorpay returns `payment_id` + `signature`
  4. Server verifies signature using `crypto.createHmac('sha256', secret)`
  5. On success → wallet balance credited in PostgreSQL
- **Key Features Used:** Order creation, payment verification, webhook idempotency via unique `referenceId`

---

## 7. Communication & Messaging

### WhatsApp Cloud API (Meta Graph API)
- **What it is:** Meta's official Business API for programmatic WhatsApp messaging.
- **API Version:** Meta Graph API v19.0
- **Why Chosen:**
  - WhatsApp is the primary communication channel for rural and semi-urban Indian customers.
  - Supports both outbound notifications and inbound message webhooks.
  - Two-way conversational AI integration possible via webhook → AI engine → reply.
- **Usage in AgriFlow AI:**
  - **Outbound Alerts:** Subscription confirmations, low balance warnings, delivery notifications.
  - **Inbound AI Chatbot:** Customer questions parsed and answered via AI model.
  - **Webhook Endpoint:** `POST /api/whatsapp/webhook` receives inbound messages from Meta.

### Twilio Voice API
- **What it is:** A cloud communications platform providing programmable voice call capabilities.
- **SDK:** `twilio` (npm)
- **Why Chosen:**
  - Provides automated outbound voice call delivery confirmation for high-value orders.
  - Failsafe notification when WhatsApp message delivery is uncertain.
- **Usage:** When a driver confirms a drop-off, the system triggers an automated Twilio call to the customer: *"Your AgriFlow delivery has been completed. Thank you!"*

### Firebase Cloud Messaging (FCM)
- **What it is:** Google's cross-platform push notification service.
- **Usage:** Fallback push notifications if Twilio voice call fails. Sends critical alerts directly to the mobile app.

---

## 8. AI & Machine Learning

### OpenAI API (GPT-4o)
- **What it is:** OpenAI's cloud-based language model API providing access to GPT-4o.
- **Why Chosen:**
  - State-of-the-art natural language understanding for customer queries.
  - Context-aware responses when injected with real-time product inventory data.
  - Low-latency cloud inference (avg. ~1.2 seconds).
- **Usage:** Primary AI engine for WhatsApp chatbot responses.
- **Prompt Strategy:** System prompt includes current in-stock product list → user query → model generates friendly reply.

### Ollama (Local AI — LLaMA 3)
- **What it is:** A tool for running open-source large language models (LLaMA 3, Mistral) locally without cloud costs.
- **Why Chosen:**
  - Zero inference cost option for development and budget-constrained deployments.
  - Full data privacy — no customer queries sent to external servers.
  - Hot-swappable with OpenAI via a unified `queryAIModel()` abstraction.
- **Usage:** Alternate AI inference engine configurable via environment variable (`AI_PROVIDER=ollama`).

---

## 9. Task Scheduling & Automation

### node-cron
- **What it is:** A task scheduler for Node.js based on Unix cron syntax.
- **Version Used:** v3.x
- **Why Chosen:**
  - Lightweight and embedded within the Node.js process — no separate job queue infrastructure needed.
  - Full cron expression support for precise time-based scheduling.
  - `timezone` option enables IST (Asia/Kolkata) scheduling.
- **AgriFlow AI Usage:**

  | Cron Job | Schedule | Action |
  |----------|----------|--------|
  | Midnight Auto-Debit | `0 0 * * *` (IST) | Evaluate active subscriptions; debit wallets; create orders |
  | Low-Balance Reminder | `0 8 * * *` (IST) | Morning WhatsApp alert to users with insufficient wallet balance |
  | Inventory Digest | `0 6 * * *` (IST) | Compile daily harvest requirement summary for Admin |

---

## 10. State Management

### Redux Toolkit
- **What it is:** The official, opinionated toolset for Redux state management in React and React Native.
- **Version Used:** Redux Toolkit v2.x
- **Why Chosen:**
  - Eliminates Redux boilerplate with `createSlice` and `createAsyncThunk`.
  - Centralized global state for user session, cart, wallet balance, and subscription data.
  - `RTK Query` simplifies server-state caching and API data management.
- **Slices Used:**
  - `authSlice` — User session, role, JWT token
  - `cartSlice` — Shopping cart items and totals
  - `subscriptionSlice` — Active and past subscriptions
  - `walletSlice` — Balance and transaction history

---

## 11. Development & DevOps Tools

### Git & GitHub
- **Purpose:** Distributed version control and remote repository hosting.
- **Workflow:** Feature branch strategy — all features developed on dedicated branches; merged to `main` after review.

### Visual Studio Code
- **Purpose:** Primary code editor with TypeScript IntelliSense, ESLint, and Prisma extensions.
- **Key Extensions:** ESLint, Prettier, Prisma, REST Client, GitLens.

### ESLint & Prettier
- **Purpose:** Code linting (enforcing rules) and automatic code formatting for consistent style across the monorepo.

### npm Workspaces
- **Purpose:** Manages the three sub-packages (`/api`, `/agriapp`, `/agriadmin`) from a single root `package.json`, enabling shared dependency hoisting.

### Docker (Target Deployment)
- **Purpose:** Containerizes the Node.js API and PostgreSQL instances for consistent, environment-independent deployment.
- **Usage:** `docker-compose.yml` defines the API service + PostgreSQL + pgAdmin containers.

### pgAdmin 4
- **Purpose:** GUI-based PostgreSQL database administration — used for schema inspection, query testing, and data verification during development.

### Postman
- **Purpose:** API development and testing tool — used to test, document, and share REST API endpoint collections.

---

## 12. Testing Tools

| Tool | Category | Purpose |
|------|----------|---------|
| **Jest** | Unit / Integration Testing | Test runner and assertion framework for Node.js / TypeScript backend |
| **React Native Testing Library** | Component Testing | Renders and tests React Native components in isolation |
| **Supertest** | Integration Testing | HTTP assertion library for Express route testing |
| **Postman Collection Runner** | API Testing | Automated API test execution across all endpoints |
| **Artillery** | Performance / Load Testing | Simulates concurrent users and measures API throughput and latency |
| **OWASP ZAP** | Security Testing | Automated vulnerability scanning for common web security threats |
| **Expo Go** | Device Testing | Live app preview on physical Android and iOS devices |
| **Chrome DevTools** | Performance Profiling | Web admin dashboard performance and network analysis |

---

## 13. Hardware Requirements

### Development Environment

| Component | Minimum Specification |
|-----------|----------------------|
| Processor | Intel Core i5 / AMD Ryzen 5 (8th Gen+) |
| RAM | 16 GB DDR4 |
| Storage | 256 GB SSD (NVMe preferred) |
| OS | Windows 10/11, Ubuntu 20.04+, or macOS 12+ |
| Internet | Stable broadband (for API sandbox testing) |

### Mobile Testing Devices

| Platform | Minimum OS Version |
|----------|--------------------|
| Android | Android 9.0 (API Level 28) |
| iOS | iOS 14.0 |

### Production Server (Target Deployment)

| Component | Specification |
|-----------|---------------|
| CPU | 4 vCPUs |
| RAM | 8 GB |
| Storage | 80 GB SSD |
| OS | Ubuntu 22.04 LTS |
| Database | PostgreSQL 15 (co-located or managed cloud) |

### AI Processing (Ollama — Local Inference)

| Component | Specification |
|-----------|---------------|
| CPU | 8-core CPU (minimum for LLaMA 3 8B) |
| RAM | 16 GB+ (32 GB recommended for larger models) |
| GPU (Optional) | NVIDIA GPU with CUDA support for faster inference |
| Alternative | Cloud OpenAI API — bypasses local hardware requirement entirely |

---

## 14. Technology Stack Summary Table

| Layer / Domain | Technology | Version | Role |
|----------------|-----------|---------|------|
| **Mobile Frontend** | React Native + Expo SDK | SDK 51+ | Customer & Driver mobile app |
| **Web Frontend** | React + Vite | React 19.x, Vite 5.x | Admin dashboard |
| **State Management** | Redux Toolkit | v2.x | Global client state |
| **Backend Framework** | Node.js + Express.js | Node v18+, Express v4.x | REST API server |
| **Language** | TypeScript | v5.x | Type-safe full-stack development |
| **Input Validation** | Zod | v3.x | Request body schema enforcement |
| **HTTP Client** | Axios | v1.x | Outbound third-party API calls |
| **Routing (Mobile)** | React Navigation | v6.x | Screen navigation and auth guarding |
| **Database** | PostgreSQL | v15+ | Relational ACID data persistence |
| **ORM** | Prisma ORM | v5.x | Type-safe DB access & migrations |
| **Authentication** | JSON Web Tokens (JWT) | RFC 7519 | Stateless session tokens |
| **Password Security** | Bcrypt | v5.x | Salted password hashing |
| **Payment Gateway** | Razorpay | REST API v1 | UPI, wallet top-up, webhooks |
| **Messaging (WhatsApp)** | WhatsApp Cloud API | Meta Graph v19.0 | Chatbot & notification dispatch |
| **Voice Calls** | Twilio Voice API | REST API | Automated delivery confirmation calls |
| **Push Notifications** | Firebase Cloud Messaging | v9.x | Fallback mobile push alerts |
| **AI Language Model** | OpenAI API (GPT-4o) | v1 | Cloud NLP for chatbot responses |
| **Local AI (Alternate)** | Ollama (LLaMA 3) | v0.x | On-premise AI inference |
| **Task Scheduling** | node-cron | v3.x | Midnight auto-debit daemon |
| **UI Charts** | Recharts / Chart.js | Latest | Admin revenue & analytics charts |
| **Testing** | Jest + Supertest | Latest | Unit & integration test suite |
| **Security Scanner** | OWASP ZAP | v2.x | Vulnerability assessment |
| **Load Testing** | Artillery | v2.x | API performance benchmarking |
| **Version Control** | Git + GitHub | - | Source control & collaboration |
| **Code Editor** | Visual Studio Code | Latest | Development IDE |
| **API Testing** | Postman | Latest | Endpoint testing & documentation |
| **DB Admin** | pgAdmin 4 | Latest | PostgreSQL GUI management |
| **Containerization** | Docker + Compose | Latest | Deployment containerization |

---

*End of Chapter 4: Tools and Technologies*

---

> **Document Owner:** AgriFlow AI Development Team  
> **Version:** 1.0  
> **Date:** October 2026
