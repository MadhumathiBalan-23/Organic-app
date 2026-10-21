# CHAPTER 5: SYSTEM IMPLEMENTATION
## Project Title: AgriFlow AI (AI-Powered Organic Produce Management & Subscription Platform)

---

## 5.1 INTRODUCTION TO IMPLEMENTATION
The implementation phase is the critical stage in software engineering where theoretical system designs, UML diagrams, and algorithmic specifications are translated into a functional, executable software ecosystem. For **AgriFlow AI**, the implementation encompasses developing a modular, multi-package architecture featuring:
- A cross-platform mobile client for customers and field drivers (**React Native / Expo**),
- A real-time web administration dashboard (**React / Vite**),
- A high-performance RESTful API service (**Node.js / Express / TypeScript**),
- A relational database persistence layer (**PostgreSQL / Prisma ORM**), and
- Specialized cloud connectors for **Razorpay** (payments), **WhatsApp Cloud API** (customer communication), **OpenAI / Ollama** (conversational AI), and **Twilio** (automated voice validation).

---

## 5.2 IMPLEMENTATION ENVIRONMENT & TECH STACK

### 5.2.1 Hardware Environment
- **Development Workstation:** Intel Core i5 / AMD Ryzen 5 or higher, 16 GB DDR4 RAM, 512 GB NVMe SSD.
- **Mobile Testing Devices:** Android 9.0+ and iOS 14.0+ smartphones for mobile application validation.
- **Production Server (Target Deployment):** Ubuntu Linux 22.04 LTS, 4 vCPUs, 8 GB RAM, Cloud Hosted.

### 5.2.2 Software Environment & Technologies
| Layer / Domain | Technology Used | Version / Specification | Purpose in AgriFlow AI |
| :--- | :--- | :--- | :--- |
| **Mobile Front-end** | React Native / Expo SDK | SDK 51+ | Cross-platform mobile application for Customers and Drivers. |
| **Web Front-end** | React, Vite | React 19.x, Vite 5.x | Responsive administration portal for inventory & sales analytics. |
| **State Management** | Redux Toolkit | v2.x | Centralized global client-side state management. |
| **Backend Framework** | Node.js / Express | Node.js v18+, Express v4.x | RESTful API server handling business logic and routing. |
| **Language** | TypeScript | v5.x | Strict type safety across client and server packages. |
| **Database** | PostgreSQL | v15+ | Relational ACID-compliant persistent database storage. |
| **ORM / Data Access** | Prisma ORM | v5.x | Database modeling, schema migrations, and type-safe queries. |
| **Payment Gateway** | Razorpay SDK | REST API v1 | Digital wallet top-ups, UPI payments, and webhooks. |
| **Messaging Gateway** | WhatsApp Cloud API | Meta Graph API v19.0 | Automated dispatch alerts and conversational AI assistant. |
| **AI Inference** | OpenAI API / Ollama | GPT-4o / LLaMA 3 | Natural language product recommendations and query parsing. |
| **Voice Services** | Twilio Voice API | REST API | Outbound automated delivery confirmation phone calls. |
| **Task Scheduler** | node-cron | v3.x | Midnight cron daemon for automated subscription auto-debit. |

---

## 5.3 MODULE IMPLEMENTATION DETAILS & ALGORITHMS

### 5.3.1 Module 1: Authentication & Role-Based Access Control (RBAC)
- **Role Segregation:** Restricts routes based on user classifications: `CUSTOMER`, `FARMER`, `DRIVER`, and `ADMIN`.
- **Implementation Strategy:**
  1. Passwords are salted and hashed using **Bcrypt** (cost factor: 10) prior to database persistence.
  2. Upon successful credential verification, the server generates a signed **JSON Web Token (JWT)** containing the `userId` and `role`.
  3. Client applications store the token in secure storage (`Expo SecureStore` for mobile, `localStorage` for web).
  4. An Express middleware intercepts incoming requests to validate the Bearer token before routing to protected controllers.

