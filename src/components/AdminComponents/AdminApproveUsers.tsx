import React, { useState, useEffect } from "react";
import useAPI from "../../hooks/useAPI";

const AdminApproveUsers: React.FC = () => {
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [selectedTruck, setSelectedTruck] = useState<string>("");

  // Fetch pending users
  const { callApi: fetchPendingUsers, data: pendingUsers, loading: loadingUsers } = useAPI<{ uid: string; email: string }[]>();

  // Fetch food trucks
  const { callApi: fetchFoodTrucks, data: foodTrucks, loading: loadingTrucks } = useAPI<string[]>();

  // API to approve user
  const { callApi: approveUser, loading: approving } = useAPI();

  useEffect(() => {
    fetchPendingUsers("getPendingUsers", "GET");
    fetchFoodTrucks("getFoodTrucks", "GET");
  }, []); // Fetch data on mount

  const handleApproveUser = async () => {
    if (!selectedUser || !selectedTruck) return;
    const response = await approveUser("approveUser", "POST", { userId: selectedUser, truckName: selectedTruck });

    if (response.success) {
      setSelectedUser("");
      setSelectedTruck("");
      fetchPendingUsers("getPendingUsers", "GET"); // Refresh list after approval
    } else {
      console.error("Failed to approve user:", response.error);
    }
  };

  return (
    <div>
      <h2>✅ Approve & Assign Users</h2>

      {loadingUsers ? <p>Loading pending users...</p> : (
        <>
          <label htmlFor="userSelect">Select User:</label>
          <select id="userSelect" value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)}>
            <option value="">Select a User</option>
            {pendingUsers?.map((user) => (
              <option key={user.uid} value={user.uid}>
                {user.email}
              </option>
            ))}
          </select>
        </>
      )}

      {loadingTrucks ? <p>Loading food trucks...</p> : (
        <>
          <label htmlFor="truckSelect">Assign to Truck:</label>
          <select id="truckSelect" value={selectedTruck} onChange={(e) => setSelectedTruck(e.target.value)}>
            <option value="">Select a Truck</option>
            {foodTrucks?.map((truck) => (
              <option key={truck} value={truck}>
                {truck}
              </option>
            ))}
          </select>
        </>
      )}

      <button onClick={handleApproveUser} disabled={approving || !selectedUser || !selectedTruck}>
        {approving ? "Approving..." : "Approve & Assign"}
      </button>
    </div>
  );
};

export default AdminApproveUsers;
