# Analysis & Requirements Document
## Project: AgriFlow AI

### 1. Introduction
The **AgriFlow AI** platform is designed to modernize and automate the organic food supply chain. By bridging the gap between local organic farms and consumers, it provides a unified digital marketplace equipped with subscription services, AI-driven customer interactions, and automated delivery validations. The system relies heavily on modern technological stacks to reduce administrative overhead and improve the reliability of product tracking.

---

### 2. System Analysis

#### 2.1 Problem Statement
The traditional local organic supply chain faces several key challenges:
- **Disjointed Communication:** Farmers, delivery drivers, and customers often use separate, unintegrated channels to manage orders.
- **Manual Overhead:** Managing recurring subscription orders, tracking payments, and confirming deliveries require significant manual effort.
- **Lack of Transparency:** Customers lack real-time visibility into their recurring subscriptions, leading to missed reminders and failed payments.
- **Delivery Uncertainties:** No automated mechanism exists to physically validate that delivery drivers have successfully dropped off organic produce.

#### 2.2 Proposed Solution (AgriFlow AI)
An automated, micro-packaged system featuring:
- A scalable backend system mapping business rules and payment gateways (Razorpay).
- AI orchestration (via OpenAI/Ollama) to manage WhatsApp communication and customer queries automatically.
- Cron-based scheduling system to manage periodic subscription billing and inventory generation.
- Twilio integration for automated outbound delivery confirmation calls.

---

### 3. Functional Requirements (FR)

**FR1: User & Role Management**
- The system must support role-based access control (RBAC) accommodating three primary actor types: Customer, Farmer/Admin, and Driver.
- Secure authentication must be provided via JWT (JSON Web Tokens).

**FR2: Marketplace & Subscription Processing**
- The system must provide a digital storefront for organic produce.
- Users must be able to subscribe to recurring delivery models (e.g., daily, weekly).
- The system must integrate a reliable payment processor (Razorpay) to capture and verify digital payments.

**FR3: Automated Operations & Jobs**
- The system must run scheduled background tasks (`node-cron`) to evaluate active subscriptions and generate automatic checkout states.
- The system must automatically dispatch WhatsApp/push notification reminders for low balances or upcoming deliveries.

**FR4: AI-Driven Communication**
- The platform must offer an AI prompt engine capable of responding to user queries based on context.
- The AI must process conversational inputs mapped through official integrations (e.g., WhatsApp).

**FR5: Delivery & Order Validation**
- The system must allow delivery drivers to update real-time order status via a mobile application.
- Integrating Twilio, the system must trigger automated voice validations to confirm delivery milestones.

---

### 4. Non-Functional Requirements (NFR)

**NFR1: Scalability & Modularity**
- The architecture must be structured using independent npm workspaces (API, Customer App, Admin Dashboard, AI tools, and Integrations) to allow independent scaling.

**NFR2: Performance**
- Backend endpoints ought to resolve within standard limits (<250ms) to ensure responsive mobile functionality.
- AI operations (especially local Ollama instances) must be strictly isolated to avoid clogging main thread processes.

**NFR3: Security**
- Data models must be strictly defined via PostgreSQL and Prisma schemas.
- Environmental variables (.env config) must manage sensitive access keys (OpenAI keys, Razorpay secrets, DB URLs).
- All passwords and user tokens must be encrypted (bcrypt/JWT).

**NFR4: Reliability**
- The core services must include fallback mechanisms (e.g., if Twilio voice fails, a fallback Firebase notification is pushed to the client app).

---

### 5. Tech Stack & Environment Requirements

**Software Requirements:**
- **Backend Environment:** Node.js (v18+), Express.js, TypeScript.
- **Frontend (Web):** React 19.x, Vite, modern browser support.
- **Frontend (Mobile):** React Native, Expo SDK for cross-platform (Android/iOS) builds.
- **Database:** PostgreSQL (v14+) running Prisma ORM.

**Hardware / Infrastructure Requirements:**
- **Server:** Minimum 2vCPUs, 4GB RAM to support backend processes + cron jobs.
- **AI Processing (If using local Ollama):** Specialized GPU instances or sufficient CPU overhead to handle local model inference accurately. (Can be bypassed using cloud OpenAI API).
- **Mobile Client:** Compatible with iOS 13+ and Android 8+.
