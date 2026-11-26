# BolKhata

A mobile-first, WhatsApp-inspired chat ledger for tracking udhaar. Send a message such as `Ramesh ne 500 udhaar liye` or `Sharma ji ne 1200 jama kiya`, confirm the suggested entry, and ask `Ramesh ka kitna baaki hai?` or `Aaj ka hisaab` to review balances and today's confirmed transactions.

## Run locally

```sh
npm install
npm run dev
```

## Run with Docker

```sh
docker compose up
```

Open [http://localhost:5173](http://localhost:5173). The Compose setup mounts the project for Vite hot reload and keeps `node_modules` inside the container.
If port 5173 is already in use, set `APP_PORT` to another host port, for example `APP_PORT=5174 docker compose up`.

## Ledger behavior

- Starts with Ramesh (₹300), Sharma ji (₹1,500), and Geeta didi (₹0).
- A loan or repayment changes a balance only after selecting **Haan**.
- **Nahi** cancels the proposed entry.
- Ledger and conversation state are kept in memory and reset on page reload.
- The microphone uses browser speech recognition when available; typing is always supported.
