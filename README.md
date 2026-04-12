# Habit & Focus Tracker

A full-stack productivity web app to build habits, track streaks, and stay focused with a built-in Pomodoro timer.

**Live Demo:**  
Frontend: https://habit-and-focus-tracker.vercel.app/  
Backend API: https://habit-and-focus-tracker.onrender.com/

---

## Features

### Habit Management
- Add, complete, and delete daily habits
- Streak tracking with automatic reset logic (IST timezone aware)
- Optimistic UI updates with rollback on failure

### Analytics Dashboard
- 30-day activity heatmap
- Weekly completions bar chart
- Streak leaderboard
- Weekday vs weekend performance insight

### Focus Timer
- Pomodoro timer (25 min focus / 5 min break)
- Skip break, extend break, reset controls
- Cycle counter

### Auth & Security
- JWT authentication with bcrypt
- Protected routes
- Rate limiting for APIs
- Helmet security headers
- CORS configured

---

## Tech Stack

### Frontend
- React
- React Router
- Context API
- Axios
- Tailwind CSS
- Recharts

### Backend
- Node.js
- Express.js
- MongoDB + Mongoose
- JWT
- bcrypt
- Helmet
- express-rate-limit

### Deployment
- Frontend: Vercel  
- Backend: Render  
- Database: MongoDB Atlas  

---

## Getting Started

### Backend
cd server  
npm install  

MONGO_URI=your_mongodb_uri  
JWT_SECRET=your_jwt_secret  
JWT_LIFETIME=7d  
PORT=5000  

npm run dev  

---

### Frontend
cd client  
npm install  

REACT_APP_API_URL=http://localhost:5000  

npm start  

---

## API Endpoints

### Auth
- POST /api/auth/register
- POST /api/auth/login

### Habits
- GET /api/habits
- POST /api/habits
- DELETE /api/habits/:id
- PATCH /api/habits/:id/complete
- GET /api/habits/analytics

---

## Project Structure

```text
habit-tracker/
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   └── pages/
└── server/
    ├── config/
    ├── controllers/
    ├── middleware/
    ├── models/
    └── routes/
