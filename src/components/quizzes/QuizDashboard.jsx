import {useState, useEffect} from 'react'
import {db, auth} from '../../config/firebase'
import {collection, doc, getDocs} from 'firebase/firestore'
import {useNavigate} from 'react-router-dom'
import {onAuthStateChanged} from 'firebase/auth'

function QuizDashboard() {
    const [quizzes, setQuizzes] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user && user.email) {
            const userDocRef = doc(db, 'Users', user.email);
            const quizzesRef = collection(userDocRef, 'quizzes');
            const querySnapshot = await getDocs(quizzesRef);
            const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setQuizzes(data);
            }
        });

        return () => unsubscribe(); // Clean up listener on unmount
    }, []);

  return (
    <div className="flex-1 flex flex-col bg-gray-900 text-white p-4  md:ml-0  w-full h-full overflow-hidden">
      <div className="flex justify-between items-center mb-7">
        <h1 className="text-3xl font-bold">My Quizzes</h1>
        <button onClick={() => navigate('/new-quiz')} className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:opacity-70 transition disabled:opacity-50 text-white text-xl font-bold cursor-pointer px-4 py-2 rounded-xl"> 
          <p> New Quiz</p>
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {quizzes.map(quiz => (
          <div key={quiz.id} onClick={() => navigate(`/quiz-review/${quiz.id}`)} className="cursor-pointer  dark:bg-gray-700 p-4 rounded-xl shadow hover:bg-gray-800 transition duration-300">
            <h2 className="font-semibold text-lg">{quiz.topic}</h2>
            <p>Score: {quiz.score}/{quiz.numQuestions}</p>
            <p className="text-sm text-gray-500">{quiz.attemptedAt?.toDate ? quiz.attemptedAt.toDate().toLocaleString() : 'Not attempted'}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default QuizDashboard