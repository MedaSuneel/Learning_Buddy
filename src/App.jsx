import './App.css'
import Sidebar from './components/sidebar/Sidebar'
import Main from './components/home/Main'
import Header from './components/header/Header'
import Summarize from './components/summarize/Summarize'
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
  
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  }

  return (
    <div className="flex h-screen w-screen m-0 p-0 overflow-hidden">
      <Router>
        <Routes>
          {/* Login Route (Displayed First) */}
          {/* <Route path="/" element={<Login />} /> */}
          
          {/* Protected Layout */}
          <Route 
            path="/*" 
            element={
              <div className="flex h-screen w-full">
                <Sidebar sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
                <div className="flex-1 flex flex-col bg-gray-900 text-white ml-16 md:ml-0 w-full overflow-hidden">
                  <Header/>
                  <Routes>
                    <Route path="/" element={<Main />} /> 
                    <Route path="/summarize" element={<Summarize />} /> 
                  </Routes>
                  
                </div>
              </div>
            } 
          />
        </Routes>
      </Router>
      {/* <Router>
        <Sidebar sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
          <div className="flex-1 flex flex-col bg-gray-900 text-white p-4 ml-16  md:ml-0  w-full overflow-hidden">
            <Routes>
              <Route path="/" element={<Main />} />
            </Routes>
            <Header/>
            <Main /> 
          </div>
      </Router> */}
    </div>
  );
};


//   return (
//     <>
//       {/* <div className>
//       <h1 className="sm:text-3xl font-bold underline bg-red-600 p-10 lg:bg-green-500">
//         Hello world!
//       </h1>
//       <img src="vite.svg" alt="react logo" className="w-20 h-20" />
//       <img src="react.svg" alt="react" className="w-20 h-20"/>
//       </div> */}
//       <Sidebar/>
//     </>
//   )
// }

export default App
