# BolKhata

### A voice-first khata for the neighborhood kirana store.

BolKhata is a mobile-first bookkeeping assistant designed around the way many shopkeepers already talk about credit: **udhaar** and **jama**. Record a transaction in Hindi, review it before saving, and ask for a balance or a quick summary—all through a familiar chat interface.

> **Hackathon demo:** BolKhata is a self-contained React prototype. It needs no account, API key, or backend. Demo ledger data and transactions live in React state and reset when the page reloads.

## The problem

Small shopkeepers often track customer credit between busy customers, handwritten notes, and memory. That makes it easy to lose track of who owes what. A bookkeeping tool should be quick to use at the counter, comfortable on a phone, and forgiving when speech recognition gets a name or amount wrong.

## The approach

BolKhata turns everyday Hindi bookkeeping phrases into a proposed ledger entry. It always asks for confirmation before changing a balance, and keeps typing available alongside voice input.

### Features

- **Hindi voice input:** Speak in `hi-IN`; the recognized transcript appears in the composer so it can be reviewed and edited before sending.
- **Spoken responses:** BolKhata reads its replies aloud using the browser's speech synthesis when available.
- **Udhaar and jama tracking:** Propose loans and repayments with a confirmation card; only **Haan** changes the ledger.
- **Balance queries:** Ask a question such as `Ramesh ka kitna baaki hai?`.
- **Daily summaries:** Ask `Aaj ka hisaab` to review confirmed transactions from the current day.
- **Demo reset:** Restore the sample balances and clear the current demo conversation and transactions.
- **Responsive chat UI:** A WhatsApp-inspired interface designed mobile-first, with a contacts ledger on wider screens.

### Try the demo

1. Enter or say `Ramesh ne 500 udhaar liye`.
2. Check the `Ramesh ₹500 udhaar` confirmation and choose **Haan** or **Nahi**.
3. After confirming, ask `Ramesh ka kitna baaki hai?` to see the updated balance.
4. Record a repayment with `Sharma ji ne 1200 jama kiya`, then ask `Aaj ka hisaab`.
5. Select **Demo Reset** to restore the seed data.

Starting demo balances:

| Customer | Balance |
| --- | ---: |
| Ramesh | ₹300 |
| Sharma ji | ₹1,500 |
| Geeta didi | ₹0 |

## Technology

- React 19 with hooks
- JavaScript and Vite
- Browser Web Speech APIs for speech recognition and speech synthesis
- Docker multi-stage build: Node 22 Alpine for building, Nginx Alpine for serving

Voice recognition depends on browser support and microphone permission. If recognition is unavailable, the app offers a friendly typing fallback. Speech responses also depend on browser support.

## Installation

Requirements: Node.js 22.12+ and npm.

```sh
npm ci
```

## Local development

```sh
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). Vite provides hot reload while you edit the app.

Useful checks:

```sh
npm run build
npm run lint
```

## Docker

Requirements: Docker Engine and the Docker Compose plugin.

```sh
docker compose up
```

Open [http://localhost:8080](http://localhost:8080). Compose builds the optimized Vite bundle in a lightweight Node 22 Alpine stage, then serves the static files from Nginx Alpine. Host port `8080` maps to container port `80`; this keeps the production app separate from Vite's local development port `5173`.

No environment variables, API keys, or external services are required. Stop the container with:

```sh
docker compose down
```

## Project structure

```text
.
├── Dockerfile               # Multi-stage production image
├── docker-compose.yml       # One-command local container startup
├── nginx.conf               # Static hosting, SPA fallback, and asset caching
├── .dockerignore
├── index.html
├── package.json
├── package-lock.json
├── vite.config.js
├── public/
│   ├── favicon.svg
│   └── icons.svg
└── src/
    ├── App.jsx              # Chat UI, parsing, confirmations, and in-memory ledger
    ├── App.css              # Chat and responsive layout styles
    ├── index.css            # Global styles
    ├── main.jsx             # React entry point
    └── assets/
```

## Screenshots

### Home Screen

The mobile-first chat brings the sample ledger, customer balances, and voice and text composer into one screen.

### Confirmation Flow

Review a parsed udhaar or jama entry before saving. **Haan** applies the entry; **Nahi** discards it. Repayments above the pending balance show the amount applied and the excess ignored.

### Daily Summary

See today's confirmed entries and udhaar and jama totals. **Demo Reset** restores the sample balances and clears the day's transactions.

## Hackathon context

BolKhata is built as a focused hackathon demo of a conversational interface for a practical, everyday bookkeeping task. The prototype prioritizes a fast mobile workflow, Hindi-first voice interaction, explicit confirmation before ledger changes, and a resettable dataset that makes judging and live demos straightforward.

**Current scope:** The ledger, transactions, and conversation are held in browser memory. Reloading the page resets the data; this prototype does not sync across devices or persist records to a server.
