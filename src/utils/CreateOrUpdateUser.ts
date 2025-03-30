import { getAuth } from "firebase/auth";

export const createOrUpdateUser = async (anonUid: string | null = null, role: string = "foodie") => {
  const user = getAuth().currentUser;
  if (!user) return;

  const token = await user.getIdToken();
  const payload = {
    uid: user.uid,
    isAnonymous: user.isAnonymous,
    createdAt: user.metadata.creationTime,
    anonUid,
    role,
  };

  const response = await fetch(`${import.meta.env.VITE_FIREBASE_FUNCTIONS_URL}/createOrUpdateUser`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data?.error || "User creation failed");
  }

  return await response.json();
};
