# <h1 align="center">Payment Service</h1>

## 🚀 Overview

This project is a **multi-tenant, multi-provider** payment service. It provides a **unified interface** for handling payment processing while dynamically selecting the appropriate provider based on the requesting tenant.

Currently, it is configured to work with **LawPay**. To enable its functionality, you must provide the following credentials:

- **Client ID**
- **Client Secret**
- **Secret Key**
- **Bank Account ID for Card Payments**
- **Bank Account ID for Bank Transfers**

The service incorporates a **request caching mechanism** to prevent duplicate processing of payment requests, ensuring that the same payment is not executed multiple times due to repeated queries.

---

## 🏃 Running Locally

First, create a `.env` file at the root of the project. You can use the `.env.example` file provided in the repository.

Ensure you are using the correct Node.js version by setting it with `nvm`:

```bash
nvm use
```

Then, install dependencies:

```bash
npm install
```

To start the project in debug mode, run:

```bash
npm run start:debug
```

---

## ✏️ Commit Standard

Follow the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) standard when making changes.

Example:

```bash
feat: add endpoint to retrieve all sections
```

---

## ⚙️ Building

To build the project, run:

```bash
npm run build
```

---

## 📝 API Documentation (Swagger)

We use **Swagger** to document all API endpoints. You can access the documentation at:

```bash
http://localhost:/version/docs
```

---

## ✅ Testing

The service provides multiple testing scripts:

Run all tests:

```bash
npm run test
```

Run only unit tests:

```bash
npm run test:unit
```

Run end-to-end (E2E) tests:

```bash
npm run test:e2e
```

---

## 💅 Linting & Formatting

Run the linter:

```bash
npm run lint
```

Auto-fix lint issues:

```bash
npm run lint:fix
```

Format the entire codebase using Prettier:

```bash
npm run prettier:fix
```

---

## 📌 Notes

- Ensure all required environment variables are correctly set before running the project.
- The payment service will support additional providers in the future.
- The service is in development and may contain bugs.
- Caching is implemented to optimize performance and prevent duplicate payment processing due to repeated queries.
