import React, {useRef ,useEffect,  useState } from "react";
import Header from "../header/Header";

function Main() {

  const [message, setMessage] = useState("");
  const [inputQuery, setInputQuery] = useState(""); // New state to store the message before clearing
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const messagesEndRef = useRef(null);


  // Function to scroll to the latest message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom(); // Scroll down whenever messages update
  }, [message]);


  const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
  const API_KEY = "AIzaSyByX-fUS3WN2m03PILJCTbYgL-okmYqxy0"; // Replace with your actual API key


  const handleInput = (e) => {
    setMessage(e.target.value);
    
    // Auto-adjust the height dynamically
    e.target.rows = 1; // Reset to single row
    const lineBreaks = e.target.value.split("\n").length; // Count lines
    e.target.rows = Math.min(lineBreaks, 7); // Set rows up to max 7
  };
  

  const formatResponse = (text) => {
    if (!text) return null;
  
    const block1 = text.split("\n\n"); // Split text into meaningful sections
  
    return block1.map((block, index1) => {
      // **Code Blocks (Java, Python, Bash, etc.)**
      if (block.startsWith("```") && block.endsWith("```")) {
        return (
          <div
            key={index1}
            className="bg-black text-green-500 p-4 md:w-full sm:w-[65vw] rounded-lg text-lg overflow-x-auto my-4 border-3 border-white shadow-md"
          >
            <pre className="whitespace-pre p-4 rounded overflow-x-auto">
              <code className="text-green-400 font-mono">
                {block.replace(/```/g, "").trim()}
              </code>
            </pre>
          </div>
        );
      }
  
      // **Tables**
      if (/^\|(.+\|)+\n\|(-+\|)+/.test(block)) {
        const lines = block.trim().split("\n");
        const headers = lines[0].split("|").map(cell => cell.trim()).filter(cell => cell);
        const rows = lines.slice(2).map(line => line.split("|").map(cell => cell.trim()).filter(cell => cell));
  
        return (
          <div key={index1} className="overflow-x-auto sm:mt-4 md:m-4 rounded-lg text-center shadow-md">
            <div className="md:w-[80vw] sm:w-[68vw]">
              <table className="border-collapse size-full text-left text-sm text-gray-200 overflow-x-visible">
                <thead className="font-bold bg-black text-white">
                  <tr>
                    {headers.map((header, i) => (
                      <th key={i} className="border border-white sm:text-lg md:text-xl sm:p-3 md:p-3 text-center">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, i) => (
                    <tr key={i} className="bg-gray-700">
                      {row.map((cell, j) => (
                        <td key={j} className="bg-black border border-white p-1 text-left">{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      }
  
      // **Further Process `block` for Headings, Paragraphs, Lists, etc.**
      const blocks = block.split(/\n(?=\S)/); // Split each line properly
  
      return blocks.map((subBlock, index2) => {
        const uniqueKey = `${index1}-${index2}`; // Unique key for nested mapping
  
        // **Headings (H1–H6)**
        if (/^(#{1,6})\s+/.test(subBlock)) {
          const headingLevel = subBlock.match(/^#{1,6}/)[0].length;
          const headingText = subBlock.replace(/^#{1,6}\s+/, "").trim();
  
          const headingStyles = [
            "text-4xl font-bold text-white mt-5 border-b pb-2",
            "text-3xl font-bold text-white mt-4",
            "text-2xl font-semibold text-green-400 mt-3",
            "text-xl font-medium text-pink-400 mt-2",
            "text-lg font-medium text-purple-400 mt-2",
            "text-base font-medium text-blue-400 mt-2",
          ];
  
          return (
            <div key={uniqueKey} className="mt-4">
              {React.createElement(
                `h${headingLevel}`,
                { className: headingStyles[headingLevel - 1] },
                headingText
              )}
            </div>
          );
        }
  
        // **Bold Text (`**bold**`)**
        if (/\*\*(.*?)\*\*/.test(subBlock)) {
          return (
            <p key={uniqueKey} className="text-white text-lg mt-2">
              {subBlock.split(/\*\*(.*?)\*\*/).map((part, i) =>
                i % 2 === 1 ? <strong key={i} className="text-yellow-300 text-xl font-semibold">{part}</strong> : part
              )}
            </p>
          );
        }
  
        // **Italic Text (`*italic*`)**
        if (/\*(.*?)\*/.test(subBlock)) {
          return (
            <p key={uniqueKey} className="text-white text-lg mt-2">
              {subBlock.split(/\*(.*?)\*/).map((part, i) =>
                i % 2 === 1 ? <em key={i} className="text-blue-300 text-xl italic">{part}</em> : part
              )}
            </p>
          );
        }
  
        // **Unordered Lists (`*` or `-`)**
        if (/^(\*|\-)\s+/.test(subBlock)) {
          const items = subBlock.split("\n").map((item, i) => (
            <li key={i} className="ml-5 list-disc">{item.replace(/^(\*|\-)\s+/, "")}</li>
          ));
          return <ul key={uniqueKey} className="text-white mt-2">{items}</ul>;
        }
  
        // **Ordered Lists (`1. 2. 3.`)**
        if (/^\d+\.\s+/.test(subBlock)) {
          const items = subBlock.split("\n").map((item, i) => (
            <li key={i} className="ml-5 list-decimal">{item.replace(/^\d+\.\s+/, "")}</li>
          ));
          return <ol key={uniqueKey} className="text-white mt-2">{items}</ol>;
        }
  
        // **Blockquotes (`> Quote`)**
        if (subBlock.startsWith("> ")) {
          const lines = subBlock.split("\n").map(line => line.replace(/^>\s*/, "").trim());
          const quoteText = lines[0]; 
          const authorText = lines.length > 1 ? lines[1].replace(/^-/, "").trim() : "";
  
          return (
            <blockquote
              key={uniqueKey}
              className="border-l-4 border-white bg-gray-800 p-4 rounded-md italic"
            >
              <p className="text-lg font-semibold text-[#ff9900]">“{quoteText}”</p>
              {authorText && <p className="text-sm text-white mt-2">- {authorText}</p>}
            </blockquote>
          );
        }
  
        // **Default Text (for normal paragraphs)**
        return <p key={uniqueKey} className="text-white text-lg mt-2">{subBlock}</p>;
      });
    });
  };
  
  

  const sendMessage = async () => {
    if (!message.trim()) return;

    setInputQuery(message); // Store message before resetting

    const newMessage = { role: "user", content: message };
    setChatHistory([...chatHistory, newMessage]);
    // setMessage(""); // Clear input field
    setLoading(true);

    try {
      const requestBody = {
        contents: [{ parts: [{ text: message }] }],
        generationConfig: {
          temperature: 1,
          topP: 0.95,
          topK: 40,
          maxOutputTokens: 8192,
          responseMimeType: "text/plain",
        },
      };

      const response = await fetch(`${API_URL}?key=${API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });


      const data = await response.json();
      const botReply = data.candidates?.[0]?.content?.parts?.[0]?.text || "No response received.";

      setChatHistory([...chatHistory, newMessage, { role: "bot", content: botReply }]);
    } catch (error) {
      console.error("Error fetching response:", error);
    } finally {
      setLoading(false);
    }

    setMessage(""); // Clear input field

    // Reset textarea rows to 1
    if (inputRef.current) {
      inputRef.current.rows = 1;
    }

  };

  

  return (
    <div className="flex-1 flex flex-col bg-gray-900 text-white p-4  md:ml-0  w-full overflow-hidden">

    
    {/* Chat Messages Display */}
    <div className="flex-1 overflow-y-auto overflow-x-hidden p-1 space-y-4 ">
      <div className="lg:mx-15 " >
        {chatHistory.map((chat, index) => (
          <div
            key={index}
            className={`p-1 rounded-lg w-fit ${
              chat.role === "user" ? "bg-white text-black text-xl font-bold p-3 ml-auto max-w-[50vw] text-left" : "bg-gray-900 text-white text-xl w-full font-semibold self-start text-left"
            }`}
          >
            {chat.role === "bot" ? (

                <div className="relative bg-gray-900 p-4  w-full">
                  {formatResponse(chat.content)}

                  {/* Icons below response */}
                  <div className="flex justify-start gap-8 mt-4 border-t pt-3">
                    {/* Copy Icon */}
                    <button
                      onClick={() => navigator.clipboard.writeText(chat.content)}
                      className="flex items-center gap-2 text-gray-300 cursor-pointer rounded-2xl hover:bg-gray-500"
                    >
                      <img src="copy2.png" alt="Copy" className="w-11 h-11 rounded-2xl " />
                    </button>

                    {/* Web Search Icon */}
                    <a
                      href={`https://www.google.com/search?q=${encodeURIComponent(inputQuery)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-gray-300 rounded-2xl hover:bg-gray-500"
                    >
                      <img src="web.png" alt="Copy" className="w-11 h-11 rounded-2xl " />
                    </a>

                    {/* YouTube Search Icon */}
                    <a
                      href={`https://www.youtube.com/results?search_query=${encodeURIComponent(inputQuery)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-gray-300 rounded-2xl hover:text-gray-500"
                    >
                      <img src="youtube.png" alt="Copy" className="w-13 h-10 " />
                    </a>
                  </div>
                </div>
             ) : chat.content}

              <div ref={messagesEndRef} />
          </div>  
        ))}
        <div className="flex gap-5 w-full">
          <div className="relative w-15 h-15 flex items-center justify-center">
            {/* Show Image Only While Generating or Statically After Completion */}
            {loading && (
              <img
                src="Chatbot.jpg"
                alt="Loading..."
                className="w-10 h-10 object-cover rounded-full"
              />
            )}
            
            {/* Rotating Border Only During Loading */}
            {loading && (
              <div className="absolute inset-0 w-full h-full border-4 border-white border-l rounded-full animate-spin"></div>
            )}
          </div>
          <div className="w-full">
            {loading &&(
              <div className="flex flex-col w-full items-center gap-4 text-white mt-4">
                <hr className="h-8 w-full bg-gradient-to-r from-blue-400 to-purple-400 rounded-full animate-bounce"></hr>
                <div className="h-8 w-full bg-gradient-to-r from-blue-400 to-purple-400 rounded-full animate-bounce delay-150"></div>
                <div className="h-8 w-full bg-gradient-to-r from-blue-400 to-purple-400 rounded-full animate-bounce delay-300"></div>
              </div>
            )}
          </div>
        </div> 
      </div>
    </div>

    <div className="flex items-center bg-gray-900 border-3 border-white p-3 rounded-4xl ">
      <button className="mr-2">📎</button>
      <textarea
        type="text"
        rows="1"
        value={message}
        ref={inputRef}
        onChange={handleInput}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault(); // Prevents new line on Enter
            sendMessage();
          }
        }}
        className="flex-1 p-2  bg-gray-900  text-lg overflow-y-auto focus:outline-none "
        placeholder="Type a message..."
      />
      {message.trim() ? (
          <button onClick={sendMessage} className="ml-2 ">
            <img src="send.png" alt="Send" className="w-10 h-10 cursor-pointer hover:bg-gray-500 hover:border-3 p-1 rounded-full transform hover:scale-115 " />
          </button>
      ) : (
        <button className="ml-2">
          <img src="mic.png" alt="Mic" className="w-10 h-10 cursor-pointer border-3 rounded-full p-1  transform hover:scale-115" />
        </button>
      )}
    </div>
  </div>
  )
}

export default Main