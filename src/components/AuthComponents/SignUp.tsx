import React, { useState } from "react";
import {
  getAuth,
  createUserWithEmailAndPassword,
  fetchSignInMethodsForEmail,
  sendEmailVerification,
} from "firebase/auth";
import { useNavigate } from "react-router-dom";
import PlaceAutocompleteInput from "../../utils/PlaceAutocompleteInput";
import { toast } from "react-toastify";
import AuthLayout from "../AuthLayout"; // ✅ Unified layout
import "../../Styles/SignUp.css";

const cuisinesList = [
  "American", "Mexican", "Italian", "Chinese", "Japanese", "Indian", "Thai", "Greek",
  "Vietnamese", "Korean", "Seafood", "Vegan", "Desserts", "Burgers", "Pizza", "BBQ", "Mediterranean"
];

const Signup: React.FC = () => {
  const [step, setStep] = useState(1);
  const [role] = useState("foodie");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [region, setRegion] = useState("");
  const [cuisine, setCuisine] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleCuisineToggle = (item: string) => {
    setCuisine(prev =>
      prev.includes(item) ? prev.filter(c => c !== item) : [...prev, item]
    );
  };

  const checkEmailExists = async (emailToCheck: string): Promise<boolean> => {
    try {
      const auth = getAuth();
      const methods = await fetchSignInMethodsForEmail(auth, emailToCheck);
      return methods.length > 0;
    } catch (err: any) {
      console.error("[Email Check Failed]", err);
      const code = err.code || "";
      if (code.includes("auth/invalid-email")) {
        toast.error("Invalid email address.");
      } else if (code.includes("auth/network-request-failed")) {
        toast.error("Network error. Please try again.");
      } else {
        toast.error("Error checking email. Please try again.");
      }
      return true;
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (step === 1) {
      if (!email || !password || !region || !firstName) {
        return toast.error("Please fill out all required fields.");
      }

      const emailExists = await checkEmailExists(email);
      if (emailExists) {
        return toast.error("That email is already registered. Please log in or use a different email.");
      }

      return setStep(2);
    }

    if (step === 2) {
      if (cuisine.length === 0) {
        return toast.error("Please select at least one favorite cuisine.");
      }

      try {
        setLoading(true);
        const auth = getAuth();
        const userCred = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCred.user;

        await sendEmailVerification(user);
        toast.info("📧 We've sent a verification email. Please check your inbox.");

        const payload = {
          uid: user.uid,
          email,
          firstName,
          isAnonymous: false,
          createdAt: new Date().toISOString(),
          role,
          region,
          favorites: [],
          preferredCuisines: cuisine,
        };

        const token = await user.getIdToken();
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/createOrUpdateUser`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });

        const json = await res.json();
        if (!res.ok || !json.success) {
          return toast.error(json.error || "Failed to create account.");
        }

        toast.success("🎉 Account created successfully!");
        navigate("/");
      } catch (err: any) {
        console.error(err);

        if (err.code === "auth/email-already-in-use") {
          toast.error("That email is already registered. Please log in instead.");
        } else if (err.code === "auth/weak-password") {
          toast.error("Password is too weak. Please use a stronger one.");
        } else if (err.code === "auth/invalid-email") {
          toast.error("Invalid email address. Please check and try again.");
        } else if (err.code === "auth/network-request-failed") {
          toast.error("Network error. Please check your connection.");
        } else {
          toast.error("Failed to sign up. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <AuthLayout>
      <h2 className="formHeader">Sign Up (Foodie)</h2>

      <form className="auth-form" onSubmit={handleSignup}>
        {step === 1 && (
          <>
            <label htmlFor="firstName">First Name:</label>
            <input
              id="firstName"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Your First Name"
              required
            />

            <label htmlFor="email">Email:</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />

            <label htmlFor="password">Password:</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a password"
              required
            />

            <label htmlFor="region">Favorite Region:</label>
            <PlaceAutocompleteInput onSelect={setRegion} />
            {region && <p className="region-preview">📍 {region}</p>}
          </>
        )}

        {step === 2 && (
          <>
            <label htmlFor="cuisine-list">Favorite Cuisines:</label>
            <div id="cuisine-list" className="signup-cuisine-options scrollable">
              {cuisinesList.map((item) => (
                <div
                  key={item}
                  className={`cuisine-item ${cuisine.includes(item) ? "selected" : ""}`}
                  onClick={() => handleCuisineToggle(item)}
                >
                  {item}
                </div>
              ))}
            </div>
          </>
        )}

        <div className="button-container">
          {step > 1 && (
            <button type="button" className="back-btn" onClick={() => setStep(step - 1)}>
              Back
            </button>
          )}
          <button type="submit" disabled={loading}>
            {loading ? "Loading..." : step === 1 ? "Next" : "Sign Up"}
          </button>
        </div>
      </form>
    </AuthLayout>
  );
};

export default Signup;
