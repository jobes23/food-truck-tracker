// src/components/ResetPassword.tsx
import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { confirmPasswordReset, getAuth } from "firebase/auth";

const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const oobCode = searchParams.get("oobCode");

  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    if (!oobCode || !newPassword) return;
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const auth = getAuth();
      await confirmPasswordReset(auth, oobCode, newPassword);
      setMessage("✅ Password has been reset! You can now log in.");
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  if (!oobCode) {
    return <p>Invalid or expired reset link.</p>;
  }

  return (
    <div style={{ maxWidth: 400, margin: "40px auto", padding: 20 }}>
      <h2>Reset Your Password</h2>
      <input
        type="password"
        placeholder="Enter new password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        style={{ width: "100%", padding: 10, marginBottom: 10 }}
      />
      <button
        onClick={handleReset}
        disabled={loading}
        style={{ width: "100%", padding: 10 }}
      >
        {loading ? "Resetting..." : "Reset Password"}
      </button>

      {message && <p style={{ color: "green", marginTop: 10 }}>{message}</p>}
      {error && <p style={{ color: "red", marginTop: 10 }}>{error}</p>}
    </div>
  );
};

export default ResetPassword;
