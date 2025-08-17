import React, { useEffect, useMemo, useState } from "react";
import { Routes, Route, useNavigate, useParams } from "react-router-dom";
import { db, auth } from "../../config/firebase";
import { onAuthStateChanged } from "firebase/auth";
import {doc,setDoc,getDoc,updateDoc,serverTimestamp,} from "firebase/firestore";

function QuizTake() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState("");
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState([]); // local selection mirror
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Get user once
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUserEmail(u?.email || "");
    });
    return () => unsub();
  }, []);

  // Load quiz
  useEffect(() => {
    const load = async () => {
      try {
        if (!userEmail) return; // wait until user is known
        const ref = doc(db, "Users", userEmail, "quizzes", quizId);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data();
          setQuiz({ id: quizId, ...data });
          setAnswers(data.userAnswers || Array(data.numQuestions).fill(""));
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [quizId, userEmail]);

  const quizRef = useMemo(() => {
    if (!userEmail || !quizId) return null;
    return doc(db, "Users", userEmail, "quizzes", quizId);
  }, [userEmail, quizId]);

  const onSelect = async (qIdx, option) => {
    const next = [...answers];
    next[qIdx] = option;
    setAnswers(next);
    // Persist selection immediately
    if (quizRef) {
      try {
        await updateDoc(quizRef, { userAnswers: next });
      } catch (e) {
        console.error("Failed to save answer", e);
      }
    }
  };

  const onSubmitQuiz = async () => {
    if (!quiz || !quizRef) return;
    setSaving(true);
    try {
      // Compute score
      let score = 0;
      quiz.questions.forEach((q, i) => {
        if (answers[i] && answers[i] === q.answer) score += 1;
      });

      await updateDoc(quizRef, {
        userAnswers: answers,
        score,
        attemptedAt: serverTimestamp(),
      });

      navigate(`/quiz-review/${quiz.id}`);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-6">Loading quiz…</div>;
  if (!quiz) return <div className="p-6">Quiz not found.</div>;

  return (
    <div className="flex-1 flex flex-col bg-gray-900 text-white p-4  md:ml-0  w-full h-full overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">{quiz.topic}</h1>
        <span className="px-3 py-1 rounded-full text-sm bg-gray-200 dark:bg-gray-700">{quiz.difficulty}</span>
      </div>

      {quiz.questions.map((q, idx) => (
        <div key={idx} className="mb-6 p-4 rounded-2xl border shadow-sm bg-white dark:bg-gray-800">
          <p className="font-semibold mb-3">{idx + 1}. {q.question}</p>
          <div className="space-y-2">
            {q.options.map((opt, i) => (
              <label key={i} className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="radio"
                  name={`q-${idx}`}
                  className="h-4 w-4"
                  checked={answers[idx] === opt}
                  onChange={() => onSelect(idx, opt)}
                />
                <span>{opt}</span>
              </label>
            ))}
          </div>
        </div>
      ))}

      <button
        onClick={onSubmitQuiz}
        disabled={saving}
        className="w-full md:w-auto bg-green-500 hover:bg-green-700 text-white font-semibold px-5 py-3 rounded-2xl shadow"
      >
        {saving ? "Submitting…" : "Submit Quiz"}
      </button>
    </div>
  );
}

/*******************************
 * QUIZ REVIEW — Shows correct vs selected + explanations
 *******************************/
export function QuizReview() {
  const { quizId } = useParams();
  const [userEmail, setUserEmail] = useState("");
  const [quiz, setQuiz] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUserEmail(u?.email || ""));
    return () => unsub();
  }, []);

  useEffect(() => {
    const load = async () => {
      if (!userEmail) return;
      const ref = doc(db, "Users", userEmail, "quizzes", quizId);
      const snap = await getDoc(ref);
      if (snap.exists()) setQuiz({ id: quizId, ...snap.data() });
    };
    load();
  }, [quizId, userEmail]);

  if (!quiz) return <div className="p-6">Loading review…</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl md:text-3xl font-bold">Review — {quiz.topic}</h1>
        <div className="text-sm px-2 py-1 rounded-full bg-gray-200 dark:bg-gray-700">Score: {quiz.score}/{quiz.numQuestions}</div>
      </div>
      <p className="text-sm text-gray-600 mb-4">Difficulty: {quiz.difficulty}</p>

      {quiz.questions.map((q, idx) => {
        const userAns = quiz.userAnswers?.[idx];
        const correct = q.answer;
        return (
          <div key={idx} className="mb-6 p-4 rounded-2xl border shadow-sm bg-white dark:bg-gray-800">
            <p className="font-semibold mb-3">{idx + 1}. {q.question}</p>
            <div className="space-y-2 mb-2">
              {q.options.map((opt, i) => {
                const isCorrect = opt === correct;
                const isUser = opt === userAns;
                return (
                  <div
                    key={i}
                    className={`p-2 rounded-lg border ${
                      isCorrect ? "bg-green-100 border-green-300" : isUser ? "bg-red-100 border-red-300" : "bg-gray-50"
                    }`}
                  >
                    {opt}
                    {isCorrect && <span className="ml-2 text-xs text-green-700">(correct)</span>}
                    {isUser && !isCorrect && <span className="ml-2 text-xs text-red-700">(your choice)</span>}
                  </div>
                );
              })}
            </div>
            <p className="text-sm text-gray-600 italic">{q.explanation}</p>
          </div>
        );
      })}
    </div>
  );
}

export default QuizTake;