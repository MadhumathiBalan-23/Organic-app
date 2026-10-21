# Problem Description & Modules Description
## Project: AgriFlow AI

---

### 1. Problem Description

The conventional local organic food supply chain suffers from systemic inefficiencies stemming from fragmented communication, reliance on manual operations, and high friction in order tracking:

- **Disjointed Communication Networks:** Farmers and local vendors lack a unified digital platform to market and communicate directly with consumers. Routine operations often depend on disparate tools (phone calls, disjointed SMS platforms, paper ledgers), preventing scalable and reliable order tracking.
- **Manual Subscription Management:** Managing recurring household needs—such as daily milk deliveries or weekly vegetable boxes—involves tracking recurring logistics manually. This lack of automation is extremely prone to human error, resulting in missed delivery collections and untraceable customer payments.
- **Lack of Delivery Traceability & Validation:** Without concrete digital delivery validations, misdeliveries or missing items remain hard to track or dispute. This opacity drastically lowers customer confidence and satisfaction.
- **High Administrative Overhead:** Business owners dedicate significant time to manually processing transactions, auditing ledgers for low customer balances, and resolving repetitive support queries, capping the growth footprint of local organic businesses.

---

### 2. Modules Description

**AgriFlow AI** addresses these core physical problems by dividing the software platform into specialized, loosely coupled modules that abstract specific logistical, data processing, and user-facing responsibilities:

#### Module 1: Backend Data Service (`/api`)
- **Role:** Centralized data orchestrator, authentication gateway, and core business logic hub.
- **Functionality:** Exposes robust RESTful API endpoints. Securely manages JSON Web Token (JWT) user authentication, overseeing role-based resource access to ensure Farmers, Drivers, and Customers only access intended data. This module communicates tightly with a relational PostgreSQL database (via Prisma ORM) to manage user instances, subscription plans, digital wallets, and inventory matrices.

#### Module 2: Mobile Interface Application (`/agriapp`)
- **Role:** The primary customer and driver interface assuring constant access to the ecosystem.
- **Functionality:** An advanced cross-platform mobile application compiled via React Native and managed with Redux. 
  - **For Customers:** It acts as a rich digital storefront to browse verified organic produce, initiate active subscriptions, view upcoming deliveries, and recharge wallet balances.
  - **For Delivery Drivers:** It provides a specialized dashboard displaying optimized daily routing logs and screen flows to register active drops and validate package delivery status.

#### Module 3: Web-Based Management Dashboard (`/agriadmin`)
- **Role:** The control surface and administration point.
- **Functionality:** Developed on a high-performance React & Vite stack, this interface serves back-office operations. It digests the API's complex data, presenting readable, interactive charts regarding real-time active subscriptions, aggregated inventory deficits (to inform harvest quotas), and global platform health. 

#### Module 4: Integrated Automations & Schedulers (`/integrations` & `/jobs`)
- **Role:** The system's proactive temporal and third-party orchestration layer.
- **Functionality:** 
  - **Cron Daemons (`node-cron`):** Continuous background services running on strict temporal mappings designed to automatically evaluate active subscription records, deduct advance wallet balances before deliveries, compile aggregate daily harvest requirements, and flag missed drop-offs automatically.
  - **Integrations Hub:** Wrappers managing secure handoffs involving Razorpay (for wallet recharges), Twilio Voice (which executes automated phone calls to confirm the delivery of high-value drops), and Firebase Cloud Messaging (for critical push notifications).

#### Module 5: AI Logic Engine (`/ai`)
- **Role:** Intelligent conversational automation layer assisting with scale without overhead.
- **Functionality:** Actively employs a unified prompt processing mechanism interfacing smoothly with high-capacity cloud models (OpenAI API) or locally hosted engines (Ollama). This logic maps specifically into supported chatbots (like WhatsApp interfaces or an in-app widget) to automatically interpret customer delivery requests, answer generic inventory queries, and fetch automated subscription adjustments, drastically minimizing manual human support interventions.
