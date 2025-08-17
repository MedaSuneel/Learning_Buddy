// src/components/NewQuizForm.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Routes, Route, useNavigate, useParams } from "react-router-dom";
import { db, auth } from "../../config/firebase";
import { onAuthStateChanged } from "firebase/auth";
import {doc,setDoc,getDoc,updateDoc,serverTimestamp,} from "firebase/firestore";

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
const GEMINI_API_KEY = "AIzaSyAWv2l_khRuqt-YdisLG2DSrRq68dyZRgc"; // Replace with your actual API key

//Safe JSON extraction from LLM text

function extractJsonArray(text) {
  if (!text) return null;
  // Try code-fenced JSON first
  const fenceMatch = text.match(/```json\n([\s\S]*?)```/i) || text.match(/```\n([\s\S]*?)```/i);
  let candidate = fenceMatch ? fenceMatch[1] : text;
  // Trim boilerplate around JSON array
  const start = candidate.indexOf("[");
  const end = candidate.lastIndexOf("]");
  if (start !== -1 && end !== -1 && end > start) {
    candidate = candidate.slice(start, end + 1);
  }
  try {
    const parsed = JSON.parse(candidate);
    if (Array.isArray(parsed)) return parsed;
  } catch (_) {}
  return null;
}

function NewQuizForm() {
  const [topic, setTopic] = useState("");
  const [numQuestions, setNumQuestions] = useState(5);
  const [difficulty, setDifficulty] = useState("easy");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // 1) Get current user
    const currentUser = await new Promise((resolve) => {
      const unsub = onAuthStateChanged(auth, (u) => {
        unsub();
        resolve(u || null);
      });
    });

    if (!currentUser || !currentUser.email) {
      setError("Please sign in to create a quiz.");
      setLoading(false);
      return;
    }

    try {
      // 2) Ask Gemini to generate quiz questions
      const prompt = `Create a ${difficulty} quiz on the topic "${topic}" with ${numQuestions} multiple-choice questions.\n\nSTRICTLY return only a JSON array where each element is an object with the exact keys: \n- question (string)\n- options (array of exactly 4 strings)\n- answer (string, exactly matching one of the options)\n- explanation (string, brief reason)\n\nNo extra text.`;

      const res = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      });

      if (!res.ok) throw new Error(`Gemini error: ${res.status}`);
      const data = await res.json();
      const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
      const questions = extractJsonArray(raw);
      if (!questions || questions.length === 0) {
        throw new Error("Could not parse questions from Gemini response.");
      }

      // 3) Build Firestore doc
      const quizId = `quiz_${Date.now()}`;
      const quizRef = doc(db, "Users", currentUser.email, "quizzes", quizId);

      await setDoc(quizRef, {
        topic: topic.trim(),
        numQuestions: Number(numQuestions),
        difficulty,
        questions, // array of {question, options[], answer, explanation}
        score: 0,
        userAnswers: Array.from({ length: Number(numQuestions) }, () => ""),
        attemptedAt: serverTimestamp(),
      });

      // 4) Go to the quiz taking screen
      navigate(`/quiz/${quizId}`);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to generate quiz. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Create a New Quiz</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Topic</label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="border rounded-xl w-full p-3 focus:outline-none focus:ring"
            placeholder="e.g., Photosynthesis"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Number of Questions</label>
          <input
            type="number"
            min={1}
            max={20}
            value={numQuestions}
            onChange={(e) => setNumQuestions(Number(e.target.value))}
            className="border rounded-xl w-full p-3 focus:outline-none focus:ring"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Difficulty</label>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="border rounded-xl w-full p-3 focus:outline-none focus:ring"
          >
            <option value="easy">Easy</option>
            <option value="moderate">Moderate</option>
            <option value="difficult">Difficult</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-3 rounded-2xl shadow"
        >
          {loading ? "Generating quiz…" : "Start Quiz"}
        </button>

        {error && (
          <p className="text-red-600 text-sm mt-2">{error}</p>
        )}
      </form>
    </div>
  );
}

export default NewQuizForm;
