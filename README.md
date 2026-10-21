# AgriFlow AI: AI-Powered Organic Product Management & Delivery Platform

AgriFlow AI is a production-style platform integrating organic marketplaces, customer subscriptions, automated advance payments, WhatsApp business logic, and automated local voice delivery validations.

## Complete Platform Architecture

AgriFlow AI is structured into independent micro-packages under an npm workspace layout:

- **`/api`**: Backend express/TypeScript REST endpoint controller. Configured for role authorization and database communication.
- **`/app`**: Mobile client built on React Native & Redux (targeting Android and iOS).
- **`/admin`**: Responsive web control dashboard built with Vite and React.
- **`/ai`**: Dedicated prompt engines and interface services for OpenAI API or local Ollama.
- **`/integrations`**: Wrapper services isolating Twilio Voice, WhatsApp messages, Firebase Notifications, and Razorpay.
- **`/jobs`**: Daemon system containing cron schedulers tracking subscription checkouts, reminders, and inventory reports.
- **`/database`**: Houses schema layout rules and database migration models.
- **`/docs`**: General documents explaining flow workflows.

---

## Technical Overview

- **REST API**: Node.js/Express.js, TypeScript, JSON Web Tokens (JWT).
- **Database Layer**: PostgreSQL database mapped via Prisma Client ORM.
- **Payment Engine**: Razorpay (Test mode enabled).
- **AI Processing**: OpenAI API endpoints or Local Ollama LLM hosting.
- **Task Orchestration**: Scheduled processes mapped with `node-cron`.

---

## Phase 1 Verification

The project root is configured with workspace settings.
To run the server development baseline:

1. Navigate to the backend directory:
   ```bash
   cd api
   ```
2. Install npm requirements:
   ```bash
   npm install
   ```
3. Run the development server build check:
   ```bash
   npm run dev
   ```
4. Verify the server logs status, and check the public server link:
   ```bash
   http://localhost:5000/api/health
   ```
