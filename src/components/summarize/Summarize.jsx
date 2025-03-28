import React from 'react';
import { useState } from "react";

const Summarize = () => {

  const [file, setFile] = useState(null);
  const [fileContent, setFileContent] = useState("");
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");

  const API_KEY = "AIzaSyByX-fUS3WN2m03PILJCTbYgL-okmYqxy0"; // Your API Key
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`;

  // Handle File Selection
  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      readFileContent(selectedFile);
    }
  };

  // Read File Content
  const readFileContent = (file) => {
    const reader = new FileReader();

    if (file.type === "text/plain") {
      reader.onload = (e) => setFileContent(e.target.result);
      reader.readAsText(file);
    } else if (file.type === "application/pdf" || file.name.endsWith(".docx")) {
      reader.onload = (e) => setFileContent("[File content extracted]");
      reader.readAsArrayBuffer(file);
    } else {
      alert("Unsupported file type. Upload a TXT, PDF, or DOCX file.");
    }
  };

  // Remove File
  const removeFile = () => {
    setFile(null);
    setFileContent("");
  };

  // Send Data to Gemini API
  const handleSend = async () => {
    if (!prompt.trim() && !fileContent) return;

    const requestBody = {
      contents: [
        {
          parts: [
            { text: fileContent ? `File content: ${fileContent}\nUser prompt: ${prompt}` : prompt }
          ]
        }
      ]
    };

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      setResponse(data.candidates?.[0]?.content?.parts?.[0]?.text || "No response received.");
    } catch (error) {
      console.error("Error sending request:", error);
    }

    setPrompt("");
    setFile(null);
    setFileContent("");
  };

  return (
    <div className="flex-1 flex flex-col bg-green-900 text-white p-4  md:ml-0  w-full overflow-hidden">
    {/* <div className="flex justify-between items-center"> */}
      <h1>Summarize</h1>
        <div className="flex flex-col w-full p-4">
      {/* Chat Input Section */}
      <div className="flex items-center border rounded-lg p-2 bg-white shadow-md w-full">
        {/* Upload File Button */}
        <label className="cursor-pointer flex items-center px-3 py-2 border-r border-gray-300">
          <span className="text-gray-600 text-sm">+</span>
          <input type="file" className="hidden" onChange={handleFileChange} />
        </label>

        {/* File Preview */}
        {file && (
          <div className="flex items-center bg-gray-200 rounded px-2 py-1 mr-2">
            <span className="text-sm">{file.name.endsWith(".pdf") ? "📄 PDF" : "📜 Text"}</span>
            <button className="ml-2 text-xs text-gray-500" onClick={removeFile}>✖</button>
          </div>
        )}

        {/* Text Input */}
        <input
          type="text"
          placeholder="Type your prompt..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="flex-1 px-2 py-1 outline-none text-gray-700"
        />

        {/* Send Button */}
        <button onClick={handleSend} className="text-blue-500 ml-2 px-4 py-1 border-l border-gray-300">
          Send
        </button>
      </div>

      {/* Response Output Section */}
      {response && (
        <div className="mt-4 p-4 bg-gray-100 border rounded">
          <p className="text-gray-700">{response}</p>
        </div>
      )}
    </div>
    {/* </div>  */}
    </div>
  )
}

export default Summarize;