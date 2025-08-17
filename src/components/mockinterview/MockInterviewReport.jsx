import React, { useState, useEffect } from "react";
import { db } from "../../config/firebase";
import { collection, getDocs, doc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { useNavigate } from "react-router-dom";

export default function MockInterviewReport() {
  const [interviews, setInterviews] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        const auth = getAuth();
        const user = auth.currentUser;

        if (!user) {
          console.log("⚠️ No user logged in, exiting fetch.");
          setLoading(false);
          return;
        }

        console.log("👤 Logged in user:", user.email);

        // Reference: Users/{email}/mock_interviews
        const userDocRef = doc(db, "Users", user.email);
        console.log("📂 User document reference created:", userDocRef.path);

        const interviewsRef = collection(userDocRef, "mock_interviews");
        console.log("📂 Fetching from collection:", interviewsRef.path);

        const interviewDocs = await getDocs(interviewsRef);
        console.log("📑 Total mock interviews found:", interviewDocs.size);

        const allInterviews = await Promise.all(
          interviewDocs.docs.map(async (interviewDoc) => {
            console.log("➡️ Processing interview:", interviewDoc.id);
            const interviewData = { id: interviewDoc.id, ...interviewDoc.data() };
            console.log("📄 Interview data:", interviewData);

            // Report subcollection
            const reportRef = collection(interviewDoc.ref, "report");
            console.log("📂 Fetching report subcollection:", reportRef.path);
            const reportSnap = await getDocs(reportRef);
            console.log("📑 Reports found:", reportSnap.size);

            interviewData.report =
              reportSnap.docs.length > 0 ? reportSnap.docs[0].data() : null;
            console.log("📝 Report data:", interviewData.report);

            // Answers subcollection
            const answersRef = collection(interviewDoc.ref, "answers");
            console.log("📂 Fetching answers subcollection:", answersRef.path);
            const answersSnap = await getDocs(answersRef);
            console.log("📑 Answers found:", answersSnap.size);

            interviewData.answers = answersSnap.docs.map((ansDoc) => {
              const ansData = { id: ansDoc.id, ...ansDoc.data() };
              console.log("💬 Answer doc:", ansData);
              return ansData;
            });

            return interviewData;
          })
        );

        console.log("📊 All interviews before sort:", allInterviews);

        // Sort by timestamp
        allInterviews.sort(
          (a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0)
        );

        console.log("✅ Final sorted interviews:", allInterviews);

        setInterviews(allInterviews);
      } catch (error) {
        console.error("🔥 Error fetching interviews:", error);
      } finally {
        console.log("⏹ Fetch finished, setting loading = false");
        setLoading(false);
      }
    };

    fetchInterviews();
  }, []);

  if (loading) {
    console.log("⏳ Still loading, showing loader...");
    return <p className="text-center text-gray-500 mt-10">Loading reports...</p>;
  }

  console.log("🎯 Render - interviews length:", interviews.length);

  return (
    <div className="flex-1 flex flex-col bg-gray-900 text-white p-4  md:ml-0  w-full h-full overflow-y-auto">
        <div className="flex justify-between items-center m-5">
            <h1 className="text-3xl font-bold text-center">
                📊 Mock Interview Reports
            </h1>
            <button
          onClick={() => {
            console.log("🎤 Navigate to /mock-interview");
            navigate("/mock-interview");
          }}
          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:opacity-70 transition disabled:opacity-50 text-white font-semibold rounded-lg shadow-md cursor-pointer"
        >
          🎤 Attend New Interview
        </button>
        </div>
      

      {interviews.length === 0 && (
        <p className="text-center text-gray-600">No interviews found yet.</p>
      )}

      {interviews.map((interview, index) => (
        <div
          key={interview.id}
          className="border rounded-xl shadow-md p-5 my-4 bg-gray-900"
        >
          {/* Report Header */}
          <div
            className="flex justify-between items-center cursor-pointer"
            onClick={() => {
              console.log("🔽 Toggling expand for index:", index);
              setExpanded(expanded === index ? null : index);
            }}
          >
            <h2 className="text-xl text-blue-400 font-semibold underline decoration-white underline-offset-4">
              {interview.role} – {interview.difficulty} ({interview.mode})
            </h2>
            <span className="text-sm text-gray-500">
              {interview.timestamp
                ? new Date(interview.timestamp.seconds * 1000).toLocaleString()
                : "No timestamp"}
            </span>
          </div>

          {/* Report Summary */}
          {interview.report && (
            <div className="mt-4 bg-gray-900 rounded-lg p-4">
              <p className="text-lg font-medium">
                Overall Score:{" "}
                <span className="font-bold text-green-600">
                  {interview.report.overallScore}
                </span>
              </p>
              <p className="mt-2">
                <strong>Strengths:</strong> {interview.report.strengths}
              </p>
              <p>
                <strong>Weaknesses:</strong> {interview.report.weaknesses}
              </p>
              <p>
                <strong>Suggestions:</strong> {interview.report.suggestions}
              </p>
            </div>
          )}

          {/* Expandable Q&A */}
          {expanded === index && (
            <div className="mt-6 space-y-4">
              <h3 className="text-lg font-semibold mb-2">Questions & Answers</h3>
              {interview.answers.length === 0 ? (
                <p className="text-gray-500">No answers recorded.</p>
              ) : (
                interview.answers.map((ans) => (
                  <div
                    key={ans.id}
                    className="border rounded-lg p-4 bg-gray-100"
                  >
                    <p className="font-medium text-gray-800">
                      Q{ans.qid}. {ans.question}
                    </p>
                    <p className="mt-2 text-blue-700">
                      <strong>Your Answer:</strong> {ans.userAnswer}
                    </p>
                    <p className="text-green-700">
                      <strong>Feedback:</strong> {ans.feedback}
                    </p>
                    <p className="text-gray-600 text-sm">
                      <strong>Suggestions:</strong> {ans.suggestions}
                    </p>
                    <p className="text-yellow-600 text-sm">
                      <strong>Rating:</strong> {ans.rating}/5
                    </p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      ))}

      {/* Attend New Interview */}
      <div className="flex justify-center mt-8">
        
      </div>
    </div>
  );
}
