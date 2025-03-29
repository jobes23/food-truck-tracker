import React, { useState } from "react";
import useAPI from "../../hooks/useAPI";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../../Styles/AddFoodTruck.css";
import PlaceAutocompleteInput from "../../utils/PlaceAutocompleteInput";


const foodIcons = [
  "🍔", "🌮", "🍕", "🍣", "🍜", "🥗", "🍩", "🥩", "🌭", "🥞", "🥪", "🍱",
  "🍙", "🍚", "🥧", "🍰", "🍪", "🍫", "🍿", "🍇", "🍉", "🍊", "🍎",
  "🍍", "🥝", "🥑", "🥦", "🥕", "🌽", "🌶️", "🍄", "🧄", "🧅", "🍠", "🥐",
  "🥨", "🥯", "🥖", "🧀", "🥚", "🥓", "🍗", "🍖", "🍤", "🦞", "🦀",
  "🦑", "🦐", "🦪", "🍦", "🍭", "🎂", "🍮", "☕", "🍵", "🍋", "🥟",
];

const cuisinesList = [
  "American", "Mexican", "Italian", "Chinese", "Pizza", "Indian", "Mediterranean", "Vegan", "Venezuelan",
  "BBQ", "Japanese", "Korean", "Thai", "French", "Seafood", "Coffee", "Desserts", "Lemonade", "Sandwiches", "Southern",
];

const AddFoodTruck: React.FC = () => {
  const [truck, setTruck] = useState({
    truckName: "",
    region: "",
    franchiseId: "",
    description: "",
    cuisine: [] as string[],
    logo: "",
    website: "",
    facebook: "",
    instagram: "",
    foodIcon: "🚚",
  });

  const { callApi, loading, error } = useAPI();

  const handleCuisineSelect = (selectedCuisine: string) => {
    setTruck((prev) => ({
      ...prev,
      cuisine: prev.cuisine.includes(selectedCuisine)
        ? prev.cuisine.filter((c) => c !== selectedCuisine)
        : [...prev.cuisine, selectedCuisine],
    }));
  };

  const handleIconSelect = (icon: string) => {
    setTruck((prev) => ({ ...prev, foodIcon: icon }));
  };

  const handleAddTruck = async () => {
    if (!truck.truckName || !truck.region || truck.cuisine.length === 0) {
      toast.error("❌ Please fill in required fields: name, region, and at least one cuisine.");
      return;
    }

    const response = await callApi("addFoodTruck", "POST", truck);
    if (response.success) {
      toast.success(`${truck.truckName} added!`);
      setTruck({
        truckName: "",
        region: "",
        franchiseId: "",
        description: "",
        cuisine: [],
        logo: "",
        website: "",
        facebook: "",
        instagram: "",
        foodIcon: "🚚",
      });
    } else {
      toast.error(error || "❌ Failed to add food truck.");
    }
  };

  return (
    <div className="form-section">
      <h3>➕ Add New Food Truck</h3>

      <label htmlFor="truckName">Truck Name:</label>
      <input
        id="truckName"
        type="text"
        value={truck.truckName}
        onChange={(e) => setTruck({ ...truck, truckName: e.target.value })}
        required
      />

      <label htmlFor="region">Region:</label>
      <PlaceAutocompleteInput
        onSelect={(region) => setTruck((prev) => ({ ...prev, region }))}
      />

      <label htmlFor="franchiseId">Franchise ID (Optional):</label>
      <input
        id="franchiseId"
        type="text"
        value={truck.franchiseId}
        onChange={(e) => setTruck({ ...truck, franchiseId: e.target.value })}
      />

      <label htmlFor="description">Truck Description / Color (Optional):</label>
      <input
        id="description"
        type="text"
        value={truck.description}
        onChange={(e) => setTruck({ ...truck, description: e.target.value })}
      />

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

      {truck.cuisine.length > 0 && (
        <div className="selected-cuisines">Selected: {truck.cuisine.join(", ")}</div>
      )}

      <label htmlFor="logo">Logo URL (Optional):</label>
      <input
        id="logo"
        type="text"
        value={truck.logo}
        onChange={(e) => setTruck({ ...truck, logo: e.target.value })}
      />

      <label htmlFor="website">Website (Optional):</label>
      <input
        id="website"
        type="text"
        value={truck.website}
        onChange={(e) => setTruck({ ...truck, website: e.target.value })}
      />

      <label htmlFor="facebook">Facebook (Optional):</label>
      <input
        id="facebook"
        type="text"
        value={truck.facebook}
        onChange={(e) => setTruck({ ...truck, facebook: e.target.value })}
      />

      <label htmlFor="instagram">Instagram (Optional):</label>
      <input
        id="instagram"
        type="text"
        value={truck.instagram}
        onChange={(e) => setTruck({ ...truck, instagram: e.target.value })}
      />

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

      <button onClick={handleAddTruck} disabled={loading}>
        ➕ {loading ? "Adding..." : "Add Truck"}
      </button>
    </div>
  );
};

export default AddFoodTruck;
