import React, { useState } from "react";
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist/legacy/build/pdf";
import workerSrc from "pdfjs-dist/legacy/build/pdf.worker.min.js?url";
import mammoth from "mammoth";
import { GoogleGenerativeAI } from "@google/generative-ai";


GlobalWorkerOptions.workerSrc = workerSrc;

const Summarize = () => {
  const [file, setFile] = useState(null);
  const [fileContent, setFileContent] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [customPrompt, setCustomPrompt] = useState("");

  const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

  // const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
  // const endpoint = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

  const handleFileChange = async (event) => {
    const selectedFile = event.target.files[0];
    if (!selectedFile) return;

    setFile(selectedFile);

    if (selectedFile.type === "text/plain") {
      const text = await selectedFile.text();
      setFileContent(text);
    } else if (selectedFile.type === "application/pdf") {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const pdf = await getDocument({ data: arrayBuffer }).promise;

      let fullText = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const text = content.items.map((item) => item.str).join(" ");
        fullText += `Page ${i}:\n${text}\n\n`;
      }

      setFileContent(fullText);
    } else if (selectedFile.name.endsWith(".docx")) {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      setFileContent(result.value);
    } else {
      alert("Unsupported file type. Please upload .txt, .pdf, or .docx.");
    }
  };

  const removeFile = () => {
    setFile(null);
    setFileContent("");
  };

  const handleSend = async () => {
  if (!fileContent.trim()) return;
  setLoading(true);
  setResponse("");

  try {
    // Choose the Gemini model
    const model = genAI.getGenerativeModel({model: "gemini-2.0-flash",});

    // Combine custom prompt + uploaded file content
    const prompt = `${customPrompt}\n\n${fileContent}`;

    // Generate summary
    const result = await model.generateContent(prompt);

    // Extract text safely
    const text = result?.response?.text();
    if (text) {
      setResponse(text);
    } else {
      setResponse("❌ Gemini Error: No valid response");
    }
  } catch (error) {
    console.error("❌ Error sending request:", error);
    setResponse("❌ Request failed: " + error.message);
  }

  setLoading(false);
};


  return (
    <div className="flex flex-col w-full h-full overflow-hidden  p-4  bg-gray-900 text-white">

        {/* Upload & Original Text (right) */}
        <div className="w-full  bg-gray-900 text-white p-4 rounded shadow">
          <div className=" flex ">
            <div>
              <label htmlFor="file-upload" className="cursor-pointer">
                <img src="upload.jpg" alt="Upload" className="w-29 h-10 hover:scale-110 rounded-2xl " />
                <input id="file-upload" type="file" onChange={handleFileChange} className="hidden" />
              </label>
            </div>
            <div>
              {file && (
                <div className="mt-2 ml-4 text-sm text-white">
                   {file.name}
                  <button onClick={removeFile} className="ml-2 text-red-500">✖</button>
                </div>
              )}
            </div>
          

            {/* Prompt Text Area */}
            <div className=" ml-5 w-[50%]">
              
              <textarea
                id="summary-prompt"
                rows={1}
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="e.g., Summarize in 10 lines, or Summarize in detail"
                className="w-full border border-gray-400 rounded px-3 py-2 text-white"
              />
            </div>
          
            {/* Summarize Button */}
            <div className="ml-5">
              <button
                onClick={handleSend}
                disabled={!file || !customPrompt.trim()}
                className={`px-4 py-2 rounded-2xl  text-white ${
                  file && customPrompt.trim()
                    ? "bg-orange-500 hover:bg-orange-700 cursor-pointer "
                    : "bg-gray-600 cursor-not-allowed"
                }`}
              >
                Summarize
              </button>
            </div>
          </div>
        </div>

      {/* Summary (left) */}
      <div className="w-full bg-gray-900 text-white p-4 rounded shadow overflow-auto max-h-[80vh]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold mb-2">📝 Summary</h2>
          <button
            onClick={() => navigator.clipboard.writeText(response)}
            className="flex items-center gap-2 text-white cursor-pointer rounded-2xl hover:bg-gray-500">
            <div className="flex gap-2   items-center">
              <img src="copy2.png" alt="Copy" className="w-8 h-8 rounded-xl " />
              <span className="text-lg font-bold">Copy</span>
            </div>
          </button>
        </div>
        {loading ? 
          <div className="flex flex-col w-full items-center gap-4 text-white mt-4">
            <hr className="h-8 w-full bg-gradient-to-r from-blue-400 to-purple-400 rounded-full animate-bounce"></hr>
            <div className="h-8 w-full bg-gradient-to-r from-blue-400 to-purple-400 rounded-full animate-bounce delay-150"></div>
            <div className="h-8 w-full bg-gradient-to-r from-blue-400 to-purple-400 rounded-full animate-bounce delay-300"></div>
          </div> 
        : 
         <p className="whitespace-pre-wrap text-lg font-semibold p-4 rounded-2xl bg-white text-black ">{response}</p>
          
        }
      </div>

      
    </div>
  );
};

export default Summarize;
