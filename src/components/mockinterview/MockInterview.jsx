import React, { useState, useEffect, useRef } from "react";
import { db, auth } from "../../config/firebase";
import {doc,collection,addDoc,getDocs,serverTimestamp} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";

// ✅ --- Gemini API Setup ---
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY; // 🔑 Replace with your key
const GEMINI_URL = import.meta.env.VITE_GEMINI_API_URL;



// 🔹 Generic Gemini Call
async function callGeminiAPI(prompt) {
  try {
    const response = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 800 }, // 🔹 tuned
      }),
    });

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    return cleanResponse(text);
  } catch (err) {
    console.error("❌ API Error:", err);
    return "";
  }
}

// 🔹 Cleanup & JSON Parsing (centralized)
function cleanResponse(text) {
  if (!text) return "";

  // remove Markdown formatting if Gemini wrapped it
  let cleaned = text.replace(/```json|```/g, "").trim();

  return cleaned;
}

function safeParseJSON(str, fallback) {
  try {
    return JSON.parse(str);
  } catch (e) {
    console.warn("⚠️ JSON Parse Failed, returning fallback:", e);
    return fallback;
  }
}

// ✅ --- Feature Functions ---

// 1️⃣ Generate Interview Questions
async function fetchQuestions(role, level, mode, count) {
  const prompt = `Generate ${count} interview questions for a ${role} interview.
Difficulty: ${level}. Mode: ${mode}.
Return ONLY JSON array like:
[{"qid":1,"text":"your question"}]`;

  const res = await callGeminiAPI(prompt);
  return safeParseJSON(res, [
    { qid: 1, text: "Error parsing AI response. Try again." },
  ]);
}

// 2️⃣ Evaluate User Answer
async function evaluateAnswer(question, answer) {
  const prompt = `Evaluate the user's answer.

Q: ${question}
Answer: ${answer}

Return ONLY JSON:
{"rating":1-5,"feedback":"short feedback","suggestions":"how to improve"}`;

  const res = await callGeminiAPI(prompt);
  return safeParseJSON(res, {
    rating: 3,
    feedback: "Default feedback due to parse error.",
    suggestions: "Answer more clearly.",
  });
}

// 3️⃣ Generate Final Report
async function generateReport(allFeedback) {
  const feedbackText = JSON.stringify(allFeedback);
  const prompt = `Summarize the interview feedback below:

${feedbackText}

Return ONLY JSON:
{
 "overallScore": number,
 "strengths": "text",
 "weaknesses": "text",
 "suggestions": "text"
}`;

  const res = await callGeminiAPI(prompt);
  return safeParseJSON(res, {
    overallScore: 3,
    strengths: "Default",
    weaknesses: "Default",
    suggestions: "Default",
  });
}


