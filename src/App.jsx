import './App.css'
import AuthPage from './components/auth/AuthPage'
import { ToastContainer } from 'react-toastify'; // ✅
import 'react-toastify/dist/ReactToastify.css';  // ✅
import Sidebar from './components/sidebar/Sidebar'
import Main from './components/home/Main'
import Header from './components/header/Header'
import Summarize from './components/summarize/Summarize'
import QuizDashboard from './components/quizzes/QuizDashboard';
import QuizTake from './components/quizzes/QuizTake';
import QuizReview from './components/quizzes/QuizReview';
import NewQuizForm from './components/quizzes/NewQuizForm'
import PodcastFeature from './components/podcast/PodcastFeature';
import MockInterview from './components/mockinterview/MockInterview';
import MockInterviewReport from './components/mockinterview/MockInterviewReport';
import LandingPage from './components/landing/LandingPage';
import Profile from './components/profile/Profile';
import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'


function Layout({ sidebarOpen, toggleSidebar }) {
  return (
    <div className="flex h-screen w-full">
      {/* Sidebar */}
      <Sidebar sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col bg-gray-900 text-white ml-16 md:ml-0 w-full overflow-hidden">
        <Header />
        <Outlet /> {/* This renders the current route content */}
      </div>
    </div>
  );
}

function App() {
  
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  }

  return (
    <div className="flex min-h-screen w-screen m-0 p-0 overflow-x-hidden overflow">
      <Router>
        <ToastContainer position="top-center" autoClose={3000} />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          {/*  */}<Route path="/login" element={<AuthPage />} />
          {/* Protected Layout */}
          <Route 
            path="/*" 
            element={
              <div className="flex h-screen w-full">
                <Sidebar sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} setSelectedChat={setSelectedChatId}/>
                <div className="flex-1 flex flex-col bg-gray-900 text-white ml-16 md:ml-0 w-full overflow-hidden">
                  <Header/>
                  <Routes>
                    <Route path="/main" element={<Main selectedChatId={selectedChatId} setSelectedChatId={setSelectedChatId} />} /> 
                    <Route path="/summarize" element={<Summarize />} /> 
                    <Route path="/quizzes" element={<QuizDashboard />} />
                    <Route path="/quiz/:quizId" element={<QuizTake />} />
                    <Route path="/quiz-review/:quizId" element={<QuizReview />} />
                    <Route path="/new-quiz" element={<NewQuizForm />} />
                    <Route path="/podcast" element={<PodcastFeature />} />
                    <Route path="/mock-interview" element={<MockInterview />} />
                    <Route path="/mock-interview-report" element={<MockInterviewReport/>} />
                    <Route path="/profile" element={<Profile />} />
                    
                    {/* Add more routes as needed */}
                  </Routes>
                  
                </div>
              </div>
            } 
          />
        </Routes>
      </Router>
      
    </div>
  );
};




export default App
