# 🛰️ Navisafe  
### _Smart Tourist Safety Monitoring and Incident Response System

[![Status](https://img.shields.io/badge/Status-Active-success)]()
[![Version](https://img.shields.io/badge/Version-1.0.0-brightgreen)]()

---

## 📚 Overview
**Navisafe** is an AI-driven safety platform that integrates **real-time GPS tracking**, **smart geofencing**, and **automated SOS alerts**.  
It uses **Gemini AI** for chatbot assistance, **Twilio** for emergency calling, and **Google Maps + Leaflet** for live map visualization.

---

## ⚡ Key Features
- 🛰️ Real-time GPS tracking via **Leaflet.js + Google Maps API**  
- 🚧 Dynamic geofencing & safety alerts  
- 🤖 **Gemini AI** chatbot for emergency assistance  
- 📞 **SOS calling system**  
- 🔐 Secure **Phantom wallet integration**  
- 🌐 Cross-platform web interface built with **Next.js**

---

## 🧠 Architecture
| Layer | Technologies |
|-------|---------------|
| **Frontend** | Next.js · React.js · Tailwind CSS · Leaflet.js · Google Maps API |
| **Backend** | Node.js · Express.js · Python |
| **AI & APIs** | Gemini API · Groq API · Twilio API |
| **Database** | MongoDB |
| **Wallet & Auth** | Phantom Wallet (Solana) |
| **Deployment** | Vercel |

---

## ⚙️ Local Setup

### 🧩 Prerequisites
Make sure you have the following installed:
- Node.js ≥ 18  
- npm 
- Python (for Twilio call automation)  
- Git  
- Phantom Wallet extension (for wallet connect)

---

## 🪜 Installation Steps
```bash
# 1️⃣ Clone the repository

# 2️⃣ Move into the project directory
cd navisafehoh

# 3️⃣ Install dependencies
npm install
```
---
### 🧱 Build, Run & Connect Setup
```bash
# 1️⃣ Build the project
npm run build

# 2️⃣ Start the production server
npm start

# 3️⃣ Open your browser:
# 👉 http://localhost:3000  (or the port shown in terminal)
```
---
### **💼 Connect Phantom Wallet**
1️⃣ Install Phantom → https://phantom.app/download  
2️⃣ Create New Wallet → Store Secret Phrase securely  
3️⃣ Switch Network → Devnet  
4️⃣ Click Deposit → Devnet SOL Faucet → Get test SOL  

--- 

### **🔗 Connect Phantom to Navisafe**
1️⃣ Open http://localhost:3000  
2️⃣ Click “Connect Wallet”  
3️⃣ Select Phantom and approve the request  
✅ Your wallet address will appear on the dashboard  

---




## AI Guardian setup

The Virtual Guardian now uses a Next.js server-side API route at `/api/guardian` instead of the old `localhost:7070` Spring Boot endpoint.

1. Create a Gemini API key in Google AI Studio.
2. Copy `.env.local.example` to `.env.local`.
3. Put your key in `GEMINI_API_KEY=...`.
4. Restart `npm run dev` after changing `.env.local`.

The key is read only by the server route and is not exposed to browser code.
#
