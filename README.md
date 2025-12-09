🧠 Learning Buddy – AI-Powered Educational Assistant

A smart and interactive web application built to enhance student learning through AI-powered chat, quizzes, mock interviews, podcasts, and file summarization.
Built using React, Tailwind CSS, Firebase, Gemini API & Google Generative AI.

🚀 Features
🟦 AI Chat Assistant

Conversational AI chatbot using Gemini API
Reply actions: Copy, YouTube Search, Google Search, Text-to-Speech

🧩 Quiz Generator

Create quizzes based on topic, difficulty & question count
Real-time quiz attempt & review
Performance visualized via charts

🎙️ AI Podcast Generator

Converts topic → AI-generated script → Speech output
Select: tone, duration, difficulty & language

🎤 Mock Interview

Role-based, difficulty-based mock interview
Supports Text and Voice input
Provides score, strengths, weaknesses & feedback

📄 File Summarization

Upload PDF/TXT + custom prompt
Summarizes using Google Generative AI
Useful for assignments & revision

👤 User Dashboard

Login/Register with Email or Google
Profile shows:
User name, email, role
Total chats, quizzes, interviews
Pie charts for performance analytics

📚 Chat History

Save chats
Re-open old conversations
Sidebar with expanded/collapsed mode

⚙️ Installation & Setup

1️⃣ Clone the Repository
git clone "repo link"
cd learning-buddy

2️⃣ Install Dependencies

npm install

3️⃣ Setup Firebase

Create a Firebase project → Enable:
Authentication (Email/Password + Google)
Firestore Database

Add your config in .env:

VITE_FIREBASE_API_KEY=xxxx
VITE_FIREBASE_AUTH_DOMAIN=xxxx
VITE_FIREBASE_PROJECT_ID=xxxx
VITE_FIREBASE_STORAGE_BUCKET=xxxx
VITE_FIREBASE_MESSAGING_SENDER_ID=xxxx
VITE_FIREBASE_APP_ID=xxxx

4️⃣ Setup Gemini API
VITE_GEMINI_API_KEY=your_api_key

5️⃣ Run the App
npm run dev

