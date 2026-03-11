# 📜 ResearchHub — Research Business Platform

> React · Firebase · Paystack · Render  
> Times New Roman · Greenish-Golden Theme

---

## ✨ Features

| Feature | Detail |
|---|---|
| **Topic Catalog** | Admin uploads topics; clients browse & request |
| **Custom Requests** | Client submits any topic with requirements |
| **Messaging** | Real-time chat per order (client ↔ admin) |
| **Quote System** | Admin sends price; client accepts or negotiates |
| **Paystack Auto-Pay** | 50% advance + 50% final — card, transfer, USSD |
| **Correction Loop** | Client sends supervisor notes → admin corrects → repeat |
| **Download Gate** | Final doc locked until Paystack confirms full payment |
| **Admin Dashboard** | Manage all orders, upload topics, send quotes |
| **Role-Based Access** | Admin vs Client — Firestore rules enforced |

---

## 🗂 Project Structure

```
research-platform/
├── public/
│   └── index.html
├── src/
│   ├── App.jsx              # Routes
│   ├── index.js
│   ├── index.css            # Global styles (Times NR + golden theme)
│   ├── firebase.js          # Firebase init
│   ├── contexts/
│   │   └── AuthContext.jsx  # Auth + profile
│   ├── utils/
│   │   ├── orders.js        # All Firestore order helpers
│   │   └── paystack.js      # Paystack popup helper
│   ├── components/
│   │   └── Navbar.jsx
│   └── pages/
│       ├── LandingPage.jsx
│       ├── AuthPage.jsx
│       ├── TopicsPage.jsx
│       ├── RequestPage.jsx
│       ├── OrdersPage.jsx
│       ├── OrderDetail.jsx  # Full client flow + Paystack
│       ├── MessagesPage.jsx
│       ├── PaymentsPage.jsx
│       ├── AdminDashboard.jsx
│       └── AdminOrder.jsx   # Full admin management
├── firestore.rules
├── render.yaml
└── .env.example
```

---

## 🚀 Setup & Deployment

### 1. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project
3. Enable **Authentication → Email/Password**
4. Enable **Firestore Database** (start in production mode)
5. Enable **Storage** (for file uploads)
6. Copy your config keys

### 2. Environment Variables

```bash
cp .env.example .env
# Fill in your Firebase + Paystack keys
```

### 3. Firestore Rules

Deploy the included rules:
```bash
npm install -g firebase-tools
firebase login
firebase init firestore
firebase deploy --only firestore:rules
```

### 4. Local Development

```bash
npm install
npm start
```

### 5. Deploy on Render

1. Push repo to GitHub
2. Go to [render.com](https://render.com) → **New → Static Site**
3. Connect your GitHub repo
4. Render auto-detects `render.yaml`
5. Set all `REACT_APP_*` env vars in the Render dashboard
6. Deploy!

---

## 👤 User Roles

| Role | Access |
|---|---|
| **Admin** | Set by `REACT_APP_ADMIN_EMAIL`. Full dashboard, quote, upload, unlock |
| **Client** | Browse topics, request, pay, send corrections, download |

To set an admin: set `REACT_APP_ADMIN_EMAIL=your@email.com` and register with that email. The system automatically assigns the `admin` role.

---

## 💳 Paystack Integration

- Uses **Paystack Popup** (inline JS)
- Payments are in **NGN (Naira)**
- Advance = 50% of agreed price
- Balance = remaining 50%
- **Download unlocks automatically** after final payment recorded
- Paystack references stored in Firestore per order

To go live: replace `pk_test_...` with `pk_live_...` in env vars.

---

## 🔄 Order Flow

```
Client requests topic
  → Admin sends quote
  → Client accepts
  → Client pays 50% advance (Paystack)
  → Admin writes & uploads watermarked draft
  → Client reviews with supervisor
  → Client sends supervisor corrections to admin
  → Admin applies corrections & sends corrected version
  → [Correction loop repeats if needed]
  → Client approves final version
  → Client pays 50% balance (Paystack)
  → Admin uploads final doc & unlocks download
  → Client downloads ✓
```

---

## 🔒 Security

- Firestore rules enforce client can only see own orders
- Admin email-based role assignment
- Download URL only revealed after `status === "complete"` and `finalPaid === true`
- Paystack reference verified and stored per transaction

---

## 📞 Support

For questions, message via the platform's built-in messaging system.

---

*Built with ❤️ for Nigerian research & nursing education.*