```typescript
// Sample Implementation: JWT Verification & RBAC Middleware
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface AuthPayload {
  userId: string;
  role: 'CUSTOMER' | 'FARMER' | 'DRIVER' | 'ADMIN';
}

export const authorizeRole = (requiredRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Access denied. Missing auth token.' });
    }

    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as AuthPayload;
      if (!requiredRoles.includes(decoded.role)) {
        return res.status(403).json({ error: 'Forbidden: Insufficient privileges.' });
      }
      (req as any).user = decoded;
      next();
    } catch (err) {
      return res.status(401).json({ error: 'Invalid or expired session token.' });
    }
  };
};
```

---

### 5.3.2 Module 2: Recurring Subscription & Midnight Auto-Debit Engine
- **Purpose:** Automatically manages recurring deliveries without demanding customer manual checkout every morning.
- **Algorithmic Flow (Midnight Daemon):**
  1. At `00:00:00` daily, the `node-cron` daemon triggers the subscription evaluation task.
  2. Queries all subscriptions where `status == 'ACTIVE'` and `next_delivery_date <= TODAY`.
  3. For each active subscription, verifies the customer's digital wallet balance.
  4. If sufficient: Debits the item cost from the wallet, inserts an immutable `Transaction` record, creates an `Order` entry, advances `next_delivery_date` to the next cycle, and sends a WhatsApp confirmation.
  5. If insufficient: Marks subscription as `PAYMENT_PENDING` and triggers an urgent WhatsApp reminder: *"Please top up your wallet to resume daily milk delivery."*

```typescript
// Sample Implementation: Midnight Cron Subscription Auto-Debit Daemon
import cron from 'node-cron';
import { PrismaClient } from '@prisma/client';
import { sendWhatsAppMessage } from '../integrations/whatsapp';

const prisma = new PrismaClient();

// Runs every day at 00:00:00 (Midnight)
cron.schedule('0 0 * * *', async () => {
  console.log('[Cron Daemon]: Initiating Midnight Subscription Auto-Debit Run...');
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const activeSubs = await prisma.subscription.findMany({
    where: {
      status: 'ACTIVE',
      nextDeliveryDate: { lte: today }
    },
    include: { product: true, customer: { include: { wallet: true } } }
  });

  for (const sub of activeSubs) {
    const cost = sub.product.price;
    const wallet = sub.customer.wallet;

    if (wallet && wallet.balance >= cost) {
      // Execute Atomic Database Transaction
      await prisma.$transaction([
        prisma.wallet.update({
          where: { id: wallet.id },
          data: { balance: { decrement: cost } }
        }),
        prisma.transaction.create({
          data: {
            walletId: wallet.id,
            amount: cost,
            type: 'DEBIT_SUBSCRIPTION',
            referenceId: `SUB-${sub.id}-${Date.now()}`
          }
        }),
        prisma.order.create({
          data: {
            customerId: sub.customerId,
            totalAmount: cost,
            orderType: 'SUBSCRIPTION_DROP',
            status: 'PLACED'
          }
        }),
        prisma.subscription.update({
          where: { id: sub.id },
          data: { nextDeliveryDate: calculateNextDate(sub.frequency, today) }
        })
      ]);

      await sendWhatsAppMessage(
        sub.customer.phoneNumber,
        `✅ Good Morning! Your daily ${sub.product.title} has been scheduled for delivery.`
      );
    } else {
      await prisma.subscription.update({
        where: { id: sub.id },
        data: { status: 'PAYMENT_PENDING' }
      });
      await sendWhatsAppMessage(
        sub.customer.phoneNumber,
        `⚠️ Low Wallet Balance: Please recharge your AgriFlow wallet to continue receiving your ${sub.product.title}.`
      );
    }
  }
});

function calculateNextDate(frequency: string, baseDate: Date): Date {
  const next = new Date(baseDate);
  if (frequency === 'DAILY') next.setDate(next.getDate() + 1);
  else if (frequency === 'ALTERNATE_DAYS') next.setDate(next.getDate() + 2);
  else if (frequency === 'WEEKLY') next.setDate(next.getDate() + 7);
  return next;
}
```

---

### 5.3.3 Module 3: Digital Wallet & Razorpay Payment Integration
- **Implementation Strategy:**
  1. The client requests a payment intent via `POST /api/wallet/topup` with the desired top-up amount.
  2. The server creates an order on Razorpay using the Razorpay Node SDK.
  3. Razorpay returns an `order_id`. The client opens the Razorpay Checkout SDK (supporting UPI, Google Pay, PhonePe, Cards).
  4. On completion, Razorpay returns `razorpay_payment_id` and `razorpay_signature`.
  5. The server calculates an HMAC-SHA256 signature and verifies authenticity before crediting the wallet ledger.

