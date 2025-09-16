import React from "react";
import { useNavigate } from "react-router-dom";

const Header = () => {

  const navigate = useNavigate();

  return (
    <div className="flex flex-col bg-gray-900 text-white h-20 p-3 md:ml-0  w-full overflow-hidden">
    <div className="flex justify-between items-center">
      <div className="flex gap-3 items-center cursor-pointer transform hover:scale-107  duration-300" 
            onClick={() => navigate("/main")}>
        <img src="Chatbot.jpg" className="w-11 h-11 rounded-3xl" alt="Menu" />
        <h1 className="text-xl font-bold">Learning Buddy</h1>
      </div>
      <img src="Profile.png" className="w-12 h-12 rounded-full md:mx-4 sm:m-0 cursor-pointer transform hover:scale-115  duration-300 " alt="Profile" 
              onClick={() => navigate("/profile")}/>
    </div> 
    </div>
  );
};

export default Header;
