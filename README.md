# 🍃 The Elites Mobile Cafe — Research Platform

A full-stack research writing marketplace built with **React + Firebase**, deployed on **Render**.

---

## ✅ Feature Overview

| Feature | Description |
|---|---|
| 🔐 Auth | Firebase Email/Password auth with role-based access (client / admin) |
| 📚 Topics | Admin uploads pre-set research topics; clients browse & filter |
| 📝 Requests | Clients submit custom or pre-set research requests |
| 💬 Messaging | Real-time per-order chat for negotiation |
| 💰 Quoting | Admin sets price + advance %, auto-sent as chat message |
| 💳 Paystack | Inline payment for advance & balance payments |
| 🔒 Download Gate | File download ONLY unlocked after full balance payment |
| 📦 File Upload | Admin uploads deliverables to Firebase Storage |
| 🛡️ Firestore Rules | Security enforced at database level |

---

## 🚀 Quick Start

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd elites-mobile-cafe
npm install
```

### 2. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project: **elites-mobile-cafe**
3. Enable **Authentication** → Email/Password
4. Enable **Firestore Database** (start in production mode)
5. Enable **Storage**
6. Go to Project Settings → Web App → copy config values

### 3. Environment Variables

```bash
cp .env.example .env
```

Fill in your `.env`:

```env
REACT_APP_FIREBASE_API_KEY=...
REACT_APP_FIREBASE_AUTH_DOMAIN=...
REACT_APP_FIREBASE_PROJECT_ID=...
REACT_APP_FIREBASE_STORAGE_BUCKET=...
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=...
REACT_APP_FIREBASE_APP_ID=...

REACT_APP_PAYSTACK_PUBLIC_KEY=pk_live_...

REACT_APP_ADMIN_EMAIL=admin@theelitesmobilecafe.com
```

> ⚠️ **NEVER commit `.env` to GitHub.** It's already in `.gitignore`.

### 4. Deploy Firestore Rules

```bash
npm install -g firebase-tools
firebase login
firebase init firestore
firebase deploy --only firestore:rules
firebase deploy --only storage
```

### 5. Run Locally

```bash
npm start
```

---

## 👑 Admin Account Setup

1. Register on the site using the email you set in `REACT_APP_ADMIN_EMAIL`
2. The system auto-assigns `role: 'admin'` based on that email
3. Admin sees the **Admin Panel** in the navbar

---

## 🌐 Deploy to Render

1. Push code to GitHub
2. Go to [render.com](https://render.com) → New Static Site
3. Connect your GitHub repo
4. **Build Command:** `npm run build`
5. **Publish Directory:** `build`
6. Add all `REACT_APP_*` variables under **Environment**
7. Deploy!

---

## 🔄 Order Lifecycle

```
Submitted → Negotiating → Advance Due → In Progress → Awaiting Final Payment → Completed
```

| Status | Who Triggers |
|---|---|
| `submitted` | Client submits request |
| `negotiating` | Admin sends quote |
| `advance_due` | Admin confirms price agreement |
| `in_progress` | Client pays advance (Paystack) |
| `awaiting_final_payment` | Admin uploads deliverable |
| `completed` | Client pays balance → 🔓 download unlocked |

---

## 💳 Payment Flow

```
Admin sets price (e.g. ₦25,000 with 50% advance)
      ↓
Client pays Advance: ₦12,500  → Work starts
      ↓
Admin uploads file
      ↓
Client pays Balance: ₦12,500  → 🔓 Download unlocked
```

---

## 📁 Project Structure

```
src/
├── components/
│   └── common/         # Navbar, ProtectedRoute, StatusHelpers
├── context/
│   └── AuthContext.jsx  # Auth + profile management
├── firebase/
│   ├── config.js        # Firebase init
│   └── services.js      # All Firestore/Storage functions
├── pages/
│   ├── public/          # Home, Login, Register, Topics
│   ├── client/          # Dashboard, Request, OrderDetail
│   └── admin/           # AdminPage
├── styles/
│   └── globals.css      # Design system + tokens
└── App.jsx              # Router + providers
```

---

## 🔒 Security Notes

- All env variables stay server-side on Render (not in Git)
- Firestore rules enforce role-based access at DB level
- Download URLs only serve after `downloadUnlocked: true` in Firestore
- Paystack keys: use `pk_live_` for production, `pk_test_` for development
- Regenerate your Paystack keys if they were ever exposed

---

## 📞 Support

For platform issues, contact the admin at the email set in your Firebase project.
