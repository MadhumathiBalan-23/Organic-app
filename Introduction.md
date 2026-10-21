# AgriFlow AI: Project Introduction

## Overview

**AgriFlow AI** is an innovative, AI-powered platform designed to streamline organic product management and delivery. It bridges the gap between local organic farms and consumers, offering a robust marketplace, automated workflow pipelines, subscription-based ordering, and seamless delivery integration. 

By leveraging advanced Artificial Intelligence (via OpenAI or local Ollama), AgriFlow automates complex business logic including order placements, advance payments, and customer reminders over popular communication channels like WhatsApp, while confirming delivery milestones using automated voice services.

---

## Core Objectives

1. **Marketplace & Subscriptions:** Provide a seamless digital marketplace where customers can browse, order, and subscribe to recurring organic food deliveries.
2. **AI-Driven Automation:** Use LLMs to manage automated WhatsApp chat interactions, inventory reports, and delivery scheduling.
3. **Workflow Efficiency:** Reduce manual administrative overhead by orchestrating background jobs (cron schedulers) to handle checkout states, pending payments, and logistical reporting.
4. **Reliable Fulfillment:** Ensure transparent, validated deliveries using integrated Twilio voice validation and Firebase for push notifications.

---

## System Architecture

AgriFlow AI is organized into independent micro-packages under an npm workspace layout, ensuring clear separation of concerns, scalability, and ease of deployment. 

The primary packages include:

### 1. `api` (Backend & Core Services)
- **Role:** Centralized core backendREST endpoints.
- **Tech Stack:** Node.js, Express.js, TypeScript, PostgreSQL (Prisma ORM).
- **Functionality:** Handles JWT authentication, role authorizations, backend business logic, and communication with the database.

### 2. `agriapp` (Mobile Application)
- **Role:** Customer and driver-facing mobile hub.
- **Tech Stack:** React Native, Expo, Redux.
- **Functionality:** Cross-platform (Android & iOS) interface allowing users to access the organic marketplace and manage subscriptions and deliveries.

### 3. `agriadmin` (Web Control Dashboard)
- **Role:** Responsive command center for administrators.
- **Tech Stack:** React, Vite.
- **Functionality:** Real-time visibility into order volumes, user engagement, subscription metrics, and system health status. 

### 4. Background & Auxiliary Services (Integrations, Jobs, AI)
- **`ai`:** Contains dedicated prompt engines that route interactions through the OpenAI API or an optimized local Ollama setup.
- **`integrations`:** Wrapper logic isolating third-party connectors securely (Twilio for voice, WhatsApp API, Firebase Cloud Messaging, Razorpay for digital payments).
- **`jobs`:** Contains system daemons executing node-cron schedules to track deliveries, automatically deduct or remind for subscription payments, and reconcile reports.

---

## Technology Stack

- **Frontend Clients:** React, React Native (Expo SDK), Redux Toolkit, Vite.
- **Backend Service:** Node.js, Express.js, TypeScript.
- **Database & Modeling:** PostgreSQL paired with Prisma Client.
- **Payment Processing:** Razorpay integration (configured with test environments for sandbox validation).
- **Artificial Intelligence:** Pluggable AI processing endpoints, supporting both cloud-native (OpenAI) and secure localized (Ollama) engines.

---

## Why AgriFlow AI?

AgriFlow revolutionizes the traditional organic food supply chain by bringing everything under one AI-assisted umbrella. Through tight system integrations, customers enjoy a zero-friction subscription process managed quietly behind the scenes. Administrators get unparalleled insight and control over their ecosystems without needing manual labor checks, paving the way for efficient, modern, and transparent local commerce.
