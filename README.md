# AI Learning Assistant System

An AI-powered learning platform that lets users upload documents (PDFs), automatically processes them into searchable chunks, and uses the Gemini API to power document-aware chat, summarization, concept explanations, flashcards, and quizzes — all wrapped in a clean, dashboard-driven web app.

---

## ✨ Features

### 📄 Document Intelligence

- Upload PDF documents through a dedicated upload modal.
- Extracted text is split into chunks, and relevant chunks are retrieved based on context before being passed to the AI — enabling accurate, grounded responses.
- Document detail view includes:
  - **Original PDF viewer** — view the exact uploaded document inline.
  - **Chat with the document** — ask questions about the document's content. If a question falls outside the document's scope, the AI explicitly responds that it's out of context.
  - **AI Actions**:
    - Generate a document summary (shown in a modal).
    - Ask the AI to explain a specific concept based on the document's context.
  - **Flashcard sets** — generate and view flashcard sets tied to a specific document.
  - **Quizzes** — generate and take quizzes based on a specific document.

### 🧠 Flashcards

- Each document can have one or more flashcard sets containing question/answer pairs.
- Clicking a flashcard set reveals all flashcards within it.
- Review flashcards multiple times, with review progress synced to the backend.
- Star/favorite flashcards for quick access later.
- A dedicated **Flashcards** section lists all flashcards belonging to the logged-in user across all documents (not scoped to a single document).

### 🏠 Dashboard

- Overview of:
  - Total documents uploaded
  - Total flashcards created
  - Total quizzes generated
  - Recent activity across documents

### 👤 Profile & Authentication

- Register/Login/Logout flow.
- JWT-based authentication with tokens stored in `localStorage`.
- Profile section to view/manage user information.

---

## 🏗️ Tech Stack

### Frontend (`/client`)

| Technology                  | Purpose                                 |
| --------------------------- | --------------------------------------- |
| React 19                    | UI library                              |
| Vite                        | Build tool & dev server                 |
| React Router DOM            | Client-side routing                     |
| Tailwind CSS 4              | Styling                                 |
| Axios                       | API requests                            |
| React Hot Toast             | Notifications                           |
| React Markdown + remark-gfm | Rendering AI-generated markdown content |
| React Syntax Highlighter    | Code block formatting in AI responses   |
| Lucide React                | Icons                                   |
| Moment.js                   | Date/time formatting                    |
| ESLint                      | Linting                                 |

### Backend (`/server`)

| Technology          | Purpose                         |
| ------------------- | ------------------------------- |
| Node.js + Express 5 | REST API server                 |
| Mongoose            | MongoDB ODM                     |
| @google/genai       | Gemini API integration          |
| pdf-parse           | PDF text extraction             |
| Multer              | File upload handling            |
| jsonwebtoken        | JWT authentication              |
| bcryptjs            | Password hashing                |
| express-validator   | Request validation              |
| dotenv              | Environment variable management |
| CORS                | Cross-origin request handling   |
| Nodemon             | Dev-time auto-reload            |

---

## 📂 Project Structure

```
ai-learning-assistant-system/
├── client/                 # React + Vite frontend
│   ├── src/
│   │   ├── assets/         # Static assets (images, icons, etc.)
│   │   ├── components/     # Reusable UI components
│   │   ├── context/        # React Context providers (e.g. auth, user state)
│   │   ├── pages/          # Route-level page components
│   │   ├── services/       # API service functions (Axios calls, etc.)
│   │   ├── utils/          # Helper/utility functions
│   │   ├── App.jsx
│   │   └── index.css
│   ├── package.json
│   └── ...
├── server/                 # Express backend
│   ├── config/             # Configuration files (DB connection, env setup, etc.)
│   ├── controllers/        # Route handler logic
│   ├── middleware/         # Custom middleware (auth, error handling, etc.)
│   ├── models/             # Mongoose schemas/models
│   ├── routes/             # API route definitions
│   ├── uploads/            # Uploaded document storage
│   ├── utils/              # Helper/utility functions (chunking, PDF parsing, etc.)
│   ├── server.js
│   ├── package.json
│   └── ...
└── README.md
```

---

## ⚙️ Getting Started

### Prerequisites

- Node.js (LTS recommended)
- MongoDB instance (local or Atlas)
- A Gemini API key

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd ai-learning-assistant-system
```

### 2. Backend Setup

```bash
cd server
npm install
```

Create a `.env` file in `/server`:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
```

Run the backend:

```bash
npm run dev     # development (nodemon)
npm start       # production
```

### 3. Frontend Setup

```bash
cd client
npm install
```

Create a `.env` file in `/client` (if needed for API base URL):

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

Run the frontend:

```bash
npm run dev
```

---

## 🔑 Core Workflow

1. **Register/Login** → JWT token issued and stored in `localStorage`.
2. **Upload a document** → PDF is parsed, text extracted, and split into chunks.
3. **Interact with the document**:
   - Chat with the AI (context-aware, grounded in the document's relevant chunks).
   - Generate a summary.
   - Ask for concept explanations.
   - Generate flashcards and quizzes.
4. **Review & retain**:
   - Review flashcards repeatedly; progress is saved.
   - Star important flashcards.
   - Track quiz and flashcard activity from the dashboard.

---

## 🗺️ Roadmap Ideas

- [ ] Spaced-repetition scheduling for flashcard review
- [ ] Quiz performance analytics
- [ ] Support for additional document formats (DOCX, TXT)
- [ ] Multi-document chat/cross-referencing
- [ ] Move token storage to HTTP-only cookies for improved security

---

## 📄 License

ISC (as specified in `package.json`) — update as appropriate for your project.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome. Feel free to open a pull request or file an issue.
