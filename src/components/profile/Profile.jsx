import React, { useEffect, useState } from "react";
import { auth, db } from "../../config/firebase";
import { signOut } from "firebase/auth";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [chatCount, setChatCount] = useState(0);
  const [quizData, setQuizData] = useState({ count: 0, score: 0, total: 0, attempted: 0 });
  const [mockData, setMockData] = useState({ count: 0, score: 0, total: 0, attempted: 0 });

  const handleLogout = async () => {
  try {
    await signOut(auth);
    // Optional: redirect to login or landing page
    window.location.href = "/"; 
  } catch (error) {
    console.error("Error logging out:", error);
  }
};


  useEffect(() => {
    const fetchProfile = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const userDocRef = doc(db, "Users", user.email);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const profileInfo = userDoc.data().profile || {};
        setUserData({ ...userDoc.data(), ...profileInfo });
      }

      // ---------- Chat Count ----------
      const chatSnap = await getDocs(collection(db, "Users", user.email, "chatHistory"));
      setChatCount(chatSnap.size);

      // ---------- Quizzes ----------
      const quizSnap = await getDocs(collection(db, "Users", user.email, "quizzes"));
      let quizScore = 0;
      let quizTotal = 0;
      quizSnap.forEach((doc) => {
        const data = doc.data();
        quizScore += data.score || 0;
        quizTotal += data.numQuestions || 0;
      });
      setQuizData({ count: quizSnap.size, score: quizScore, total: quizTotal, attempted: quizSnap.size });

      // ---------- Mock Interviews ----------
      const mockSnap = await getDocs(collection(db, "Users", user.email, "mock_interviews"));
      let mockScore = 0;
      let mockTotal = 0;
      let mockAttempted = mockSnap.size;

      for (const mockDoc of mockSnap.docs) {
        const reportSnap = await getDocs(
          collection(db, "Users", user.email, "mock_interviews", mockDoc.id, "report")
        );
        reportSnap.forEach((reportDoc) => {
          const data = reportDoc.data();
          mockScore += data.overallScore || 0;
          mockTotal += 5; // max per interview
        });
      }
      setMockData({ count: mockSnap.size, score: mockScore, total: mockTotal, attempted: mockAttempted });
    };

    fetchProfile();
  }, []);

  if (!userData) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <p className="text-lg font-semibold text-gray-500">Loading Profile...</p>
      </div>
    );
  }

  const COLORS = ["#4ade80", "#e5e7eb"];
  const quizPie = [
    { name: "Scored", value: quizData.score },
    { name: "Remaining", value: Math.max(quizData.total - quizData.score, 0) },
  ];
  const mockPie = [
    { name: "Scored", value: mockData.score },
    { name: "Remaining", value: Math.max(mockData.total - mockData.score, 0) },
  ];

  return (
    <div className="h-screen overflow-y-auto bg-gray-50 p-8">
      <div className="w-full mx-auto bg-white rounded-xl  p-6">
        {/* Profile Header */}
        <div className="flex items-center gap-4 border-b pb-4 mb-6">
          <img
            src="Profile.png"
            alt="Profile"
            className="w-29 h-29 rounded-full border-2 border-indigo-500 object-cover"
          />
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{userData.name || "No Name"}</h2>
            <p className="text-indigo-600 font-medium">{userData.role || "Student"}</p>
            <p className="text-gray-600">{auth.currentUser.email}</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="bg-indigo-100 p-6 rounded-lg shadow text-center hover:scale-105">
            <h3 className="text-xl font-semibold text-indigo-700">{chatCount}</h3>
            <p className="text-gray-700 mt-1">Chats</p>
          </div>
          <div className="bg-green-100 p-6 rounded-lg shadow text-center hover:scale-105">
            <h3 className="text-xl font-semibold text-green-700">{quizData.count}</h3>
            <p className="text-gray-700 mt-1">Quizzes</p>
          </div>
          <div className="bg-yellow-100 p-6 rounded-lg shadow text-center hover:scale-105">
            <h3 className="text-xl font-semibold text-yellow-700">{mockData.count}</h3>
            <p className="text-gray-700 mt-1">Mock Interviews</p>
          </div>
        </div>

        {/* Pie Charts */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-indigo-50 p-4 rounded-lg shadow">
            <h3 className="text-center font-semibold text-gray-700 mb-1">Quizzes Progress</h3>
            <p className="text-center text-gray-600 text-sm mb-2">
              Attempted: {quizData.attempted} / Total Quizzes
            </p>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={quizPie} dataKey="value" innerRadius={50} outerRadius={80} label>
                  {quizPie.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <p className="text-center text-gray-600 mt-2">
              Score: {quizData.score} / {quizData.total}
            </p>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg shadow">
            <h3 className="text-center font-semibold text-gray-700 mb-1">Mock Interviews Progress</h3>
            <p className="text-center text-gray-600 text-sm mb-2">
              Attempted: {mockData.attempted} / Total Interviews
            </p>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={mockPie} dataKey="value" innerRadius={50} outerRadius={80} label>
                  {mockPie.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <p className="text-center text-gray-600 mt-2">
              Score: {mockData.score} / {mockData.total}
            </p>
          </div>
        </div>

        {/* Extra Info */}
        <div className="mt-6 text-right">
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition cursor-pointer hover:scale-110"
          >
              Logout
          </button>
        </div>

      </div>
    </div>
  );
};

export default Profile;
