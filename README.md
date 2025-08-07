# Full-Stack AI Chatbot

A complete full-stack AI chatbot application with JWT authentication, persistent chat history, and real-time WebSocket streaming.

## Features

- **JWT Authentication**: Secure login with static credentials
- **Persistent Chat History**: MongoDB storage for all conversations
- **Real-time Streaming**: WebSocket-based AI response streaming
- **Modern UI**: React with Material UI and Tailwind CSS
- **State Management**: Redux for global state, React Query for API caching
- **AI Integration**: Gemini API support with fallback mock responses

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or cloud)
- Google Gemini API key

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend directory:
```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/chatbot

# JWT Configuration
JWT_SECRET=chatbotDemo
JWT_EXPIRES_IN=24h

# CORS Configuration
FRONTEND_URL=http://localhost:3000
GEMINI_API_KEY="xyz-xyz"
GEMINI_MODEL="gemini-2.0-flash"
```

4. Start the development server:
```bash
npm run start:dev
```

The backend will be running on `http://localhost:3001`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the frontend directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
```

4. Start the development server:
```bash
npm run dev
```

The frontend will be running on `http://localhost:3000`

## Login Instructions

Use the following static credentials to login:
- **Username**: `admin`
- **Password**: `password`
