import React, {useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {db, auth} from "../../config/firebase"; // Adjust the import path as necessary
import { doc, getDoc, collection, query, onSnapshot, orderBy } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
    
    const Sidebar = ({ sidebarOpen, toggleSidebar, setSelectedChat }) => {

      const navigate = useNavigate();
      const [userEmail, setUserEmail] = useState(null);
      const [chatTitles, setChatTitles] = useState([]);

      useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
          if (user) setUserEmail(user.email);
        });
        return () => unsubscribeAuth();
      }, []);

      useEffect(() => {
        if (!userEmail) return;
        const chatRef = collection(db, "Users", userEmail, "chatHistory");

        const unsubscribe = onSnapshot(chatRef, (snapshot) => {
          const titles = snapshot.docs.map((doc) => ({
            id: doc.id,
            title: doc.data().title || "Untitled Chat"
          }));
          setChatTitles(titles);
        });

        return () => unsubscribe();
      }, [userEmail]);

        return (
          <div
          className={`bg-black text-white p-4 transition-all duration-700 ease-in-out 
            ${sidebarOpen ? "w-1/2 md:w-1/3  lg:w-1/5" : "w-18"} 
            h-screen fixed md:relative z-50 overflow-hidden`}
          >
            <button onClick={toggleSidebar} className="mb-4">
              <img src="menu1.png" className="w-9 h-9 cursor-pointer hover:border-3 hover:rounded-2xl p-1 " alt="Menu" />
            </button>
            {/* {sidebarOpen && (
              <> */}
                <button className="flex items-center  mb-6 cursor-pointer transform hover:scale-80 transition duration-500" 
                    onClick={() => {
                    setSelectedChat(null);
                    setChatHistory([]); // Optional: reset current messages
                  }}>
                  <img src="/plus3.png" className="w-7 h-7 ml-1 " alt="plus" /> 
                  {sidebarOpen && 
                    <p className="text-xl font-semibold ml-3">New Chat</p>
                  }
                </button>

                {sidebarOpen && (
                  <>  
                  {/* History Section (Scrollable) */}
                  <h2 className="text-2xl font-semibold mb-2">History</h2>
                  <div className="flex-1 h-[33vh] p-2 rounded-lg overflow-y-auto scrollbar-thin scrollbar-track-black cursor-pointer">  
                    <ul className="space-y-2">                     
                      
                      {[...chatTitles].reverse().map((chat) => (
                        <li key={chat.id} className="p-2 rounded hover:bg-gray-800" onClick={() => setSelectedChat(chat.id)}>
                          {chat.title.length > 20 ? chat.title.slice(0, 20) + "..." : chat.title}
                        </li>
                      ))}
                      
                    </ul>
                  </div>
                  </>
                )}

                
                  <div className="absolute bottom-0 left-0 w-full p-2 ">
                 
                    <div className="mt-4 mb-2">
                      <div className="flex items-center mb-3 m-2 cursor-pointer transform hover:scale-90 transition duration-500"
                        onClick={() => navigate("/summarize")}>
                        <img src="summary.jpg" className="w-9 h-9 " alt="Summarize" /> 
                        {sidebarOpen && 
                          <p className=" text-xl ml-4">Summarize</p>
                        }
                      </div>
                      <div className="flex items-center mb-3 m-2 cursor-pointer transform hover:scale-90 transition duration-500"
                        onClick={() => navigate("/quizzes")}>
                        <img src="/quiz.jpg" className="w-9 h-9 " alt="Quiz" /> 
                        {sidebarOpen && 
                          <p className=" text-xl ml-4">Quizzes</p>
                        }
                      </div>
                      <div className="flex items-center mb-3 m-2 cursor-pointer transform hover:scale-90 transition duration-500">
                        <img src="/video2.jpg" className="w-8 h-8 mr-2" alt="Translate" /> 
                        {sidebarOpen && 
                          <p className=" text-xl ml-4">Translate Video</p>
                        }
                      </div>
                      <div className="flex items-center mb-3 m-2 cursor-pointer transform hover:scale-90 transition duration-500"
                        onClick={() => navigate("/podcast")}>
                        <img src="/quiz.jpg" className="w-8 h-8 mr-2" alt="Podcast" /> 
                        {sidebarOpen && 
                          <p className=" text-xl ml-4">Podcasts</p>
                        }
                      </div>
                      <div className="flex items-center mb-3 m-2 cursor-pointer transform hover:scale-90 transition duration-500"
                        onClick={() => navigate("/mock-interview-report")}>
                        <img src="/video2.jpg" className="w-8 h-8 mr-2" alt="Translate" /> 
                        {sidebarOpen && 
                          <p className=" text-xl ml-4">Mock Interviews</p>
                        }
                      </div>
                    </div>
                  </div>
              
          </div>
        );
      };
      
export default Sidebar