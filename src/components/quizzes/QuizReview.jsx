import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { db, auth } from "../../config/firebase";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

function QuizReview() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [quizData, setQuizData] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user && user.email) {
        const quizDocRef = doc(db, "Users", user.email, "quizzes", quizId);
        const quizSnap = await getDoc(quizDocRef);

        if (quizSnap.exists()) {
          setQuizData(quizSnap.data());
        }
      }
    });

    return () => unsubscribe();
  }, [quizId]);

  if (!quizData) return <p className="p-4">Loading review...</p>;

  return (
    <div className="flex-1 flex flex-col bg-gray-900 text-white p-4  md:ml-0  w-full h-full overflow-y-auto">
      <h1 className="text-2xl font-bold mb-4">Quiz Review - {quizData.topic}</h1>
      {quizData.questions.map((q, index) => {
        const userAnswer = quizData.userAnswers[index];
        const correctAnswer = q.answer;
        return (
          <div key={index} className="mb-6 p-4 border rounded-lg bg-gray-800">
            <p className="font-semibold mb-2">{index + 1}. {q.question}</p>
            <ul className="mb-2">
              {q.options.map((opt, i) => (
                <li
                  key={i}
                  className={`p-2 rounded 
                    ${opt === correctAnswer ? "bg-green-700" : ""}
                    ${opt === userAnswer && opt !== correctAnswer ? "bg-red-700" : ""}
                  `}
                >
                  {opt}
                </li>
              ))}
            </ul>
            {/* <p><strong>Your Answer:</strong> {userAnswer}</p>
            <p><strong>Correct Answer:</strong> {correctAnswer}</p> */}
            <p className="text-gray-100 mt-2"><em>Reason : {q.explanation}</em></p>
          </div>
        );
      })}
      <button 
        className="bg-white text-black px-4 py-2 rounded cursor-pointer hover:bg-gray-400"
        onClick={() => navigate("/quizzes")}
      >
        Back to Dashboard
      </button>
    </div>
  );
}

export default QuizReview;