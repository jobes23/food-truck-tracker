import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { confirmPasswordReset, getAuth } from "firebase/auth";
import { toast } from "react-toastify";
import AuthLayout from "../AuthLayout";

const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const oobCode = searchParams.get("oobCode");

  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oobCode || !newPassword) return;

    setLoading(true);
    try {
      const auth = getAuth();
      await confirmPasswordReset(auth, oobCode, newPassword);
      toast.success("🎉 Password updated successfully!");
    } catch (err: any) {
      console.error(err);
      if (err.code === "auth/expired-action-code") {
        toast.error("Reset link expired. Please try again.");
      } else {
        toast.error("Failed to reset password.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!oobCode) {
    return (
      <AuthLayout>
        <p className="text-red-500">Invalid or expired password reset link.</p>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <form className="auth-form" onSubmit={handleReset}>
        <h2>Choose a New Password</h2>
        <label htmlFor="newPassword">New Password:</label>
        <input
          id="newPassword"
          type="password"
          required
          placeholder="••••••••"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <div className="button-container">
          <button type="submit" disabled={loading}>
            {loading ? "Updating..." : "Reset Password"}
          </button>
        </div>
      </form>
    </AuthLayout>
  );
};

export default ResetPassword;
