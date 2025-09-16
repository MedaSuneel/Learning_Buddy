import { motion } from "framer-motion";
import { Brain, FileText, ListChecks, Mic, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";


const features = [
  {
    title: "Chatbot",
    description: "Ask any question and get instant AI-powered answers.",
    icon: <Brain className="w-8 h-8 text-indigo-600" />,
  },
  {
    title: "Summarization",
    description: "Upload files or paste text and receive clear summaries.",
    icon: <FileText className="w-8 h-8 text-indigo-600" />,
  },
  {
    title: "Quizzes",
    description: "Test your knowledge with AI-generated quizzes.",
    icon: <ListChecks className="w-8 h-8 text-indigo-600" />,
  },
  {
    title: "Podcasts",
    description: "Learn through engaging Q&A style podcasts.",
    icon: <Mic className="w-8 h-8 text-indigo-600" />,
  },
];

const LandingPage = () => {

  const navigate = useNavigate();

  return (
    <div className="flex-1 flex flex-col md:ml-0 w-full min-h-screen overflow-y-auto">
      {/* Navbar */}
      <header className="flex justify-between items-center px-8 py-4 shadow-sm bg-white">
        
        <div className="flex gap-3 items-center cursor-pointer transform hover:scale-107  duration-300">
          <img src="Chatbot.jpg" className="w-11 h-11 rounded-3xl" alt="Menu" />
          <h1 className="text-2xl font-bold text-indigo-600">Learning Buddy</h1>
        </div>
        {/* <nav className="space-x-6">
          <a href="#features" className="text-gray-700 hover:text-indigo-600">
            Features
          </a>
          <a href="#about" className="text-gray-700 hover:text-indigo-600">
            About
          </a>
          <a href="#contact" className="text-gray-700 hover:text-indigo-600">
            Contact
          </a>
        </nav> */}
        <button className="bg-indigo-600 text-white px-4 py-2 mx-8 rounded-xl hover:bg-indigo-700 cursor-pointer hover:scale-105"
            onClick={() => navigate("/login")}>
          Get Started
        </button>
      </header>

      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center px-6 py-20 bg-gradient-to-r from-indigo-50 via-white to-indigo-50">
        
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-6xl font-bold text-gray-900"
        >
          Your AI-Powered Study Companion 🚀
        </motion.h2>
        
        
          <p className="mt-6 text-lg md:text-xl text-gray-600 max-w-2xl">
            Learning Buddy helps you learn smarter with an interactive chatbot, 
            summarization tools, quizzes, and podcasts—all in one place.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            className="mt-8 flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl shadow-md hover:bg-indigo-700 cursor-pointer"
            onClick={() => navigate("/login")}
          >
            Start Learning <ArrowRight className="w-5 h-5" />
          </motion.button>
        

      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <h3 className="text-3xl md:text-4xl font-bold text-center text-gray-900">
          Features of Learning Buddy
        </h3>
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 px-8 ">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.05 }}
              className="bg-indigo-50 p-6 rounded-2xl shadow hover:shadow-lg transition"
            >
              <div className="flex justify-center">{feature.icon}</div>
              <h4 className="mt-4 text-xl font-semibold text-gray-800 text-center">
                {feature.title}
              </h4>
              <p className="mt-2 text-gray-600 text-center">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-indigo-50 px-6">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        {/* Text */}
        <div>
          <h3 className="text-4xl font-bold text-gray-900 mb-6">
            About <span className="text-indigo-600">Learning Buddy</span>
          </h3>
          <p className="text-lg text-gray-700 leading-relaxed">
            Learning Buddy is your AI-powered companion designed to make 
            studying more <span className="font-semibold">interactive</span> 
            and <span className="font-semibold">fun</span>. 
            With smart tools like Chatbot, Summarization, Quizzes, and Podcasts, 
            you can learn, revise, and practice in ways that keep you 
            <span className="font-semibold"> engaged and motivated</span>.
          </p>
          <p className="mt-4 text-lg text-gray-700 leading-relaxed">
            Whether you’re preparing for exams, exploring new topics, 
            or simply revising, Learning Buddy adapts to your needs 
            and helps you learn smarter, not harder. 🚀
          </p>
        </div>

        {/* Illustration / Image */}
        <div className="flex justify-center">
          <img
            src="buddy-2.png"
            alt="Learning illustration"
            className="w-80 md:w-150 rounded-4xl"
          />
        </div>
      </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-white px-6">
      <div className="max-w-4xl mx-auto text-center">
        <h3 className="text-4xl font-bold text-gray-900">
          Get in <span className="text-indigo-600">Touch</span>
        </h3>
        <p className="mt-6 text-lg text-gray-600 max-w-2xl mx-auto">
          Have questions, feedback, or ideas for improvement? 
          We’d love to hear from you!  
          Reach out anytime and let’s make learning better together. 💡
        </p>

        {/* Contact Options */}
        <div className="mt-10 flex flex-col md:flex-row justify-center gap-6">
          <a
            href="mailto:22bq1a05d4@vvit.net"
            className="flex items-center gap-3 bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-indigo-700 transition"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 12H8m8 0l-4-4m4 4l-4 4"
              />
            </svg>
            Email Us
          </a>
          <a
            href="https://github.com/MedaSuneel/Learning_Buddy.git"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 bg-gray-900 text-white px-6 py-3 rounded-xl hover:bg-gray-800 transition"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 0C5.373 0 0 5.373 0 12c0 5.302 3.438 9.8 8.205 11.387..."/>
            </svg>
            GitHub
          </a>
        </div>
      </div>
      </section>


      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-6 text-center">
        <p>© {new Date().getFullYear()} Learning Buddy. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
