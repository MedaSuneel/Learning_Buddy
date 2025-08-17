// src/pages/Auth.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {auth,googleProvider} from "../../config/firebase"; // Adjust the import path as necessary
import {createUserWithEmailAndPassword,signInWithEmailAndPassword,signInWithPopup, sendEmailVerification, onAuthStateChanged} from "firebase/auth";
import {doc, setDoc} from "firebase/firestore";
import {db} from "../../config/firebase"; // Adjust the import path as necessary
import { toast } from "react-toastify";

export default function AuthPage() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  

  const navigate = useNavigate();

 


  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (isRegistering) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await sendEmailVerification(userCredential.user);

        // 🔥 Create Firestore user document
        const userDocRef = doc(db, "Users", email);  // Document ID is user's email
          await setDoc(userDocRef, {
            name: "",
            role: "student"
          });
        toast.success("Verification email is sent! Please verify.");
      } else {
          const userCredential = await signInWithEmailAndPassword(auth, email, password);
          if (!userCredential.user.emailVerified) {
            toast.error("Please verify your email.");
            return;
          }
          toast.success("Logged in successfully!");
          navigate("/main");
      }
      
    } catch (err) {
      console.log(err.message);
      toast.error("Invalid email or password.");
    }
  };

  const handleGoogleAuth = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user.emailVerified || result.user.emailVerified === undefined) {

        const userDocRef = doc(db, "Users", result.user.email);
        await setDoc(userDocRef, {
          name: result.user.displayName || "",
          role: "student"
        }, { merge: true });

        toast.success("Logged in with Google!");
        navigate("/main");
      } else {
        toast.error("Please verify your email first.");
      }
    } catch (error) {
      console.error(error.message);
      toast.error("Google Sign-in failed.");
    }
  };

  return (
    <div className="flex w-full h-full min-h-screen items-center ">
      
      {/* Left image section */}
      <div className="hidden md:flex w-1/2 items-center justify-center bg-white">
        {/* <div className="flex items-center mb-8">
          <img src="Chatbot.jpg" className="w-11 h-11 rounded-3xl" alt="Menu" />
          <h1 className="text-xl font-bold">Learning Buddy</h1>
        </div> */}
        <img src="buddy_icon.jpg" alt="Learning Illustration" className="rounded-2xl h-full w-full"/>
      </div>

      {/* Right form section */}
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center px-6 py-12 bg-white">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <img src="Chatbot.jpg" className="w-11 h-11 rounded-3xl" alt="Logo" />
          <h1 className="text-2xl font-bold text-gray-800">Learning Buddy</h1>
        </div>

      {/* Authentication Form */}
        <div className="bg-black p-8 rounded-xl shadow-lg w-full max-w-md">
          <h2 className="text-3xl font-bold mb-6 text-center text-white">
            {isRegistering ? "Create an Account" : "Welcome Back"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              className="w-full px-4 py-2 border-2 border-white text-white rounded-md"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <input
              type="password"
              placeholder="Password"
              className="w-full px-4 py-2 border-2 border-white text-white rounded-md"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button
              type="submit"
              className="w-full bg-orange-600 hover:bg-blue-700 text-white font-bold py-2 rounded-md transition cursor-pointer"
            >
              {isRegistering ? "Register" : "Login"}
            </button>
          </form>
          <div><p className="text-center text-white text-sm mt-2 font-bold">OR</p></div>

          <div className="mt-2">
            <button
              onClick={handleGoogleAuth}
              className="w-full bg-white hover:bg-gray-200 text-black font-bold py-2 rounded-md transition cursor-pointer"
            >
              <img src="google.png" alt="Google Icon" className="inline-block w-7 h-7 mr-2 items-center justify-center" />
              {isRegistering ? "Sign Up with Google" : "Sign In with Google"}
            </button>
          </div>

          <p className="text-md mt-6 text-center text-white">
            {isRegistering ? "Already have an account?" : "Don't have an account?"}{" "}
            <button
              type="button"
              onClick={() => setIsRegistering(!isRegistering)}
              className="text-blue-400 hover:underline cursor-pointer "
            >
              {isRegistering ? "Sign In" : "Register"}
            </button>
          </p>
        </div>
      
      </div>
    </div>
  );
}
