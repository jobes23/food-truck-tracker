import React, { useState } from "react";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import "../Styles/SignUp.css";

const Signup: React.FC = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [type, setType] = useState("food_truck");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [instagram, setInstagram] = useState("");
  const [facebook, setFacebook] = useState("");
  const [logo, setLogo] = useState("");
  const [defaultFoodIcon, setDefaultFoodIcon] = useState("");
  const [cuisine, setCuisine] = useState<string[]>([]);
  const [businessName, setBusinessName] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const cuisinesList = [
    // North and South America
    "American", "Southern", "Cajun", "Creole",
    "Mexican", "Tex-Mex", "Caribbean", "Cuban", "Jamaican", "Dominican",
    "Puerto Rican", "Brazilian", "Peruvian", "Argentinian", "Colombian", 
  
    // Europe
    "Italian", "French", "Spanish", "Greek", "Mediterranean", "German", "Irish",
    "British", "Portuguese", "Polish", "Hungarian", "Russian",
  
    // Asia
    "Chinese", "Cantonese", "Szechuan", "Japanese", "Sushi", "Korean", "Korean BBQ",
    "Thai", "Vietnamese", "Indian", "North Indian", "South Indian", "Pakistani",
    "Middle Eastern", "Lebanese", "Turkish", "Israeli",
  
    // Africa
    "Moroccan", "Ethiopian", "South African",
  
    // Other
    "Vegan", "Vegetarian", "Gluten-Free", "Seafood", "Street Food", "Fusion",
    "Asian Fusion", "Latin Fusion",
  
    // Popular Niches
    "Desserts", "Coffee", "Breakfast/Brunch", 
    "Burgers", "Pizza", "Salads", "Sandwiches",
  
    // Dietary
     "Paleo", "Keto",
  ];

  const foodIconsList = [
    "🍔", "🌮", "🍕", "🍣", "🍜", "🥗", "🍩", "🥩", "🌭", "🥞", "🥪", "🍱",
    "🍙", "🍚", "🥧", "🍰", "🍪", "🍫", "🍿", "🍇", "🍉", "🍊", "🍎",
    "🍍", "🥝", "🥑", "🥦", "🥕", "🌽", "🌶️", "🍄", "🧄", "🧅", "🍠", "🥐",
    "🥨", "🥯", "🥖", "🧀", "🥚", "🥓", "🍗", "🍖", "🍤", "🦞", "🦀",
    "🦑", "🦐", "🦪", "🍦", "🍭", "🎂", "🍮", "☕", "🍵",
  ];

  const handleCuisineSelect = (selectedCuisine: string) => {
    setCuisine((prevCuisines) =>
      prevCuisines.includes(selectedCuisine)
        ? prevCuisines.filter((c) => c !== selectedCuisine) // Remove if already selected
        : [...prevCuisines, selectedCuisine] // Add if not selected
    );
  };

  const handleFoodIconSelect = (selectedIcon: string) => {
    setDefaultFoodIcon((prevIcon) => (prevIcon === selectedIcon ? "" : selectedIcon));
  };
  

  const validatePhone = (phone: string) => {
    const phoneRegex = /^[0-9]{10}$/; // Basic US phone number format
    return phoneRegex.test(phone);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
  
    if (step === 2 && type === "food_truck" && cuisine.length === 0) {
        setError("Please select at least one cuisine.");
        return;
      }
  
    if (step === 3 && type === "food_truck" && !defaultFoodIcon) {
        setError("Please select a default food icon.");
        return;
    }

    if (step === 1 && !validatePhone(phone)) {
        setError("Please enter a valid 10-digit phone number.");
        return;
    }
  
    if (step === 4) {
      try {
        // Data to send to the backend
        const requestData = {
            // userId: user.uid,
            type,
            name,
            email,
            phone,
            address,
            instagram,
            facebook,
            logo,
            defaultFoodIcon,
            cuisine,
            businessName,
          };
    
          console.log("📤 Sending data to backend:", requestData); // ✅ Console log before sending

        const auth = getAuth();
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
  
        // const token = await user.getIdToken();
  
        
  
        // const response = await fetch("https://us-central1-YOUR_PROJECT_ID.cloudfunctions.net/signUp", {
        //   method: "POST",
        //   headers: {
        //     "Content-Type": "application/json",
        //     "Authorization": `Bearer ${token}`,
        //   },
        //   body: JSON.stringify(requestData),
        // });
  
        // const data = await response.json();
  
        // if (!response.ok) {
        //   setError(data.message || "Signup failed.");
        //   return;
        // }
  
        navigate("/");
      } catch (err) {
        setError("Error creating account. Try again.");
      }
    } else {
      setStep(step + 1);
    }
  };  

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  return (
    <div className="auth-container">
      <div className="formHeader">Sign Up</div>
      {error && <p className="error">{error}</p>}

      <div className="progress-bar">
        <div className="progress-bar-fill" style={{ width: `${((step - 1) / 3) * 100}%` }}></div>
      </div>

      <form className="auth-form" onSubmit={handleSignup}>
        {step === 1 && (
          <>
            <label htmlFor="accountType">Account Type:</label>
            <select id="accountType" value={type} onChange={(e) => setType(e.target.value)}>
              <option value="food_truck">Food Truck</option>
              <option value="venue">Venue</option>
              <option value="event">Event Owner</option>
            </select>
            <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required />
            <input type="tel" placeholder="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} required />
            {type !== "food_truck" && (
              <input type="text" placeholder="Address" value={address} onChange={(e) => setAddress(e.target.value)} required />
            )}
            {type === "food_truck" && (
              <input type="text" placeholder="Business Name" value={businessName} onChange={(e) => setBusinessName(e.target.value)} />
            )}
          </>
        )}

        {step === 2 && type === "food_truck" && (
          <>
            <label>Cuisine (Select One or More):</label>

            <div className="cuisine-options">
              {cuisinesList.map((c) => (
                <div
                  key={c}
                  className={`cuisine-item ${cuisine.includes(c) ? "selected" : ""}`}
                  onClick={() => handleCuisineSelect(c)}
                >
                  {c}
                </div>
              ))}
            </div>
          </>
        )}

        {step === 3 && type === "food_truck" && (
          <>
            <label>Default Food Icon (Pick One):</label>
            <div className="icon-options">
              {foodIconsList.map((icon) => (
                <div
                  key={icon}
                  className={`icon-item ${defaultFoodIcon === icon ? "selected" : ""}`}
                  onClick={() => handleFoodIconSelect(icon)}
                >
                  {icon}
                </div>
              ))}
            </div>
          </>
        )}

        {step === 4 && (
          <>
            <input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </>
        )}

        <div className="button-container">
          {step > 1 && <button type="button" className="back-btn" onClick={handleBack}>Back</button>}
          <button type="submit">{step === 4 ? "Sign Up" : "Next"}</button>
        </div>
      </form>
    </div>
  );
};

export default Signup;
