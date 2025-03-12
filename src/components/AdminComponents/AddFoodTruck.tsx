import React, { useState } from "react";
import useAPI from "../../hooks/useAPI";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../../Styles/AddFoodTruck.css";

interface AddFoodTruckProps {
}

// 🔥 Food Icons
const foodIcons = [
  "🍔", "🌮", "🍕", "🍣", "🍜", "🥗", "🍩", "🥩", "🌭", "🥞", "🥪", "🍱",
  "🍙", "🍚", "🥧", "🍰", "🍪", "🍫", "🍿", "🍇", "🍉", "🍊", "🍎",
  "🍍", "🥝", "🥑", "🥦", "🥕", "🌽", "🌶️", "🍄", "🧄", "🧅", "🍠", "🥐",
  "🥨", "🥯", "🥖", "🧀", "🥚", "🥓", "🍗", "🍖", "🍤", "🦞", "🦀",
  "🦑", "🦐", "🦪", "🍦", "🍭", "🎂", "🍮", "☕", "🍵", "🍋", "🥟", "🌭",
];
// 🔥 Cuisine List
const cuisinesList = [
  "American", "Mexican", "Italian", "Chinese", "Pizza", "Indian", "Mediterranean", "Vegan", "Venezuelan",
  "BBQ", "Japanese", "Korean", "Thai", "French", "Seafood", "Coffee", "Desserts", "Lemonade", "Sandwiches", "Southern",
];

const AddFoodTruck: React.FC<AddFoodTruckProps> = () => { // No setMessage
  const [truck, setTruck] = useState({
    truckName: "",
    cuisine: [] as string[],
    logo: "",
    website: "",
    facebook: "",
    instagram: "",
    foodIcon: "🚚",
  });

  const { callApi, loading, error } = useAPI();

  // ✅ Handle Cuisine Selection (Multi-select)
  const handleCuisineSelect = (selectedCuisine: string) => {
    setTruck((prev) => ({
      ...prev,
      cuisine: prev.cuisine.includes(selectedCuisine)
        ? prev.cuisine.filter((c) => c !== selectedCuisine) // Remove if already selected
        : [...prev.cuisine, selectedCuisine], // Add if not selected
    }));
  };

  // ✅ Handle Food Icon Selection
  const handleIconSelect = (icon: string) => {
    setTruck((prev) => ({ ...prev, foodIcon: icon }));
  };

  // ✅ Handle Add Truck Submission
  const handleAddTruck = async () => {
    if (!truck.truckName || truck.cuisine.length === 0) {
      toast.error("❌ Please fill in all required fields.");
      return;
    }

    const response = await callApi("addFoodTruck", "POST", truck);
    if (response.success) {
      toast.success(`✅ ${truck.truckName} has been added successfully!`);
      setTruck({ truckName: "", cuisine: [], logo: "", website: "", facebook: "", instagram: "", foodIcon: "🚚" });
    } else {
      toast.error(error || "❌ Failed to add food truck.");
    }
  };

  return (
    <div className="form-section">
      <h3>➕ Add New Food Truck</h3>

      <label htmlFor="truckName">Truck Name:</label>
      <input id="truckName" type="text" value={truck.truckName} onChange={(e) => setTruck({ ...truck, truckName: e.target.value })} required />

      {/* 🔥 Clickable Cuisine Selection */}
      <label>Select Cuisine Type:</label>
      <div className="cuisine-options">
        {cuisinesList.map((c) => (
          <div
            key={c}
            className={`cuisine-item ${truck.cuisine.includes(c) ? "selected" : ""}`}
            onClick={() => handleCuisineSelect(c)}
          >
            {c}
          </div>
        ))}
      </div>

      {/* Display Selected Cuisines */}
      {truck.cuisine.length > 0 && (
        <div className="selected-cuisines">
          Selected: {truck.cuisine.join(", ")}
        </div>
      )}

      <label htmlFor="logo">Logo URL (Optional):</label>
      <input id="logo" type="text" value={truck.logo} onChange={(e) => setTruck({ ...truck, logo: e.target.value })} />

      <label htmlFor="website">Website (Optional):</label>
      <input id="website" type="text" value={truck.website} onChange={(e) => setTruck({ ...truck, website: e.target.value })} />

      <label htmlFor="facebook">Facebook (Optional):</label>
      <input id="facebook" type="text" value={truck.facebook} onChange={(e) => setTruck({ ...truck, facebook: e.target.value })} />

      <label htmlFor="instagram">Instagram (Optional):</label>
      <input id="instagram" type="text" value={truck.instagram} onChange={(e) => setTruck({ ...truck, instagram: e.target.value })} />

      {/* 🔥 Food Icon Selector */}
      <label>Select Food Icon:</label>
      <div className="icon-options">
        {foodIcons.map((icon) => (
          <span
            key={icon}
            className={`icon-item ${truck.foodIcon === icon ? "selected" : ""}`}
            onClick={() => handleIconSelect(icon)}
          >
            {icon}
          </span>
        ))}
      </div>

      <button onClick={handleAddTruck} disabled={loading}>➕ {loading ? "Adding..." : "Add Truck"}</button>
    </div>
  );
};

export default AddFoodTruck;
