# Saraha App

An anonymous messaging platform built with Node.js, Express, and EJS using the MVC architecture. Users get a shareable profile link or QR code where others can send them anonymous messages.

## Features

- User registration and login (session-based auth, sessions stored in MongoDB)
- Shareable profile URL and QR code for receiving messages
- Anonymous messaging

## Tech Stack

- Node.js / Express
- MongoDB / Mongoose
- EJS templates
- express-session with MongoDB-backed session store

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy the example environment file and fill in your own values:
   ```bash
   cp .env.example .env
   ```
3. Start the server:
   ```bash
   npm start
   ```

> If deploying to Vercel or another host, set `MONGODB_URI` and `SESSION_SECRET` in that platform's environment variable settings.