```typescript
// Sample Implementation: Razorpay Payment Signature Verification
import crypto from 'crypto';
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const verifyRazorpayPayment = async (req: Request, res: Response) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, amount, userId } = req.body;

  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  if (expectedSignature !== razorpay_signature) {
    return res.status(400).json({ success: false, message: 'Invalid payment signature. Transaction rejected.' });
  }

  // Credit user wallet in PostgreSQL
  const updatedWallet = await prisma.wallet.update({
    where: { userId },
    data: { balance: { increment: amount } }
  });

  await prisma.transaction.create({
    data: {
      walletId: updatedWallet.id,
      amount,
      type: 'CREDIT_RECHARGE',
      referenceId: razorpay_payment_id
    }
  });

  res.json({ success: true, message: 'Wallet recharged successfully!', balance: updatedWallet.balance });
};
```

---

### 5.3.4 Module 4: WhatsApp Cloud API & AI Chatbot Integration
- **Purpose:** Connects customer messaging directly with our inventory and order database.
- **Workflow:**
  1. Customer messages the business WhatsApp number: *"Do you have fresh country eggs today?"*
  2. Meta Webhooks forward the inbound message payload to our Express webhook endpoint (`POST /api/whatsapp/webhook`).
  3. The backend extracts query intent and fetches current stock levels from PostgreSQL.
  4. Injects real-time stock data into the **OpenAI / Ollama Prompt Engine**.
  5. Generates a friendly, contextual response and sends it back via the **WhatsApp Graph API**.

```typescript
// Sample Implementation: Inbound WhatsApp Webhook Controller
import axios from 'axios';
import { Request, Response } from 'express';
import { queryAIModel } from '../ai/promptEngine';

export const handleWhatsAppWebhook = async (req: Request, res: Response) => {
  const body = req.body;
  if (body.object === 'whatsapp_business_account') {
    const entry = body.entry?.[0];
    const changes = entry?.changes?.[0];
    const message = changes?.value?.messages?.[0];

    if (message?.type === 'text') {
      const userPhone = message.from;
      const userText = message.text.body;

      // Generate response via AI Engine
      const aiReply = await queryAIModel(userPhone, userText);

      // Send response back via Meta Graph API
      await axios.post(
        `https://graph.facebook.com/v19.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
        {
          messaging_product: 'whatsapp',
          to: userPhone,
          type: 'text',
          text: { body: aiReply }
        },
        { headers: { Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}` } }
      );
    }
    return res.sendStatus(200);
  }
  res.sendStatus(404);
};
```

---

### 5.3.5 Module 5: Driver Route & Contactless Drop-off Validation
- **Workflow:**
  1. The delivery driver views their morning queue of customer stops on the **AgriApp** mobile client.
  2. Upon arriving at the doorstep, the driver taps **"Confirm Drop-off"**.
  3. The mobile client sends a `POST /api/deliveries/confirm-drop` with geolocation and timestamp.
  4. The backend marks the order status as `DELIVERED`.
  5. The backend triggers the **Twilio Voice API** to initiate an automated confirmation call and sends a **WhatsApp drop-off message** with receipt details.

---

## 5.4 DATABASE IMPLEMENTATION & PRISMA MIGRATIONS
- Database modeling is executed through declarative schemas in `prisma/schema.prisma`.
- Migration commands ensure reproducible schema versions:
```bash
# Generate Prisma Client Types
npx prisma generate

# Execute Relational Schema Migration to PostgreSQL
npx prisma migrate dev --name init_agriflow_schema
```

---

## 5.5 SECURITY & DATA PROTECTION IMPLEMENTATION
1. **Password Encryption:** Bcrypt with dynamic salting prevents rainbow table attacks.
2. **Token Security:** Short-lived JWT tokens (24-hour expiration) signed with HMAC-SHA256 secrets stored in `.env` files.
3. **Payment Integrity:** Client-side payment claims are never trusted blindly; all Razorpay webhook and return signatures are verified using server-side cryptographic digests.
4. **Input Sanitization:** Express request bodies are validated using strict Zod schemas to protect against SQL injections and payload tampering.
