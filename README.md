# Contract Management System

A web app that lets a construction contractor run their business in one place: clients, projects, vendors, purchases, labor, expenses and payments. Updates appear **in real time** for everyone using it, so the whole team always sees the same numbers.

Built as a freelance project for a construction contractor. This repository contains the **React frontend**.

## Features

- **Projects:** create projects with a client and an advance payment, and follow each project's running ledger. The ledger updates live as payments and costs come in. Ledgers and invoices can be exported as PDF.
- **Clients:** add, view and remove clients.
- **Vendors:** vendor list, a ledger for each vendor, and total outstanding balances.
- **Purchases:** record purchases from vendors, including advance payments.
- **Labor:** workers and their payments.
- **Expenses:** record and remove expenses.
- **Payments:** record client payments. New payments appear instantly for every user.
- **Dashboard:** pending invoices, recent activity, active projects this year and total receivables.
- **Accounts:** sign up, log in and protected routes.

## Real-time updates

The app uses **Socket.IO**. When someone adds a payment, invoice, vendor or project change, the server broadcasts an event, and every open screen refreshes that data automatically, with no page reload.

Each project ledger has its own room (`join-project-ledger`), so someone viewing a project only receives updates for that project.

| Event | What it refreshes |
|---|---|
| `payment_added`, `paymentUpdated` | Payments |
| `invoiceAdded` | Invoices |
| `vendorAdded` | Vendors |
| `projectUpdated` | Projects |
| `project-ledger-updated` | The open project's ledger |

## Tech stack

| Area | Tools |
|---|---|
| UI | React 19, React Router 7 |
| Real time | socket.io-client |
| PDF export | html2pdf.js |
| Backend (separate) | Node.js, Express, MySQL, Socket.IO |

## Pages

| Route | Page |
|---|---|
| `/` | Login |
| `/signup` | Sign up |
| `/dashboard` | Overview |
| `/projects` | Projects and ledgers |
| `/clients` | Clients |
| `/vendors` | Vendors and ledgers |
| `/purchases` | Purchases |
| `/labor` | Labor and labor payments |
| `/expenses` | Expenses |
| `/payments` | Client payments |

## Getting started

Requirements: Node.js 18 or newer, and the backend API running.

```bash
git clone https://github.com/aliakbarr474/contract-management-system.git
cd contract-management-system
npm install
npm start
```

The app opens at `http://localhost:3000`. API requests use relative paths (for example `/projects/show`) and Socket.IO connects to the same origin, so the app expects to be served from the same host as the backend, or through a development proxy.

## Project structure

```
src/
├── App.js            # routes
├── Socket.js         # shared Socket.IO client
├── ProtectedRoute.js
├── Login.js / Signup.js
├── Dashboard.js
├── Projects.js       # projects, live ledgers, PDF export
├── Clients.js
├── Vendors.js
├── Purchases.js
├── Labor.js
├── Expenses.js
└── Payments.js
```

## Author

**Ali Akbar** — Full-stack developer
[GitHub](https://github.com/aliakbarr474) · [LinkedIn](https://linkedin.com/in/ali-akbar-8592b1241) · aliakbarr474@gmail.com
