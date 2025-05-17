
# 🎉 EventHub - Full-Stack Event Booking System

EventHub is a full-stack event booking system that allows users to browse and book events, manage their bookings, and includes an admin panel for event management. Built with support from AI tools like ChatGPT and GitHub Copilot to demonstrate modern development workflows.

---

## 📌 Features

### 🌍 Frontend (Web Only)
- **Authentication**: Register and Login (no password recovery)
- **Home Page**: 
  - Grid or flexbox layout for event listings
  - "Booked" label replaces "Book Now" for already booked events
- **Event Details Page**:
  - Full event info: name, description, category, date, venue, price, image
  - 1-click booking with confirmation screen (no payment integration)
- **Admin Panel**:
  - Separate screen within the app
  - Admin can **Create / Read / Update / Delete** events
  - Role-based access (Admin, User)

### 🛠 Backend
- **Authentication**
- **Event Management API**
- **Booking API**

### 🎯 Optional Enhancements
- Role-based permissions
- Event tags & categories
- Event image upload
- Pagination / Lazy loading
- Responsive Design

### 🚀 Bonus Features
- Backend Deployment (e.g. Render, Vercel, Heroku)
- Multi-language support (English - Arabic)
- Unit Testing
- Dark Mode

---

## 📁 Folder Structure

```

EventHub/
├── client/            # Frontend code (Vite + Tailwind)
├── server/            # Backend API
├── shared/            # Shared logic/types between frontend and backend
├── drizzle.config.ts  # Drizzle ORM config (if used)
├── vite.config.ts     # Vite frontend config
├── tailwind.config.ts # Tailwind CSS config
├── tsconfig.json      # TypeScript config
└── .gitignore         # Git ignore rules

````

---

## 🚀 Getting Started

### ✅ Prerequisites

- [Node.js](https://nodejs.org/)
- [Git](https://git-scm.com/)
- [pnpm](https://pnpm.io/) or `npm` / `yarn`

---

### 📥 Installation

1. **Clone the repo**
```bash
git clone https://github.com/mahmoud1053/EventHub.git
cd EventHub
````

2. **Install dependencies**

```bash
pnpm install        # Or use npm install / yarn install
```

3. **Start the development servers**

* **Frontend** (inside `/client`):

  ```bash
  cd client
  pnpm dev          # Or npm run dev
  ```

* **Backend** (inside `/server`):

  ```bash
  cd ../server
  pnpm dev          # Or npm run dev
  ```

> Make sure both frontend and backend servers are running.

---

## 🧠 Built With AI Assistance

This project was developed using:

* 🔮 ChatGPT (OpenAI)
* 🤖 Replit

These tools supported brainstorming, code generation, refactoring, and writing docs.

---

## 🙌 Contributing

Feel free to fork the project, create feature branches, and submit PRs. All improvements are welcome!

---

## 📄 License

MIT License

---

## 💬 Contact

Mahmoud Ahmed Alam Eldin
[GitHub Profile](https://github.com/mahmoud1053)