// 🔹 --- Component ---
function MockInterview() {
  const [user, setUser] = useState(null);
  const [interviews, setInterviews] = useState([]);

  const navigate = useNavigate(); 

  const [setup, setSetup] = useState({
    role: "Frontend",
    difficulty: "Beginner",
    mode: "Technical",
    count: 5,
  });

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [userAnswer, setUserAnswer] = useState("");
  const [report, setReport] = useState(null);
  const [interviewId, setInterviewId] = useState(null);

  const recognitionRef = useRef(null); // for speech-to-text

  // 🔹 Load user + saved interviews
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      if (u && u.email) {
        setUser(u);
        const userDocRef = doc(db, "Users", u.email);
        const interviewsRef = collection(userDocRef, "mock_interviews");
        const querySnapshot = await getDocs(interviewsRef);
        const data = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setInterviews(data);
      }
    });
    return () => unsubscribe();
  }, []);

  // 🔊 Read question aloud when displayed
  useEffect(() => {
    if (questions.length && questions[currentIndex]) {
      const utterance = new SpeechSynthesisUtterance(
        questions[currentIndex].text
      );
      utterance.lang = "en-US";
      speechSynthesis.speak(utterance);
    }
  }, [currentIndex, questions]);

  // 🎙️ Start speech-to-text
  const startListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition not supported in this browser.");
      return;
    }
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.lang = "en-US";
    recognitionRef.current.interimResults = false;
    recognitionRef.current.maxAlternatives = 1;

    recognitionRef.current.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setUserAnswer((prev) => prev + " " + transcript);
    };

    recognitionRef.current.start();
  };

  // 🔹 Start interview
  const handleStart = async () => {
    const qs = await fetchQuestions(
      setup.role,
      setup.difficulty,
      setup.mode,
      setup.count
    );
    setQuestions(qs);
    setCurrentIndex(0);
    setAnswers([]);
    setReport(null);

    if (user?.email) {
      const userDocRef = doc(db, "Users", user.email);
      const interviewsRef = collection(userDocRef, "mock_interviews");
      const newInterview = await addDoc(interviewsRef, {
        role: setup.role,
        difficulty: setup.difficulty,
        mode: setup.mode,
        questions: qs,
        timestamp: serverTimestamp(),
      });
      setInterviewId(newInterview.id);
    }
  };

  // 🔹 Submit answer
  const handleSubmitAnswer = async () => {
    const q = questions[currentIndex];
    const feedback = await evaluateAnswer(q.text, userAnswer);

    const updatedAnswers = [
      ...answers,
      { qid: q.qid, question: q.text, userAnswer, ...feedback },
    ];
    setAnswers(updatedAnswers);
    setUserAnswer("");

    if (user?.email && interviewId) {
      const userDocRef = doc(db, "Users", user.email);
      const interviewsRef = collection(userDocRef, "mock_interviews");
      const interviewDoc = doc(interviewsRef, interviewId);
      await addDoc(collection(interviewDoc, "answers"), {
        qid: q.qid,
        question: q.text,
        userAnswer,
        ...feedback,
      });
    }

    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(currentIndex + 1);
    } else {
      const rpt = await generateReport(updatedAnswers);
      setReport(rpt);

      if (user?.email && interviewId) {
        const userDocRef = doc(db, "Users", user.email);
        const interviewsRef = collection(userDocRef, "mock_interviews");
        const interviewDoc = doc(interviewsRef, interviewId);
        await addDoc(collection(interviewDoc, "report"), rpt);
      }
    }
  };

  return (
    <div className="flex flex-col w-full h-full overflow-hidden  p-4  bg-gray-900 text-white">
      {/* Setup Screen */}
      {!questions.length && !report && (
        <div className="p-6 rounded-2xl shadow-md border bg-gray-900">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Start Mock Interview</h2>

            {/* Setup Form */}
            <div className="space-y-4">
            {/* Role */}
            <div className="flex items-center justify-between">
            <label className="w-1/3 text-gray-200 font-medium">Role</label>
            <select
                value={setup.role}
                onChange={(e) => setSetup({ ...setup, role: e.target.value })}
                className="p-2 rounded border w-2/3 bg-gray-900 text-white"
            >
                <option>Frontend</option>
                <option>Backend</option>
                <option>Data Science</option>
                <option>Machine Learning</option>
                <option>HR</option>
            </select>
            </div>

            {/* Difficulty */}
            <div className="flex items-center justify-between">
            <label className="w-1/3 text-gray-200 font-medium">Difficulty</label>
            <select
                value={setup.difficulty}
                onChange={(e) => setSetup({ ...setup, difficulty: e.target.value })}
                className="p-2 rounded border w-2/3 bg-gray-900 text-white"
            >
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Advanced</option>
            </select>
            </div>

            {/* Mode */}
            <div className="flex items-center justify-between">
            <label className="w-1/3 text-gray-200 font-medium">Mode</label>
            <select
                value={setup.mode}
                onChange={(e) => setSetup({ ...setup, mode: e.target.value })}
                className="p-2 rounded border w-2/3 bg-gray-900 text-white"
            >
                <option>Technical</option>
                <option>HR</option>
                <option>Mixed</option>
            </select>
            </div>

            {/* Question Count */}
            <div className="flex items-center justify-between">
            <label className="w-1/3 text-gray-200 font-medium">Question Count</label>
            <input
                type="number"
                min="1"
                max="15"
                value={setup.count}
                onChange={(e) =>
                setSetup({ ...setup, count: Number(e.target.value) })
                }
                className="p-2 rounded border w-2/3 bg-gray-900 text-white"
            />
            </div>
            </div>


            <button
              onClick={handleStart}
              className="w-full py-2 px-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:opacity-70 transition disabled:opacity-50 text-white rounded-lg cursor-pointer"
            >
              Start Interview
            </button>
          </div>
        </div>
      )}

      {/* Interview Screen */}
      {questions.length > 0 && !report && (
        <div className="p-6 rounded-2xl shadow-md border bg-gray-900">
          <h3 className="text-lg font-medium">
            Question {currentIndex + 1} of {questions.length}
          </h3>
          <p className="my-4">{questions[currentIndex].text}</p>

          <textarea
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            className="w-full p-2 border rounded"
            rows="4"
            placeholder="Type or speak your answer..."
          />

          <div className="flex gap-2 mt-4">
            <button
              onClick={handleSubmitAnswer}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 cursor-pointer"
            >
              Submit Answer
            </button>
            <button
              onClick={startListening}
              className="px-4 py-2 border rounded-lg hover:bg-gray-700  cursor-pointer"
            >
              🎙️ Speak
            </button>
          </div>
        </div>
      )}

      {/* Report Screen */}
      {report && (
        <div>
            <h2 className="text-2xl font-semibold my-4">Final Report</h2>
        <div className="p-6 rounded-2xl shadow-md border bg-gray-900">
          
          <p>
            <strong>Overall Score:</strong> {report.overallScore}/5
          </p>
          <p>
            <strong>Strengths:</strong> {report.strengths}
          </p>
          <p>
            <strong>Weaknesses:</strong> {report.weaknesses}
          </p>
          <p>
            <strong>Suggestions:</strong> {report.suggestions}
          </p>
          
        </div>
        <div className="my-4 flex justify-center "> 
            <button 
            className="bg-white text-black text-lg font-semibold px-4 py-2 rounded cursor-pointer hover:bg-gray-400"
            onClick={() => navigate("/mock-interview-report")}
            >
                Back to Dashboard
            </button>
            </div>
        </div>
        
      )}
    </div>
  );
}

export default MockInterview;
